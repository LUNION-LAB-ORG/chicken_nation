// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  ajouterLigne,
  articlesHorsMode,
  basculerOption,
  commandableEnLigne,
  construireLigne,
  erreurLignesRecues,
  LIGNES_MAX,
  detailsLigne,
  epiceDeLigne,
  fcfa,
  groupeIncomplet,
  normaliserGroupes,
  platDisponibleMaintenant,
  problemesLigne,
  QUANTITE_MAX,
  QUANTITE_SUPPLEMENT_MAX,
  remplacerLigne,
  retirerArticlesHorsMode,
  signatureLigne,
  signaturePanier,
  totalLigne,
} from "./panier.utils";

import { fcfa as fcfaSite, INSECABLE as _ } from "@/lib/typo";

/** Ligne de panier minimale, clé recalculée comme le fait la fiche. */
function ligne(o = {}) {
  const l = {
    dish_id: "plat-a",
    nom: "BOX DE LA NATION",
    image: "",
    prixUnitaire: 5000,
    epice: false,
    options: [],
    supplements: [],
    quantite: 1,
    available_order_types: ["DELIVERY", "PICKUP"],
    ...o,
  };

  return {
    ...l,
    cle: o.cle ?? signatureLigne(l.dish_id, l.epice, l.options, l.supplements),
  };
}

const coca = (quantite = 1, modes = ["DELIVERY", "PICKUP"]) => ({
  id: "coca",
  nom: "COCA 0,5L",
  prix: 1000,
  quantite,
  available_order_types: modes,
});

const SAUCES = {
  id: "g-sauce",
  name: "Sauce",
  description: null,
  min_select: 1,
  max_select: 1,
  position: 0,
  items: [
    {
      id: "bbq",
      label: "Barbecue",
      price_delta: 0,
      is_default: true,
      available: true,
      position: 0,
    },
    {
      id: "cheddar",
      label: "Cheddar",
      price_delta: 500,
      is_default: false,
      available: true,
      position: 1,
    },
  ],
};
const ACCOMPAGNEMENTS = {
  id: "g-acc",
  name: "Accompagnements",
  description: "Deux au plus",
  min_select: 0,
  max_select: 2,
  position: 1,
  items: [
    {
      id: "coleslaw",
      label: "Coleslaw",
      price_delta: 0,
      is_default: false,
      available: true,
      position: 0,
    },
    {
      id: "frites",
      label: "Frites",
      price_delta: 500,
      is_default: false,
      available: true,
      position: 1,
    },
    {
      id: "popcorn",
      label: "Pop corn",
      price_delta: 1000,
      is_default: false,
      available: false,
      position: 2,
    },
  ],
};

const PLAT = {
  id: "plat-a",
  name: "MENU À COMPOSER",
  description: "",
  image: "https://cdn.exemple.test/plat.jpg",
  prix: 6000,
  prixAvantPromo: null,
  spice_level: "OPTIONAL",
  available_order_types: ["DELIVERY", "PICKUP", "TABLE"],
  available_from: null,
  available_until: null,
  restaurantsExclus: ["resto-x"],
  groupes: [SAUCES, ACCOMPAGNEMENTS],
  supplements: [
    {
      id: "coca",
      name: "COCA",
      price: 1000,
      category: "DRINK",
      available_order_types: ["DELIVERY", "PICKUP"],
      image: null,
      position: 0,
    },
    {
      id: "glace",
      name: "GLACE",
      price: 1500,
      category: "DRINK",
      available_order_types: ["PICKUP"],
      image: null,
      position: 1,
    },
  ],
};

describe("fcfa", () => {
  it("est la version unique de lib/typo.ts, avec insécables", () => {
    expect(fcfa).toBe(fcfaSite);
    expect(fcfa(12500)).toBe(`12${_}500${_}FCFA`);
  });
});

describe("totalLigne", () => {
  it("compte options par plat et suppléments une fois pour la ligne", () => {
    const l = ligne({
      prixUnitaire: 5000,
      quantite: 2,
      options: [
        {
          item_id: "cheddar",
          group_id: "g-sauce",
          label: "Cheddar",
          price_delta: 500,
        },
      ],
      supplements: [coca(3)],
    });

    expect(totalLigne(l)).toBe((5000 + 500) * 2 + 1000 * 3);
  });
});

