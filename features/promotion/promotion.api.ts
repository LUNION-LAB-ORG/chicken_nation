import { cache } from "react";

import { IPromotionPublique } from "./promotion.type";

import { baseURL } from "@/config/api";
import { PaginatedResponse } from "@/types/api.type";

/** Étiquette de cache des offres publiques (à passer à `revalidateTag` après un changement au backoffice). */
export const ETIQUETTE_PROMOTIONS = "promotions";
// Court : une offre qui commence ou se termine apparaît ou disparaît vite.
// Attention : une page qui lit les offres est revalidée au même rythme.
const REVALIDATION_PROMOTIONS = 300;

export interface IPromotionAPI {
  obtenirPromotionsActives(params: {
    limit?: number;
  }): Promise<PaginatedResponse<IPromotionPublique>>;
}

/**
 * Lecture par `fetch` natif et non par ak-api-http (lib/api.ts) : cette
 * bibliothèque passe par axios, que Next ne met pas en cache.
 * Route publique : `GET /fidelity/promotions` est réservée au personnel
 * (401 pour un visiteur). Lève une erreur si la route ne répond pas
 * (route absente d'un serveur pas encore mis à jour : 401 ou 404).
 */
async function lirePromotionsPubliques(
  limite: number,
): Promise<PaginatedResponse<IPromotionPublique>> {
  const res = await fetch(
    `${baseURL}/fidelity/promotions/public?limit=${limite}`,
    {
      next: {
        revalidate: REVALIDATION_PROMOTIONS,
        tags: [ETIQUETTE_PROMOTIONS],
      },
    },
  );

  if (!res.ok)
    throw new Error(
      `Offres illisibles : GET /fidelity/promotions/public a répondu ${res.status}`,
    );
  const corps = (await res.json()) as PaginatedResponse<IPromotionPublique>;

  if (!Array.isArray(corps?.data))
    throw new Error("Offres illisibles : réponse sans liste");

  return corps;
}

export const promotionAPI: IPromotionAPI = {
  obtenirPromotionsActives(params: { limit?: number }) {
    return lirePromotionsPubliques(params.limit || 12);
  },
};

/**
 * « Offres du moment » (offres fidélité publiques, en cours). Section
 * secondaire : en cas d'échec, liste vide (section masquée) plutôt qu'une
 * page bloquée. C'est aussi le cas tant que la route publique n'est pas en
 * production.
 */
export const obtenirOffresDuMoment = cache(
  async (limite: number = 12): Promise<IPromotionPublique[]> => {
    try {
      return (await lirePromotionsPubliques(limite)).data;
    } catch (erreur) {
      // eslint-disable-next-line no-console -- journal du serveur : section masquée
      console.warn("Offres du moment masquées :", (erreur as Error).message);

      return [];
    }
  },
);
