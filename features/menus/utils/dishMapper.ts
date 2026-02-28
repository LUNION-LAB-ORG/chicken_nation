import { formatImageUrl } from "@/utils/imageHelpers";
import { Dish } from "../types/dish.types";
import { MappedDish } from "../types/dish.mapper.types";


export const mapDishToUI = (dish: Dish): MappedDish => {
    const hasActivePromotion = Boolean(dish.is_promotion && dish.promotion_price && dish.promotion_price > 0);
    const actualPrice = hasActivePromotion ? dish.promotion_price! : dish.price;

    return {
        ...dish,
        image: formatImageUrl(dish.image || ''),
        actualPrice,
        hasActivePromotion,
    };
};