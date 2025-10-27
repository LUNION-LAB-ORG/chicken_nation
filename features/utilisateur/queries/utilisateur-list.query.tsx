import React from "react";

import { useQuery } from "@tanstack/react-query";
import getQueryClient from "@/lib/get-query-client";
import { obtenirTousUtilisateursAction } from "../actions/utilisateur.action";
import { IUtilisateursParams } from "../types/utilisateur.type";
import { utilisateurKeyQuery } from "./index.query";
import { addToast } from "@heroui/toast";
import { X } from "lucide-react";

const queryClient = getQueryClient();

//1- Option de requête optimisée
export const utilisateursListQueryOption = (
  utilisateursParamsDTO: IUtilisateursParams
) => {
  return {
    queryKey: utilisateurKeyQuery("list", utilisateursParamsDTO),
    queryFn: async () => {
      const result = await obtenirTousUtilisateursAction(utilisateursParamsDTO);
      if (!result.success) {
        throw new Error(
          result.error || "Erreur lors de la récupération des utilisateurs"
        );
      }
      return result.data!;
    },
    placeholderData: (previousData: any) => previousData,
    staleTime: 30 * 1000, //30 secondes
    refetchOnWindowFocus: false, //Ne pas refetch lors du focus de la fenetre
    refetchOnMount: true, //Refetch lors du mount
  };
};

//2- Hook pour récupérer les utilisateurs
export const useUtilisateursListQuery = (
  utilisateursParamsDTO: IUtilisateursParams
) => {
  const query = useQuery(utilisateursListQueryOption(utilisateursParamsDTO));

  // Gestion des erreurs dans le hook
  React.useEffect(() => {
    if (query.isError && query.error) {
      addToast({
        title: "Erreur lors de la récupération des utilisateurs:",
        description:
          query.error instanceof Error
            ? query.error.message
            : "Erreur inconnue",
        icon: <X />,
        color: "danger",
      });
    }
  }, [query]);

  return query;
};

//3- Fonction pour précharger les utilisateurs appelée dans les pages
export const prefetchUtilisateursListQuery = (
  utilisateursParamsDTO: IUtilisateursParams
) => {
  return queryClient.prefetchQuery(
    utilisateursListQueryOption(utilisateursParamsDTO)
  );
};
