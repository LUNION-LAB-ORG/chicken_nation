import { baseURL } from "@/config/api";
import { AdhesionBody, AdhesionResponse } from "./adhesion.types";

export interface IAdhesionAPI {
  /**
   * Pré-inscription silencieuse à la Carte de la Nation.
   * Endpoint PUBLIC (aucune authentification), rate-limité côté backend.
   * Idempotent : un numéro déjà connu met à jour le profil sans doublon.
   * `photo` : photo du titulaire (FACULTATIVE sur le site — sert à la
   * vérification backoffice, peut être fournie plus tard dans l'app).
   */
  adherer: (data: AdhesionBody, photo: File | null) => Promise<AdhesionResponse>;
}

export const adhesionAPI: IAdhesionAPI = {
  async adherer(data: AdhesionBody, photo: File | null): Promise<AdhesionResponse> {
    // multipart/form-data via fetch natif : ak-api-http est JSON-only et ne gère
    // pas l'upload de fichier. Le navigateur pose lui-même le boundary (on NE fixe
    // donc PAS le Content-Type). Endpoint PUBLIC → aucun header d'auth.
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("phone", data.phone);
    if (data.profile_type) formData.append("profile_type", data.profile_type);
    if (data.establishment) formData.append("establishment", data.establishment);
    formData.append("whatsapp_opt_in", String(data.whatsapp_opt_in));
    if (photo) formData.append("photo", photo);

    const response = await fetch(`${baseURL}/adhesion`, {
      method: "POST",
      body: formData,
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = Array.isArray(json?.message)
        ? json.message.join(", ")
        : json?.message;
      throw new Error(
        message || "Une erreur est survenue lors de l'envoi de votre demande.",
      );
    }
    return json as AdhesionResponse;
  },
};
