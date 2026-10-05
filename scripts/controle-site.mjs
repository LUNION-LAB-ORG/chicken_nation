#!/usr/bin/env node
// Contrôle automatique du site servi (lot L0 du plan d'intégration de la refonte).
//
// Pour chaque adresse : code HTTP, <title>, description, adresse de référence
// (canonical), un seul <h1>, langue, JSON-LD lisible par JSON.parse, numéros de
// téléphone publiés et motifs interdits de scripts/interdits.txt (annexe A).
// Contrôles généraux : adresse inconnue en vraie 404 sans boucle, anglais et arabe
// redirigés vers le français, aucun en-tête Link hreflang, anciennes adresses
// redirigées en permanent (tableau 1.3 du plan).
//
// Node 20 ou plus, sans dépendance.
//
// Usage :
//   node scripts/controle-site.mjs [options] [chemin ou adresse ...]
//   bun run controle [options] [chemin ...]
//
// Sans chemin, les adresses sont lues dans le sitemap du site contrôlé.
//
// Options :
//   --base <url>              site contrôlé (défaut : variable CONTROLE_BASE,
//                             sinon http://localhost:3057)
//   --origine <url>           origine publique, celle des adresses de référence et du
//                             sitemap (défaut https://www.chicken-nation.com)
//   --sitemap                 ajoute les adresses du sitemap aux chemins donnés
//   --sans-redirections       saute les contrôles généraux
//   --redirections            seulement les contrôles généraux
//   --construction <dossier>  cherche aussi les motifs interdits dans la construction
//                             (<dossier>/server/app et <dossier>/static/chunks, dossier .next)
//   --interdits <fichier>     liste des motifs (défaut scripts/interdits.txt)
//   --parallele <n>           requêtes simultanées (défaut 3)
//   --delai <secondes>        délai maximal d'une requête (défaut 90 : le serveur de
//                             développement compile chaque page à la première visite)
//   --agent <texte>           en-tête User-Agent envoyé
//   --json                    rapport complet en JSON sur la sortie standard
//
// Code de sortie : 0 sans écart, 1 au moins un écart, 2 erreur d'usage ou site injoignable.

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Seul numéro publié (règle 2 du plan), en chiffres et en lien.
const NUMERO_PUBLIE = "2721712130";
const LIEN_TEL_PUBLIE = "tel:+2252721712130";

const TITRE_MAX = 60;
const DESCRIPTION_MAX = 155;

// Numéro ivoirien à 10 chiffres (01, 05, 07, 21, 25, 27), indicatif +225 facultatif,
// séparé ou non par des espaces, points ou tirets ; jamais collé à d'autres chiffres.
const RE_NUMERO = /(?<![\d+])(?:\+?225[ .-]?)?((?:0[157]|2[157])(?:[ .-]?\d{2}){4})(?!\d)/g;

class ErreurUsage extends Error {}

// ---------------------------------------------------------------------------
// Options

function lireOptions(argv) {
  const options = {
    base: process.env.CONTROLE_BASE || "http://localhost:3057",
    origine: "https://www.chicken-nation.com",
    sitemap: false,
    pages: true,
    generaux: true,
    construction: null,
    interdits: path.join(RACINE, "scripts", "interdits.txt"),
    parallele: 3,
    delai: 90,
    agent: "Mozilla/5.0 (compatible; controle-site/1.0)",
    json: false,
    chemins: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const option = argv[i];
    const valeur = () => {
      const v = argv[++i];

      if (v === undefined) throw new ErreurUsage(`valeur manquante après ${option}`);

      return v;
    };

    switch (option) {
      case "--base":
        options.base = valeur();
        break;
      case "--origine":
        options.origine = valeur();
        break;
      case "--sitemap":
        options.sitemap = true;
        break;
      case "--sans-redirections":
        options.generaux = false;
        break;
      case "--redirections":
        options.pages = false;
        break;
      case "--construction":
        options.construction = path.resolve(process.cwd(), valeur());
        break;
      case "--interdits":
        options.interdits = path.resolve(process.cwd(), valeur());
        break;
      case "--parallele":
        options.parallele = Math.max(1, Number.parseInt(valeur(), 10) || 1);
        break;
      case "--delai":
        options.delai = Math.max(1, Number(valeur()) || 90);
        break;
      case "--agent":
        options.agent = valeur();
        break;
      case "--json":
        options.json = true;
        break;
      case "-h":
      case "--aide":
      case "--help":
        options.aide = true;
        break;
      default:
        if (option.startsWith("--")) throw new ErreurUsage(`option inconnue : ${option}`);
        options.chemins.push(option);
    }
  }

  try {
    options.base = new URL(options.base).origin;
    options.origine = new URL(options.origine).origin;
  } catch {
    throw new ErreurUsage("--base et --origine attendent une adresse complète (http://… ou https://…)");
  }

  return options;
}

