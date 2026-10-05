#!/usr/bin/env node
// Photos recadrées des plats (lot L3 du plan d'intégration de la refonte).
//
// La maquette a recadré au plus près du plat une photo par plat de l'instantané
// de production du 02/10 (`.maquette-site/assets/fiche/plat-N.webp`, dimensions
// et couleur de fond dans `dimensions.json`). Leur numéro suit `contenu.json`,
// qui n'a pas les identifiants : ce script les retrouve dans `dishes.json` par
// (nom, prix, catégorie), une fois pour toutes.
//
// Il s'arrête au moindre doute (deux plats possibles, photo absente, dimensions
// différentes du fichier) plutôt que de poser une photo sur le mauvais plat.
//
// Écrit :
//   public/assets/plats/<id-du-plat>.webp            (copie de la photo)
//   features/menus/data/photos-plats.json            ({ [id]: { fond, l, h, ratio, etiquette } })
// et retire de public/assets/plats/ les photos d'un plat qui n'est plus associé.
//
// Node 20 ou plus, sans dépendance.
//
// Usage :
//   node scripts/photos-plats.mjs [--maquette <dossier>] [--essai]
//
//   --maquette <dossier>  dossier de la maquette (défaut : ../.maquette-site à côté du dépôt)
//   --essai               vérifie et affiche le bilan sans rien écrire
//
// Code de sortie : 0 si tout est associé sans ambiguïté, 1 sinon.

import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOSSIER_PHOTOS = path.join(RACINE, "public", "assets", "plats");
const FICHIER_JSON = path.join(RACINE, "features", "menus", "data", "photos-plats.json");

function lireOptions(argv) {
  const options = { maquette: path.resolve(RACINE, "..", ".maquette-site"), essai: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--maquette") options.maquette = path.resolve(argv[++i] ?? "");
    else if (argv[i] === "--essai") options.essai = true;
    else if (argv[i] === "--aide" || argv[i] === "-h") {
      console.log("Usage : node scripts/photos-plats.mjs [--maquette <dossier>] [--essai]");
      process.exit(0);
    } else {
      console.error(`Option inconnue : ${argv[i]}`);
      process.exit(1);
    }
  }
  return options;
}

const lireJson = async (fichier) => JSON.parse(await readFile(fichier, "utf8"));
const espaces = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const cle = (nom, prix, categorie) => `${espaces(nom)}|${Number(prix)}|${espaces(categorie)}`;

