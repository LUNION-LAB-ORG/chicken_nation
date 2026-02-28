import { apiClient } from "@/lib/api.client";
import { formatImageUrl } from "@/utils/imageHelpers";
import { Category } from "@/features/menus/types/category.types";

export const categoryAPI = {
    /**
     * Récupère toutes les catégories
     */
    async getAllCategories(): Promise<Category[]> {
        const data = await apiClient.request({
            endpoint: '/categories',
            method: 'GET',
            service: 'public',
        });

        const categories: Category[] = (data ?? []).map((category: Category) => ({
            ...category,
            image: formatImageUrl(category.image || ''),
        }));

        return categories;
    },

    /**
     * Récupère une catégorie par ID avec ses plats triés par prix
     */
    async getCategoryById(id: string): Promise<Category> {
        const data = await apiClient.request<Category>({
            endpoint: `/categories/${id}`,
            method: 'GET',
            service: 'public',
        });

        // On formate l'image de la catégorie et on traite ses plats
        return {
            ...data,
            image: formatImageUrl(data.image || ''),
            dishes: (data.dishes ?? [])
                .map((dish) => ({
                    ...dish,
                    image: formatImageUrl(dish.image || ''),
                }))
                .sort((a, b) => {
                    // Tri par prix croissant (Numérique strict)
                    const priceA = Number(a.price) || 0;
                    const priceB = Number(b.price) || 0;
                    return priceA - priceB;
                }),
        };
    },
};