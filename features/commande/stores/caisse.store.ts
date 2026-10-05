"use client";

import type { IAdresseLivraison, ModeCommande } from "../types/commande.types";
import type { EtapeCaisse } from "../utils/caisse.utils";

import { atom, type Getter } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { lignesACommander, signaturePanier } from "../utils/panier.utils";

import { panierAtom, stockageNavigateur } from "./panier.store";

/**
 * Choix de la caisse en 5 étapes, partagés par le tiroir du panier, la caisse
 * et la barre des étapes.
 *
 *  - Gardés dans le navigateur (localStorage `cn-caisse`) : mode, adresse de
 *    livraison (avec son repère) et restaurant de retrait. Le client qui
 *    revient les retrouve.
 *  - En mémoire seulement, perdus au rechargement : heure de retrait (un
 *    créneau d'hier ne vaut plus rien), étape, code, points et cadeaux.
 */

// ── Mode, adresse, restaurant (gardés) ────────────────────────────────────

export interface ICaisseGardee {
  mode: ModeCommande;
  adresse: IAdresseLivraison | null;
  restaurantId: string | null;
}

const CAISSE_VIDE: ICaisseGardee = {
  mode: "DELIVERY",
  adresse: null,
  restaurantId: null,
};

/**
 * Valeur relue du navigateur remise d'aplomb : une valeur abîmée ou d'une
 * autre version du site ne doit jamais casser la caisse ni envoyer un point
 * GPS faux au livreur.
 */
export function lireCaisseGardee(brut: unknown): ICaisseGardee {
  const v = (brut && typeof brut === "object" ? brut : {}) as Record<
    string,
    unknown
  >;
  const a = (
    v.adresse && typeof v.adresse === "object" ? v.adresse : null
  ) as Record<string, unknown> | null;
  const latitude = Number(a?.latitude);
  const longitude = Number(a?.longitude);
  const adresse: IAdresseLivraison | null =
    a &&
    typeof a.libelle === "string" &&
    a.libelle.trim() &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
      ? {
          libelle: a.libelle,
          latitude,
          longitude,
          repere: typeof a.repere === "string" ? a.repere.slice(0, 200) : "",
        }
      : null;

  return {
    mode: v.mode === "PICKUP" ? "PICKUP" : "DELIVERY",
    adresse,
    restaurantId:
      typeof v.restaurantId === "string" && v.restaurantId
        ? v.restaurantId
        : null,
  };
}

const caisseGardeeAtom = atomWithStorage<ICaisseGardee>(
  "cn-caisse",
  CAISSE_VIDE,
  stockageNavigateur<ICaisseGardee>(),
);

/** Choix gardés, toujours lisibles. */
export const caisseAtom = atom((get) =>
  lireCaisseGardee(get(caisseGardeeAtom)),
);

/**
 * Base d'une écriture : la valeur du navigateur. L'atome n'est relu du
 * navigateur qu'une fois affiché quelque part ; sur une page sans caisse ni
 * tiroir (Mes commandes, « Retirer ici » sur la carte), il vaut encore
 * CAISSE_VIDE, et l'écriture effaçait le reste (« Se déconnecter » remettait
 * la livraison et oubliait le restaurant de retrait). Stockage bloqué : la
 * valeur de la page.
 */
function caissePourEcrire(get: Getter): ICaisseGardee {
  try {
    const brut = window.localStorage.getItem("cn-caisse");

    if (brut !== null) return lireCaisseGardee(JSON.parse(brut));
  } catch {
    /* stockage bloqué ou valeur illisible */
  }

  return get(caisseAtom);
}

/** Livraison ou retrait. */
export const modeAtom = atom(
  (get) => get(caisseAtom).mode,
  (get, set, mode: ModeCommande) =>
    set(caisseGardeeAtom, { ...caissePourEcrire(get), mode }),
);

/** Adresse de livraison choisie (texte, point GPS et repère), ou null. */
export const adresseAtom = atom(
  (get) => get(caisseAtom).adresse,
  (get, set, adresse: IAdresseLivraison | null) =>
    set(caisseGardeeAtom, { ...caissePourEcrire(get), adresse }),
);

/**
 * Déconnexion (« Se déconnecter », « Changer de compte », « Changer de
 * numéro ») : l'adresse et son repère sont des données du client, ils ne
 * restent pas sur un appareil partagé. Le mode et le restaurant de retrait,
 * eux, ne disent rien de lui.
 */
export const oublierAdresseAtom = atom(null, (get, set) =>
  set(caisseGardeeAtom, { ...caissePourEcrire(get), adresse: null }),
);

