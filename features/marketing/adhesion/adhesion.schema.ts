import { z } from "zod";
import { isValidPhoneCI } from "./utils/phone";

/**
 * Profil déclaratif de la Carte de la Nation.
 * Carte UNIVERSELLE : purement déclaratif, AUCUN justificatif n'est demandé.
 * Seule valeur possible : "ETUDIANT" (réponse « Oui » à « Êtes-vous étudiant/élève ? »).
 * Une réponse « Non » n'envoie AUCUN `profile_type` au backend.
 */
export type ProfileType = "ETUDIANT";

/**
 * Schéma de validation du formulaire d'adhésion (pré-inscription silencieuse).
 * Le numéro est validé au format ivoirien puis normalisé en `+225XXXXXXXXXX`
 * dans la mutation (voir `transformations`).
 *
 * `profile_type` est OPTIONNEL : renseigné à "ETUDIANT" uniquement lorsque
 * l'utilisateur répond « Oui » à « Êtes-vous étudiant/élève ? ». Dans ce cas,
 * `establishment` (nom de l'établissement) devient REQUIS (voir `superRefine`).
 */
export const adhesionSchema = z
  .object({
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

    // "ETUDIANT" si « Oui », sinon absent : aucun profile_type n'est envoyé.
    profile_type: z.literal("ETUDIANT").optional(),

    // Nom de l'établissement — requis uniquement si profile_type === "ETUDIANT".
    establishment: z
      .string()
      .trim()
      .max(150, "Le nom de l'établissement ne doit pas dépasser 150 caractères")
      .optional(),

    // Consentement explicite OBLIGATOIRE : sans opt-in, pas d'envoi WhatsApp.
    whatsapp_opt_in: z
      .boolean()
      .refine(
        (value) => value === true,
        "Vous devez accepter de recevoir votre carte sur WhatsApp",
      ),
  })
  .superRefine((data, ctx) => {
    // Établissement requis dès lors que l'utilisateur se déclare étudiant/élève.
    if (data.profile_type === "ETUDIANT" && !data.establishment?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["establishment"],
        message: "Indiquez votre établissement",
      });
    }
  });

export type AdhesionDTO = z.infer<typeof adhesionSchema>;