// ---------------------------------------------------------------------------
// Motifs interdits

async function lireInterdits(fichier) {
  const texte = await readFile(fichier, "utf8");
  const motifs = [];
  let section = null;

  for (const [index, brute] of texte.split(/\r?\n/).entries()) {
    const ligne = brute.trim();

    if (!ligne || ligne.startsWith("#")) continue;

    const entete = ligne.match(/^\[(html|texte|relire)\]$/);

    if (entete) {
      section = entete[1];
      continue;
    }
    if (!section) throw new ErreurUsage(`${fichier}:${index + 1} : motif placé avant toute section`);

    const [, source, sauf] = ligne.match(/^(.*?)(?:\s+@sauf\s+(\S.*))?$/);
    let re;

    try {
      re = new RegExp(source, "g");
    } catch (erreur) {
      throw new ErreurUsage(`${fichier}:${index + 1} : expression invalide (${erreur.message})`);
    }
    motifs.push({
      section,
      source,
      re,
      sauf: sauf ? sauf.split(",").map((chemin) => chemin.trim()).filter(Boolean) : [],
    });
  }

  return motifs;
}

function tolerePourPage(motif, chemin) {
  return motif.sauf.some((sauf) => chemin === sauf || chemin.startsWith(`${sauf}/`));
}

function tolerePourFichier(motif, relatif) {
  return motif.sauf.some((sauf) => {
    const dernier = sauf.split("/").filter(Boolean).pop();

    return dernier && relatif.split(path.sep).includes(dernier);
  });
}

function chercher(motif, texte, maximum = 3) {
  const extraits = [];
  let total = 0;

  for (const trouve of texte.matchAll(motif.re)) {
    total++;
    if (extraits.length < maximum) extraits.push(extrait(texte, trouve.index, trouve[0].length));
  }

  return { total, extraits };
}

function extrait(texte, debut, longueur, marge = 35) {
  const a = Math.max(0, debut - marge);
  const b = Math.min(texte.length, debut + longueur + marge);

  return `${a > 0 ? "…" : ""}${texte.slice(a, b).replace(/\s+/g, " ").trim()}${b < texte.length ? "…" : ""}`;
}

// ---------------------------------------------------------------------------
// Lecture du HTML (sans analyseur : expressions régulières suffisantes pour le
// HTML produit par React, aux attributs toujours entre guillemets doubles)

const ENTITES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };

function decoderEntites(texte) {
  return texte.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (tout, code) => {
    if (code[0] !== "#") return ENTITES[code.toLowerCase()] ?? tout;

    const n = code[1] === "x" || code[1] === "X" ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);

    try {
      return String.fromCodePoint(n);
    } catch {
      return tout;
    }
  });
}

// Échappements JavaScript (charge RSC, morceaux de la construction) : é, \xe9.
function desechapperJs(texte) {
  return texte
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(Number.parseInt(h, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(Number.parseInt(h, 16)));
}

function normaliserEspaces(texte) {
  return texte.replace(/[\u00a0\u202f\u2009]/g, " ");
}

function attributs(source) {
  const resultat = {};

  for (const m of source.matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    resultat[m[1].toLowerCase()] = decoderEntites(m[2] ?? m[3] ?? m[4] ?? "");
  }

  return resultat;
}

function balises(html, nom) {
  return [...html.matchAll(new RegExp(`<${nom}\\b([^>]*)>`, "gi"))].map((m) => attributs(m[1]));
}

function retirerBlocs(html, noms) {
  let resultat = html.replace(/<!--[\s\S]*?-->/g, " ");

  for (const nom of noms) {
    resultat = resultat.replace(new RegExp(`<${nom}\\b[^>]*>[\\s\\S]*?</${nom}\\s*>`, "gi"), " ");
  }

  return resultat;
}

const NOMS_META_TEXTE = new Set([
  "description",
  "og:title",
  "og:description",
  "og:image:alt",
  "twitter:title",
  "twitter:description",
  "twitter:image:alt",
]);

// Texte vu ou entendu par le visiteur : contenu des balises, plus title, alt,
// aria-label, placeholder et les descriptions reprises par les moteurs et le partage.
function texteVisible(html) {
  const sansCode = retirerBlocs(html, ["script", "style"]);
  const contenu = sansCode.replace(/<[^>]+>/g, " ");
  const enPlus = [];

  for (const m of sansCode.matchAll(/<[a-z][a-z0-9-]*\b([^>]*)>/gi)) {
    const a = attributs(m[1]);

    for (const nom of ["alt", "title", "aria-label", "placeholder"]) if (a[nom]) enPlus.push(a[nom]);
    if (a.content && NOMS_META_TEXTE.has(a.name ?? a.property)) enPlus.push(a.content);
  }

  return normaliserEspaces(decoderEntites(`${contenu} | ${enPlus.join(" | ")}`)).replace(/\s+/g, " ");
}

function blocsJsonLd(html) {
  const blocs = [];

  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if ((attributs(m[1]).type ?? "").toLowerCase() === "application/ld+json") blocs.push(m[2]);
  }

  return blocs;
}

