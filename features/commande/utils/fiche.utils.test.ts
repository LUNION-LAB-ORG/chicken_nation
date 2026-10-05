// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  aideMaximum,
  choixInitiaux,
  decouperLibelle,
  empechementPlat,
  groupesIncomplets,
  ligneAModifier,
  ligneDeFiche,
  mentionPlatHorsMode,
  mentionSupplementHorsMode,
  messageGroupe,
  messageSupplementHorsMode,
  regleGroupe,
  supplementsParCategorie,
  totalFiche,
} from "./fiche.utils";
import { problemesHorsMode, nomsHorsMode } from "./tiroir.utils";
import { remplacerLigne, signatureLigne } from "./panier.utils";

const _ = "\u00a0";

const item = (id, label, prix = 0, extra = {}) => ({
  id,
  label,
  price_delta: prix,
  is_default: false,
  available: true,
  position: 0,
  ...extra,
});
const SAUCE = {
  id: "g-sauce",
  name: "SAUCE",
  description: null,
  min_select: 1,
  max_select: 1,
  position: 0,
  items: [
    item("bbq", "BARBECUE", 0, { is_default: true }),
    item("ail", "Crème à l'ail"),
    item("cheddar", "Cheddar : fondu maison", 500),
  ],
};
const ACCOMP = {
  id: "g-acc",
  name: "Accompagnements",
  description: null,
  min_select: 0,
  max_select: 2,
  position: 1,
  items: [
    item("coleslaw", "Coleslaw"),
    item("frites", "Frites", 500),
    item("pop", "Pop corn de poulet", 1000, { available: false }),
  ],
};
const supp = (id, name, price, category, position = 0, types) => ({
  id,
  name,
  price,
  category,
  available_order_types: types ?? ["DELIVERY", "PICKUP"],
  image: null,
  position,
});
const PLAT = {
  id: "29cd5e84-707d-4beb-8eb4-30e8f50b8a35",
  name: "MENU À COMPOSER",
  description: "",
  image: "https://cdn.exemple.test/menu.jpg",
  prix: 6000,
  prixAvantPromo: null,
  spice_level: "OPTIONAL",
  available_order_types: ["DELIVERY", "PICKUP"],
  available_from: null,
  available_until: null,
  restaurantsExclus: [],
  groupes: [SAUCE, ACCOMP],
  supplements: [
    supp("coca", "COCA", 1000, "DRINK", 1),
    supp("glace", "GLACE VANILLE", 1500, "DRINK", 0, ["PICKUP"]),
    supp("bbq-s", "BARBECUE", 1000, "FOOD"),
    supp("fries", "CHEDDAR FRIES", 2000, "ACCESSORY"),
  ],
};

describe("decouperLibelle", () => {
  it("découpe sur « : » et met en forme", () => {
    expect(decouperLibelle("Cheddar : fondu MAISON")).toEqual({
      titre: "Cheddar",
      detail: "Fondu maison",
    });
    expect(decouperLibelle("HOT CREAMY BBQ")).toEqual({
      titre: "Hot creamy BBQ",
      detail: "",
    });
    // Un « : » en tête n'est pas une séparation.
    expect(decouperLibelle(": seul").titre).toBe(": seul");
  });
});

describe("règles des groupes", () => {
  it("annonce obligatoire ou facultatif et le nombre de choix", () => {
    expect(regleGroupe({ min_select: 1, max_select: 1 })).toBe(
      "Obligatoire · 1 choix",
    );
    expect(regleGroupe({ min_select: 0, max_select: 2 })).toBe(
      `Facultatif · jusqu'à 2${_}choix`,
    );
    expect(regleGroupe({ min_select: 1, max_select: 3 })).toBe(
      `Obligatoire · 1 à 3${_}choix`,
    );
    expect(regleGroupe({ min_select: 2, max_select: 2 })).toBe(
      `Obligatoire · 2${_}choix`,
    );
  });

  it("messages d'erreur et d'aide", () => {
    expect(messageGroupe({ min_select: 1 })).toBe(
      "Choisissez une option pour continuer.",
    );
    expect(messageGroupe({ min_select: 2 })).toBe(
      `Choisissez au moins 2${_}options pour continuer.`,
    );
    expect(aideMaximum({ max_select: 2 })).toBe(
      `2${_}choix au maximum${_}: décochez-en un pour changer.`,
    );
  });

  it("groupes incomplets dans l'ordre de la fiche", () => {
    expect(groupesIncomplets([SAUCE, ACCOMP], []).map((g) => g.id)).toEqual([
      "g-sauce",
    ]);
    expect(
      groupesIncomplets(
        [SAUCE, ACCOMP],
        [{ item_id: "ail", group_id: "g-sauce", label: "", price_delta: 0 }],
      ),
    ).toEqual([]);
  });
});

