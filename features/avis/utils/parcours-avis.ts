import type {
  CanalAvis,
  EcranAvis,
  EnvoiAvis,
  RessentiAvis,
  SaisieAvis,
  StoreAvis,
} from "../types/avis.types";

import { CANAUX, RESSENTIS } from "../types/avis.types";

import { COMMENTAIRE_MAX } from "./textes-avis";

/**
 * Parcours en quatre écrans sur une seule adresse (/fr/avis) :
 * présentation, étape 1 (expérience), étape 2 (numéro), merci.
 * Fonctions pures, partagées par l'îlot ParcoursAvis et ses tests.
 */

export const SAISIE_VIDE: SaisieAvis = {
  ressenti: null,
  canal: "",
  restaurantId: "",
  commentaire: "",
  telephone: "",
  prenom: "",
  // Un accord se donne d'un geste : la case n'est jamais cochée d'avance.
  accordRappel: false,
};

/** Écran du bouton Retour ; null quand il n'y en a pas (présentation, merci). */
export function ecranPrecedent(ecran: EcranAvis): EcranAvis | null {
  if (ecran === "experience") return "presentation";
  if (ecran === "numero") return "experience";

  return null;
}

/** Numéro d'étape affiché (« Étape 1 sur 2 »), null hors des deux étapes. */
export function numeroEtape(ecran: EcranAvis): 1 | 2 | null {
  if (ecran === "experience") return 1;
  if (ecran === "numero") return 2;

  return null;
}

/** Ce que l'action serveur reçoit (elle revérifie tout). */
export function envoiDepuisSaisie(
  saisie: SaisieAvis,
  source: string,
  piege: string,
): EnvoiAvis {
  return {
    ressenti: saisie.ressenti,
    canal: saisie.canal,
    restaurant_id: saisie.restaurantId || null,
    commentaire: saisie.commentaire,
    telephone: saisie.telephone,
    prenom: saisie.prenom,
    accord_rappel: saisie.accordRappel,
    source,
    site_web: piege,
  };
}

// ── Brouillon (sessionStorage) ─────────────────────────────────────────────

/**
 * Brouillon de l'étape 1, gardé le temps de l'onglet : un rechargement ou un
 * aller-retour vers une autre page ne fait pas perdre le texte. Ni le numéro,
 * ni le prénom, ni l'accord de rappel n'y sont gardés. Effacé à l'envoi.
 */
export const CLE_BROUILLON = "cn-avis-brouillon";

type Brouillon = Pick<
  SaisieAvis,
  "ressenti" | "canal" | "restaurantId" | "commentaire"
>;

export function texteBrouillon(saisie: SaisieAvis): string | null {
  const brouillon: Brouillon = {
    ressenti: saisie.ressenti,
    canal: saisie.canal,
    restaurantId: saisie.restaurantId,
    commentaire: saisie.commentaire,
  };

  // Rien de saisi : pas de brouillon.
  if (
    !brouillon.ressenti &&
    !brouillon.canal &&
    !brouillon.restaurantId &&
    !brouillon.commentaire
  )
    return null;

  return JSON.stringify(brouillon);
}

/**
 * Brouillon relu, valeur par valeur : une valeur inconnue (store fermé depuis,
 * texte modifié à la main) est ignorée.
 */
export function lireBrouillon(
  texte: string | null,
  stores: StoreAvis[],
): Partial<SaisieAvis> {
  if (!texte) return {};
  let brut: unknown;

  try {
    brut = JSON.parse(texte);
  } catch {
    return {};
  }
  if (!brut || typeof brut !== "object") return {};
  const b = brut as Record<string, unknown>;
  const lu: Partial<SaisieAvis> = {};

  if (RESSENTIS.includes(b.ressenti as RessentiAvis))
    lu.ressenti = b.ressenti as RessentiAvis;
  if (CANAUX.includes(b.canal as CanalAvis)) lu.canal = b.canal as CanalAvis;
  if (
    typeof b.restaurantId === "string" &&
    stores.some((s) => s.id === b.restaurantId)
  )
    lu.restaurantId = b.restaurantId;
  if (typeof b.commentaire === "string")
    lu.commentaire = b.commentaire.slice(0, COMMENTAIRE_MAX);

  return lu;
}
