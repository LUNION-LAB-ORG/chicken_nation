import type { ICommande, ILignePanier } from "../types/commande.types";
import type { IArticleGA } from "@/lib/analytique";

import { totalLigne } from "./panier.utils";

/**
 * Articles des événements de commerce GA4 (lib/analytique.ts). Prix unitaire
 * avec les choix et suppléments, en francs CFA entiers ; jamais de donnée du
 * client (ni téléphone, ni adresse).
 */
export function articleDeLigne(
  ligne: Pick<
    ILignePanier,
    "dish_id" | "nom" | "prixUnitaire" | "options" | "supplements" | "quantite"
  >,
  categorie?: string | null,
): IArticleGA {
  const quantite = Math.max(1, ligne.quantite);

  return {
    item_id: ligne.dish_id,
    item_name: ligne.nom,
    price: Math.round(totalLigne(ligne) / quantite),
    quantity: quantite,
    ...(categorie ? { item_category: categorie } : {}),
  };
}

/** Lignes d'une commande payée (montant de ligne de l'API, plats offerts compris à 0). */
export function articlesDeCommande(
  commande: Pick<ICommande, "lignes">,
): IArticleGA[] {
  return commande.lignes.map((l) => {
    const quantite = Math.max(1, l.quantite);

    return {
      item_id: l.dish_id,
      item_name: l.nom,
      price: Math.round(l.montant / quantite),
      quantity: quantite,
    };
  });
}
