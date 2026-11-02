// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  DESCRIPTION_PAGE_AVIS,
  ERREURS_AVIS,
  LIBELLES_CANAUX,
  LIBELLES_RESSENTIS,
  TEXTES_AVIS,
  compteurCaracteres,
  ecranMerci,
  sourceAutorisee,
  sourceDepuisAdresse,
} from "./textes-avis";

const _ = " ";

/** Toutes les chaînes d'un objet de textes, à plat. */
const chaines = (valeur) =>
  typeof valeur === "string"
    ? [valeur]
    : Array.isArray(valeur)
      ? valeur.flatMap(chaines)
      : valeur && typeof valeur === "object"
        ? Object.values(valeur).flatMap(chaines)
        : [];

const MERCIS = [
  ["PAS_CONTENT", true],
  ["PAS_CONTENT", false],
  ["PEUT_MIEUX_FAIRE", true],
  ["PEUT_MIEUX_FAIRE", false],
  ["AU_TOP", true],
  ["AU_TOP", false],
].map(([ressenti, accord]) => ecranMerci(ressenti, accord));

const TOUS = [
  ...chaines(TEXTES_AVIS),
  ...chaines(LIBELLES_CANAUX),
  ...chaines(LIBELLES_RESSENTIS),
  ...chaines(ERREURS_AVIS),
  ...chaines(MERCIS),
  DESCRIPTION_PAGE_AVIS,
];

describe("écran Merci selon le ressenti et l'accord de rappel", () => {
  it("« sous 24 h » promis seulement au client pas content qui a accepté d'être rappelé", () => {
    expect(ecranMerci("PAS_CONTENT", true)).toEqual({
      titre: "ON EST DÉSOLÉS",
      message: `Ton message est bien arrivé. Un membre de l'équipe te rappelle sous 24${_}h pour trouver une solution.`,
    });
    expect(ecranMerci("PAS_CONTENT", false)).toEqual({
      titre: "ON EST DÉSOLÉS",
      message: "Ton message est bien arrivé. L'équipe le lit et s'en occupe.",
    });
    const avecPromesse = MERCIS.filter((m) => /24.h|rappel/.test(m.message));

    expect(avecPromesse).toEqual([ecranMerci("PAS_CONTENT", true)]);
  });

  it("un titre pour chacun des trois ressentis, avec ou sans accord", () => {
    for (const accord of [true, false]) {
      expect(ecranMerci("PEUT_MIEUX_FAIRE", accord)).toEqual({
        titre: "MERCI POUR TA FRANCHISE",
        message: "On regarde ce qui s'est passé et on s'améliore.",
      });
      expect(ecranMerci("AU_TOP", accord)).toEqual({
        titre: `MERCI${_}!`,
        message:
          "Ton message va droit au cœur de l'équipe. Tu fais partie de la Nation.",
      });
    }
  });
});

describe("textes de la page", () => {
  it("aucun tiret cadratin ni demi-cadratin", () => {
    for (const t of TOUS) expect(t).not.toMatch(/[—–]/);
  });

  it("insécable avant « : ? ! », jamais d'espace simple", () => {
    for (const t of TOUS) expect(t).not.toMatch(/ [:?!]/);
  });

  it("impératif à deux pronoms : « dis-le-nous », avec ses deux traits d'union", () => {
    for (const t of TOUS) expect(t).not.toMatch(/dis-le nous/i);
    expect(TEXTES_AVIS.presentation.paragraphes[1]).toContain(
      "dis-le-nous aussi.",
    );
    // Aussi dans la description de la page (résultat Google, partage).
    expect(DESCRIPTION_PAGE_AVIS).toContain(`hauteur${_}: dis-le-nous.`);
  });

  it("aucune donnée d'exemple de la maquette (numéro, référence, agent, stores écrits à la main)", () => {
    const texte = TOUS.join("\n");

    expect(texte).not.toMatch(/07 07 00 00|0707000|CN-|Agent 1|exemple/i);
    for (const store of ["Zone 4", "Faya", "Sococé", "Angré", "Yopougon"])
      expect(texte).not.toContain(store);
    // Valeur vide de la liste des canaux : « Choisir », sans tirets autour.
    expect(TEXTES_AVIS.experience.choisir).toBe("Choisir");
  });

  it("le client répond « Téléphone » (le back-office affiche « Manuel »)", () => {
    expect(LIBELLES_CANAUX.TELEPHONE).toBe("Téléphone");
    expect(Object.values(LIBELLES_CANAUX)).not.toContain("Manuel");
    expect(Object.values(LIBELLES_CANAUX)).toEqual([
      "Appli Chicken Nation",
      "Site web",
      "Téléphone",
      "WhatsApp",
      "Sur place en store",
      "Autre plateforme",
    ]);
    expect(Object.values(LIBELLES_RESSENTIS)).toEqual([
      "Au top",
      "Peut mieux faire",
      "Pas content",
    ]);
  });

  it("compteur « 0 / 1 000 »", () => {
    expect(compteurCaracteres(0)).toBe(`0${_}/${_}1${_}000`);
    expect(compteurCaracteres(1000)).toBe(`1${_}000${_}/${_}1${_}000`);
  });

  it("mention de suppression avec le numéro public", () => {
    expect(TEXTES_AVIS.numero.mentionDebut).toBe(
      `Ton avis reste privé et n'est utilisé que pour traiter ton retour. Pour le faire supprimer${_}: `,
    );
  });
});

describe("source lue dans l'adresse (QR codes)", () => {
  it("codes de la liste blanche, jumelle du serveur", () => {
    for (const code of ["marque-page", "ticket", "sac", "site"])
      expect(sourceAutorisee(code)).toBe(code);
    expect(sourceDepuisAdresse("?source=marque-page")).toBe("marque-page");
    expect(sourceDepuisAdresse("?utm_source=fb&source=Ticket")).toBe("ticket");
  });

  it("toute autre valeur, ou son absence, devient « site »", () => {
    for (const recherche of [
      "",
      "?",
      "?source=",
      "?source=facebook",
      "?source=marque_page",
      "?source=%3Cscript%3E",
      `?source=${"a".repeat(41)}`,
      "?utm_source=marque-page",
    ])
      expect(sourceDepuisAdresse(recherche)).toBe("site");
    expect(sourceAutorisee(null)).toBe("site");
    expect(sourceAutorisee(42)).toBe("site");
  });
});
