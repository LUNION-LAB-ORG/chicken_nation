import { AdhesionDTO } from "./adhesion.schema";

/** Corps envoyé au backend pour l'endpoint public `POST /adhesion`. */
export type AdhesionBody = AdhesionDTO;

/** Réponse de l'endpoint public `POST /adhesion`. */
export interface AdhesionResponse {
  success: boolean;
  message: string;
}
