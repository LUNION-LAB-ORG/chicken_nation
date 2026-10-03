import { Api, SearchParams } from "ak-api-http";
import { IUtilisateur } from "../types/utilisateur.type";
import { IUtilisateurAddUpdateResponse, IUtilisateurDeleteResponse } from "../types/utilisateur.type";
import { PaginatedResponse } from "@/types/api.type";
import { UtilisateurAddDTO, UtilisateurUpdateDTO } from "../schema/utilisateur.schema";
import { IUtilisateursParams } from "../types/utilisateur.type";

// Routes privées : `client` vient de exigerSessionPersonnel() (lib/api.server.ts),
// un client créé pour la requête en cours avec le jeton de SA session. Jamais le
// client partagé `api` de lib/api.ts, qui n'envoie aucun jeton.
export interface IUtilisateurAPI {
    obtenirTousUtilisateurs(client: Api, params: IUtilisateursParams): Promise<PaginatedResponse<IUtilisateur>>;
    obtenirUtilisateur(client: Api, id: string): Promise<IUtilisateur>;
    ajouterUtilisateur(client: Api, data: UtilisateurAddDTO): Promise<IUtilisateurAddUpdateResponse>;
    modifierProfil(client: Api, id: string, data: UtilisateurUpdateDTO): Promise<IUtilisateurAddUpdateResponse>;
    supprimerUtilisateur(client: Api, id: string): Promise<IUtilisateurDeleteResponse>;
}

export const utilisateurAPI: IUtilisateurAPI = {
    obtenirTousUtilisateurs(client: Api, params: IUtilisateursParams): Promise<PaginatedResponse<IUtilisateur>> {
        return client.request<PaginatedResponse<IUtilisateur>>({
            endpoint: `/users`,
            method: "GET",
            searchParams: params as SearchParams,
        });
    },

    obtenirUtilisateur(client: Api, id: string): Promise<IUtilisateur> {
        return client.request<IUtilisateur>({
            endpoint: `/users/${id}/profile`,
            method: "GET",
        });
    },
    ajouterUtilisateur(client: Api, data: UtilisateurAddDTO): Promise<IUtilisateurAddUpdateResponse> {
        return client.request<IUtilisateurAddUpdateResponse>({
            endpoint: `/users`,
            method: "POST",
            data,
        });
    },
    modifierProfil(client: Api, id: string, data: UtilisateurUpdateDTO): Promise<IUtilisateurAddUpdateResponse> {
        return client.request<IUtilisateurAddUpdateResponse>({
            endpoint: `/users/${id}/profile`,
            method: "PATCH",
            data,
        });
    },
    supprimerUtilisateur(client: Api, id: string): Promise<IUtilisateurDeleteResponse> {
        return client.request<IUtilisateurDeleteResponse>({
            endpoint: `/users/${id}`,
            method: "DELETE",
        });
    },
};
