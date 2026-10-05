#!/usr/bin/env node
// Poids des pages d'une construction de production (lot L0 du plan d'intégration).
//
// Pour chaque page de l'App Router : JavaScript chargé au premier affichage (fichiers
// communs de buildManifest.rootMainFiles et fichiers d'entrée du manifeste client de
// la page), CSS et polices préchargées, comparés aux budgets de la section 5.4 du plan.
// Les fichiers de buildManifest.polyfillFiles ne sont pas comptés : chargés en
// nomodule, seuls les très vieux navigateurs les téléchargent.
//
// Tailles brutes, gzip (niveau 9) et brotli calculées sur les fichiers de .next/static.
// À lancer après `node node_modules/next/dist/bin/next build`, jamais sur le dossier
// du serveur de développement.
//
// Node 20 ou plus, sans dépendance.
//
// Usage :
//   node scripts/budget-js.mjs [--dossier .next] [--toutes] [--json]
//   bun run budget [options]
//
// Options :
//   --dossier <chemin>  dossier de construction (défaut : .next à la racine du site)
//   --toutes            montre aussi les pages internes (_not-found, _global-error)
//                       et celles du groupe (protected)
//   --json              rapport complet en JSON sur la sortie standard
//
// Code de sortie : 0 budgets tenus, 1 au moins un dépassement, 2 erreur.

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import zlib from "node:zlib";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KO = 1024;

// Budgets de la section 5.4 du plan, en ko gzip. Pages repérées par leur route
// sans les groupes entre parenthèses.
const BUDGETS_JS = new Map([
  ["/[locale]", 170],
  ["/[locale]/histoire", 170],
  ["/[locale]/restaurants", 170],
  ["/[locale]/restaurants/[restaurant]", 170],
  ["/[locale]/carte/[plat]", 170],
  ["/[locale]/carte", 200],
  ["/[locale]/commander", 260],
]);
const BUDGET_CSS = 30;
const BUDGET_POLICES = { fichiers: 6, ko: 100 };

class ErreurUsage extends Error {}

function lireOptions(argv) {
  const options = { dossier: path.join(RACINE, ".next"), toutes: false, json: false };

  for (let i = 0; i < argv.length; i++) {
    const option = argv[i];

    switch (option) {
      case "--dossier": {
        const valeur = argv[++i];

        if (!valeur) throw new ErreurUsage("valeur manquante après --dossier");
        options.dossier = path.resolve(process.cwd(), valeur);
        break;
      }
      case "--toutes":
        options.toutes = true;
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
        throw new ErreurUsage(`option inconnue : ${option}`);
    }
  }

  return options;
}

async function lireJson(fichier) {
  try {
    return JSON.parse(await readFile(fichier, "utf8"));
  } catch (erreur) {
    throw new ErreurUsage(`lecture impossible de ${fichier} (${erreur.code ?? erreur.message}) : lancer d'abord la construction de production`);
  }
}

async function manifestesClients(dossier) {
  const resultat = [];
  const entrees = await readdir(dossier, { withFileTypes: true });

  for (const entree of entrees) {
    const complet = path.join(dossier, entree.name);

    if (entree.isDirectory()) resultat.push(...(await manifestesClients(complet)));
    else if (entree.name === "page_client-reference-manifest.js") resultat.push(complet);
  }

  return resultat;
}

// Le manifeste est un script qui remplit globalThis.__RSC_MANIFEST : exécuté dans
// un contexte isolé plutôt qu'avec eval.
async function lireManifeste(fichier) {
  const contexte = {};

  contexte.self = contexte;
  contexte.globalThis = contexte;
  vm.createContext(contexte);
  vm.runInContext(await readFile(fichier, "utf8"), contexte, { filename: fichier });

  const [[cle, manifeste]] = Object.entries(contexte.__RSC_MANIFEST ?? {});

  return { cle, manifeste };
}

function relatifStatique(fichier) {
  return fichier.replace(/^\/?_next\//, "").replace(/^\//, "");
}

function creerMesure(dossier) {
  const cache = new Map();

  return async function mesurer(fichier) {
    const relatif = relatifStatique(fichier);

    if (!cache.has(relatif)) {
      cache.set(
        relatif,
        readFile(path.join(dossier, relatif)).then(
          (contenu) => ({
            brut: contenu.length,
            gzip: zlib.gzipSync(contenu, { level: 9 }).length,
            brotli: zlib.brotliCompressSync(contenu).length,
          }),
          () => ({ brut: 0, gzip: 0, brotli: 0, absent: true }),
        ),
      );
    }

    return cache.get(relatif);
  };
}

async function somme(fichiers, mesurer) {
  const total = { brut: 0, gzip: 0, brotli: 0, absents: [] };

  for (const fichier of fichiers) {
    const taille = await mesurer(fichier);

    total.brut += taille.brut;
    total.gzip += taille.gzip;
    total.brotli += taille.brotli;
    if (taille.absent) total.absents.push(fichier);
  }

  return total;
}

function routeAffichee(cle) {
  const route = cle
    .replace(/\/page$/, "")
    .replace(/\/\([^)]+\)/g, "")
    .replace(/^$/, "/");

  return route || "/";
}

const ko = (octets) => Math.round(octets / KO);

function aligner(lignes) {
  const largeurs = lignes[0].map((_, colonne) => Math.max(...lignes.map((ligne) => String(ligne[colonne]).length)));

  return lignes.map((ligne) =>
    ligne
      .map((cellule, colonne) => (colonne === 0 ? String(cellule).padEnd(largeurs[colonne]) : String(cellule).padStart(largeurs[colonne])))
      .join("  "),
  );
}

