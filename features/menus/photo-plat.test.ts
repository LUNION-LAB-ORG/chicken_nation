// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "bun:test";

import { FOND_PHOTO_PLAT, aPhotoRecadree, photoPlat } from "./photo-plat";
import photosRecadrees from "./data/photos-plats.json";
// Instantané de production du 02/10 (`.maquette-site/dishes.json`), réduit aux champs lus par le site.
import platsProduction from "./tests/plats-production-0210.json";

const DOSSIER = path.join(
  import.meta.dir,
  "..",
  "..",
  "public",
  "assets",
  "plats",
);
const idDe = (nom) => platsProduction.find((p) => p.name === nom).id;

describe("photo recadrée", () => {
  it("associe 48 plats sur 49 de la production, FRITE RT ORANGINA sans photo", () => {
    const sans = platsProduction
      .filter((p) => !aPhotoRecadree(p.id))
      .map((p) => p.name);

    expect(sans).toEqual(["FRITE RT ORANGINA"]);
    expect(Object.keys(photosRecadrees)).toHaveLength(48);
  });

  it("donne le fichier, le fond, les dimensions et l'étiquette", () => {
    const id = idDe("BOX DE LA NATION");

    expect(photoPlat(id, "chicken-nation/dishes/x.jpg")).toEqual({
      src: `/assets/plats/${id}.webp`,
      fond: "#FBEACA",
      largeur: 900,
      hauteur: 787,
      ratio: 1.144,
      etiquette: true,
      recadree: true,
    });
    // Seule photo sur fond blanc, sans étiquette (retouche 5).
    expect(photoPlat(idDe("GBONHI MAX"), null)).toMatchObject({
      fond: "#FFFFFF",
      etiquette: false,
      recadree: true,
    });
    // Wrap très haut et photo très large restent décrits tels quels.
    expect(photoPlat(idDe("CHICKEN SANDWICH"), null).ratio).toBe(0.441);
  });

  it("a un fichier par plat associé, et aucun fichier orphelin", () => {
    const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith(".webp"));

    expect(fichiers.sort()).toEqual(
      Object.keys(photosRecadrees)
        .map((id) => `${id}.webp`)
        .sort(),
    );
    for (const [id, r] of Object.entries(photosRecadrees)) {
      expect(existsSync(path.join(DOSSIER, `${id}.webp`))).toBe(true);
      expect(Math.abs(r.ratio - r.l / r.h)).toBeLessThan(0.001);
      // En-tête RIFF/WEBP : le fichier n'est pas une autre image renommée.
      const octets = readFileSync(path.join(DOSSIER, `${id}.webp`));

      expect(
        octets.toString("ascii", 0, 4) + octets.toString("ascii", 8, 12),
      ).toBe("RIFFWEBP");
    }
  });
});

describe("repli sur la photo de l'API", () => {
  it("garde la photo de l'API, carrée, sur le fond crème et sans étiquette CSS", () => {
    expect(
      photoPlat(idDe("FRITE RT ORANGINA"), "https://exemple.test/frite.jpg"),
    ).toEqual({
      src: "https://exemple.test/frite.jpg",
      fond: FOND_PHOTO_PLAT,
      largeur: 1080,
      hauteur: 1080,
      ratio: 1,
      etiquette: false,
      recadree: false,
    });
    const nouveau = photoPlat(
      "nouveau-plat",
      "chicken-nation/dishes/nouveau.jpg",
    );

    expect(nouveau.src.endsWith("/chicken-nation/dishes/nouveau.jpg")).toBe(
      true,
    );
    expect(nouveau.recadree).toBe(false);
  });

  it("montre le logo sur fond crème pour un plat sans photo", () => {
    expect(photoPlat("sans-photo", null)).toMatchObject({
      src: "/assets/images/logo.png",
      fond: FOND_PHOTO_PLAT,
      etiquette: false,
      recadree: false,
    });
  });
});
