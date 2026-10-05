/**
 * Carte publique réduite aux champs que le site affiche ou publie
 * (36 ko pour les 49 plats de production au lieu des 776 ko de `GET /dishes`, qui embarque pour
 * chaque plat tous ses suppléments et toutes ses lignes de restaurant).
 */

/** Plat tel que renvoyé par `GET /dishes` à un visiteur non connecté (champs lus seulement). */
export interface IPlatApi {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_promotion: boolean;
  promotion_price: number | null;
  image: string | null;
  /** Modes de vente : DELIVERY, PICKUP, TABLE. Liste vide = vendu partout (règle du serveur). */
  available_order_types?: string[] | null;
  /** Créneau horaire « HH:mm », à l'heure d'Abidjan. */
  available_from?: string | null;
  available_until?: string | null;
  composable?: boolean | null;
  entity_status: string;
  updated_at?: string | null;
  category: { id?: string; name: string } | null;
}

/** Photo d'un plat : recadrée par la maquette, ou repli sur la photo de l'API. */
export interface IPhotoPlat {
  src: string;
  /** Couleur du fond de la photo : la zone qui la porte prend la même (aucune couture). */
  fond: string;
  largeur: number;
  hauteur: number;
  /** Largeur / hauteur. */
  ratio: number;
  /** Étiquette étoile à redessiner en CSS (photos recadrées seulement : celles de l'API la portent déjà). */
  etiquette: boolean;
  /** Photo recadrée de `public/assets/plats/` (sinon photo de l'API ou image par défaut). */
  recadree: boolean;
}

export interface IPlatCarte {
  id: string;
  /** Dernière partie de l'adresse de la page du plat (`/fr/carte/<slug>`). */
  slug: string;
  /** Nom tel qu'enregistré (souvent en capitales). */
  nom: string;
  /** Description, espaces réduits (mise en forme au rendu). */
  description: string;
  /** Prix payé : prix promo si la promotion est active. */
  prix: number;
  /** Prix barré quand le plat est en promotion. */
  prixAvantPromo: number | null;
  /** Photo de l'API, adresse complète (ancienne carte et panier). */
  image: string;
  photo: IPhotoPlat;
  /** Catégorie propre du plat (jamais la section Promotions, sauf pour un plat rangé dans PROMOTIONS). */
  categorie: { cle: string; nom: string; court: string };
  /** Modes de vente de l'API ; liste vide = vendu partout. */
  modes: string[];
  /** Créneau horaire (« 11:00 » à « 15:00 », heure d'Abidjan) ; `null` = servi toute la journée. */
  creneau: { debut: string; fin: string } | null;
  composable: boolean;
  /** `updated_at` de l'API (date de dernière modification, sitemap). */
  modifieLe: string | null;
}

export interface ICategorieCarte {
  /** Ancre de la section sur la carte (`#box`). */
  cle: string;
  /** Titre de la section (« Nos box »). */
  nom: string;
  /** Forme courte (« Box »). */
  court: string;
  /** Plats triés par prix croissant. */
  plats: IPlatCarte[];
}
