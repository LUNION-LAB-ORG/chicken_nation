import type {
  CategorieSupplement,
  IAdresseEnregistree,
  IConditionsCommande,
  IFraisLivraison,
  IItineraireLivraison,
  IPlatDetail,
  IReglagesFidelite,
  Resultat,
} from "../types/commande.types";

import { normaliserGroupes } from "./panier.utils";

import { formatImageUrl } from "@/utils/formatImageUrl";

/**
 * Réponses de l'API remises sous la forme du site. Fonctions pures, à part des
 * actions serveur (actions/commande.action.ts) pour pouvoir les tester : une
 * réponse incomplète ou d'une ancienne version du serveur ne doit jamais
 * produire un montant ou un lieu faux.
 */

type Brut = Record<string, unknown>;

const nombre = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const estObjet = (v: unknown): v is Brut =>
  !!v && typeof v === "object" && !Array.isArray(v);
const TOUS_LES_MODES = ["DELIVERY", "PICKUP", "TABLE"];

/** Modes de vente ; liste absente ou vide = vendu partout (règle du serveur). */
export const modesDeVente = (v: unknown) =>
  Array.isArray(v) && v.length ? (v as string[]) : TOUS_LES_MODES;

export const IMAGE_PAR_DEFAUT = "/assets/images/logo.png";

// ── Plat ──────────────────────────────────────────────────────────────────

/** Détail d'un plat (GET /dishes/:id avec l'en-tête x-app-composable). */
export function versPlatDetail(p: Brut): IPlatDetail {
  const prix = nombre(p.price);
  const promo = nombre(p.promotion_price);
  const enPromo = !!p.is_promotion && promo > 0 && promo < prix;

  // Un même supplément peut être rattaché deux fois : on dédoublonne.
  const vus = new Set<string>();
  const supplements = (
    Array.isArray(p.dish_supplements) ? (p.dish_supplements as Brut[]) : []
  )
    .map((ds) => ds?.supplement as Brut | undefined)
    .filter(
      (s): s is Brut =>
        !!s && typeof s.id === "string" && s.available !== false,
    )
    .filter((s) =>
      vus.has(s.id as string) ? false : (vus.add(s.id as string), true),
    )
    .map((s) => ({
      id: s.id as string,
      name: String(s.name ?? "")
        .replace(/\s+/g, " ")
        .trim(),
      price: nombre(s.price),
      category: (["FOOD", "DRINK", "ACCESSORY"].includes(String(s.category))
        ? s.category
        : "ACCESSORY") as CategorieSupplement,
      available_order_types: modesDeVente(s.available_order_types),
      image:
        typeof s.image === "string" && s.image ? formatImageUrl(s.image) : null,
      position: nombre(s.position),
    }));

  return {
    id: String(p.id),
    name: String(p.name ?? "").trim(),
    description: String(p.description ?? "")
      .replace(/\s+/g, " ")
      .trim(),
    image: formatImageUrl((p.image as string) ?? undefined, IMAGE_PAR_DEFAUT),
    prix: enPromo ? promo : prix,
    prixAvantPromo: enPromo ? prix : null,
    spice_level: (["ALWAYS", "OPTIONAL", "NEVER"].includes(
      String(p.spice_level),
    )
      ? p.spice_level
      : "OPTIONAL") as IPlatDetail["spice_level"],
    available_order_types: modesDeVente(p.available_order_types),
    available_from: (p.available_from as string) || null,
    available_until: (p.available_until as string) || null,
    restaurantsExclus: Array.isArray(p.excluded_restaurant_ids)
      ? (p.excluded_restaurant_ids as unknown[]).filter(
          (r): r is string => typeof r === "string",
        )
      : [],
    groupes: normaliserGroupes(p.option_groups),
    supplements,
  };
}

// ── Livraison ─────────────────────────────────────────────────────────────

/** Frais de livraison (GET /orders/frais-livraison, ou `frais` de l'itinéraire). */
export function versFrais(d: unknown): Resultat<IFraisLivraison> {
  if (!estObjet(d) || d.montant === undefined || d.montant === null) {
    return {
      ok: false,
      message: "Cette adresse n'est pas desservie pour le moment.",
    };
  }
  const avant =
    d.original_montant !== undefined && d.original_montant !== null
      ? nombre(d.original_montant)
      : null;

  return {
    ok: true,
    data: {
      montant: nombre(d.montant),
      montantAvantOffre:
        avant !== null && avant > nombre(d.montant) ? avant : null,
      offre: (d.offer_name as string) || null,
      distanceKm: d.distance !== undefined ? nombre(d.distance) : null,
    },
  };
}

/**
 * Restaurant de préparation et frais (GET /orders/itineraire-livraison).
 * Distance : celle du trajet si Google l'a donnée, sinon celle des frais
 * (par la route, ou vol d'oiseau redressé), à une décimale.
 */
