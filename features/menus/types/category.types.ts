import { Dish } from "./dish.types";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  dishes?: Dish[];
  created_at: string;
  updated_at: string;
}