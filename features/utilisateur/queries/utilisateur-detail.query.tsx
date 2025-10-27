import React from "react";

import getQueryClient from "@/lib/get-query-client";
import { addToast } from "@heroui/toast";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { obtenirUnUtilisateurAction } from "../actions/utilisateur.action";
import { utilisateurKeyQuery } from "./index.query";

const queryClient = getQueryClient();

//1- Option de requête
export const utilisateurQueryOption = (id: string) => {
  return {
    queryKey: utilisateurKeyQuery("detail", id),
    queryFn: async () => {
      if (!id) throw new Error("L'identifiant utilisateur est requis");

      const result = await obtenirUnUtilisateurAction(id);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!id,
  };
};

//2- Hook pour récupérer un utilisateur
export const useUtilisateurQuery = (id: string) => {
  const query = useQuery(utilisateurQueryOption(id));

  // Gestion des erreurs dans le hook
  React.useEffect(() => {
    if (query.isError && query.error) {
      addToast({
        title: "Erreur lors de la récupération de l'utilisateur:",
        description:
          query.error instanceof Error
            ? query.error.message
            : "Erreur inconnue",
        icon: <X />,
        color: "danger",
      });
    }
  }, [query.isError, query.error]);

  return query;
};

//3- Fonction pour précharger un utilisateur
export const prefetchUtilisateurQuery = (id: string) => {
  return queryClient.prefetchQuery(utilisateurQueryOption(id));
};