describe("ajouterLigne", () => {
  it("fusionne deux ajouts identiques et additionne leurs suppléments", () => {
    const a = ligne({ supplements: [coca(1)] });
    const panier = ajouterLigne(
      ajouterLigne([], a),
      ligne({ supplements: [coca(1)] }),
    );

    expect(panier).toHaveLength(1);
    expect(panier[0].quantite).toBe(2);
    expect(panier[0].supplements[0].quantite).toBe(2);
    expect(panier[0].cle).toBe(signatureLigne("plat-a", false, [], [coca(2)]));
  });

  it("garde deux lignes quand l'épicé diffère", () => {
    const panier = ajouterLigne(
      [ligne({ epice: true })],
      ligne({ epice: false }),
    );

    expect(panier).toHaveLength(2);
  });
});

describe("remplacerLigne (« Mettre à jour »)", () => {
  const a = ligne({ dish_id: "a" });
  const b = ligne({ dish_id: "b" });
  const c = ligne({ dish_id: "c" });

  it("remplace la ligne à sa place", () => {
    const nouvelle = ligne({ dish_id: "b", epice: true, quantite: 3 });
    const panier = remplacerLigne([a, b, c], 1, nouvelle, b.cle);

    expect(panier.map((l) => l.dish_id)).toEqual(["a", "b", "c"]);
    expect(panier[1].epice).toBe(true);
    expect(panier[1].quantite).toBe(3);
  });

  it("fusionne avec une autre ligne devenue identique", () => {
    const panier = remplacerLigne(
      [a, b, c],
      1,
      ligne({ dish_id: "c", quantite: 2 }),
      b.cle,
    );

    expect(panier.map((l) => `${l.dish_id}×${l.quantite}`)).toEqual([
      "a×1",
      "c×3",
    ]);
  });

  it("retrouve la ligne par sa clé si le panier a bougé (autre onglet)", () => {
    const panier = remplacerLigne(
      [b, c],
      2,
      ligne({ dish_id: "c", epice: true }),
      c.cle,
    );

    expect(panier.map((l) => `${l.dish_id}:${l.epice}`)).toEqual([
      "b:false",
      "c:true",
    ]);
  });

  it("ajoute la ligne si celle à modifier a disparu", () => {
    const panier = remplacerLigne([a], 0, ligne({ dish_id: "b" }), "disparue");

    expect(panier.map((l) => l.dish_id)).toEqual(["a", "b"]);
  });
});

describe("signaturePanier", () => {
  it("change avec une quantité ou un choix, pas avec un plat retiré", () => {
    const a = ligne();

    expect(signaturePanier([a])).toBe(signaturePanier([{ ...a }]));
    expect(signaturePanier([a])).not.toBe(
      signaturePanier([{ ...a, quantite: 2 }]),
    );
    expect(signaturePanier([a, ligne({ dish_id: "z", retire: true })])).toBe(
      signaturePanier([a]),
    );
  });
});

describe("groupes d'options", () => {
  it("normaliserGroupes garde la description et trie par position", () => {
    const groupes = normaliserGroupes([
      { ...ACCOMPAGNEMENTS, position: 1, description: "  Deux   au plus " },
      { ...SAUCES, position: 0, description: "" },
    ]);

    expect(groupes.map((g) => g.id)).toEqual(["g-sauce", "g-acc"]);
    expect(groupes[0].description).toBeNull();
    expect(groupes[1].description).toBe("Deux au plus");
  });

  it("groupeIncomplet trouve le premier groupe sous son minimum", () => {
    expect(groupeIncomplet([SAUCES, ACCOMPAGNEMENTS], [])?.id).toBe("g-sauce");
    const choix = [
      {
        item_id: "bbq",
        group_id: "g-sauce",
        label: "Barbecue",
        price_delta: 0,
      },
    ];

    expect(groupeIncomplet([SAUCES, ACCOMPAGNEMENTS], choix)).toBeNull();
  });

  it("basculerOption : choix unique remplacé, multiple borné, indisponible ignoré", () => {
    let s = basculerOption([], SAUCES, "bbq");

    s = basculerOption(s, SAUCES, "cheddar");
    expect(s.map((o) => o.item_id)).toEqual(["cheddar"]);
    // Minimum 1 : on ne décoche pas le dernier choix.
    expect(basculerOption(s, SAUCES, "cheddar")).toEqual(s);
    let a = basculerOption([], ACCOMPAGNEMENTS, "coleslaw");

    a = basculerOption(a, ACCOMPAGNEMENTS, "frites");
    expect(basculerOption(a, ACCOMPAGNEMENTS, "popcorn")).toEqual(a);
    expect(a).toHaveLength(2);
  });
});

