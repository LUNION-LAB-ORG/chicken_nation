import { keepPreviousData, useQuery } from "@tanstack/react-query";
import React from "react";
import { categoryKeyQuery } from "./index.query";
import { categoryAPI } from "../../apis/category.api";

// Hook pour récupérer les restaurants
export const useCategoryListQuery = () => {
	const result = useQuery({
		queryKey: categoryKeyQuery("list"),
		queryFn: async () => {
			const result = await categoryAPI.getAllCategories();
			return result;
		},
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,// le délai de rafraîchissement
		enabled: true,
	});

	React.useEffect(() => {
		if (result.isError || result.error) {
		}

	}, [result]);

	return result;
};

// Hook pour récupérer une catégorie spécifique
export const useCategoryOneQuery = (categoryId: string) => {
	const result = useQuery({
		queryKey: categoryKeyQuery("one", categoryId),
		queryFn: async () => {
			const result = await categoryAPI.getCategoryById(categoryId);
			return result;
		},
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		enabled: !!categoryId,
	});

	React.useEffect(() => {
		if (result.isError || result.error) {
		}
	}, [result]);

	return result;
};