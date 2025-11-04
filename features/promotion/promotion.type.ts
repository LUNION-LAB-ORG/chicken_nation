/**
 * Enum Type Promotion 
 */
export enum PromotionType {
  PERCENTAGE = "PERCENTAGE", // POURCENTAGE
  FIXED_AMOUNT = "FIXED_AMOUNT", // MONTANT FIXE
  BUY_X_GET_Y = "BUY_X_GET_Y", // ACHETER X, OBTEindre Y
}

/**
 * Enum Type Produit Cible 
 */
export enum PromotionTarget {
  ALL_PRODUCTS = "ALL_PRODUCTS", // TOUT LES PRODUITS
  SPECIFIC_PRODUCTS = "SPECIFIC_PRODUCTS", // PRODUITS SPECIFiques
  CATEGORIES = "CATEGORIES", // CATEGORIES
}

/**
 * Enum Statut Promotion 
 */
export enum PromotionStatus {
  DRAFT = "DRAFT", // Brouillon
  ACTIVE = "ACTIVE", // ACTIF
  EXPIRED = "EXPIRED", // EXPIRÉ
  PAUSED = "PAUSED", // PAUSE
  CANCELLED = "CANCELLED", // ANNULÉ
}

/**
 * Visibilité de la promotion.
 */
export enum PromotionVisibility {
  PUBLIC = "PUBLIC", // PUBLIC
  PRIVATE = "PRIVATE", // PRIVE
}


/**
 * Représente une promotion.
 */
export interface IPromotion {
  id: string;
  title: string;
  description?: string;
  discount_type: PromotionType;
  discount_value: number;
  target_type: PromotionTarget;
  min_order_amount?: number;
  max_discount_amount?: number;
  max_usage_per_user?: number;
  max_total_usage?: number;
  current_usage: number;
  start_date: string;
  expiration_date: string;
  status: PromotionStatus;
  visibility: PromotionVisibility;
  is_active: boolean;
  target_standard: boolean;
  target_premium: boolean;
  target_gold: boolean;
  coupon_image_url?: string;
  background_color?: string;
  text_color?: string;
  expiration_color?: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface IPromotionParams {
  title?: string;
  discount_type?: PromotionType;
  target_type?: PromotionTarget;

  min_order_amount?: number;
  max_discount_amount?: number;

  start_date_from?: string;
  start_date_to?: string;
  expiration_date_from?: string;
  expiration_date_to?: string;
  status?: PromotionStatus;
  visibility?: PromotionVisibility;

  target_standard?: boolean;
  target_premium?: boolean;
  target_gold?: boolean;
  targeted_category_ids?: string[];
  targeted_dish_ids?: string[];
  restaurant_ids?: string[];

  page?: number;
  limit?: number;
}