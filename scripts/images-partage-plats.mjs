#!/usr/bin/env node
// Images de partage des pages plats (lot L12 du plan d'intégration de la refonte).
//
// Pour chaque photo recadrée (`public/assets/plats/<id>.webp`, liste et couleur
// de fond dans `features/menus/data/photos-plats.json`, écrits par
// `scripts/photos-plats.mjs`) : un JPEG 1200 × 630 de moins de 150 ko, la photo
// entière posée au centre sur sa couleur de fond (celle de son coin, sinon celle
// du fichier JSON), le logo en haut à gauche.
// C'est l'aperçu montré par WhatsApp, Facebook et Google quand on partage la
// page du plat ; jamais la photo brute de l'API (PNG de près de 1 Mo).
//
// Un plat sans photo recadrée (FRITE RT ORANGINA, nouveaux plats) n'a pas
// d'image ici : sa page reprend l'image générale du site
// (`app/[locale]/(public)/carte/[plat]/page.tsx` vérifie la présence du fichier).
//
// Écrit `public/assets/partage/plats/<id-du-plat>.jpg` et retire les images
// d'un plat qui n'a plus de photo recadrée. Un fichier change de nom avec le
// plat : le cache long des fichiers statiques reste juste.
//
// Node 20 ou plus, sans dépendance ; ffmpeg doit être installé.
//
// Usage :
//   node scripts/images-partage-plats.mjs [--essai] [--ffmpeg <chemin>]
//
//   --essai           vérifie les sources et affiche le bilan sans rien écrire
//   --ffmpeg <chemin> programme ffmpeg (défaut : celui du PATH)
//
// Code de sortie : 0 si toutes les images sont faites et sous 150 ko, 1 sinon.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FICHIER_JSON = path.join(RACINE, "features", "menus", "data", "photos-plats.json");
const DOSSIER_PHOTOS = path.join(RACINE, "public", "assets", "plats");
const DOSSIER_SORTIE = path.join(RACINE, "public", "assets", "partage", "plats");
const LOGO = path.join(RACINE, "public", "assets", "site", "logo-orange.png");

// Format attendu par WhatsApp, Facebook et X (rapport 1,91:1).
const LARGEUR = 1200;
const HAUTEUR = 630;
const POIDS_MAX = 150_000;

// Logo (203 × 300) dans la marge de gauche ; la photo occupe une zone centrée
// qui ne le touche jamais, quelle que soit sa forme (de 0,44 à 2,19).
const LOGO_HAUTEUR = 104;
const LOGO_X = 44;
const LOGO_Y = 40;
const ZONE = { x: 140, y: 40, largeur: LARGEUR - 2 * 140, hauteur: HAUTEUR - 2 * 40 };

// Qualité JPEG de ffmpeg (2 = la meilleure) : on monte d'un cran tant que
// l'image dépasse le poids permis.
const QUALITES = [3, 4, 5, 6, 8, 10];

function lireOptions(argv) {
  const options = { essai: false, ffmpeg: "ffmpeg" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--essai") options.essai = true;
    else if (argv[i] === "--ffmpeg") options.ffmpeg = argv[++i] ?? "ffmpeg";
    else if (argv[i] === "--aide" || argv[i] === "-h") {
      console.log("Usage : node scripts/images-partage-plats.mjs [--essai] [--ffmpeg <chemin>]");
      process.exit(0);
    } else {
      console.error(`Option inconnue : ${argv[i]}`);
      process.exit(1);
    }
  }
  return options;
}

/** Largeur et hauteur lues dans l'en-tête d'un JPEG (premier segment SOF). */
export function dimensionsJpeg(octets) {
  if (octets[0] !== 0xff || octets[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < octets.length) {
    if (octets[i] !== 0xff) return null;
    const marqueur = octets[i + 1];
    const longueur = octets.readUInt16BE(i + 2);
    // SOF0 à SOF15, sauf DHT (C4), JPG (C8) et DAC (CC).
    if (marqueur >= 0xc0 && marqueur <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marqueur)) {
      return { l: octets.readUInt16BE(i + 7), h: octets.readUInt16BE(i + 5) };
    }
    i += 2 + longueur;
  }
  return null;
}

/** Taille et position de la photo, entière, au centre de la zone. */
export function placement(l, h) {
  const echelle = Math.min(ZONE.largeur / l, ZONE.hauteur / h);
  // Dimensions paires : le JPEG en 4:2:0 n'a pas de bord flou.
  const largeur = 2 * Math.round((l * echelle) / 2);
  const hauteur = 2 * Math.round((h * echelle) / 2);
  return {
    largeur,
    hauteur,
    x: ZONE.x + Math.round((ZONE.largeur - largeur) / 2),
    y: ZONE.y + Math.round((ZONE.hauteur - hauteur) / 2),
  };
}

/**
 * Couleur du coin haut gauche de la photo (« #FAE8C8 »), ou `null` s'il est
 * transparent. Le fond de l'image la reprend : aucune couture visible autour
 * de la photo, même quand son fond diffère d'un cran de celui du fichier JSON.
 */
