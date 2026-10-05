// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  cheminPropre,
  LIENS_MENU_MOBILE,
  LIENS_NAVIGATION,
  LIENS_PIED,
  lienCourant,
  sansBarrePanier,
  sansBoutonCommander,
} from "./liens";

describe("cheminPropre", () => {
  it("retire la barre finale, la recherche et l'ancre", () => {
    expect(cheminPropre("/fr/carte/")).toBe("/fr/carte");
    expect(cheminPropre("/fr/carte?retrait=angre")).toBe("/fr/carte");
    expect(cheminPropre("/fr#avantages")).toBe("/fr");
    expect(cheminPropre("/")).toBe("/");
    expect(cheminPropre(null)).toBe("");
  });
});

describe("lienCourant", () => {
  it("marque la page elle-même", () => {
    expect(lienCourant("/fr/carte", "/fr/carte")).toBe("page");
    expect(lienCourant("/fr/histoire", "/fr/histoire/")).toBe("page");
  });

  it("marque la rubrique sur une page enfant", () => {
    expect(lienCourant("/fr/carte", "/fr/carte/box-de-la-nation-5b020e")).toBe(
      "true",
    );
    expect(lienCourant("/fr/restaurants", "/fr/restaurants/angre")).toBe(
      "true",
    );
  });

  it("ne marque ni une ancre de l'accueil ni une autre rubrique", () => {
    expect(lienCourant("/fr#avantages", "/fr")).toBeUndefined();
    expect(
      lienCourant("/fr/carte", "/fr/carte-nation/adhesion"),
    ).toBeUndefined();
    expect(lienCourant("/fr/carte", "/fr")).toBeUndefined();
    expect(lienCourant("/fr/carte", null)).toBeUndefined();
  });
});

describe("sansBoutonCommander", () => {
  it("masque « Commander » sur la carte et sur la caisse seulement", () => {
    expect(sansBoutonCommander("/fr/carte")).toBe(true);
    expect(sansBoutonCommander("/fr/commander")).toBe(true);
    expect(sansBoutonCommander("/fr/carte/box-de-la-nation-5b020e")).toBe(
      false,
    );
    expect(sansBoutonCommander("/fr/commander/3f9a2c")).toBe(false);
    expect(sansBoutonCommander("/fr")).toBe(false);
    expect(sansBoutonCommander(null)).toBe(false);
  });
});

describe("sansBarrePanier", () => {
  it("masque la barre sur la caisse et le suivi, pas sur Mes commandes", () => {
    expect(sansBarrePanier("/fr/commander")).toBe(true);
    expect(sansBarrePanier("/fr/commander/")).toBe(true);
    expect(sansBarrePanier("/fr/commander/0b5e2a1c-9f1e")).toBe(true);
    expect(sansBarrePanier("/fr/commander/mes-commandes")).toBe(false);
    expect(sansBarrePanier("/fr/carte")).toBe(false);
    expect(sansBarrePanier("/fr")).toBe(false);
  });
});

describe("liens du gabarit", () => {
  const hrefs = (liens) => liens.map((l) => l.href);

  it("navigation de l'en-tête (retouche 12)", () => {
    expect(hrefs(LIENS_NAVIGATION)).toEqual([
      "/fr/carte",
      "/fr/restaurants",
      "/fr#avantages",
      "/fr/histoire",
      "/fr/commander/mes-commandes",
    ]);
  });

  it("menu du téléphone : la navigation, plus la Carte de la Nation, l'application et la franchise", () => {
    for (const href of hrefs(LIENS_NAVIGATION))
      expect(hrefs(LIENS_MENU_MOBILE)).toContain(href);
    expect(hrefs(LIENS_MENU_MOBILE)).toContain("/fr/carte-nation/adhesion");
    expect(hrefs(LIENS_MENU_MOBILE)).toContain("/fr/app-mobile");
    expect(hrefs(LIENS_MENU_MOBILE)).toContain("/fr/histoire#franchise");
  });

  it("pied de page : les douze liens du plan, dans l'ordre", () => {
    expect(LIENS_PIED.map((l) => l.libelle)).toEqual([
      "La carte",
      "Mes commandes",
      "Restaurants",
      "Vos avantages",
      "Carte de la Nation",
      "Application",
      "Notre histoire",
      "Devenir franchisé",
      "Contact",
      "FAQ",
      "Politique de confidentialité",
      "Supprimer mon compte",
    ]);
    for (const l of [...LIENS_PIED, ...LIENS_MENU_MOBILE, ...LIENS_NAVIGATION])
      expect(l.href.startsWith("/fr")).toBe(true);
  });
});
