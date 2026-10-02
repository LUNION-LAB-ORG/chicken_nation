"use client";

import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import type { ILignePanier } from "../types/commande.types";
import { ajouterLigne } from "../utils/panier.utils";

/**
 * Panier gardé dans le navigateur (localStorage), comme l'application le garde
 * sur le téléphone. Les prix n'y sont qu'un souvenir d'affichage : le serveur
 * relit tout depuis sa base à la création de la commande.
 */
const stockage = createJSONStorage<ILignePanier[]>(() =>
  typeof window === "undefined"
    ? (undefined as unknown as Storage)
    : {
        // Navigation privée ou stockage bloqué : le panier vit le temps de la page.
        getItem: (k) => {
          try {
            return window.localStorage.getItem(k);
          } catch {
            return null;
          }
        },
        setItem: (k, v) => {
          try {
            window.localStorage.setItem(k, v);
          } catch {
            /* stockage indisponible */
          }
        },
        removeItem: (k) => {
          try {
            window.localStorage.removeItem(k);
          } catch {
            /* stockage indisponible */
          }
        },
      } as Storage,
);

export const panierAtom = atomWithStorage<ILignePanier[]>("cn-panier", [], stockage);

export const ajouterAuPanierAtom = atom(null, (get, set, ligne: ILignePanier) => {
  set(panierAtom, ajouterLigne(get(panierAtom), ligne));
});

export const changerQuantiteAtom = atom(null, (get, set, { cle, quantite }: { cle: string; quantite: number }) => {
  const lignes = get(panierAtom);
  set(
    panierAtom,
    quantite <= 0 ? lignes.filter((l) => l.cle !== cle) : lignes.map((l) => (l.cle === cle ? { ...l, quantite } : l)),
  );
});

export const viderPanierAtom = atom(null, (_get, set) => set(panierAtom, []));
