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
  /** Aide affichée sous le titre du groupe (back office), ou null. */
  description: string | null;
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
  /** Photo du supplément (adresse complète), ou null s'il n'en a pas. */
  image: string | null;
  /** Ordre d'affichage dans sa catégorie (back office). */
  position: number;
}

/** Niveau d'épice d'un plat : OPTIONAL, le client choisit ; ALWAYS / NEVER, imposé. */
export type NiveauEpice = "ALWAYS" | "OPTIONAL" | "NEVER";

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
  spice_level: NiveauEpice;
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
  /**
   * Niveau d'épice du plat (champ ajouté le 05/10, absent des paniers
   * d'avant) : sert à écrire « Non épicé » quand le client l'a choisi.
   */
  spice_level?: NiveauEpice;
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

/**
 * Heures du suivi, telles que le serveur les pose à chaque changement de
 * statut (ISO, ou null tant que l'étape n'est pas atteinte).
 */
export interface IHeuresCommande {
  accepted_at: string | null;
  prepared_at: string | null;
  ready_at: string | null;
  picked_up_at: string | null;
  collected_at: string | null;
  completed_at: string | null;
}

export interface ICommande {
  id: string;
  reference: string;
  type: string;
  status: StatutCommande;
  paied: boolean;
  payment_method: string | null;
  net_amount: number;
  /** Remise totale : code promo ou bon, OU points de fidélité (jamais les deux). */
  discount: number;
  /** Points de fidélité retenus par le serveur (0 si aucun, ou s'il les a refusés). */
  points: number;
  tax: number;
  delivery_fee: number;
  amount: number;
  created_at: string;
  date: string | null;
  recovery_code: string | null;
  /**
   * Restaurant de la commande, SANS son numéro : le seul numéro affiché par le
   * site est le 27 21 71 21 30 (retouche 6). Le numéro reçu de l'API est
   * écarté à la lecture.
   */
  restaurant: { id: string; name: string; address: string | null } | null;
  adresse: string | null;
  /** Repère saisi avec l'adresse de livraison (« portail bleu »), ou null. */
  repere?: string | null;
  /**
   * Heure demandée, « HH:mm » à l'heure d'Abidjan (champ `time` de l'API) :
   * créneau de retrait choisi, ou heure de la commande pour « dès que possible ».
   */
  heure?: string | null;
  heures: IHeuresCommande;
  lignes: ILigneCommande[];
}

/** Supplément d'une ligne de commande, pour « Recommander ». */
export interface ISupplementCommande {
  id: string;
  nom: string;
  quantite: number;
  /** Supplément offert (cadeau) : jamais recommandé. */
  offert: boolean;
}

