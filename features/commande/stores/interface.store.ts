"use client";

import { atom } from "jotai";

/**
 * État des fenêtres de la commande, partagé entre l'en-tête, la barre du
 * panier, les cartes de plats et la mise en page publique.
 *
 * Les fenêtres elles-mêmes (fiche plat, tiroir du panier) sont montées par
 * `FenetresCommande` dans la mise en page publique et chargées à la demande.
 * Ce composant passe les drapeaux « branchée » à vrai dès qu'il est monté :
 * avant (rendu serveur, première peinture), les boutons qui ouvriraient une
 * fenêtre restent de simples liens (la carte de plat mène à la page du plat,
 * le panier à la page de commande).
 */

/**
 * Plat dont la fiche est demandée.
 *  - `indexLigne` : ligne du panier à modifier (« Modifier ») ; la fiche
 *    s'ouvre pré-remplie et « Mettre à jour » remplace la ligne à sa place ;
 *  - `cleLigne` : clé de cette ligne, pour la retrouver si le panier a changé
 *    entre-temps (autre onglet) ;
 *  - `depuis` : « panier » quand « Modifier » vient du tiroir, qui se rouvre
 *    à la fermeture de la fiche.
 */
export interface IFicheDemandee {
  platId: string;
  indexLigne?: number;
  cleLigne?: string;
  depuis?: "panier";
}

/** Tiroir du panier ouvert. */
export const tiroirPanierOuvertAtom = atom(false);

/** Fiche plat demandée, ou `null` quand elle est fermée. */
export const ficheDemandeeAtom = atom<IFicheDemandee | null>(null);

/** Vrai dès que la fiche plat est montée dans la page (FenetresCommande). */
export const ficheBrancheeAtom = atom(false);

/** Vrai dès que le tiroir du panier est monté dans la page (FenetresCommande). */
export const tiroirPanierBrancheAtom = atom(false);
