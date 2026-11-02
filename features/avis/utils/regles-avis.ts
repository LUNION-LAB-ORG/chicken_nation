import type { SaisieAvis } from "../types/avis.types";

import {
  COMMENTAIRE_MAX,
  COMMENTAIRE_MIN,
  ERREURS_AVIS,
  PRENOM_MAX,
} from "./textes-avis";

import { normaliserMobileCI } from "@/features/commande/utils/panier.utils";

/**
 * Règles du formulaire « Ton avis compte », vérifiées dans le navigateur avant
 * l'envoi, sans zod (comme le formulaire de contact : rien de plus à charger
 * pour le visiteur). L'action serveur revérifie tout avec le schéma zod
 * (schemas/avis.schema.ts), bâti sur les mêmes fonctions et les mêmes bornes,
 * et le serveur de l'API garde ses propres barrières.
 */

/**
 * Commentaire tel que le serveur l'enregistre : retours chariot ramenés à
 * « \n », tabulations en espaces, autres caractères de contrôle retirés,
 * espaces de bord retirés (avis-prive.rules.ts, nettoyerCommentaire).
 */
export function nettoyerCommentaire(brut: string): string {
  return String(brut ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .trim();
}

/** Prénom sur une ligne, espaces resserrés ; null s'il est vide. */
export function nettoyerPrenom(brut: unknown): string | null {
  if (typeof brut !== "string") return null;
  const propre = brut
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return propre || null;
}

/** Message d'erreur du commentaire, ou null s'il est bon. */
export function erreurCommentaire(brut: string): string | null {
  const commentaire = nettoyerCommentaire(brut);

  if (commentaire.length < COMMENTAIRE_MIN) return ERREURS_AVIS.commentaire;
  if (commentaire.length > COMMENTAIRE_MAX)
    return ERREURS_AVIS.commentaireTropLong;

  return null;
}

/** Numéro canonique +2250… d'un mobile ivoirien (07, 05, 01), ou null. */
export const mobileIvoirien = (saisie: string): string | null =>
  normaliserMobileCI(String(saisie ?? ""));

export function erreurTelephone(saisie: string): string | null {
  return mobileIvoirien(saisie) ? null : ERREURS_AVIS.telephone;
}

export function erreurPrenom(saisie: string): string | null {
  const prenom = nettoyerPrenom(saisie);

  return prenom && prenom.length > PRENOM_MAX
    ? ERREURS_AVIS.prenomTropLong
    : null;
}

export type ChampExperience = "ressenti" | "canal" | "commentaire";
export type ErreursExperience = Partial<Record<ChampExperience, string>>;

/** Ordre des champs de l'étape 1 (focus sur la première erreur). */
export const CHAMPS_EXPERIENCE: readonly ChampExperience[] = [
  "ressenti",
  "canal",
  "commentaire",
];

/** Erreurs de l'étape 1 (objet vide : on peut continuer). */
export function erreursExperience(saisie: SaisieAvis): ErreursExperience {
  const erreurs: ErreursExperience = {};

  if (!saisie.ressenti) erreurs.ressenti = ERREURS_AVIS.ressenti;
  if (!saisie.canal) erreurs.canal = ERREURS_AVIS.canal;
  const commentaire = erreurCommentaire(saisie.commentaire);

  if (commentaire) erreurs.commentaire = commentaire;

  return erreurs;
}

export type ChampNumero = "telephone" | "prenom";
export type ErreursNumero = Partial<Record<ChampNumero, string>>;

export const CHAMPS_NUMERO: readonly ChampNumero[] = ["telephone", "prenom"];

/** Erreurs de l'étape 2. */
export function erreursNumero(saisie: SaisieAvis): ErreursNumero {
  const erreurs: ErreursNumero = {};
  const telephone = erreurTelephone(saisie.telephone);
  const prenom = erreurPrenom(saisie.prenom);

  if (telephone) erreurs.telephone = telephone;
  if (prenom) erreurs.prenom = prenom;

  return erreurs;
}
