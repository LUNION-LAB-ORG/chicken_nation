import { api } from "@/lib/api";
import { PaginatedResponse } from "@/types/api.type";

export interface ICommentaireAPI {
    obtenirMeilleursCommentaires(params: ObtenirCommentairesParams): Promise<PaginatedResponse<ICommentaire>>;
}

export const commentaireAPI: ICommentaireAPI = {
    obtenirMeilleursCommentaires(params: ObtenirCommentairesParams) {
        return api.request({
            endpoint: `/comments/bests`,
            method: "GET",
            searchParams: params,
            service: "public"
        });
    },
};
