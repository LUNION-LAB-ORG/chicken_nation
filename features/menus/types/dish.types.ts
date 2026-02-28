import { Category } from "./category.types";

export interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  is_promotion: boolean;
  is_alway_epice: boolean;
  promotion_price: number | null;
  category_id: string;
  cooking_time: number | null;
  // Relations
  category?: Category;
  created_at: Date | string;
  updated_at: Date | string;

  isFavorite: boolean;
}