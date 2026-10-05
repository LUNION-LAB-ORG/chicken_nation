// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { PageContact } from "./PageContact";

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

const contact = renderToStaticMarkup(<PageContact />);

describe("Contact", () => {
  it("un seul h1, numéro unique, aucun numéro de restaurant", () => {
    expect(niveaux(contact).filter((n) => n === 1)).toHaveLength(1);
    expect(contact).toContain(">Nous contacter</h1>");
    const texte = sansInsecables(contact);

    for (const motif of motifsInterdits()) expect(texte).not.toMatch(motif);
    for (const tel of contact.match(/href="tel:[^"]*"/g) ?? [])
      expect(tel).toBe(`href="tel:+2252721712130"`);
    expect(contact).toContain(`href="mailto:info@chicken-nation.com"`);
  });

  it("formulaire « contact » partagé, libellés reliés aux champs", () => {
    for (const champ of ["nom", "prenom", "email", "telephone", "message"]) {
      expect(contact).toContain(`for="contact-${champ}"`);
      expect(contact).toContain(`id="contact-${champ}"`);
    }
    // Attribut HTML insensible à la casse (React l'écrit autoComplete).
    expect(contact).toMatch(/autocomplete="email"/i);
    expect(contact).toContain(`aria-labelledby="ecrire-titre"`);
    expect(contact).toContain(`method="post"`);
  });

  it("typographie : insécable avant ? ! : ;", () => {
    expect(texteVisible(contact)).not.toMatch(/\w [?!:;]/);
  });
});
