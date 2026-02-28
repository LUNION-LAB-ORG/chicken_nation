import { apiClient } from "@/lib/api.client";
import { MappedDish } from "../types/dish.mapper.types";
import { mapDishToUI } from "../utils/dishMapper";

export const dishAPI = {
    /**
     * Récupère les plats les plus populaires
     */
    async getPopularDishes(limit: number = 4, days: number = 30): Promise<MappedDish[]> {
        const data = await apiClient.request({
            endpoint: `/dishes/popular`,
            method: "GET",
            searchParams: { limit, days },
            service: "public"
        });

        return (data ?? []).map(mapDishToUI);
    },

    /**
     * Récupère un plat spécifique par son ID
     */
    async getDishById(id: string, customerId?: string): Promise<MappedDish> {
        const data = await apiClient.request({
            endpoint: `/dishes/${id}`,
            method: "GET",
            searchParams: customerId ? { customerId } : {},
            service: customerId ? "private" : "public"
        });

        return mapDishToUI(data);
    }
};