function typesJsonLd(donnees) {
  const types = [];
  const visiter = (noeud) => {
    if (Array.isArray(noeud)) return noeud.forEach(visiter);
    if (!noeud || typeof noeud !== "object") return;
    if (noeud["@type"]) types.push(...[].concat(noeud["@type"]));
    if (noeud["@graph"]) visiter(noeud["@graph"]);
  };

  visiter(donnees);

  return types;
}

function numerosDans(texte) {
  return [...normaliserEspaces(texte).matchAll(RE_NUMERO)].map((m) => m[1].replace(/\D/g, ""));
}

function formaterNumero(chiffres) {
  return chiffres.replace(/(\d{2})(?=\d)/g, "$1 ");
}

// ---------------------------------------------------------------------------
// Réseau

function creerReseau(options) {
  const base = new URL(options.base);

  async function requete(adresse, entetes = {}) {
    const debut = performance.now();
    const reponse = await fetch(adresse, {
      redirect: "manual",
      headers: {
        "User-Agent": options.agent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr",
        ...entetes,
      },
      signal: AbortSignal.timeout(options.delai * 1000),
    });
    const corps = await reponse.text();

    return { statut: reponse.status, entetes: reponse.headers, corps, duree: Math.round(performance.now() - debut) };
  }

  // Adresse donnée par l'utilisateur ou tirée du sitemap, ramenée sur le site contrôlé.
  function versBase(adresse) {
    const url = new URL(adresse, base);

    if (url.origin === options.origine || url.origin === base.origin) return new URL(url.pathname + url.search, base);

    return url;
  }

  function relatif(url) {
    return url.origin === base.origin ? `${url.pathname}${url.search}${url.hash}` : url.href;
  }

  // Suit les redirections une à une (7 requêtes au plus) et repère les boucles :
  // adresse déjà vue, ou chaîne trop longue (callbackUrl qui grossit à chaque tour).
  async function suivre(chemin, entetes = {}) {
    const etapes = [];
    const vues = new Set();
    let url = new URL(chemin, base);

    for (let i = 0; i < 7; i++) {
      const cle = url.href.replace(/#.*$/, "");

      if (vues.has(cle)) return { etapes, boucle: true };
      vues.add(cle);

      const r = await requete(cle, entetes);
      const location = r.entetes.get("location");
      const suivante = location ? new URL(location, url) : null;
      const html = r.corps;

      etapes.push({
        adresse: relatif(url),
        statut: r.statut,
        vers: suivante ? relatif(suivante) : null,
        lien: r.entetes.get("link"),
        langue: (balises(html, "html")[0] ?? {}).lang ?? null,
      });
      if (r.statut >= 300 && r.statut < 400 && suivante) {
        if (suivante.origin !== base.origin) return { etapes, boucle: false };
        url = suivante;
        continue;
      }

      return { etapes, boucle: false };
    }

    return { etapes, boucle: true };
  }

  return { base, requete, versBase, relatif, suivre };
}

async function enParallele(elements, nombre, fonction) {
  const resultats = new Array(elements.length);
  let suivant = 0;

  await Promise.all(
    Array.from({ length: Math.min(nombre, elements.length) }, async () => {
      while (suivant < elements.length) {
        const index = suivant++;

        resultats[index] = await fonction(elements[index], index);
      }
    }),
  );

  return resultats;
}

function hreflangs(lien) {
  if (!lien) return [];

  return [...lien.matchAll(/hreflang\s*=\s*"?([^";,\s]+)/gi)].map((m) => m[1]);
}

// ---------------------------------------------------------------------------
// Sitemap

async function adressesDuSitemap(reseau, options) {
  const adresses = [];
  const remarques = [];
  const file = ["/sitemap.xml"];
  const vus = new Set();

  while (file.length) {
    const url = reseau.versBase(file.shift());

    if (vus.has(url.href)) continue;
    vus.add(url.href);

    const r = await reseau.requete(url.href, { Accept: "application/xml,text/xml,*/*" });

    if (r.statut !== 200) throw new Error(`sitemap ${reseau.relatif(url)} : code HTTP ${r.statut}`);

    const locs = [...r.corps.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => decoderEntites(m[1]));

    if (/<sitemapindex\b/.test(r.corps)) {
      file.push(...locs);
      continue;
    }
    for (const loc of locs) {
      if (!loc.startsWith(`${options.origine}/fr`)) remarques.push(`adresse hors de ${options.origine}/fr : ${loc}`);
      adresses.push(loc);
    }
  }

  const doublons = adresses.filter((adresse, i) => adresses.indexOf(adresse) !== i);

  for (const doublon of new Set(doublons)) remarques.push(`adresse en double : ${doublon}`);

  return { adresses: [...new Set(adresses)], remarques };
}

