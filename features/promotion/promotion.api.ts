import { api } from "@/lib/api";
import { PaginatedResponse } from "@/types/api.type";
import { IPromotionPublique } from "./promotion.type";

export interface IPromotionAPI {
    obtenirPromotionsActives(params: { limit?: number }): Promise<PaginatedResponse<IPromotionPublique>>;
}

export const promotionAPI: IPromotionAPI = {
    // Route publique : `GET /fidelity/promotions` est réservée au personnel
    // (401 pour un visiteur, la section ne s'affichait plus).
    obtenirPromotionsActives(params: { limit?: number }) {
        return api.request({
            endpoint: `/fidelity/promotions/public`,
            method: "GET",
            searchParams: { limit: params.limit || 12 },
            service: "public"
        });
    },
};
