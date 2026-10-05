// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import { articleDeLigne, articlesDeCommande } from "./analytique.utils";

describe("articles GA4", () => {
  it("prix unitaire avec choix et suppléments, arrondi au franc", () => {
    const article = articleDeLigne(
      {
        dish_id: "plat-a",
        nom: "BOX DE LA NATION",
        prixUnitaire: 5000,
        options: [
          { item_id: "o", group_id: "g", label: "Frites", price_delta: 500 },
        ],
        // Supplément au même prix quelle que soit la quantité du plat.
        supplements: [{ id: "s", nom: "Coca", prix: 1000, quantite: 1 }],
        quantite: 3,
      },
      "Box",
    );

    expect(article).toEqual({
      item_id: "plat-a",
      item_name: "BOX DE LA NATION",
      price: Math.round((5500 * 3 + 1000) / 3),
      quantity: 3,
      item_category: "Box",
    });
  });

  it("sans catégorie connue, pas de champ vide", () => {
    const article = articleDeLigne({
      dish_id: "p",
      nom: "WINGS",
      prixUnitaire: 2000,
      options: [],
      supplements: [],
      quantite: 1,
    });

    expect(article).not.toHaveProperty("item_category");
    expect(article.price).toBe(2000);
  });

  it("lignes d'une commande : montant de ligne de l'API, plat offert à 0", () => {
    expect(
      articlesDeCommande({
        lignes: [
          { dish_id: "a", nom: "BOX", quantite: 2, montant: 11000 },
          {
            dish_id: "b",
            nom: "BIG CHICKEN",
            quantite: 1,
            montant: 0,
            offert: true,
          },
        ],
      }),
    ).toEqual([
      { item_id: "a", item_name: "BOX", price: 5500, quantity: 2 },
      { item_id: "b", item_name: "BIG CHICKEN", price: 0, quantity: 1 },
    ]);
  });
});
