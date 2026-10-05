/**
 * Règles du formulaire de contact, vérifiées dans le navigateur avant l'envoi.
 * Ce sont celles du schéma zod de app/api/send-email/route.ts (longueurs,
 * caractères du téléphone), écrites sans zod pour ne pas l'envoyer au
 * navigateur. La route reste seule juge : elle revérifie tout.
 */

import { INSECABLE, nombre } from "@/lib/typo";

export type SujetContact = "contact" | "franchise";

export const CHAMPS_CONTACT = [
  "nom",
  "prenom",
  "email",
  "telephone",
  "message",
] as const;

export type ChampContact = (typeof CHAMPS_CONTACT)[number];

export type ValeursContact = Record<ChampContact, string>;

export type ErreursContact = Partial<Record<ChampContact, string>>;

/** Longueurs maximales, identiques à celles de la route. */
export const LONGUEURS_MAX: Record<ChampContact, number> = {
  nom: 80,
  prenom: 80,
  email: 160,
  telephone: 30,
  message: 3000,
};

export const VALEURS_VIDES: ValeursContact = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  message: "",
};

// Même tolérance que la route : chiffres, +, parenthèses, points, tirets, espaces.
const RE_TELEPHONE = /^[0-9+().\s-]+$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Message d'erreur d'un champ, ou null s'il est bon. */
export function erreurChamp(champ: ChampContact, brute: string): string | null {
  const valeur = brute.trim();
  const max = LONGUEURS_MAX[champ];

  switch (champ) {
    case "nom":
      if (!valeur) return "Indiquez votre nom.";
      break;
    case "prenom":
      if (!valeur) return "Indiquez votre prénom.";
      break;
    case "email":
      if (!valeur) return "Indiquez votre adresse électronique.";
      if (!RE_EMAIL.test(valeur))
        return "Cette adresse électronique n'est pas valide.";
      break;
    case "telephone":
      if (!valeur) return "Indiquez votre numéro de téléphone.";
      if (valeur.length < 6 || !RE_TELEPHONE.test(valeur))
        return "Ce numéro de téléphone n'est pas valide.";
      break;
    case "message":
      if (valeur.length < 2) return "Écrivez votre message.";
      break;
  }

  if (valeur.length > max)
    return `${nombre(max)}${INSECABLE}caractères au plus.`;

  return null;
}

/** Toutes les erreurs du formulaire (objet vide s'il peut partir). */
export function verifierContact(valeurs: ValeursContact): ErreursContact {
  const erreurs: ErreursContact = {};

  for (const champ of CHAMPS_CONTACT) {
    const erreur = erreurChamp(champ, valeurs[champ]);

    if (erreur) erreurs[champ] = erreur;
  }

  return erreurs;
}
