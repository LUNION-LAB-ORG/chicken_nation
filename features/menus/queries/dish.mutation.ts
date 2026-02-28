import { useMutation } from "@tanstack/react-query";
import { dishAPI } from "../apis/dish.api";

/**
 * Mutation pour récupérer une catégorie spécifique
 */
export const useDishOneMutation = () => {
    return useMutation({
        mutationFn: async (dishId: string) => {
            const result = await dishAPI.getDishById(dishId);
            return result;
        }
    });
};