describe("disponibilité", () => {
  const a = (h, m = 0) => new Date(Date.UTC(2026, 9, 5, h, m));

  it("platDisponibleMaintenant suit le créneau, minute de fin comprise, passage de minuit", () => {
    expect(platDisponibleMaintenant(null, null, a(3))).toBe(true);
    expect(platDisponibleMaintenant("11:00", "15:00", a(15, 0))).toBe(true);
    expect(platDisponibleMaintenant("11:00", "15:00", a(15, 1))).toBe(false);
    expect(platDisponibleMaintenant("22:00", "02:00", a(1))).toBe(true);
    expect(platDisponibleMaintenant("22:00", "02:00", a(12))).toBe(false);
    expect(platDisponibleMaintenant("00:00", "00:00", a(12))).toBe(true);
  });

  it("problemesLigne : mode, supplément, créneau, choix à refaire", () => {
    const l = ligne({
      available_order_types: ["PICKUP"],
      supplements: [coca(1, ["PICKUP"])],
      available_from: "11:00",
      available_until: "12:00",
      choixManquant: "Sauce",
    });
    const p = problemesLigne(l, "DELIVERY", a(18));

    expect(p[0]).toMatch(/^Nouveau choix à faire : Sauce\./);
    expect(p).toContain("Indisponible en livraison.");
    expect(p).toContain("COCA 0,5L : indisponible en livraison.");
    expect(p).toContain("Servi seulement de 11:00 à 12:00.");
    expect(problemesLigne(ligne(), "DELIVERY", a(18))).toEqual([]);
  });

  it("commandableEnLigne : un plat servi seulement sur place ne s'ajoute pas", () => {
    expect(commandableEnLigne(["TABLE"])).toBe(false);
    expect(commandableEnLigne(["PICKUP", "TABLE"])).toBe(true);
    expect(commandableEnLigne([])).toBe(true);
  });
});

describe("articles à emporter", () => {
  const babatche = ligne({
    dish_id: "babatche",
    nom: "BABATCHÊ",
    available_order_types: ["PICKUP"],
  });
  const box = ligne({
    dish_id: "box",
    nom: "BOX",
    supplements: [
      coca(1),
      {
        ...coca(1),
        id: "glace",
        nom: "GLACE",
        available_order_types: ["PICKUP"],
      },
    ],
  });

  it("articlesHorsMode liste plats et suppléments sans doublon", () => {
    expect(
      articlesHorsMode([babatche, box, { ...babatche, cle: "x" }], "DELIVERY"),
    ).toEqual(["BABATCHÊ", "GLACE"]);
    expect(articlesHorsMode([babatche, box], "PICKUP")).toEqual([]);
  });

  it("retirerArticlesHorsMode retire les plats, les suppléments, et refait la clé", () => {
    const panier = retirerArticlesHorsMode([babatche, box], "DELIVERY");

    expect(panier).toHaveLength(1);
    expect(panier[0].supplements.map((s) => s.id)).toEqual(["coca"]);
    expect(panier[0].cle).toBe(signatureLigne("box", false, [], [coca(1)]));
    expect(articlesHorsMode(panier, "DELIVERY")).toEqual([]);
  });

  it("retirerArticlesHorsMode fusionne les lignes devenues identiques", () => {
    const avecGlace = ligne({
      dish_id: "box",
      supplements: [
        { ...coca(1), id: "glace", available_order_types: ["PICKUP"] },
      ],
    });
    const sansRien = ligne({ dish_id: "box" });
    const panier = retirerArticlesHorsMode([avecGlace, sansRien], "DELIVERY");

    expect(panier).toHaveLength(1);
    expect(panier[0].quantite).toBe(2);
  });
});

