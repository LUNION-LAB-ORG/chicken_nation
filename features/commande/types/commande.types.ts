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
  /** Modes où le supplément est vendu (le serveur refuse les autres). */
  available_order_types: string[];
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
  /** Restaurants qui ne proposent pas ce plat (refusés au retrait par le serveur). */
  restaurantsExclus: string[];
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
  /** Absent dans un panier enregistré avant le 02/10 : vendu partout. */
  available_order_types?: string[];
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
  /**
   * Champs ajoutés le 02/10 : absents dans un panier enregistré avant, d'où
   * le `?`. Créneau horaire du plat et restaurants qui ne le proposent pas.
   */
  available_from?: string | null;
  available_until?: string | null;
  restaurantsExclus?: string[];
  /** Plat retiré du catalogue (relu à l'ouverture du panier) : ligne écartée. */
  retire?: boolean;
  /** Options ou suppléments choisis qui ne sont plus proposés. */
  indisponibles?: string[];
  /** Choix devenu obligatoire depuis l'ajout (nom du groupe d'options). */
  choixManquant?: string;
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
  /** Indication saisie par le client (portail, immeuble…), jointe à l'adresse. */
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
  lignes: ILigneCommande[];
}

export interface ILigneCommande {
  nom: string;
  quantite: number;
  /** Total de la ligne : plat, options et suppléments. */
  montant: number;
  options: string[];
  supplements: string[];
  epice: boolean;
}

/** Livraison coupée depuis le back office (réglage delivery.app_disabled). */
export interface ILivraisonDisponible {
  disponible: boolean;
  message: string | null;
}

export interface IConfigPaiement {
  public_key: string;
  sandbox: boolean;
}

/** `statut` : code HTTP de l'API quand elle a répondu en erreur. */
export type Resultat<T> = { ok: true; data: T } | { ok: false; message: string; statut?: number };
