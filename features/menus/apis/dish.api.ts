import { MappedDish } from "../types/dish.mapper.types";
import { mapDishToUI } from "../utils/dishMapper";

import { apiClient } from "@/lib/api.client";

export const dishAPI = {
  /**
   * Récupère les plats les plus populaires
   */
  async getPopularDishes(
    limit: number = 4,
    days: number = 30,
  ): Promise<MappedDish[]> {
    const data = await apiClient.request({
      endpoint: `/dishes/popular`,
      method: "GET",
      searchParams: { limit, days },
      service: "public",
    });

    return (data ?? []).map(mapDishToUI);
  },

  /**
   * Récupère un plat spécifique par son ID.
   * `x-app-composable` : le site sait afficher un menu composable ; sans cet
   * en-tête, le serveur répond 404 sur un tel plat et le lien vers
   * l'application retomberait sur l'accueil (même en-tête que la carte,
   * menu-public.api.ts, et la fiche plat, commande.action.ts).
   */
  async getDishById(id: string, customerId?: string): Promise<MappedDish> {
    const data = await apiClient.request({
      // Encodé : l'identifiant vient de l'adresse (?product=), « ../ » ou
      // « ? » ne doivent pas viser une autre route de l'API.
      endpoint: `/dishes/${encodeURIComponent(id)}`,
      method: "GET",
      searchParams: customerId ? { customerId } : {},
      service: customerId ? "private" : "public",
      config: { headers: { "x-app-composable": "1" } },
    });

    return mapDishToUI(data);
  },
};
