"use client";

import { useMutation } from "@tanstack/react-query";
import { processAndValidateFormData } from "ak-zod-form-kit";
import { adhesionAPI } from "../adhesion.api";
import { adhesionSchema, AdhesionDTO } from "../adhesion.schema";
import { normalizePhoneCI } from "../utils/phone";
import { AdhesionResponse } from "../adhesion.types";

/**
 * Mutation d'adhésion à la Carte de la Nation (pré-inscription silencieuse).
 *
 * On revalide côté client avec `processAndValidateFormData` (défense en
 * profondeur, en plus du `zodResolver` du formulaire) et on NORMALISE le
 * numéro au format `+225XXXXXXXXXX` avant l'envoi. Les `transformations`
 * s'appliquent avant la validation Zod (le schéma accepte les deux formats).
 */
export const useAdhesionMutation = () => {
  return useMutation<AdhesionResponse, Error, { data: AdhesionDTO }>({
    mutationFn: async ({ data }) => {
      const validation = processAndValidateFormData(adhesionSchema, data, {
        outputFormat: "object",
        transformations: {
          name: (value: string) => value.trim(),
          // Normalise 0700000000 / +2250700000000 → +2250700000000
          phone: (value: string) => normalizePhoneCI(value) ?? value,
          // Trim ; un établissement vide (« Non » à la question étudiant) n'est
          // PAS envoyé au backend (undefined → droppé par la sérialisation JSON).
          establishment: (value: string | undefined) => {
            const trimmed = (value ?? "").trim();
            return trimmed.length > 0 ? trimmed : undefined;
          },
        },
      });

      if (!validation.success) {
        throw new Error(
          validation.errorsInString ||
            "Une erreur est survenue lors de la validation des données.",
        );
      }

      return adhesionAPI.adherer(validation.data as AdhesionDTO);
    },
  });
};
