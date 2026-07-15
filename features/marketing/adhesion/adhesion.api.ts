import { apiClient } from "@/lib/api.client";
import { AdhesionBody, AdhesionResponse } from "./adhesion.types";

export interface IAdhesionAPI {
  /**
   * Pré-inscription silencieuse à la Carte de la Nation.
   * Endpoint PUBLIC (aucune authentification), rate-limité côté backend.
   * Idempotent : un numéro déjà connu met à jour le profil sans doublon.
   */
  adherer: (data: AdhesionBody) => Promise<AdhesionResponse>;
}

export const adhesionAPI: IAdhesionAPI = {
  adherer(data: AdhesionBody): Promise<AdhesionResponse> {
    return apiClient.request<AdhesionResponse>({
      endpoint: `/adhesion`,
      method: "POST",
      data,
      service: "public",
    });
  },
};