// ---------------------------------------------------------------------------
// Contrôle d'une page

// Chemin décodé, sans barre finale (Next la retire), pour comparer page et référence.
function cheminNormalise(url) {
  let chemin = url.pathname;

  try {
    chemin = decodeURI(chemin);
  } catch {
    // Encodage invalide : le chemin brut sert tel quel.
  }

  return chemin.replace(/(.)\/$/, "$1");
}

async function controlerPage(adresse, { reseau, options, motifs, depuisSitemap }) {
  const url = reseau.versBase(adresse);
  const chemin = cheminNormalise(url);
  const page = { chemin: reseau.relatif(url), statut: null, duree: null, ecarts: [], avertissements: [], relire: [] };
  const ecart = (texte) => page.ecarts.push(texte);
  const avertissement = (texte) => page.avertissements.push(texte);
  let r;

  try {
    r = await reseau.requete(url.href);
  } catch (erreur) {
    ecart(`requête impossible : ${erreur.cause?.code ?? erreur.name} ${erreur.message}`);

    return page;
  }

  page.statut = r.statut;
  page.duree = r.duree;

  if (r.statut >= 300 && r.statut < 400) {
    const location = r.entetes.get("location");

    ecart(`redirige (${r.statut}) vers ${location ? reseau.relatif(new URL(location, url)) : "?"}${depuisSitemap ? " : adresse à retirer du sitemap" : ""}`);

    return page;
  }
  if (r.statut !== 200) ecart(`code HTTP ${r.statut}`);

  const typeContenu = r.entetes.get("content-type") ?? "";

  if (!typeContenu.includes("text/html")) {
    ecart(`contenu ${typeContenu || "sans type"} au lieu de HTML`);

    return page;
  }

  const html = r.corps;
  const sansCode = retirerBlocs(html, ["script", "style"]);
  const tete = retirerBlocs(html, ["script", "style", "svg"]);
  const metas = balises(html, "meta");
  const meta = (nom) => metas.find((m) => (m.name ?? m.property) === nom)?.content;

  // En-tête Link hreflang (next-intl l'envoie tant que plusieurs langues existent).
  const langues = hreflangs(r.entetes.get("link"));

  if (langues.length) ecart(`en-tête Link hreflang : ${langues.join(", ")}`);

  // Langue du document.
  page.langue = (balises(html, "html")[0] ?? {}).lang ?? null;
  if (page.langue !== "fr") ecart(`<html lang="${page.langue ?? ""}"> au lieu de lang="fr"`);

  // Indexation.
  const robots = `${meta("robots") ?? ""} ${r.entetes.get("x-robots-tag") ?? ""}`.toLowerCase();

  page.indexable = !robots.includes("noindex");
  if (depuisSitemap && !page.indexable) ecart("noindex alors que l'adresse est dans le sitemap");

  // Titre.
  const titres = [...tete.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)].map((m) => normaliserEspaces(decoderEntites(m[1])).trim());

  page.titre = titres[0] ?? null;
  if (!titres.length || !titres[0]) ecart("<title> absent ou vide");
  if (titres.length > 1) ecart(`${titres.length} balises <title>`);
  if (page.titre && page.titre.length > TITRE_MAX) avertissement(`titre de ${page.titre.length} caractères (${TITRE_MAX} au plus)`);

  // Description.
  page.description = meta("description") ?? null;
  if (!page.description) {
    if (page.indexable) ecart("description absente");
  } else if (page.description.length > DESCRIPTION_MAX) {
    avertissement(`description de ${page.description.length} caractères (${DESCRIPTION_MAX} au plus)`);
  }

  // Adresse de référence.
  const canonique = balises(html, "link").find((l) => (l.rel ?? "").toLowerCase().split(/\s+/).includes("canonical"))?.href ?? null;

  page.canonical = canonique;
  if (!canonique) {
    if (page.indexable) ecart("adresse de référence (canonical) absente");
  } else {
    let reference = null;

    try {
      reference = new URL(canonique);
    } catch {
      ecart(`adresse de référence non absolue : ${canonique}`);
    }
    if (reference) {
      const cheminReference = cheminNormalise(reference);

      if (reference.origin !== options.origine) ecart(`adresse de référence sur ${reference.origin} au lieu de ${options.origine}`);
      if (!cheminReference.startsWith("/fr")) ecart(`adresse de référence hors de /fr : ${cheminReference}`);
      else if (page.indexable && cheminReference !== chemin) ecart(`adresse de référence ${cheminReference} pour la page ${chemin}`);
    }
  }

  // Titres de niveau 1.
  page.h1 = (sansCode.match(/<h1\b/gi) ?? []).length;
  if (page.h1 !== 1) ecart(`${page.h1} balise(s) <h1> au lieu d'une`);

  // Données structurées.
  const blocs = blocsJsonLd(html);

  page.jsonld = [];
  for (const [index, bloc] of blocs.entries()) {
    try {
      page.jsonld.push(...typesJsonLd(JSON.parse(bloc)));
    } catch (erreur) {
      ecart(`JSON-LD n° ${index + 1} illisible : ${erreur.message}`);
    }
  }

  if (meta("og:phone_number") !== undefined) ecart(`balise og:phone_number (retirée par le plan) : ${meta("og:phone_number")}`);

  // Numéros publiés : texte visible, liens tel:, JSON-LD et balises meta.
  const visible = texteVisible(html);
  const liensTel = balises(html, "a")
    .map((a) => a.href ?? "")
    .filter((href) => href.toLowerCase().startsWith("tel:"));
  const mauvaisLiens = [...new Set(liensTel.map((href) => href.replace(/\s/g, "")).filter((href) => href !== LIEN_TEL_PUBLIE))];

  if (mauvaisLiens.length) ecart(`liens tel: autres que ${LIEN_TEL_PUBLIE} : ${mauvaisLiens.join(", ")}`);

  const sourcesNumeros = [visible, ...blocs, ...liensTel, ...metas.map((m) => m.content ?? "")].join(" | ");
  const autresNumeros = [...new Set(numerosDans(sourcesNumeros))].filter((n) => n !== NUMERO_PUBLIE);

  if (autresNumeros.length) ecart(`numéros autres que le 27 21 71 21 30 : ${autresNumeros.map(formaterNumero).join(", ")}`);

  // Motifs interdits : un seul extrait dans le message, jusqu'à trois dans page.motifs (JSON).
  const htmlDecode = normaliserEspaces(desechapperJs(decoderEntites(html)));

  page.motifs = [];
  for (const motif of motifs) {
    if (tolerePourPage(motif, chemin)) continue;

    const { total, extraits } = chercher(motif, motif.section === "html" ? htmlDecode : visible);

    if (!total) continue;
    page.motifs.push({ motif: motif.source, section: motif.section, total, extraits });

    const message = `motif « ${motif.source} » (${total}) : ${extraits[0]}`;

    if (motif.section === "relire") page.relire.push(message);
    else ecart(message);
  }

  return page;
}

