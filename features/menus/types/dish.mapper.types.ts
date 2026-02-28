import { Dish } from "./dish.types";

export interface MappedDish extends Dish {
    actualPrice: number;
    hasActivePromotion: boolean;
}