"use server";

import { ActionResponse, PaginatedResponse } from "@/types/api.type";
import { commentaireAPI } from "./commentaire.api";
import { handleServerActionError } from "@/utils/handleServerActionError";

export const obtenirMeilleursCommentairesAction = async (params: ObtenirCommentairesParams): Promise<ActionResponse<PaginatedResponse<ICommentaire>>> => {
    try {
        const data = await commentaireAPI.obtenirMeilleursCommentaires(params);
        return {
            success: true,
            data: data,
            message: "Les meilleurs commentaires obtenus avec succès",
        }
    } catch (error) {
        return handleServerActionError(error, "Erreur lors de la récupération des meilleurs commentaires");
    }
}
