// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, spyOn } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { AppelCarte } from "./AppelCarte";
import { Atouts } from "./Atouts";
import { EnteteHistoire } from "./EnteteHistoire";
import { Equipe } from "./Equipe";
import { ENGAGEMENTS, Franchise, RAISONS } from "./Franchise";
import { Origine } from "./Origine";
import { SavoirFaire } from "./SavoirFaire";
import { VALEURS, Valeurs } from "./Valeurs";

// Motifs [html] et [texte] de scripts/interdits.txt (annexe A du plan).
function motifsInterdits() {
  const lignes = fs
    .readFileSync(path.join(process.cwd(), "scripts", "interdits.txt"), "utf8")
    .split("\n");
  const motifs = [];
  let section = "";

  for (const brute of lignes) {
    const ligne = brute.trim();

    if (!ligne || ligne.startsWith("#")) continue;
    if (/^\[\w+\]$/.test(ligne)) {
      section = ligne;
      continue;
    }
    if (section === "[relire]") continue;
    motifs.push(new RegExp(ligne.replace(/\s+@sauf\s+\S+$/, "")));
  }

  return motifs;
}

const sansInsecables = (html) => html.replace(/[   ]/g, " ");

/** Texte visible : balises retirées, entités courantes décodées. */
const texteVisible = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

/** Niveaux de titres dans l'ordre du document. */
const niveaux = (html) =>
  [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));

// Un titre en police d'affiche avec un caractère absent de la police est
// signalé par console.error (TitreAffiche) : aucun ne doit l'être.
let espion;
let html;

beforeAll(() => {
  espion = spyOn(console, "error");
  html = renderToStaticMarkup(
    <>
      <EnteteHistoire />
      <Origine />
      <Valeurs />
      <SavoirFaire />
      <Equipe />
      <Atouts />
      <Franchise />
      <AppelCarte />
    </>,
  );
});

afterAll(() => espion.mockRestore());

describe("Notre histoire", () => {
  it("un seul h1, titres dans l'ordre, aucun titre d'affiche refusé", () => {
    const suite = niveaux(html);

    expect(suite.filter((n) => n === 1)).toHaveLength(1);
    expect(html).toMatch(
      /<h1[^>]*id="titre-histoire"[^>]*>Notre histoire<\/h1>/,
    );
    // Jamais un saut de niveau (h2 puis h4).
    for (let i = 1; i < suite.length; i++)
      expect(suite[i] - suite[i - 1]).toBeLessThanOrEqual(1);
    expect(espion).not.toHaveBeenCalled();
  });

  it("section franchise : id, titre h2 et formulaire « franchise »", () => {
    expect(html).toMatch(
      /<section[^>]*aria-labelledby="franchise-titre"[^>]*id="franchise"/,
    );
    expect(html).toMatch(
      /<h2[^>]*id="franchise-titre"[^>]*>La franchise Chicken Nation<\/h2>/,
    );
    expect(html).toContain(`id="franchise-nom"`);
    expect(html).toContain(`aria-labelledby="franchise-demande"`);
    // Champ piège présent mais jamais affiché.
    expect(html).toMatch(/<div hidden="">[\s\S]*?name="site_web"/);
    // Lien de l'en-tête vers la section.
    expect(html).toContain(`href="#franchise"`);
  });

  it("contenu repris : valeurs, raisons et engagements au complet", () => {
    expect(VALEURS).toHaveLength(3);
    expect(RAISONS.map((r) => r.points.length)).toEqual([4, 4, 4]);
    expect(ENGAGEMENTS.map((e) => e.points.length)).toEqual([4, 4, 4]);
    for (const texte of [
      "Notre secret",
      "Et en cuisine",
      "père Champion dans poulet",
      "Qualité sans compromis",
      "Une cuisine authentique",
      "Une famille passionnée",
      "Formation continue",
      "De l&#x27;élevage au service",
      "Pourquoi nous rejoindre",
      "Nos engagements",
      "Voir la carte et commander",
    ])
      expect(html).toContain(texte);
  });

  it("ni logo partenaire, ni icône floue, ni vidéo, ni ancienne image", () => {
    expect(html).not.toMatch(/turbo|glovo|yango|partenaire/i);
    expect(html).not.toMatch(/icone-[123]\.png|picture-[123]\.png/);
    expect(html).not.toContain("/assets/images/");
    expect(html).not.toContain("<video");
  });

  it("une seule image préchargée : le fond de l'en-tête", () => {
    const images = html.match(/<img[^>]*>/g) ?? [];

    for (const img of images) expect(img).toMatch(/ alt="/);
    // Préchargée par React : toute image ni différée ni en priorité basse.
    const prechargees = images.filter(
      (img) => !/loading="lazy"/.test(img) && !/fetchPriority="low"/.test(img),
    );

    expect(prechargees).toHaveLength(1);
    expect(prechargees[0]).toContain("fond-salle.webp");
    // La photo de l'origine, dans le premier écran sur ordinateur, n'attend
    // pas le défilement.
    expect(images.find((img) => img.includes("histoire-poule.webp"))).toContain(
      'loading="eager"',
    );
  });

  it("aucun motif interdit, seul numéro le 27 21 71 21 30", () => {
    const texte = sansInsecables(html);

    for (const motif of motifsInterdits()) expect(texte).not.toMatch(motif);
    const liens = html.match(/href="tel:[^"]*"/g) ?? [];

    expect(liens.length).toBeGreaterThan(0);
    for (const tel of liens) expect(tel).toBe(`href="tel:+2252721712130"`);
  });

  it("typographie : insécable avant ? ! : ; et avant %, aucun anglicisme repris", () => {
    const texte = texteVisible(html);

    expect(texte).not.toMatch(/\w [?!:;]/);
    expect(texte).not.toMatch(/\d %/);
    expect(texte).not.toMatch(
      /made in|success story|marketing|reporting|digita|\bkit\b|support (continu|marketing|administratif)/i,
    );
  });
});