// ---------------------------------------------------------------------------
// Contrôles généraux (tableau 1.3 et lot L1 du plan)

const CAS_GENERAUX = [
  { chemin: "/fr/xyz", nom: "adresse inconnue sous /fr : vraie 404 en français", etapes: [404], langue: "fr" },
  { chemin: "/xyz", nom: "adresse inconnue sans langue : 307 vers /fr/xyz puis 404", etapes: [[307, "/fr/xyz"], 404] },
  { chemin: "/en/restaurants", nom: "anglais redirigé en permanent", etapes: [["permanente", "/fr/restaurants"], 200] },
  { chemin: "/ar", nom: "arabe redirigé en permanent", etapes: [["permanente", "/fr"], 200] },
  { chemin: "/", nom: "navigateur en arabe : mène à /fr", entetes: { "Accept-Language": "ar" }, final: ["/fr", 200] },
  { chemin: "/", nom: "accueil sans langue : mène à /fr sans en-tête hreflang", final: ["/fr", 200], sansHreflang: true },
  { chemin: "/fr", nom: "accueil : aucun en-tête Link hreflang", etapes: [200], sansHreflang: true },
  { chemin: "/fr/franchise", nom: "franchise fusionnée dans l'histoire", etapes: [["permanente", "/fr/histoire#franchise"], 200] },
  { chemin: "/franchise", nom: "franchise sans langue", etapes: [["permanente", "/fr/histoire#franchise"], 200] },
  { chemin: "/fr/restaurants/nos-menus", nom: "ancienne carte", etapes: [["permanente", "/fr/carte"], 200] },
  { chemin: "/restaurants/nos-menus", nom: "ancienne carte sans langue", etapes: [["permanente", "/fr/carte"], 200] },
  { chemin: "/fr/carte-nation", nom: "Carte de la Nation vers l'adhésion", etapes: [["permanente", "/fr/carte-nation/adhesion"], 200] },
  { chemin: "/", nom: "racine : redirection permanente vers /fr", etapes: [["permanente", "/fr"], 200] },
  { chemin: "/manifest.json", nom: "ancien manifeste", etapes: [["permanente", "/manifest.webmanifest"], 200] },
  { chemin: "/app-mobile/menu/abc123", nom: "lien de partage d'un plat de l'appli", etapes: [[307, "/fr/app-mobile/deep-link?product=abc123"], 200] },
  { chemin: "/fr/app-mobile/download", nom: "téléchargement de l'appli : une seule redirection", etapes: [[307, "/fr/app-mobile/deep-link"], 200] },
  { chemin: "/fr/carte/plat-inexistant-123456", nom: "plat inconnu : la carte, sans page en cache", etapes: [["permanente", "/fr/carte"], 200] },
  { chemin: "/fr/carte/box", nom: "nom de catégorie : la section de la carte", etapes: [["permanente", "/fr/carte#box"], 200] },
  { chemin: "/fr/dashboard", nom: "tableau de bord supprimé : vraie 404", etapes: [404] },
  { chemin: "/fr/auth/login", nom: "connexion du personnel supprimée : vraie 404", etapes: [404] },
  { chemin: "/fr/sign-up", nom: "inscription supprimée : vraie 404", etapes: [404] },
];

