"use client";

import { addToast } from "@heroui/toast";
import { useMutation } from "@tanstack/react-query";
import { processAndValidateFormData } from "ak-zod-form-kit";
import { CheckCircle2, User2, X } from "lucide-react";
import { login } from "../actions/auth.action";
import { LoginDTO, loginSchema } from "../schemas/auth.schema";
import { useInvalidateAuthQuery } from "./index.query";

export const useLoginMutation = () => {
  const invalidateAuthQuery = useInvalidateAuthQuery();

  return useMutation({
    mutationFn: async ({ data }: { data: LoginDTO }) => {
      // Validation des données
      const validation = processAndValidateFormData(loginSchema, data, {
        outputFormat: "object",
        transformations: {
          email: (value: string) => value.trim().toLowerCase(),
          password: (value: string) => value.trim(),
        },
      });

      if (!validation.success) {
        throw new Error(
          validation.errorsInString ||
            "Une erreur est survenue lors de la validation des données."
        );
      }

      // Appel de l'API avec l'action
      const result = await login(validation.data as LoginDTO);

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la connexion");
      }

      return result.data!;
    },
    onSuccess: async () => {
      addToast({
        title: "Connexion reussie",
        description: "Connexion reussie",
        icon: <CheckCircle2 />,
        promise: invalidateAuthQuery(),
        color: "success",
      });
    },

    onError: async (error) => {
      console.log("error query", error);
      addToast({
        title: "Erreur lors de la connexion:",
        description: error.message,
        icon: <X />,
        promise: Promise.reject(error),
        color: "danger",
      });
    },
  });
};
