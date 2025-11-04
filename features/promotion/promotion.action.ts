"use server";

import { ActionResponse, PaginatedResponse } from "@/types/api.type";
import { promotionAPI } from "./promotion.api";
import { handleServerActionError } from "@/utils/handleServerActionError";
import { IPromotion } from "./promotion.type";
export const obtenirPromotionsActivesAction = async (params: ObtenirCommentairesParams): Promise<ActionResponse<PaginatedResponse<IPromotion>>> => {
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
