"use server";

import { ActionResponse, PaginatedResponse } from "@/types/api.type";
import { promotionAPI } from "./promotion.api";
import { handleServerActionError } from "@/utils/handleServerActionError";
import { IPromotionPublique } from "./promotion.type";
export const obtenirPromotionsActivesAction = async (params: { limit?: number }): Promise<ActionResponse<PaginatedResponse<IPromotionPublique>>> => {
    try {
        const data = await promotionAPI.obtenirPromotionsActives(params);
        return {
            success: true,
            data: data,
            message: "Les promotions actives obtenues avec succès",
        }
    } catch (error) {
        return handleServerActionError(error, "Erreur lors de la récupération des promotions actives");
    }
}
