"use client";

import { atom } from "jotai";

/**
 * État des fenêtres de la commande, partagé entre l'en-tête, la barre du
 * panier, les cartes de plats et la mise en page publique.
 *
 * Les fenêtres elles-mêmes (fiche plat, tiroir panier) arrivent au lot L11b,
 * chargées à la demande. Tant qu'une fenêtre n'est pas branchée, les boutons
 * qui l'ouvriraient restent de simples liens : la carte de plat mène à la page
 * du plat, le panier à la page de commande. Le composant qui monte une fenêtre
 * passe son drapeau « branchée » à vrai ; aucun bouton n'est à modifier.
 */

/** Plat dont la fiche est demandée ; `indexLigne` : ligne du panier à modifier (« Modifier »). */
export interface IFicheDemandee {
  platId: string;
  indexLigne?: number;
}

/** Tiroir du panier ouvert. */
export const tiroirPanierOuvertAtom = atom(false);

/** Fiche plat demandée, ou `null` quand elle est fermée. */
export const ficheDemandeeAtom = atom<IFicheDemandee | null>(null);

/** Vrai dès que la fiche plat est montée dans la page (lot L11b). */
export const ficheBrancheeAtom = atom(false);

/** Vrai dès que le tiroir du panier est monté dans la page (lot L11b). */
export const tiroirPanierBrancheAtom = atom(false);