async function principal() {
  const options = lireOptions(process.argv.slice(2));

  if (options.aide) {
    console.log("Usage : node scripts/budget-js.mjs [--dossier .next] [--toutes] [--json]");

    return 0;
  }

  const { dossier } = options;
  const buildManifest = await lireJson(path.join(dossier, "build-manifest.json"));
  const polices = await lireJson(path.join(dossier, "server", "next-font-manifest.json"));
  const polyfills = new Set(buildManifest.polyfillFiles ?? []);
  const communs = (buildManifest.rootMainFiles ?? []).filter((fichier) => !polyfills.has(fichier));
  const mesurer = creerMesure(dossier);
  let identifiant = "";

  try {
    identifiant = (await readFile(path.join(dossier, "BUILD_ID"), "utf8")).trim();
  } catch {
    identifiant = "inconnu";
  }

  const pages = [];

  for (const fichier of await manifestesClients(path.join(dossier, "server", "app"))) {
    const { cle, manifeste } = await lireManifeste(fichier);

    if (!cle || !manifeste) continue;
    if (!options.toutes && (cle.includes("(protected)") || /^\/_/.test(cle))) continue;

    const js = new Set(communs);
    const css = new Set();

    for (const liste of Object.values(manifeste.entryJSFiles ?? {})) liste.forEach((f) => js.add(relatifStatique(f)));
    for (const liste of Object.values(manifeste.entryCSSFiles ?? {})) {
      liste.forEach((f) => css.add(relatifStatique(typeof f === "string" ? f : f.path)));
    }

    // Polices préchargées par next/font pour cette page.
    const fichiersPolices = [...new Set(polices.app?.[`[project]/app${cle}`] ?? [])];
    const route = routeAffichee(cle);
    const budgetJs = BUDGETS_JS.get(route) ?? null;
    const mesureJs = await somme(js, mesurer);
    const mesureCss = await somme(css, mesurer);
    const mesurePolices = await somme(fichiersPolices, mesurer);
    const depassements = [];

    if (budgetJs !== null && ko(mesureJs.gzip) > budgetJs) depassements.push(`JS ${ko(mesureJs.gzip)} ko > ${budgetJs} ko`);
    if (ko(mesureCss.gzip) > BUDGET_CSS) depassements.push(`CSS ${ko(mesureCss.gzip)} ko > ${BUDGET_CSS} ko`);
    if (fichiersPolices.length > BUDGET_POLICES.fichiers) depassements.push(`${fichiersPolices.length} polices > ${BUDGET_POLICES.fichiers}`);
    if (ko(mesurePolices.brut) > BUDGET_POLICES.ko) depassements.push(`polices ${ko(mesurePolices.brut)} ko > ${BUDGET_POLICES.ko} ko`);

    pages.push({
      route,
      cle,
      js: { fichiers: js.size, brut: mesureJs.brut, gzip: mesureJs.gzip, brotli: mesureJs.brotli, absents: mesureJs.absents },
      css: { fichiers: css.size, brut: mesureCss.brut, gzip: mesureCss.gzip, absents: mesureCss.absents },
      polices: { fichiers: fichiersPolices.map((f) => path.basename(f)), brut: mesurePolices.brut },
      budgetJs,
      depassements,
    });
  }

  pages.sort((a, b) => a.route.localeCompare(b.route));

  const rapport = {
    dossier,
    construction: identifiant,
    budgets: { js: Object.fromEntries(BUDGETS_JS), css: BUDGET_CSS, polices: BUDGET_POLICES },
    polyfillsExclus: [...polyfills],
    pages,
    depassements: pages.reduce((total, page) => total + page.depassements.length, 0),
  };

  if (options.json) {
    console.log(JSON.stringify(rapport, null, 2));
  } else {
    const lignes = [["Page", "JS fich.", "JS brut", "JS gzip", "JS br", "Budget JS", "CSS gzip", "Polices", "État"]];

    for (const page of pages) {
      lignes.push([
        page.route,
        page.js.fichiers,
        `${ko(page.js.brut)} ko`,
        `${ko(page.js.gzip)} ko`,
        `${ko(page.js.brotli)} ko`,
        page.budgetJs === null ? "aucun" : `${page.budgetJs} ko`,
        `${ko(page.css.gzip)} ko`,
        `${page.polices.fichiers.length} / ${ko(page.polices.brut)} ko`,
        page.depassements.length ? "DÉPASSÉ" : "ok",
      ]);
    }

    console.log(`Construction ${path.relative(process.cwd(), dossier) || dossier} (BUILD_ID ${identifiant})`);
    console.log(`Polyfills exclus : ${[...polyfills].join(", ") || "aucun"}`);
    console.log(`Budgets : JS selon la page, CSS ${BUDGET_CSS} ko gzip, polices ${BUDGET_POLICES.fichiers} fichiers et ${BUDGET_POLICES.ko} ko`);
    console.log();
    console.log(aligner(lignes).join("\n"));

    const absents = [...new Set(pages.flatMap((page) => [...page.js.absents, ...page.css.absents]))];

    if (absents.length) console.log(`\nFichiers introuvables (comptés 0) : ${absents.join(", ")}`);

    const enDepassement = pages.filter((page) => page.depassements.length);

    console.log();
    if (!enDepassement.length) console.log("Tous les budgets sont tenus.");
    for (const page of enDepassement) console.log(`DÉPASSÉ ${page.route} : ${page.depassements.join(" ; ")}`);
  }

  return rapport.depassements ? 1 : 0;
}

principal().then(
  (code) => {
    process.exitCode = code;
  },
  (erreur) => {
    console.error(erreur instanceof ErreurUsage ? `Erreur : ${erreur.message}` : erreur);
    process.exitCode = 2;
  },
);
