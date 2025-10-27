import React from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import getQueryClient from "@/lib/get-query-client";
import { IUtilisateur } from "../types/utilisateur.type";
import { PaginatedResponse } from "@/types/api.type";
import { obtenirTousUtilisateursAction } from "../actions/utilisateur.action";
import { IUtilisateursParams } from "../types/utilisateur.type";
import { utilisateurKeyQuery } from "./index.query";
import { addToast } from "@heroui/toast";
import { X } from "lucide-react";

const queryClient = getQueryClient();

//1- Option de requête
export const utilisateursInfinityQueryOption = (
  utilisateursParamsDTO: IUtilisateursParams
) => {
  return {
    queryKey: utilisateurKeyQuery("list", utilisateursParamsDTO),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await obtenirTousUtilisateursAction({
        ...utilisateursParamsDTO,
        page: pageParam,
      });

      if (!result.success) {
        throw new Error(
          result.error || "Erreur lors de la récupération des utilisateurs"
        );
      }

      return result.data!;
    },

    initialPageParam: 1,

    getNextPageParam: (lastPage: PaginatedResponse<IUtilisateur>) => {
      const hasNextPage = lastPage.meta.totalPages > lastPage.meta.page;
      return hasNextPage ? lastPage.meta.page + 1 : undefined;
    },
  };
};

//2- Hook pour récupérer les utilisateurs
export const useUtilisateursInfinityQuery = (
  utilisateursParamsDTO: IUtilisateursParams
) => {
  const query = useInfiniteQuery(
    utilisateursInfinityQueryOption(utilisateursParamsDTO)
  );

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

//3- Fonction pour précharger les utilisateurs
export const prefetchUtilisateursInfinityQuery = (
  utilisateursParamsDTO: IUtilisateursParams
) => {
  return queryClient.prefetchInfiniteQuery(
    utilisateursInfinityQueryOption(utilisateursParamsDTO)
  );
};
