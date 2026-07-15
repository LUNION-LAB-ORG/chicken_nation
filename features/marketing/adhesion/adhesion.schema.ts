import { z } from "zod";
import { isValidPhoneCI } from "./utils/phone";

/**
 * Types de profil déclaratifs de la Carte de la Nation.
 * Carte UNIVERSELLE : le profil est purement déclaratif, AUCUN justificatif
 * n'est demandé côté client.
 */
export const PROFILE_TYPES = ["ETUDIANT", "PROFESSIONNEL"] as const;
export type ProfileType = (typeof PROFILE_TYPES)[number];

/**
 * Schéma de validation du formulaire d'adhésion (pré-inscription silencieuse).
 * Le numéro est validé au format ivoirien puis normalisé en `+225XXXXXXXXXX`
 * dans la mutation (voir `transformations`).
 */
export const adhesionSchema = z.object({
  name: z
    .string({ message: "Votre nom est requis" })
    .trim()
    .min(2, "Votre nom doit contenir au moins 2 caractères")
    .max(100, "Votre nom ne doit pas dépasser 100 caractères"),

  // Accepte 0700000000 / +2250700000000 / 2250700000000 (raw ou normalisé).
  phone: z
    .string({ message: "Votre numéro de téléphone est requis" })
    .trim()
    .refine(isValidPhoneCI, "Numéro ivoirien invalide (ex : 07 07 00 00 00)"),

  profile_type: z.enum(PROFILE_TYPES, { message: "Choisissez votre profil" }),

  // Consentement explicite OBLIGATOIRE : sans opt-in, pas d'envoi WhatsApp.
  whatsapp_opt_in: z
    .boolean()
    .refine(
      (value) => value === true,
      "Vous devez accepter de recevoir votre carte sur WhatsApp",
    ),
});

export type AdhesionDTO = z.infer<typeof adhesionSchema>;
