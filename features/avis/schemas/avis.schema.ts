import type { DonneesAvis } from "../types/avis.types";

import { z } from "zod";

import { CANAUX, RESSENTIS } from "../types/avis.types";
import {
  erreurCommentaire,
  mobileIvoirien,
  nettoyerCommentaire,
  nettoyerPrenom,
} from "../utils/regles-avis";
import {
  ERREURS_AVIS,
  PRENOM_MAX,
  sourceAutorisee,
} from "../utils/textes-avis";

/**
 * Schéma de l'envoi d'un avis, appliqué par l'action serveur avant l'appel à
 * l'API : mêmes bornes et mêmes messages que le DTO du serveur
 * (CreerAvisPriveDto) et que les règles du navigateur (regles-avis.ts).
 * Il rend le corps EXACT de POST /avis-prives (contrat, 5.5) : numéro
 * canonique +225…, prénom vide → null, source filtrée par la liste blanche.
 * Le champ piège n'en fait pas partie : l'action le traite avant.
 */
export const schemaAvis = z
  .object({
    ressenti: z.enum(RESSENTIS, { error: ERREURS_AVIS.ressenti }),
    canal: z.enum(CANAUX, { error: ERREURS_AVIS.canal }),
    // "" ou absent = « Je ne sais pas ». Toute forme d'identifiant acceptée,
    // comme IsUUID('all') du serveur ; c'est lui qui vérifie que le store existe.
    restaurant_id: z.preprocess(
      (v) => (v === "" || v === undefined ? null : v),
      z.guid({ error: ERREURS_AVIS.store }).nullable(),
    ),
    commentaire: z
      .string({ error: ERREURS_AVIS.commentaire })
      .superRefine((brut, ctx) => {
        const erreur = erreurCommentaire(brut);

        if (erreur) ctx.addIssue({ code: "custom", message: erreur });
      })
      .transform(nettoyerCommentaire),
    telephone: z
      .string({ error: ERREURS_AVIS.telephone })
      .transform((saisie, ctx) => {
        const telephone = mobileIvoirien(saisie);

        if (!telephone) {
          ctx.addIssue({ code: "custom", message: ERREURS_AVIS.telephone });

          return z.NEVER;
        }

        return telephone;
      }),
    prenom: z
      .string({ error: ERREURS_AVIS.panne })
      .nullish()
      .transform((brut) => nettoyerPrenom(brut))
      .refine((p) => !p || p.length <= PRENOM_MAX, {
        message: ERREURS_AVIS.prenomTropLong,
      }),
    accord_rappel: z.boolean({ error: ERREURS_AVIS.panne }).default(false),
    source: z.unknown().transform(sourceAutorisee),
  })
  .transform(
    (d): DonneesAvis => ({
      ressenti: d.ressenti,
      canal: d.canal,
      restaurant_id: d.restaurant_id,
      commentaire: d.commentaire,
      telephone: d.telephone,
      prenom: d.prenom,
      accord_rappel: d.accord_rappel,
      source: d.source,
    }),
  );

/** Premier message d'erreur du schéma (affiché au visiteur). */
export function premierMessage(erreur: z.ZodError): string {
  return erreur.issues[0]?.message ?? ERREURS_AVIS.panne;
}
