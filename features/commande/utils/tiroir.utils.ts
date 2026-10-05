import type { ILignePanier, ModeCommande } from "../types/commande.types";

import { lignesACommander, problemesLigne, venduEn } from "./panier.utils";

import { joli } from "@/lib/typo";

/**
 * Règles d'écran du tiroir du panier (maquette, JS 438-500).
 */

/**
 * Articles du panier qui ne se vendent pas dans ce mode, pour l'alerte
 * « Livraison impossible avec… » : nom du plat tel qu'enregistré, nom du
 * supplément passé par joli() (comme sur la ligne), sans doublon.
 */
export function nomsHorsMode(
  lignes: ILignePanier[],
  mode: ModeCommande,
): string[] {
  const noms: string[] = [];

  for (const l of lignesACommander(lignes)) {
    if (!venduEn(l.available_order_types, mode)) noms.push(l.nom);
    for (const s of l.supplements)
      if (s.quantite > 0 && !venduEn(s.available_order_types, mode))
        noms.push(joli(s.nom));
  }

  return Array.from(new Set(noms));
}

/**
 * Problèmes d'une ligne à montrer dans le tiroir : tous ceux de
 * problemesLigne SAUF le mode, déjà signalé par la mention « À emporter
 * uniquement » de la ligne et par l'alerte au-dessus du sous-total.
 */
export const problemesHorsMode = (
  l: ILignePanier,
  mode: ModeCommande,
  maintenant = new Date(),
) =>
  problemesLigne(l, mode, maintenant).filter(
    (p) => !/indisponible en (livraison|retrait)\.$/i.test(p),
  );
