// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  cheminPlat,
  lireSuffixe,
  resoudreSlugPlat,
  slugPlat,
  suffixePlat,
  suffixesEnDouble,
} from "./plats.slug";
import platsProduction from "./tests/plats-production-0210.json";

import { slugifier } from "@/lib/seo/slug";
// Instantané de production du 02/10 (`.maquette-site/dishes.json`), réduit aux champs lus par le site.

const plats = platsProduction.map((p) => ({ id: p.id, nom: p.name }));

describe("adresse d'un plat", () => {
  it("met le nom sans accents puis les 6 premiers caractères de l'identifiant", () => {
    expect(
      slugPlat({
        id: "5b020e13-0f6f-4d5c-9c5e-1a2b3c4d5e6f",
        nom: "BOX DE LA NATION",
      }),
    ).toBe("box-de-la-nation-5b020e");
    expect(slugPlat({ id: "ec0bc5b2-xxxx", nom: "MÉCHANT MÉCHANT" })).toBe(
      "mechant-mechant-ec0bc5",
    );
    expect(slugPlat({ id: "949ad43e-xxxx", nom: "NUGGETS (12 PCS)" })).toBe(
      "nuggets-12-pcs-949ad4",
    );
    expect(slugPlat({ id: "368b82c5-xxxx", nom: "FRITE ET CODY'S" })).toBe(
      "frite-et-codys-368b82",
    );
    expect(slugPlat({ id: "AB12CD34", nom: "  " })).toBe("plat-ab12cd");
    expect(cheminPlat({ id: "53d01278-1163", nom: "AGBÔLOR" })).toBe(
      "/fr/carte/agbolor-53d012",
    );
    expect(slugifier("Œuf & BŒUF")).toBe("oeuf-boeuf");
  });

  it("distingue les cinq noms en double de la production", () => {
    const parNom = new Map();

    for (const p of plats)
      parNom.set(p.nom, [...(parNom.get(p.nom) ?? []), slugPlat(p)]);
    const doubles = Array.from(parNom.entries()).filter(
      ([, s]) => s.length > 1,
    );

    expect(doubles.map(([nom]) => nom).sort()).toEqual([
      "HOT CREAMY BEEF",
      "HOT CREAMY POULET",
      "MÉCHANT MÉCHANT",
      "NATION CURRY",
      "PEPPER MAYO BEEF",
    ]);
    for (const [, slugs] of doubles)
      expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("n'a aucun suffixe en double sur la carte de production", () => {
    expect(plats).toHaveLength(49);
    expect(suffixesEnDouble(plats)).toEqual([]);
    expect(new Set(plats.map(slugPlat)).size).toBe(49);
  });
});

describe("retrouver un plat par son adresse", () => {
  const box = plats.find((p) => p.nom === "BOX DE LA NATION");

  it("trouve chaque plat de la production par son adresse exacte", () => {
    for (const p of plats)
      expect(resoudreSlugPlat(slugPlat(p), plats)).toEqual({
        type: "trouve",
        plat: p,
      });
  });

  it("redirige un nom modifié vers la nouvelle adresse", () => {
    const renomme = plats.map((p) =>
      p.id === box.id ? { ...p, nom: "BOX NATION XL" } : p,
    );

    expect(resoudreSlugPlat("box-de-la-nation-5b020e", renomme)).toEqual({
      type: "redirection",
      plat: { id: box.id, nom: "BOX NATION XL" },
      slug: "box-nation-xl-5b020e",
    });
    // Casse ou encodage différents : même plat, adresse de référence rétablie.
    expect(resoudreSlugPlat("BOX-DE-LA-NATION-5B020E", plats).type).toBe(
      "trouve",
    );
    expect(
      resoudreSlugPlat("box%2Dde%2Dla%2Dnation%2D5b020e", plats).type,
    ).toBe("trouve");
    expect(resoudreSlugPlat("5b020e", plats)).toEqual({
      type: "redirection",
      plat: box,
      slug: "box-de-la-nation-5b020e",
    });
  });

  it("signale un plat retiré et une adresse illisible", () => {
    expect(resoudreSlugPlat("box-de-la-nation-000000", plats)).toEqual({
      type: "retire",
    });
    expect(resoudreSlugPlat("xyz", plats)).toEqual({ type: "illisible" });
    expect(resoudreSlugPlat("", plats)).toEqual({ type: "illisible" });
    expect(resoudreSlugPlat("%E0%A4%A", plats)).toEqual({ type: "illisible" });
  });

  it("départage deux plats au même suffixe par l'adresse exacte", () => {
    const jumeaux = [
      { id: "abcdef-1", nom: "PREMIER" },
      { id: "abcdef-2", nom: "SECOND" },
    ];

    expect(suffixesEnDouble(jumeaux)).toEqual(["abcdef"]);
    expect(resoudreSlugPlat("second-abcdef", jumeaux)).toEqual({
      type: "trouve",
      plat: jumeaux[1],
    });
    expect(resoudreSlugPlat("autre-abcdef", jumeaux).type).toBe("redirection");
  });

  it("lit le suffixe en fin d'adresse", () => {
    expect(lireSuffixe("nuggets-12-pcs-949ad4")).toBe("949ad4");
    expect(lireSuffixe("nuggets-12-pcs")).toBeNull();
    expect(suffixePlat("5B020E13-0F6F")).toBe("5b020e");
  });
});
