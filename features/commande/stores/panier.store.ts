"use client";

import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import type { ILignePanier, IPlatDetail } from "../types/commande.types";
import { ajouterLigne, rafraichirLigne, totalLigne } from "../utils/panier.utils";

/** Stockage texte au sens de jotai (son type n'est pas exporté). */
interface StockageTexte {
  getItem: (cle: string) => string | null;
  setItem: (cle: string, valeur: string) => void;
  removeItem: (cle: string) => void;
  subscribe: (cle: string, rappel: (valeur: string | null) => void) => () => void;
}

/**
 * Panier gardé dans le navigateur (localStorage), comme l'application le garde
 * sur le téléphone. Les prix n'y sont qu'un souvenir d'affichage : le serveur
 * relit tout depuis sa base à la création de la commande.
 */
const stockage = createJSONStorage<ILignePanier[]>(
  (): StockageTexte =>
    typeof window === "undefined"
      ? (undefined as unknown as StockageTexte)
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
          /**
           * Synchronisation entre onglets. Jotai n'écoute l'événement « storage »
           * de lui-même que pour un vrai window.localStorage, pas pour cet objet :
           * sans cet abonnement, un onglet resté ouvert sur la carte gardait le
           * panier d'avant la commande et le réécrivait au prochain ajout (plats
           * déjà payés de retour dans le panier). `key` null : stockage vidé.
           */
          subscribe: (k, rappel) => {
            const ecoute = (e: StorageEvent) => {
              if (e.key !== k && e.key !== null) return;
              try {
                if (e.storageArea !== window.localStorage) return;
              } catch {
                return;
              }
              rappel(e.key === null ? null : e.newValue);
            };
            window.addEventListener("storage", ecoute);
            return () => window.removeEventListener("storage", ecoute);
          },
        },
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

/**
 * Plats relus au catalogue à l'ouverture du panier, appliqués au panier TEL
 * QU'IL EST au retour de la relecture (le client a pu retirer une ligne
 * entre-temps). `null` = plat retiré du catalogue ; id absent = non relu.
 * Renvoie vrai si le prix d'une ligne encore proposée a changé.
 */
export const rafraichirPanierAtom = atom(null, (get, set, plats: Record<string, IPlatDetail | null>) => {
  const avant = get(panierAtom);
  const apres = avant.map((l) => rafraichirLigne(l, l.dish_id in plats ? plats[l.dish_id] : undefined));
  set(panierAtom, apres);
  return apres.some((l, i) => !l.retire && totalLigne(l) !== totalLigne(avant[i]));
});

/** Lignes d'une commande annulée pour être modifiée, remises dans le panier. */
export const restaurerPanierAtom = atom(null, (get, set, lignes: ILignePanier[]) => {
  set(
    panierAtom,
    lignes.reduce((panier, l) => ajouterLigne(panier, l), get(panierAtom)),
  );
});