/** Largeur et hauteur lues dans l'en-tête d'un WebP (VP8, VP8L ou VP8X). */
function dimensionsWebp(octets) {
  if (octets.toString("ascii", 0, 4) !== "RIFF" || octets.toString("ascii", 8, 12) !== "WEBP") return null;
  const bloc = octets.toString("ascii", 12, 16);
  if (bloc === "VP8X") {
    return { l: 1 + octets.readUIntLE(24, 3), h: 1 + octets.readUIntLE(27, 3) };
  }
  if (bloc === "VP8 ") {
    return { l: octets.readUInt16LE(26) & 0x3fff, h: octets.readUInt16LE(28) & 0x3fff };
  }
  if (bloc === "VP8L") {
    const b = octets.readUInt32LE(21);
    return { l: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  return null;
}

async function principal() {
  const options = lireOptions(process.argv.slice(2));
  const problemes = [];
  const fichiers = {
    contenu: path.join(options.maquette, "contenu.json"),
    plats: path.join(options.maquette, "dishes.json"),
    dimensions: path.join(options.maquette, "assets", "fiche", "dimensions.json"),
  };
  for (const f of Object.values(fichiers)) {
    if (!existsSync(f)) {
      console.error(`Fichier introuvable : ${f}`);
      process.exit(1);
    }
  }

  const contenu = await lireJson(fichiers.contenu);
  const brut = await lireJson(fichiers.plats);
  const plats = (Array.isArray(brut) ? brut : brut.data ?? []).filter((p) => p.entity_status === "ACTIVE");
  const dimensions = await lireJson(fichiers.dimensions);

  // Plats de l'instantané, par (nom, prix, catégorie).
  const platsParCle = new Map();
  for (const p of plats) {
    const k = cle(p.name, p.price, p.category?.name);
    platsParCle.set(k, [...(platsParCle.get(k) ?? []), p]);
  }

  // Une photo de la maquette pour un seul plat, un plat pour une seule photo.
  const associations = new Map();
  for (const photo of contenu.plats ?? []) {
    const numero = String(photo.image ?? "").match(/plat-(\d+)\.webp$/)?.[1];
    const libelle = `${photo.nom} (${photo.categorie}, ${photo.prix} F)`;
    if (numero === undefined) {
      problemes.push(`photo sans numéro pour ${libelle} : ${photo.image}`);
      continue;
    }
    const candidats = platsParCle.get(cle(photo.nom, photo.prix, photo.categorie)) ?? [];
    if (candidats.length !== 1) {
      problemes.push(
        candidats.length === 0
          ? `aucun plat de dishes.json pour plat-${numero} ${libelle}`
          : `plat-${numero} ${libelle} : ${candidats.length} plats possibles (${candidats.map((c) => c.id).join(", ")})`,
      );
      continue;
    }
    const plat = candidats[0];
    if (associations.has(plat.id)) {
      problemes.push(`${plat.name} (${plat.id}) reçoit deux photos : plat-${associations.get(plat.id).numero} et plat-${numero}`);
      continue;
    }
    const dim = dimensions[`plat-${numero}`];
    const source = path.join(options.maquette, "assets", "fiche", `plat-${numero}.webp`);
    if (!dim) {
      problemes.push(`plat-${numero} absent de dimensions.json (${libelle})`);
      continue;
    }
    if (!existsSync(source)) {
      problemes.push(`fichier absent : ${source}`);
      continue;
    }
    const lu = dimensionsWebp(await readFile(source));
    if (!lu || lu.l !== dim.l || lu.h !== dim.h) {
      problemes.push(`plat-${numero} : dimensions.json dit ${dim.l} × ${dim.h}, le fichier ${lu ? `${lu.l} × ${lu.h}` : "illisible"}`);
      continue;
    }
    associations.set(plat.id, { numero, source, plat, dim });
  }

  // Photos recadrées jamais utilisées : signe d'un instantané qui a bougé.
  const numerosUtilises = new Set(Array.from(associations.values()).map((a) => `plat-${a.numero}`));
  for (const n of Object.keys(dimensions)) {
    if (!numerosUtilises.has(n)) problemes.push(`${n} de dimensions.json n'est associé à aucun plat`);
  }

  const sansPhoto = plats.filter((p) => !associations.has(p.id));

  console.log(`Maquette : ${options.maquette}`);
  console.log(`Plats actifs de l'instantané : ${plats.length}`);
  console.log(`Associés à une photo recadrée : ${associations.size}`);
  console.log(
    `Sans photo recadrée (photo de l'API sur fond #FBEACA) : ${sansPhoto.length}` +
      (sansPhoto.length ? ` : ${sansPhoto.map((p) => `${p.name} (${p.id})`).join(", ")}` : ""),
  );

  if (problemes.length > 0) {
    console.error(`\n${problemes.length} problème(s), rien n'est écrit :`);
    for (const p of problemes) console.error(`  - ${p}`);
    process.exit(1);
  }
  if (options.essai) {
    console.log("\nEssai : rien n'est écrit.");
    return;
  }

  // Ordre de dishes.json (alphabétique) : un nouveau passage ne déplace rien.
  const sortie = {};
  await mkdir(DOSSIER_PHOTOS, { recursive: true });
  for (const p of plats) {
    const a = associations.get(p.id);
    if (!a) continue;
    sortie[p.id] = {
      fond: a.dim.fond,
      l: a.dim.l,
      h: a.dim.h,
      ratio: Math.round((a.dim.l / a.dim.h) * 1000) / 1000,
      etiquette: a.dim.etiquette !== false,
    };
    await copyFile(a.source, path.join(DOSSIER_PHOTOS, `${p.id}.webp`));
  }

  let retirees = 0;
  for (const f of await readdir(DOSSIER_PHOTOS)) {
    const id = f.replace(/\.webp$/, "");
    if (f.endsWith(".webp") && !(id in sortie)) {
      await rm(path.join(DOSSIER_PHOTOS, f));
      retirees++;
    }
  }

  await mkdir(path.dirname(FICHIER_JSON), { recursive: true });
  await writeFile(FICHIER_JSON, `${JSON.stringify(sortie, null, 2)}\n`);
  console.log(`\nÉcrit : ${path.relative(RACINE, FICHIER_JSON)} et ${Object.keys(sortie).length} photo(s) dans ${path.relative(RACINE, DOSSIER_PHOTOS)}/`);
  if (retirees) console.log(`Retirées (plus associées) : ${retirees}`);
}

principal().catch((e) => {
  console.error(e);
  process.exit(1);
});
