import { api } from "@/lib/api";
import { PaginatedResponse } from "@/types/api.type";
import { IPromotion, IPromotionParams, PromotionStatus } from "./promotion.type";

export interface IPromotionAPI {
    obtenirPromotionsActives(params: IPromotionParams): Promise<PaginatedResponse<IPromotion>>;
}

export const promotionAPI: IPromotionAPI = {
    obtenirPromotionsActives(params: IPromotionParams) {
        return api.request({
            endpoint: `/fidelity/promotions`,
            method: "GET",
            searchParams: {
                ...params,
                status: PromotionStatus.ACTIVE,
                page: params.page || 1,
                limit: params.limit || 10,
            },
            service: "public"
        });
    },
};