function couleurDuCoin(ffmpeg, source) {
  // Passage en RGBA avant le recadrage : en 4:2:0, un pixel seul serait arrondi à 0.
  const r = spawnSync(ffmpeg, ["-v", "error", "-i", source, "-vf", "format=rgba,crop=1:1:0:0", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "-"]);
  if (r.error || r.status !== 0 || r.stdout.length < 4) return null;
  const [rouge, vert, bleu, alpha] = r.stdout;
  if (alpha < 255) return null;
  return `#${[rouge, vert, bleu].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function fabriquer(ffmpeg, { source, sortie, fond, l, h, qualite }) {
  const p = placement(l, h);
  const couleur = fond.replace("#", "0x");
  // La photo est d'abord aplatie sur son fond à sa taille d'origine : certaines
  // ont une colonne transparente au bord, qui ferait un trait sombre une fois
  // la photo redimensionnée. Superpositions en RGB : couleurs exactes, et pas
  // de passage en 4:2:0 qui arrondit les dimensions avant la fin.
  const filtre = [
    `color=c=${couleur}:s=${l}x${h}:d=1,format=rgba[fondPhoto]`,
    `[0:v]format=rgba[photo]`,
    `[fondPhoto][photo]overlay=0:0:format=rgb,scale=${p.largeur}:${p.hauteur}:flags=lanczos[photoAplatie]`,
    // Toile pleine plutôt que `pad`, qui laisse une dernière ligne noire.
    `color=c=${couleur}:s=${LARGEUR}x${HAUTEUR}:d=1,format=rgba[toile]`,
    `[toile][photoAplatie]overlay=${p.x}:${p.y}:format=rgb[a]`,
    // Les pixels transparents du logo sont orange : pas de liseré au redimensionnement.
    `[1:v]format=rgba,scale=-2:${LOGO_HAUTEUR}:flags=lanczos[logo]`,
    `[a][logo]overlay=${LOGO_X}:${LOGO_Y}:format=rgb,format=yuvj420p[sortie]`,
  ].join(";");
  const r = spawnSync(
    ffmpeg,
    ["-v", "error", "-y", "-i", source, "-i", LOGO, "-filter_complex", filtre, "-map", "[sortie]", "-frames:v", "1", "-q:v", String(qualite), sortie],
    { encoding: "utf8" },
  );
  if (r.error) throw new Error(`ffmpeg introuvable (${r.error.message}) : installez-le ou passez --ffmpeg <chemin>`);
  if (r.status !== 0) throw new Error(`ffmpeg a échoué : ${r.stderr.trim()}`);
}

async function principal() {
  const options = lireOptions(process.argv.slice(2));
  const recadrages = JSON.parse(await readFile(FICHIER_JSON, "utf8"));
  const ids = Object.keys(recadrages);
  const problemes = [];

  if (!existsSync(LOGO)) problemes.push(`logo absent : ${path.relative(RACINE, LOGO)}`);
  for (const id of ids) {
    if (!existsSync(path.join(DOSSIER_PHOTOS, `${id}.webp`))) problemes.push(`photo absente pour ${id}`);
  }
  if (problemes.length) {
    for (const p of problemes) console.error(`Problème : ${p}`);
    process.exit(1);
  }

  console.log(`${ids.length} photos recadrées.`);
  if (options.essai) {
    for (const id of ids) {
      const { l, h } = recadrages[id];
      const p = placement(l, h);
      console.log(`${id} : photo ${l} × ${h} posée en ${p.largeur} × ${p.hauteur} à (${p.x}, ${p.y})`);
    }
    return;
  }

  await mkdir(DOSSIER_SORTIE, { recursive: true });
  const poids = [];
  for (const id of ids) {
    const { l, h } = recadrages[id];
    const source = path.join(DOSSIER_PHOTOS, `${id}.webp`);
    const fond = couleurDuCoin(options.ffmpeg, source) ?? recadrages[id].fond;
    const sortie = path.join(DOSSIER_SORTIE, `${id}.jpg`);
    let taille = Infinity;
    for (const qualite of QUALITES) {
      fabriquer(options.ffmpeg, { source, sortie, fond, l, h, qualite });
      taille = (await stat(sortie)).size;
      if (taille < POIDS_MAX) break;
    }
    const dimensions = dimensionsJpeg(await readFile(sortie));
    if (!dimensions || dimensions.l !== LARGEUR || dimensions.h !== HAUTEUR) {
      problemes.push(`${id}.jpg : dimensions ${dimensions ? `${dimensions.l} × ${dimensions.h}` : "illisibles"}`);
    }
    if (taille >= POIDS_MAX) problemes.push(`${id}.jpg : ${Math.round(taille / 1000)} ko, au-delà de 150 ko`);
    poids.push(taille);
  }

  // Images d'un plat qui n'a plus de photo recadrée.
  const gardes = new Set(ids.map((id) => `${id}.jpg`));
  const retirees = (await readdir(DOSSIER_SORTIE)).filter((f) => f.endsWith(".jpg") && !gardes.has(f));
  for (const f of retirees) await rm(path.join(DOSSIER_SORTIE, f));

  const ko = (n) => `${Math.round(n / 1000)} ko`;
  console.log(
    `${poids.length} images écrites dans ${path.relative(RACINE, DOSSIER_SORTIE)} : ` +
      `de ${ko(Math.min(...poids))} à ${ko(Math.max(...poids))}, ${ko(poids.reduce((a, b) => a + b, 0))} en tout.`,
  );
  if (retirees.length) console.log(`${retirees.length} image(s) retirée(s) : ${retirees.join(", ")}`);
  if (problemes.length) {
    for (const p of problemes) console.error(`Problème : ${p}`);
    process.exit(1);
  }
}

// Lancé directement (et non importé par un test).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  principal().catch((erreur) => {
    console.error(erreur.message);
    process.exit(1);
  });
}