/** Heure de retrait (ISO d'un créneau), null = dès que possible. En mémoire seulement. */
export const heureRetraitAtom = atom<string | null>(null);

/** Restaurant de retrait choisi, ou null. Changer de restaurant remet l'heure à « dès que possible ». */
export const restaurantIdAtom = atom(
  (get) => get(caisseAtom).restaurantId,
  (get, set, restaurantId: string | null) => {
    const actuelle = caissePourEcrire(get);

    if (restaurantId !== actuelle.restaurantId) set(heureRetraitAtom, null);
    set(caisseGardeeAtom, { ...actuelle, restaurantId });
  },
);

// ── Étapes (en mémoire) ───────────────────────────────────────────────────

/** Étape affichée. La caisse la ramène à l'étape la plus avancée possible (caisse.utils, etapeAccessible). */
export const etapeAtom = atom<EtapeCaisse>(1);

/** Étape la plus avancée que le client a ouverte : l'étape Avantages ne compte « faite » qu'une fois vue. */
export const etapeVueAtom = atom<EtapeCaisse>(1);

/** Aller à une étape (déjà ramenée au possible par l'appelant). */
export const allerEtapeAtom = atom(null, (get, set, etape: EtapeCaisse) => {
  set(etapeAtom, etape);
  if (etape > get(etapeVueAtom)) set(etapeVueAtom, etape);
});

// ── Avantages (en mémoire) ────────────────────────────────────────────────

export interface IAvantages {
  /** Code promo ou bon vérifié par le serveur, avec la remise annoncée. */
  code: { code: string; remise: number } | null;
  /** Points choisis ; la caisse les ramène au maximum du panier (fidelite.utils, pointsRetenus et avisPoints). */
  points: number;
  /** Identifiants des cadeaux ajoutés. */
  cadeaux: string[];
  /** Épicé ou non choisi pour un plat offert qui le demande, par identifiant de cadeau. */
  epiceCadeaux: Record<string, boolean>;
}

export const AVANTAGES_VIDES: IAvantages = {
  code: null,
  points: 0,
  cadeaux: [],
  epiceCadeaux: {},
};

const avantagesBrutsAtom = atom<IAvantages & { panierDuCode: string }>({
  ...AVANTAGES_VIDES,
  panierDuCode: "",
});

/**
 * Avantages de la commande en cours, jamais gardés dans le navigateur.
 *  - Panier vide (commande payée, panier vidé) : tout est oublié, un cadeau
 *    ne part jamais seul.
 *  - Code : valable seulement pour le panier sur lequel le serveur l'a
 *    vérifié ; dès que le panier change, il disparaît et se revérifie (règle
 *    du site : la remise d'un code dépend des plats).
 *  - Points : gardés, mais ramenés au maximum du nouveau panier, avec la
 *    phrase « Points ajustés » (besoin 12 du plan).
 *  - Cadeaux : gardés tant que le panier a un plat payant.
 * Écrire un avantage garde les autres : `set(avantagesAtom, { points: 120 })`.
 */
export const avantagesAtom = atom(
  (get): IAvantages => {
    const brut = get(avantagesBrutsAtom);
    const lignes = get(panierAtom);

    if (lignesACommander(lignes).length === 0) return AVANTAGES_VIDES;
    const { panierDuCode, ...avantages } = brut;

    return {
      ...avantages,
      code:
        avantages.code && panierDuCode === signaturePanier(lignes)
          ? avantages.code
          : null,
    };
  },
  (get, set, maj: Partial<IAvantages>) => {
    const signature = signaturePanier(get(panierAtom));
    const actuels = get(avantagesAtom);

    set(avantagesBrutsAtom, { ...actuels, ...maj, panierDuCode: signature });
  },
);

/**
 * Code vérifié pour un panier qui a changé depuis : il ne vaut plus (la
 * remise dépend des plats). La caisse le revérifie aussitôt sur le nouveau
 * panier et dit ce qu'il en est, au lieu de le retirer en silence. null si
 * aucun code n'est en attente.
 */
export const codeAReverifierAtom = atom((get) => {
  const brut = get(avantagesBrutsAtom);
  const lignes = get(panierAtom);

  return brut.code &&
    lignesACommander(lignes).length > 0 &&
    brut.panierDuCode !== signaturePanier(lignes)
    ? brut.code.code
    : null;
});

/** Autre client ou déconnexion : rien du précédent ne doit rester. */
export const oublierAvantagesAtom = atom(null, (_get, set) => {
  set(avantagesBrutsAtom, { ...AVANTAGES_VIDES, panierDuCode: "" });
});