describe("choixInitiaux", () => {
  it("nouveau plat : choix par défaut, épicé à choisir, quantité 1", () => {
    const c = choixInitiaux(PLAT);

    expect(c.epice).toBeNull();
    expect(c.options.map((o) => o.item_id)).toEqual(["bbq"]);
    expect(c.supplements).toEqual({});
    expect(c.quantite).toBe(1);
  });

  it("épicé imposé par le plat", () => {
    expect(choixInitiaux({ ...PLAT, spice_level: "ALWAYS" }).epice).toBe(true);
    expect(choixInitiaux({ ...PLAT, spice_level: "NEVER" }).epice).toBe(false);
  });

  it("« Modifier » : choix de la ligne relus sur le plat du jour", () => {
    const ligne = {
      cle: "x",
      dish_id: PLAT.id,
      nom: PLAT.name,
      image: "",
      prixUnitaire: 6000,
      epice: true,
      options: [
        {
          item_id: "cheddar",
          group_id: "g-sauce",
          label: "ancien",
          price_delta: 300,
        },
        { item_id: "pop", group_id: "g-acc", label: "Pop", price_delta: 1000 },
        {
          item_id: "retire",
          group_id: "g-acc",
          label: "Retiré",
          price_delta: 0,
        },
      ],
      supplements: [
        { id: "coca", nom: "COCA", prix: 1000, quantite: 2 },
        { id: "disparu", nom: "X", prix: 100, quantite: 1 },
        { id: "fries", nom: "CHEDDAR FRIES", prix: 2000, quantite: 99 },
      ],
      quantite: 80,
      available_order_types: ["DELIVERY"],
    };
    const c = choixInitiaux(PLAT, ligne);

    // Choix indisponible ou retiré écarté ; libellé et prix du jour.
    expect(c.options).toEqual([
      {
        item_id: "cheddar",
        group_id: "g-sauce",
        label: "Cheddar : fondu maison",
        price_delta: 500,
      },
    ]);
    expect(c.epice).toBe(true);
    expect(c.supplements).toEqual({ coca: 2, fries: 20 });
    expect(c.quantite).toBe(50);
  });
});

describe("ligne et total de la fiche", () => {
  it("total en direct : plat, options, quantité, suppléments une fois", () => {
    const c = {
      ...choixInitiaux(PLAT),
      options: [
        {
          item_id: "cheddar",
          group_id: "g-sauce",
          label: "Cheddar",
          price_delta: 500,
        },
        {
          item_id: "frites",
          group_id: "g-acc",
          label: "Frites",
          price_delta: 500,
        },
      ],
      supplements: { coca: 2 },
      quantite: 3,
    };

    // (6 000 + 1 000) × 3 + 2 × 1 000
    expect(totalFiche(PLAT, c)).toBe(23000);
  });

  it("la ligne porte l'épicé choisi et la même clé qu'un ajout identique", () => {
    const c = { ...choixInitiaux(PLAT), epice: true, supplements: { coca: 1 } };
    const l = ligneDeFiche(PLAT, c);

    expect(l.epice).toBe(true);
    expect(l.spice_level).toBe("OPTIONAL");
    expect(l.cle).toBe(
      signatureLigne(PLAT.id, true, c.options, [{ id: "coca", quantite: 1 }]),
    );
  });
});

describe("ligneAModifier", () => {
  const a = { cle: "a", dish_id: PLAT.id };
  const b = { cle: "b", dish_id: "autre" };

  it("à sa place, ou retrouvée par sa clé, sinon rien", () => {
    expect(
      ligneAModifier([a, b], { platId: PLAT.id, indexLigne: 0, cleLigne: "a" }),
    ).toBe(a);
    // Le panier a bougé dans un autre onglet.
    expect(
      ligneAModifier([b, a], { platId: PLAT.id, indexLigne: 0, cleLigne: "a" }),
    ).toBe(a);
    expect(
      ligneAModifier([b], { platId: PLAT.id, indexLigne: 0, cleLigne: "a" }),
    ).toBeNull();
    expect(ligneAModifier([a], { platId: PLAT.id })).toBeNull();
    expect(
      ligneAModifier([{ ...a, retire: true }], {
        platId: PLAT.id,
        indexLigne: 0,
      }),
    ).toBeNull();
  });

  it("« Mettre à jour » remplace la ligne à sa place", () => {
    const l1 = {
      ...ligneDeFiche(PLAT, { ...choixInitiaux(PLAT), epice: false }),
    };
    const autre = { ...l1, cle: "autre", dish_id: "autre" };
    const modifiee = ligneDeFiche(PLAT, {
      ...choixInitiaux(PLAT, l1),
      supplements: { coca: 1 },
    });
    const apres = remplacerLigne([l1, autre], 0, modifiee, l1.cle);

    expect(apres.map((l) => l.cle)).toEqual([modifiee.cle, "autre"]);
  });
});

