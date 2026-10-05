// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  CATEGORIES_SITE,
  CLE_PROMOTIONS,
  categorieDuSite,
  comparerCategories,
} from "./carte.categories";
import {
  aEmporterUniquement,
  construireCarte,
  fourchettePrix,
  platEnVedette,
  platsDeLaCarte,
  platVitrine,
} from "./carte";
// Instantané de production du 02/10 (`.maquette-site/dishes.json`), réduit aux champs lus par le site.
import platsProduction from "./tests/plats-production-0210.json";

const plat = (id, nom, categorie, prix, extra = {}) => ({
  id,
  name: nom,
  description: null,
  price: prix,
  is_promotion: false,
  promotion_price: null,
  image: null,
  entity_status: "ACTIVE",
  category: categorie === null ? null : { name: categorie },
  ...extra,
});

describe("table des catégories", () => {
  it("garde l'ordre et les clés de la maquette", () => {
    expect(CATEGORIES_SITE.map((c) => c.cle)).toEqual([
      "promotions",
      "box",
      "pane",
      "ailes",
      "burgers",
      "sandwichs",
      "nuggets",
      "combos",
    ]);
  });

  it("reconnaît un nom de la base sans tenir compte des accents, de la casse ni des espaces", () => {
    expect(categorieDuSite("POULET PANÉ")).toMatchObject({
      cle: "pane",
      libelle: "Poulet pané",
      ordre: 2,
    });
    expect(categorieDuSite("poulet  pane ")).toMatchObject({ cle: "pane" });
    expect(categorieDuSite("LES BURGERS")).toMatchObject({
      cle: "burgers",
      court: "Burger",
    });
  });

  it("donne une clé tirée du nom et l'ordre alphabétique à une catégorie inconnue", () => {
    const inconnue = categorieDuSite("Test bascule paiement");

    expect(inconnue).toEqual({
      cle: "test-bascule-paiement",
      libelle: "Test bascule paiement",
      court: "Test bascule paiement",
      vitrine: null,
      ordre: null,
    });
    expect(categorieDuSite("DESSERTS GLACÉS").cle).toBe("desserts-glaces");
    // Jamais la même ancre qu'une catégorie de la table.
    expect(categorieDuSite("Box").cle).toBe("box-2");

    const triees = [
      categorieDuSite("Zébu"),
      categorieDuSite("COMBOS"),
      categorieDuSite("Assiettes"),
      categorieDuSite("NOS BOX"),
    ]
      .sort(comparerCategories)
      .map((c) => c.libelle);

    expect(triees).toEqual(["Nos box", "Combos", "Assiettes", "Zébu"]);
  });
});

describe("carte de production (instantané du 02/10)", () => {
  const carte = construireCarte(platsProduction);

  it("range les 49 plats actifs, chacun dans sa catégorie, dans l'ordre de la table", () => {
    expect(carte.map((c) => c.cle)).toEqual([
      "promotions",
      "box",
      "pane",
      "ailes",
      "burgers",
      "sandwichs",
      "nuggets",
      "combos",
    ]);
    expect(platsDeLaCarte(carte)).toHaveLength(49);
    expect(new Set(platsDeLaCarte(carte).map((p) => p.id))).toEqual(
      new Set(platsProduction.map((p) => p.id)),
    );
    const compte = Object.fromEntries(
      carte.map((c) => [c.cle, c.plats.length]),
    );

    expect(compte).toEqual({
      promotions: 6,
      box: 7,
      pane: 9,
      ailes: 6,
      burgers: 9,
      sandwichs: 8,
      nuggets: 3,
      combos: 6,
    });
  });

  it("réunit dans Promotions les plats en promotion et la catégorie PROMOTIONS", () => {
    const promotions = carte.find((c) => c.cle === CLE_PROMOTIONS);

    expect(promotions.nom).toBe("Promotions");
    expect(promotions.plats.map((p) => p.nom)).toEqual([
      "SKINNY MAX",
      "BOX 2K26 PRO",
      "BIG CHICKEN",
      "BOX DE LA NATION",
      "BOX 2K26 PRO MAX",
      "GBONHI MAX",
    ]);
    // Un plat en promotion reste aussi dans sa catégorie, avec son prix barré.
    const box = carte
      .find((c) => c.cle === "box")
      .plats.find((p) => p.nom === "BOX DE LA NATION");

    expect(box).toMatchObject({
      prix: 6000,
      prixAvantPromo: 8500,
      categorie: { cle: "box", nom: "Nos box", court: "Box" },
    });
    // GBONHI MAX n'a pas d'autre catégorie que PROMOTIONS.
    const gbonhi = promotions.plats.find((p) => p.nom === "GBONHI MAX");

    expect(gbonhi.categorie).toEqual({
      cle: "promotions",
      nom: "Promotions",
      court: "Promotion",
    });
  });

  it("trie chaque catégorie par prix croissant", () => {
    for (const c of carte) {
      const prix = c.plats.map((p) => p.prix);

      expect(prix).toEqual([...prix].sort((a, b) => a - b));
    }
  });

  it("réduit chaque plat aux champs du site", () => {
    const agbolor = platsDeLaCarte(carte).find((p) => p.nom === "AGBÔLOR");

    expect(Object.keys(agbolor).sort()).toEqual(
      [
        "categorie",
        "composable",
        "creneau",
        "description",
        "id",
        "image",
        "modes",
        "modifieLe",
        "nom",
        "photo",
        "prix",
        "prixAvantPromo",
        "slug",
      ].sort(),
    );
    expect(agbolor).toMatchObject({
      slug: "agbolor-53d012",
      prix: 7000,
      prixAvantPromo: null,
      composable: true,
      creneau: null,
      modes: ["DELIVERY", "PICKUP", "TABLE"],
      modifieLe: "2026-07-28T12:44:00.011Z",
    });
    // La carte réduite reste petite (la réponse brute fait 776 ko).
    expect(JSON.stringify(carte).length).toBeLessThan(60_000);
  });

  it("met en vedette la plus forte remise en francs", () => {
    expect(platEnVedette(carte)).toMatchObject({
      nom: "GBONHI MAX",
      prix: 12000,
      prixAvantPromo: 18000,
    });
  });

  it("illustre chaque catégorie par le plat vitrine de la table", () => {
    expect(
      Object.fromEntries(carte.map((c) => [c.cle, platVitrine(c)?.nom])),
    ).toEqual({
      promotions: "GBONHI MAX",
      box: "BOX DE LA NATION",
      pane: "GBONHI",
      ailes: "AILES CRISPY 12 PCS",
      burgers: "BURGER PATRON",
      sandwichs: "CHICKEN SANDWICH",
      nuggets: "NUGGETS (12 PCS)",
      combos: "FRITE ET COCA",
    });
  });

  it("donne la fourchette des prix payés", () => {
    expect(fourchettePrix(carte)).toEqual({ min: 2000, max: 22000 });
    expect(fourchettePrix([])).toBeNull();
  });
});

