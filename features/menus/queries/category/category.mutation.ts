import { useMutation } from "@tanstack/react-query";
import { categoryAPI } from "../../apis/category.api";

/**
 * Mutation pour récupérer une catégorie spécifique
 */
export const useCategoryOneMutation = () => {
	return useMutation({
		mutationFn: async (categoryId: string) => {
			const result = await categoryAPI.getCategoryById(categoryId);
			return result;
		}
	});
};