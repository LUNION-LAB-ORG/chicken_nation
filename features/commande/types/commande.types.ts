export type ModeCommande = "DELIVERY" | "PICKUP";

export type CategorieSupplement = "FOOD" | "DRINK" | "ACCESSORY";

export interface IOptionItem {
  id: string;
  label: string;
  price_delta: number;
  is_default: boolean;
  available: boolean;
  position: number;
}

export interface IGroupeOptions {
  id: string;
  name: string;
  min_select: number;
  max_select: number;
  position: number;
  items: IOptionItem[];
}

export interface ISupplementPlat {
  id: string;
  name: string;
  price: number;
  category: CategorieSupplement;
}

/** Plat tel que la fiche d'ajout au panier en a besoin (GET /dishes/:id). */
export interface IPlatDetail {
  id: string;
  name: string;
  description: string;
  image: string;
  /** Prix payé : prix promo si la promotion est active. */
  prix: number;
  prixAvantPromo: number | null;
  /** OPTIONAL : le client choisit ; ALWAYS / NEVER : imposé. */
  spice_level: "ALWAYS" | "OPTIONAL" | "NEVER";
  available_order_types: string[];
  available_from: string | null;
  available_until: string | null;
  groupes: IGroupeOptions[];
  supplements: ISupplementPlat[];
}

export interface IOptionChoisie {
  item_id: string;
  group_id: string;
  label: string;
  price_delta: number;
}

export interface ISupplementChoisi {
  id: string;
  nom: string;
  prix: number;
  quantite: number;
}

export interface ILignePanier {
  /** Signature : deux ajouts identiques fusionnent sur la même ligne. */
  cle: string;
  dish_id: string;
  nom: string;
  image: string;
  prixUnitaire: number;
  epice: boolean;
  options: IOptionChoisie[];
  supplements: ISupplementChoisi[];
  quantite: number;
  available_order_types: string[];
}

export interface IClient {
  id: string;
  phone: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export interface IAdresseLivraison {
  libelle: string;
  latitude: number;
  longitude: number;
  /** Point de repère saisi par le client, transmis au livreur. */
  repere: string;
}

export interface IFraisLivraison {
  montant: number;
  montantAvantOffre: number | null;
  offre: string | null;
  distanceKm: number | null;
}

export interface ISuggestionAdresse {
  placeId: string;
  principal: string;
  secondaire: string;
}

export type StatutCommande =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "READY"
  | "PICKED_UP"
  | "COLLECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface ICommande {
  id: string;
  reference: string;
  type: string;
  status: StatutCommande;
  paied: boolean;
  payment_method: string | null;
  net_amount: number;
  discount: number;
  tax: number;
  delivery_fee: number;
  amount: number;
  created_at: string;
  date: string | null;
  recovery_code: string | null;
  restaurant: { id: string; name: string; phone: string | null; address: string | null } | null;
  adresse: string | null;
  lignes: { nom: string; quantite: number; montant: number }[];
}

export interface IConfigPaiement {
  public_key: string;
  sandbox: boolean;
}

export type Resultat<T> = { ok: true; data: T } | { ok: false; message: string };