describe("carte de la base de test", () => {
  // Forme de GET /dishes sur l'API de test (localhost:4020) au 05/10.
  const carte = construireCarte([
    plat("42636181-a", "BABATCHÊ", "NOS BOX", 22000, {
      available_order_types: ["PICKUP", "TABLE"],
    }),
    plat("e6f76a6d-a", "BIG CHICKEN", "NOS BOX", 8000),
    plat("939cf341-a", "BOX 2K26 PRO", "NOS BOX", 10000, {
      is_promotion: true,
      promotion_price: 4500,
    }),
    plat("29cd5e84-a", "MENU À COMPOSER", "NOS BOX", 6000, {
      composable: true,
    }),
    plat("bf938cda-a", "Plat test bascule", "Test bascule paiement", 12000),
  ]);

  it("place une catégorie inconnue après celles de la table", () => {
    expect(carte.map((c) => [c.cle, c.nom, c.plats.length])).toEqual([
      ["promotions", "Promotions", 1],
      ["box", "Nos box", 4],
      ["test-bascule-paiement", "Test bascule paiement", 1],
    ]);
  });

  it("repère les plats à emporter seulement", () => {
    const tous = platsDeLaCarte(carte);

    expect(tous.filter(aEmporterUniquement).map((p) => p.nom)).toEqual([
      "BABATCHÊ",
    ]);
    expect(aEmporterUniquement({ modes: [] })).toBe(false);
  });

  it("prend un plat de la catégorie quand le plat vitrine n'y est pas", () => {
    const test = carte.find((c) => c.cle === "test-bascule-paiement");

    expect(platVitrine(test).nom).toBe("Plat test bascule");
  });
});

describe("règles de tri des plats", () => {
  it("écarte les plats inactifs ou sans catégorie, et supprime Promotions sans promotion", () => {
    const carte = construireCarte([
      plat("a1", "ACTIF", "COMBOS", 2000),
      plat("a2", "RETIRÉ", "COMBOS", 2000, { entity_status: "DELETED" }),
      plat("a3", "SANS CATÉGORIE", null, 2000),
      // Prix promo absent, nul ou supérieur au prix : pas en promotion.
      plat("a4", "FAUSSE PROMO", "COMBOS", 2000, {
        is_promotion: true,
        promotion_price: 0,
      }),
      plat("a5", "PROMO TROP CHÈRE", "COMBOS", 2000, {
        is_promotion: true,
        promotion_price: 2500,
      }),
    ]);

    expect(carte.map((c) => c.cle)).toEqual(["combos"]);
    expect(
      carte[0].plats.map((p) => [p.nom, p.prix, p.prixAvantPromo]),
    ).toEqual([
      ["ACTIF", 2000, null],
      ["FAUSSE PROMO", 2000, null],
      ["PROMO TROP CHÈRE", 2000, null],
    ]);
    expect(platEnVedette(carte)).toBeNull();
  });

  it("lit le créneau horaire comme le serveur", () => {
    const [c] = construireCarte([
      plat("b1", "MIDI", "COMBOS", 2000, {
        available_from: "11:00",
        available_until: "15:00",
      }),
      plat("b2", "NUIT", "COMBOS", 2100, {
        available_from: "22:00",
        available_until: "02:00",
      }),
      plat("b3", "TOUJOURS", "COMBOS", 2200, {
        available_from: "00:00",
        available_until: "00:00",
      }),
      plat("b4", "ILLISIBLE", "COMBOS", 2300, {
        available_from: "midi",
        available_until: "15:00",
      }),
    ]);

    expect(c.plats.map((p) => p.creneau)).toEqual([
      { debut: "11:00", fin: "15:00" },
      { debut: "22:00", fin: "02:00" },
      null,
      null,
    ]);
  });

  it("à remise égale, met en vedette le plat le plus cher", () => {
    const carte = construireCarte([
      plat("c1", "PETITE", "COMBOS", 3000, {
        is_promotion: true,
        promotion_price: 2000,
      }),
      plat("c2", "GRANDE", "COMBOS", 6000, {
        is_promotion: true,
        promotion_price: 5000,
      }),
    ]);

    expect(platEnVedette(carte).nom).toBe("GRANDE");
  });
});