describe("empechementPlat", () => {
  const midi = new Date("2026-10-05T12:00:00Z");

  it("plat servi seulement au restaurant", () => {
    expect(
      empechementPlat({ ...PLAT, available_order_types: ["TABLE"] }, midi),
    ).toBe(
      `Ce plat est servi seulement au restaurant${_}: il ne se commande pas en ligne.`,
    );
  });

  it("hors créneau horaire, heures lisibles", () => {
    expect(
      empechementPlat(
        { ...PLAT, available_from: "18:00", available_until: "23:30" },
        midi,
      ),
    ).toBe(
      `Ce plat est servi de 18${_}h à 23${_}h${_}30. Revenez à ce moment-là pour le commander.`,
    );
    expect(
      empechementPlat(
        { ...PLAT, available_from: "11:00", available_until: "15:00" },
        midi,
      ),
    ).toBeNull();
  });
});

describe("mode choisi", () => {
  it("mention d'un plat selon le mode, rien pour un plat vendu partout ou sur place", () => {
    expect(mentionPlatHorsMode(["PICKUP"], "DELIVERY")).toBe(
      `À emporter uniquement${_}: ce plat se retire au restaurant`,
    );
    expect(mentionPlatHorsMode(["DELIVERY"], "PICKUP")).toBe(
      `En livraison uniquement${_}: ce plat ne se retire pas au restaurant`,
    );
    expect(mentionPlatHorsMode([], "DELIVERY")).toBeNull();
    expect(mentionPlatHorsMode(["TABLE"], "DELIVERY")).toBeNull();
  });

  it("mention et message d'un supplément", () => {
    expect(mentionSupplementHorsMode(["PICKUP"], "DELIVERY")).toBe(
      "À emporter uniquement",
    );
    expect(mentionSupplementHorsMode(["TABLE"], "PICKUP")).toBe(
      "Sur place uniquement",
    );
    expect(mentionSupplementHorsMode(["PICKUP"], "PICKUP")).toBeNull();
    expect(messageSupplementHorsMode("Glace vanille", "DELIVERY")).toBe(
      `Glace vanille${_}: la livraison ne sera pas possible avec cet article.`,
    );
  });
});

describe("supplementsParCategorie", () => {
  it("sauces, boissons, accompagnements, dans l'ordre du back office", () => {
    const c = supplementsParCategorie(PLAT.supplements);

    expect(c.map((x) => x.libelle)).toEqual([
      "Sauces",
      "Boissons",
      "Accompagnements",
    ]);
    expect(c[1].supplements.map((s) => s.id)).toEqual(["glace", "coca"]);
    expect(supplementsParCategorie([])).toEqual([]);
  });
});

describe("tiroir", () => {
  const ligne = {
    cle: "l",
    dish_id: "babatche",
    nom: "BABATCHÊ",
    image: "",
    prixUnitaire: 4000,
    epice: false,
    options: [],
    supplements: [
      {
        id: "glace",
        nom: "GLACE VANILLE",
        prix: 1500,
        quantite: 1,
        available_order_types: ["PICKUP"],
      },
      {
        id: "coca",
        nom: "COCA",
        prix: 1000,
        quantite: 1,
        available_order_types: ["DELIVERY", "PICKUP"],
      },
    ],
    quantite: 1,
    available_order_types: ["PICKUP", "TABLE"],
    available_from: "18:00",
    available_until: "23:00",
  };

  it("noms des articles à emporter seulement, sans doublon", () => {
    expect(nomsHorsMode([ligne, { ...ligne, cle: "m" }], "DELIVERY")).toEqual([
      "BABATCHÊ",
      "Glace vanille",
    ]);
    expect(nomsHorsMode([ligne], "PICKUP")).toEqual([]);
    expect(nomsHorsMode([{ ...ligne, retire: true }], "DELIVERY")).toEqual([]);
  });

  it("problèmes de la ligne sans le mode (déjà dans l'alerte)", () => {
    const midi = new Date("2026-10-05T12:00:00Z");

    expect(problemesHorsMode(ligne, "DELIVERY", midi)).toEqual([
      "Servi seulement de 18:00 à 23:00.",
    ]);
  });
});