export function versItineraire(d: unknown): Resultat<IItineraireLivraison> {
  if (!estObjet(d))
    return {
      ok: false,
      message: "Cette adresse n'est pas desservie pour le moment.",
    };
  const frais = versFrais(d.frais);

  if (!frais.ok) return frais;
  const r =
    estObjet(d.restaurant) && typeof d.restaurant.id === "string"
      ? d.restaurant
      : null;
  const trajet = estObjet(d.itineraire)
    ? nombre(d.itineraire.distanceMeters) / 1000
    : 0;
  const parFrais = estObjet(d.frais)
    ? nombre(d.frais.distance_exacte ?? d.frais.distance)
    : 0;
  const km = trajet > 0 ? trajet : parFrais;

  return {
    ok: true,
    data: {
      restaurant: r
        ? { id: String(r.id), nom: String(r.name ?? "").trim() }
        : null,
      frais: frais.data,
      distanceKm: km > 0 ? Math.round(km * 10) / 10 : null,
    },
  };
}

// ── Adresses enregistrées ─────────────────────────────────────────────────

/** Adresse du carnet du client (GET, POST, PATCH /addresses), ou null si inutilisable. */
export function versAdresseEnregistree(a: unknown): IAdresseEnregistree | null {
  if (!estObjet(a) || typeof a.id !== "string") return null;
  const latitude = Number(a.latitude);
  const longitude = Number(a.longitude);
  const libelle = String(a.address ?? "")
    .replace(/\s+/g, " ")
    .trim();

  // Point absent ou à 0,0 : le livreur ne trouverait rien, l'adresse n'est pas proposée.
  if (
    !libelle ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    (!latitude && !longitude)
  )
    return null;
  const titre = String(a.title ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return { id: a.id, titre: titre || "Adresse", libelle, latitude, longitude };
}

// ── Fidélité ──────────────────────────────────────────────────────────────

/** Réglages de fidélité (GET /fidelity/loyalty/config, route publique). */
export function versReglagesFidelite(brut: unknown): IReglagesFidelite {
  const d = estObjet(brut) ? brut : {};
  const jours = nombre(d.points_expiration_days);

  return {
    valeurPoint: Math.max(0, nombre(d.point_value_in_xof)),
    minimum: Math.max(0, nombre(d.minimum_redemption_points)),
    // Absent : le serveur applique 50 (loyalty.service, capLoyaltyDiscount).
    plafondPct:
      d.max_redemption_pct === null || d.max_redemption_pct === undefined
        ? 50
        : nombre(d.max_redemption_pct),
    pointsParFranc: Math.max(0, nombre(d.points_per_xof)),
    joursValidite: jours > 0 ? Math.floor(jours) : null,
  };
}

// ── Conditions de la commande ─────────────────────────────────────────────

/**
 * Conditions publiques (GET /orders/conditions-commande). Taux absent, négatif
 * ou aberrant : null. Grille seulement si `grille_frais_appliquee` est vrai
 * (avec les zones du livreur, la grille n'est qu'un secours et ses prix
 * seraient faux) et si chaque palier est lisible.
 */
export function versConditionsCommande(brut: unknown): IConditionsCommande {
  const d = estObjet(brut) ? brut : {};
  const taux = Number(d.taux_frais_service);
  const tauxFraisService =
    d.taux_frais_service !== null &&
    Number.isFinite(taux) &&
    taux >= 0 &&
    taux < 1
      ? taux
      : null;
  const paliers = Array.isArray(d.grille_frais)
    ? (d.grille_frais as unknown[])
    : [];
  const grille = paliers.map((p) => {
    if (!estObjet(p)) return null;
    const montant = Number(p.montant);
    const max = p.distance_max_km === null ? null : Number(p.distance_max_km);

    if (!Number.isFinite(montant) || montant <= 0) return null;
    if (max !== null && !(Number.isFinite(max) && max > 0)) return null;

    return { distanceMaxKm: max, montant };
  });
  const lisible = grille.length > 0 && grille.every((p) => p !== null);

  return {
    tauxFraisService,
    grille:
      d.grille_frais_appliquee === true && lisible
        ? (grille as NonNullable<(typeof grille)[number]>[])
        : null,
  };
}

/**
 * Frais de service estimés, calcul du serveur à la création (createv2) :
 * arrondis à la dizaine supérieure sur le sous-total des plats, options et
 * suppléments, avant remises, livraison exclue. `null` si le taux est inconnu.
 */
export function fraisServiceEstimes(
  sousTotal: number,
  taux: number | null,
): number | null {
  if (taux === null || !Number.isFinite(taux) || taux < 0) return null;

  return Math.ceil((Math.max(0, sousTotal) * taux) / 10) * 10;
}