describe("fiche plat", () => {
  it("epiceDeLigne : imposé ou choisi, null tant que rien n'est choisi", () => {
    expect(epiceDeLigne("ALWAYS", null)).toBe(true);
    expect(epiceDeLigne("NEVER", true)).toBe(false);
    expect(epiceDeLigne("OPTIONAL", null)).toBeNull();
    expect(epiceDeLigne("OPTIONAL", false)).toBe(false);
  });

  it("construireLigne : même ligne que la fiche, quantités bornées", () => {
    const options = [
      {
        item_id: "cheddar",
        group_id: "g-sauce",
        label: "Cheddar",
        price_delta: 500,
      },
    ];
    const l = construireLigne(PLAT, {
      epice: true,
      options,
      supplements: { coca: 2, inconnu: 3, glace: 0 },
      quantite: 80,
    });

    expect(l.quantite).toBe(QUANTITE_MAX);
    expect(l.supplements).toEqual([
      {
        id: "coca",
        nom: "COCA",
        prix: 1000,
        quantite: 2,
        available_order_types: ["DELIVERY", "PICKUP"],
      },
    ]);
    expect(l.cle).toBe(signatureLigne("plat-a", true, options, l.supplements));
    expect(l.spice_level).toBe("OPTIONAL");
    expect(l.restaurantsExclus).toEqual(["resto-x"]);
    expect(totalLigne(l)).toBe((6000 + 500) * 50 + 2000);
    const borne = construireLigne(PLAT, {
      epice: false,
      options: [],
      supplements: { coca: 99 },
      quantite: 0,
    });

    expect(borne.quantite).toBe(1);
    expect(borne.supplements[0].quantite).toBe(QUANTITE_SUPPLEMENT_MAX);
  });

  it("detailsLigne : choix, « Non épicé » seulement si le client a choisi, suppléments", () => {
    const options = [
      {
        item_id: "frites",
        group_id: "g-acc",
        label: "Frites",
        price_delta: 500,
      },
    ];

    expect(
      detailsLigne({
        options,
        supplements: [coca(2)],
        epice: false,
        spice_level: "OPTIONAL",
      }),
    ).toEqual({
      choix: "Frites · Non épicé",
      supplements: `+ 2${_}Coca 0,5${_}l`,
    });
    expect(
      detailsLigne({ options: [], supplements: [], epice: false }).choix,
    ).toBe("");
    expect(
      detailsLigne({
        options: [],
        supplements: [],
        epice: true,
        spice_level: "ALWAYS",
      }).choix,
    ).toBe("Épicé");
  });
});

describe("lignes reçues du navigateur (recette sécurité B2)", () => {
  it("un panier normal passe", () => {
    expect(erreurLignesRecues([ligne({ supplements: [coca(2)] })])).toBeNull();
  });

  it("quantités de supplément ou de plat non entières, nulles ou négatives : refusées", () => {
    for (const q of [0.01, -3, 1.5, Number.NaN, "2"]) {
      expect(
        erreurLignesRecues([
          ligne({ supplements: [{ ...coca(), quantite: q }] }),
        ]),
      ).toContain("supplément non valable");
    }
    for (const q of [0, 1.5, -1, 51, "1"]) {
      expect(erreurLignesRecues([ligne({ quantite: q })])).toContain(
        "quantité non valable",
      );
    }
  });

  it("forme abîmée, panier vide ou trop long : refusé sans erreur", () => {
    expect(erreurLignesRecues(null)).toBe("Votre panier est vide.");
    expect(erreurLignesRecues([])).toBe("Votre panier est vide.");
    expect(erreurLignesRecues([null])).toContain("n'a pas pu être lu");
    expect(erreurLignesRecues([{ ...ligne(), options: "x" }])).toContain(
      "n'a pas pu être lu",
    );
    expect(
      erreurLignesRecues(Array.from({ length: LIGNES_MAX + 1 }, () => ligne())),
    ).toContain("trop de lignes");
  });
});