const PERMANENTS = new Set([301, 308]);

function statutConforme(attendu, obtenu) {
  if (attendu === "permanente") return PERMANENTS.has(obtenu);

  return attendu === obtenu;
}

function decrireAttente(cas) {
  if (cas.final) return `aboutit à ${cas.final[0]} (${cas.final[1]})`;

  return cas.etapes
    .map((etape) => (Array.isArray(etape) ? `${etape[0] === "permanente" ? "301 ou 308" : etape[0]} vers ${etape[1]}` : `${etape}`))
    .join(", puis ");
}

function decrireChaine(resultat) {
  const court = (adresse) => (adresse.length > 70 ? `${adresse.slice(0, 70)}…` : adresse);
  const morceaux = resultat.etapes.slice(0, 3).map((e) => (e.vers ? `${e.statut} vers ${court(e.vers)}` : `${e.statut}`));
  const reste = resultat.etapes.length - morceaux.length;

  return `${morceaux.join(", puis ")}${reste > 0 ? `, puis ${reste} autre(s)` : ""}${resultat.boucle ? " (boucle)" : ""}`;
}

async function controlerCas(cas, reseau) {
  const sortie = { chemin: cas.chemin, nom: cas.nom, attendu: decrireAttente(cas), obtenu: null, ecarts: [] };
  let resultat;

  try {
    resultat = await reseau.suivre(cas.chemin, cas.entetes);
  } catch (erreur) {
    sortie.ecarts.push(`requête impossible : ${erreur.cause?.code ?? erreur.name} ${erreur.message}`);

    return sortie;
  }

  sortie.obtenu = decrireChaine(resultat);
  sortie.etapes = resultat.etapes.map(({ adresse, statut, vers }) => ({ adresse, statut, vers }));
  if (resultat.boucle) sortie.ecarts.push("boucle de redirections");

  const { etapes } = resultat;

  if (cas.etapes) {
    const conforme =
      !resultat.boucle &&
      etapes.length === cas.etapes.length &&
      cas.etapes.every((attendu, i) => {
        const obtenu = etapes[i];

        if (!Array.isArray(attendu)) return statutConforme(attendu, obtenu.statut) && !obtenu.vers;

        return statutConforme(attendu[0], obtenu.statut) && obtenu.vers === attendu[1];
      });

    if (!conforme && !resultat.boucle) sortie.ecarts.push(`attendu : ${sortie.attendu}`);
  }
  if (cas.final) {
    const derniere = etapes[etapes.length - 1];
    const cheminFinal = derniere?.adresse.replace(/#.*$/, "");

    if (resultat.boucle || cheminFinal !== cas.final[0] || derniere.statut !== cas.final[1]) sortie.ecarts.push(`attendu : ${sortie.attendu}`);
  }
  if (cas.langue) {
    const derniere = etapes[etapes.length - 1];

    if (derniere && derniere.langue !== cas.langue) sortie.ecarts.push(`page en lang="${derniere.langue ?? ""}" au lieu de lang="${cas.langue}"`);
  }
  if (cas.sansHreflang) {
    const langues = [...new Set(etapes.flatMap((e) => hreflangs(e.lien)))];

    if (langues.length) sortie.ecarts.push(`en-tête Link hreflang : ${langues.join(", ")}`);
  }

  return sortie;
}

// ---------------------------------------------------------------------------
// Construction (.next) : motifs interdits dans les fichiers produits

const EXTENSIONS_TEXTE = new Set([".html", ".rsc", ".js", ".mjs", ".json", ".body", ".meta", ".txt", ".xml"]);
const TAILLE_MAX = 10 * 1024 * 1024;

async function fichiersDe(dossier) {
  const resultat = [];
  let entrees;

  try {
    entrees = await readdir(dossier, { withFileTypes: true });
  } catch {
    return resultat;
  }
  for (const entree of entrees) {
    const complet = path.join(dossier, entree.name);

    if (entree.isDirectory()) resultat.push(...(await fichiersDe(complet)));
    else if (entree.isFile() && EXTENSIONS_TEXTE.has(path.extname(entree.name))) resultat.push(complet);
  }

  return resultat;
}

async function controlerConstruction(dossier, motifs) {
  const cibles = ["server/app", "static/chunks"].map((sous) => path.join(dossier, sous));
  const trouvailles = [];
  let nombreFichiers = 0;

  for (const cible of cibles) {
    try {
      await stat(cible);
    } catch {
      throw new ErreurUsage(`dossier de construction introuvable : ${cible}`);
    }
  }

  for (const cible of cibles) {
    for (const fichier of await fichiersDe(cible)) {
      const contenu = await readFile(fichier);

      if (contenu.length > TAILLE_MAX || contenu.subarray(0, 2000).includes(0)) continue;
      nombreFichiers++;

      const relatif = path.relative(dossier, fichier);
      const brut = contenu.toString("utf8");
      const estHtml = fichier.endsWith(".html");
      const texteHtml = normaliserEspaces(desechapperJs(decoderEntites(brut)));
      const visible = estHtml ? texteVisible(brut) : null;

      for (const motif of motifs) {
        if (motif.section === "relire") continue;
        if (motif.section === "texte" && !estHtml) continue;
        if (tolerePourFichier(motif, relatif)) continue;

        const { total, extraits } = chercher(motif, motif.section === "html" ? texteHtml : visible, 1);

        if (total) trouvailles.push({ motif: motif.source, fichier: relatif, total, extrait: extraits[0] });
      }
    }
  }

  return { dossier, fichiers: nombreFichiers, trouvailles };
}

// ---------------------------------------------------------------------------
// Affichage

function afficher(rapport) {
  const lignes = [];
  const ajouter = (texte = "") => lignes.push(texte);

  ajouter(`Contrôle du site ${rapport.base} (origine publique ${rapport.origine}), ${rapport.date}`);
  ajouter(`Motifs : ${path.relative(process.cwd(), rapport.interdits) || rapport.interdits}`);

  if (rapport.pages) {
    ajouter();
    ajouter(`Pages (${rapport.pages.length}${rapport.sourceSitemap ? ", depuis le sitemap" : ""})`);
    for (const remarque of rapport.remarquesSitemap ?? []) ajouter(`  SITEMAP  ${remarque}`);
    for (const page of rapport.pages) {
      const resume = [
        page.h1 !== undefined ? `${page.h1} h1` : null,
        page.jsonld ? `JSON-LD ${page.jsonld.length ? page.jsonld.join(", ") : "aucun"}` : null,
        page.indexable === undefined ? null : page.indexable ? "indexable" : "noindex",
        page.duree !== null ? `${(page.duree / 1000).toFixed(1).replace(".", ",")} s` : null,
      ].filter(Boolean);
      const etat = page.ecarts.length ? "ÉCART" : "ok   ";

      ajouter(`  ${etat} ${page.statut ?? "---"} ${page.chemin}${resume.length ? `  (${resume.join(" ; ")})` : ""}`);
      if (page.titre) ajouter(`        titre : ${page.titre}`);
      for (const texte of page.ecarts) ajouter(`        écart : ${texte}`);
      for (const texte of page.avertissements) ajouter(`        avertissement : ${texte}`);
      for (const texte of page.relire) ajouter(`        à relire : ${texte}`);
    }
  }

  if (rapport.generaux) {
    ajouter();
    ajouter(`Redirections et langues (${rapport.generaux.length} cas)`);
    for (const cas of rapport.generaux) {
      ajouter(`  ${cas.ecarts.length ? "ÉCART" : "ok   "} ${cas.chemin}  ${cas.nom}`);
      if (cas.ecarts.length) {
        ajouter(`        obtenu : ${cas.obtenu ?? "rien"}`);
        for (const texte of cas.ecarts) ajouter(`        écart : ${texte}`);
      }
    }
  }

  if (rapport.construction) {
    const { dossier, fichiers, trouvailles } = rapport.construction;

    ajouter();
    ajouter(`Construction ${path.relative(process.cwd(), dossier) || dossier} (${fichiers} fichiers lus)`);
    if (!trouvailles.length) ajouter("  ok    aucun motif interdit");

    const parMotif = new Map();

    for (const t of trouvailles) parMotif.set(t.motif, [...(parMotif.get(t.motif) ?? []), t]);
    for (const [motif, liste] of parMotif) {
      ajouter(`  ÉCART « ${motif} » dans ${liste.length} fichier(s)`);
      for (const t of liste.slice(0, 6)) ajouter(`        ${t.fichier} (${t.total}) : ${t.extrait}`);
      if (liste.length > 6) ajouter(`        … et ${liste.length - 6} autre(s)`);
    }
  }

  const r = rapport.resume;

  ajouter();
  ajouter("Résumé");
  if (rapport.pages) ajouter(`  Pages : ${r.pages} contrôlées, ${r.pagesEnEcart} avec écart, ${r.ecartsPages} écart(s), ${r.avertissements} avertissement(s), ${r.relire} à relire`);
  if (rapport.generaux) ajouter(`  Redirections et langues : ${r.cas} cas, ${r.casEnEcart} en écart`);
  if (rapport.construction) ajouter(`  Construction : ${r.trouvailles} motif(s) trouvé(s) dans les fichiers`);
  ajouter(`  Résultat : ${r.ecarts ? `${r.ecarts} écart(s)` : "aucun écart"}`);

  return lignes.join("\n");
}

const AIDE = `Usage : node scripts/controle-site.mjs [options] [chemin ou adresse ...]
Sans chemin, les adresses sont lues dans le sitemap du site contrôlé.
Options : --base <url>, --origine <url>, --sitemap, --sans-redirections, --redirections,
          --construction <dossier .next>, --interdits <fichier>, --parallele <n>,
          --delai <secondes>, --agent <texte>, --json
Voir l'en-tête du fichier pour le détail.`;

// ---------------------------------------------------------------------------

async function principal() {
  const options = lireOptions(process.argv.slice(2));

  if (options.aide) {
    console.log(AIDE);

    return 0;
  }

  const motifs = await lireInterdits(options.interdits);
  const reseau = creerReseau(options);
  const rapport = {
    base: options.base,
    origine: options.origine,
    date: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
    interdits: options.interdits,
  };

  if (options.pages || options.generaux) {
    try {
      await reseau.requete(`${options.base}/`);
    } catch (erreur) {
      console.error(`Site injoignable sur ${options.base} : ${erreur.cause?.code ?? erreur.message}`);

      return 2;
    }
  }

  if (options.pages) {
    let adresses = [...options.chemins];
    let depuisSitemap = new Set();

    if (!adresses.length || options.sitemap) {
      const sitemap = await adressesDuSitemap(reseau, options);

      depuisSitemap = new Set(sitemap.adresses);
      adresses = [...new Set([...adresses, ...sitemap.adresses])];
      rapport.sourceSitemap = true;
      rapport.remarquesSitemap = sitemap.remarques;
    }
    rapport.pages = await enParallele(adresses, options.parallele, (adresse) =>
      controlerPage(adresse, { reseau, options, motifs, depuisSitemap: depuisSitemap.has(adresse) }),
    );
  }

  if (options.generaux) {
    rapport.generaux = await enParallele(CAS_GENERAUX, options.parallele, (cas) => controlerCas(cas, reseau));
  }

  if (options.construction) rapport.construction = await controlerConstruction(options.construction, motifs);

  const pages = rapport.pages ?? [];
  const generaux = rapport.generaux ?? [];
  const trouvailles = rapport.construction?.trouvailles ?? [];
  const ecartsPages = pages.reduce((somme, p) => somme + p.ecarts.length, 0);
  const ecartsGeneraux = generaux.filter((c) => c.ecarts.length).length;

  rapport.resume = {
    pages: pages.length,
    pagesEnEcart: pages.filter((p) => p.ecarts.length).length,
    ecartsPages,
    avertissements: pages.reduce((somme, p) => somme + p.avertissements.length, 0),
    relire: pages.reduce((somme, p) => somme + p.relire.length, 0),
    cas: generaux.length,
    casEnEcart: ecartsGeneraux,
    trouvailles: trouvailles.length,
    ecarts: ecartsPages + ecartsGeneraux + trouvailles.length + (rapport.remarquesSitemap?.length ?? 0),
  };

  console.log(options.json ? JSON.stringify(rapport, null, 2) : afficher(rapport));

  return rapport.resume.ecarts ? 1 : 0;
}

principal().then(
  (code) => {
    process.exitCode = code;
  },
  (erreur) => {
    console.error(erreur instanceof ErreurUsage ? `Erreur : ${erreur.message}\n\n${AIDE}` : erreur);
    process.exitCode = 2;
  },
);
