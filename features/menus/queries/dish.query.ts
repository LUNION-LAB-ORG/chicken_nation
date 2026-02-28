import { useQuery } from "@tanstack/react-query";
import { dishAPI } from "../apis/dish.api";
import { dishKeyQuery } from "./index.query";

// Hook pour récupérer les détails d'un plat spécifique par son ID
export const useDishOneQuery = (dishId: string, customerId?: string) => {
    return useQuery({
        queryKey: dishKeyQuery("one", dishId, customerId),
        queryFn: async () => {
            const result = await dishAPI.getDishById(dishId, customerId);
            return result;
        },
        enabled: !!dishId,
        staleTime: 2 * 60 * 1000,
    });
};

export const usePopularDishesQuery = (limit: number = 4, days: number = 30) => {
    return useQuery({
        queryKey: dishKeyQuery("popular", limit, days),
        queryFn: () => dishAPI.getPopularDishes(limit, days),
        staleTime: 15 * 60 * 1000,
    });
};