export interface ILigneCommande {
  /** Plat commandé (pour « Recommander » et la photo). */
  dish_id: string;
  nom: string;
  /** Photo de l'API (adresse complète), ou chaîne vide. */
  image: string;
  quantite: number;
  /** Total de la ligne : plat, options et suppléments. */
  montant: number;
  /** Libellés des choix, pour l'affichage. */
  options: string[];
  /** Identifiants des choix retenus, pour « Recommander ». */
  option_item_ids: string[];
  /** Suppléments lisibles (« 2 × Coca »), pour l'affichage. */
  supplements: string[];
  /** Suppléments détaillés, pour « Recommander ». */
  supplementsChoisis: ISupplementCommande[];
  epice: boolean;
  /** Plat offert (cadeau à 0 F) : jamais recommandé. */
  offert: boolean;
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

// ── Fidélité ──────────────────────────────────────────────────────────────

/**
 * Points du client et réglages de fidélité, lus tels quels sur l'API
 * (GET /fidelity/loyalty/config et /fidelity/loyalty/customer/:id). Le back
 * office peut changer ces réglages : rien n'est écrit en dur sur le site.
 */
export interface IReglagesFidelite {
  /** Valeur d'un point en francs (point_value_in_xof). */
  valeurPoint: number;
  /** Minimum de points par commande (minimum_redemption_points). */
  minimum: number;
  /** Part maximale du sous-total payable en points (max_redemption_pct). 0 ou 100 et plus : aucune. */
  plafondPct: number;
  /** Points gagnés par franc (points_per_xof). */
  pointsParFranc: number;
  /** Durée de validité des points en jours (points_expiration_days), null si illisible. */
  joursValidite: number | null;
}

export interface IPointsFidelite extends IReglagesFidelite {
  /** Solde utilisable (redeemable_points, sinon total_points). */
  solde: number;
}

/**
 * Cadeau gagné (récompense GIFT grattée) : un plat ou un supplément offert,
 * ajouté à la commande à 0 F. `available_order_types`, créneau et restaurants
 * viennent de l'article relu au catalogue ; absents si la relecture a échoué
 * (le serveur reste alors le seul juge).
 */
export interface ICadeau {
  /** Identifiant de la récompense (reward_id). */
  id: string;
  type: "PLAT" | "SUPPLEMENT";
  /** dish_id ou supplement_id du payload. */
  articleId: string;
  nom: string;
  image: string;
  expireLe: string | null;
  available_order_types?: string[];
  available_from?: string | null;
  available_until?: string | null;
  restaurantsExclus?: string[];
  /** Article retiré du catalogue ou indisponible : le serveur refuserait la commande. */
  indisponible?: boolean;
}

/** Ce que le panier montre au client connecté : ses points (null si illisibles) et ses cadeaux. */
export interface IFideliteClient {
  points: IPointsFidelite | null;
  cadeaux: ICadeau[];
}

/**
 * Ce que le navigateur transmet d'un cadeau choisi (le serveur revérifie tout).
 * `epice` : choix du client pour un plat offert qui le demande ; absent, le
 * plat part non épicé (comme avant le 05/10).
 */
export type CadeauChoisi = Pick<
  ICadeau,
  "id" | "type" | "articleId" | "nom"
> & { epice?: boolean };

// ── Livraison, adresses, conditions ─────────────────────────────────────

/**
 * Restaurant qui préparera une livraison et frais pour l'adresse, lus sur
 * GET /orders/itineraire-livraison : c'est le serveur qui choisit le
 * restaurant (le plus proche qui propose les plats). Il peut changer à la
 * commande si un plat y est exclu.
 */
export interface IItineraireLivraison {
  /** Restaurant retenu, nom tel que l'API l'enregistre (« CHICKEN NATION ZONE 4 »), ou null. */
  restaurant: { id: string; nom: string } | null;
  frais: IFraisLivraison;
  /** Distance par la route en km (une décimale), ou null si inconnue. */
  distanceKm: number | null;
}

/** Adresse enregistrée du client (carnet partagé avec l'application). */
export interface IAdresseEnregistree {
  id: string;
  /** Nom donné par le client (« Maison », « Bureau »). */
  titre: string;
  libelle: string;
  latitude: number;
  longitude: number;
}

/**
 * Conditions publiques de la commande (GET /orders/conditions-commande).
 * `null` partout quand le serveur ne les donne pas (ancienne version,
 * réseau) : le site écrit alors « calculés au paiement ».
 */
export interface IConditionsCommande {
  /** Taux des frais de service (0,01 = 1 %), ou null s'il est inconnu. */
  tauxFraisService: number | null;
  /**
   * Grille des frais de livraison, seulement si elle s'applique vraiment
   * (`grille_frais_appliquee`) ; sinon null et la grille n'est pas montrée.
   * Palier « jusqu'à X km » par la route, borne comprise ; `distanceMaxKm`
   * null = au-delà du palier précédent.
   */
  grille: { distanceMaxKm: number | null; montant: number }[] | null;
}

/** Ce que la caisse envoie pour créer la commande (creerCommandeAction). */
export interface ICreationCommande {
  mode: ModeCommande;
  lignes: ILignePanier[];
  adresse: IAdresseLivraison | null;
  restaurantId: string | null;
  /** ISO ; null = dès que possible. */
  heureRetrait: string | null;
  code: string | null;
  /** Points de fidélité à utiliser, jamais avec un code. Absent : page d'avant le 02/10. */
  points?: number;
  /** Cadeaux choisis, ajoutés à 0 F. */
  cadeaux?: CadeauChoisi[];
}

/** Ligne de commande telle que POST /orders/create-v2 l'attend. */
export interface IArticleCommande {
  dish_id: string;
  quantity: number;
  epice: boolean;
  supplements: { id: string; quantity: number; reward_id?: string }[];
  option_item_ids?: string[];
  /** Ligne offerte (plat d'un cadeau). */
  reward_id?: string;
}

/** `statut` : code HTTP de l'API quand elle a répondu en erreur. */
export type Resultat<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; statut?: number };
