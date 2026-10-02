"use server";

import { formatImageUrl } from "@/utils/formatImageUrl";
import { appelApi } from "../apis/api-client.server";
import type {
  CadeauChoisi,
  CategorieSupplement,
  IAdresseLivraison,
  ICadeau,
  ICommande,
  IConfigPaiement,
  IFideliteClient,
  IFraisLivraison,
  ILignePanier,
  ILivraisonDisponible,
  IPlatDetail,
  IPointsFidelite,
  ISuggestionAdresse,
  ModeCommande,
  Resultat,
} from "../types/commande.types";
import { versCommande } from "../utils/commande.utils";
import { articlesAvecCadeaux, erreurPoints, soldeUtilisable, versCadeau } from "../utils/fidelite.utils";
import {
  articlesPayants,
  assietteCodePromo,
  lignesACommander,
  normaliserGroupes,
  platsNonProposes,
  problemesLigne,
  sousTotal,
} from "../utils/panier.utils";
import { obtenirClientAction } from "./connexion.action";

type Brut = Record<string, unknown>;
const nombre = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const TOUS_LES_MODES = ["DELIVERY", "PICKUP", "TABLE"];
const modes = (v: unknown) => (Array.isArray(v) && v.length ? (v as string[]) : TOUS_LES_MODES);
const estUuid = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

// ── Carte ─────────────────────────────────────────────────────────────────

/** Détail d'un plat pour la fiche d'ajout au panier (route publique). */
export async function obtenirPlatAction(id: string): Promise<Resultat<IPlatDetail>> {
  if (!estUuid(id)) return { ok: false, message: "Plat introuvable.", statut: 404 };
  const res = await appelApi<Brut>(`/dishes/${id}`, { public: true, entetes: { "x-app-composable": "1" } });
  if (!res.ok) return res;
  const p = res.data;
  const prix = nombre(p.price);
  const promo = nombre(p.promotion_price);
  const enPromo = !!p.is_promotion && promo > 0 && promo < prix;

  // Un même supplément peut être rattaché deux fois : on dédoublonne.
  const vus = new Set<string>();
  const supplements = (Array.isArray(p.dish_supplements) ? (p.dish_supplements as Brut[]) : [])
    .map((ds) => ds.supplement as Brut | undefined)
    .filter((s): s is Brut => !!s && typeof s.id === "string" && s.available !== false)
    .filter((s) => (vus.has(s.id as string) ? false : (vus.add(s.id as string), true)))
    .map((s) => ({
      id: s.id as string,
      name: String(s.name ?? "").replace(/\s+/g, " ").trim(),
      price: nombre(s.price),
      category: (["FOOD", "DRINK", "ACCESSORY"].includes(String(s.category)) ? s.category : "ACCESSORY") as CategorieSupplement,
      available_order_types: modes(s.available_order_types),
    }));

  return {
    ok: true,
    data: {
      id: String(p.id),
      name: String(p.name ?? "").trim(),
      description: String(p.description ?? "").replace(/\s+/g, " ").trim(),
      image: formatImageUrl((p.image as string) ?? undefined, "/assets/images/logo.png"),
      prix: enPromo ? promo : prix,
      prixAvantPromo: enPromo ? prix : null,
      spice_level: (["ALWAYS", "OPTIONAL", "NEVER"].includes(String(p.spice_level)) ? p.spice_level : "OPTIONAL") as IPlatDetail["spice_level"],
      available_order_types: modes(p.available_order_types),
      available_from: (p.available_from as string) || null,
      available_until: (p.available_until as string) || null,
      restaurantsExclus: Array.isArray(p.excluded_restaurant_ids)
        ? (p.excluded_restaurant_ids as unknown[]).filter((r): r is string => typeof r === "string")
        : [],
      groupes: normaliserGroupes(p.option_groups),
      supplements,
    },
  };
}

/**
 * Plats du panier relus au catalogue, à l'ouverture de /commander : le panier
 * peut dater de plusieurs jours (prix, modes, créneaux ont pu changer, un plat
 * a pu être retiré). `null` = plat retiré du catalogue. Un plat absent du
 * résultat n'a pas pu être relu (réseau, serveur) : sa ligne reste telle quelle.
 */
export async function revaliderPanierAction(ids: string[]): Promise<Record<string, IPlatDetail | null>> {
  const uniques = Array.from(new Set((Array.isArray(ids) ? ids : []).map(String))).slice(0, 40);
  const resultats = await Promise.all(uniques.map(async (id) => [id, await obtenirPlatAction(id)] as const));
  const plats: Record<string, IPlatDetail | null> = {};
  for (const [id, res] of resultats) {
    if (res.ok) plats[id] = res.data;
    else if (res.statut === 404) plats[id] = null;
  }
  return plats;
}

// ── Adresse et frais de livraison ─────────────────────────────────────────

/**
 * Livraison coupée depuis le back office (« delivery.app_disabled ») : le
 * serveur refuserait la commande au dernier moment. Si la route ne répond pas
 * (serveur pas encore à jour, réseau), la livraison est supposée ouverte : le
 * serveur reste le garde-fou.
 */
export async function livraisonDisponibleAction(): Promise<ILivraisonDisponible> {
  const res = await appelApi<Brut>("/orders/livraison-disponible", { public: true });
  if (!res.ok || !res.data || res.data.disponible !== false) return { disponible: true, message: null };
  const message = typeof res.data.message === "string" ? res.data.message.trim() : "";
  return {
    disponible: false,
    message: message || "La livraison est momentanément indisponible. Vous pouvez commander à emporter.",
  };
}

export async function rechercherAdressesAction(saisie: string, session: string): Promise<ISuggestionAdresse[]> {
  const q = saisie.trim();
  if (q.length < 3 || q.length > 120) return [];
  const params = new URLSearchParams({ input: q, components: "country:ci", language: "fr", sessionToken: session });
  const res = await appelApi<Brut[]>(`/maps/places/autocomplete?${params}`);
  if (!res.ok || !Array.isArray(res.data)) return [];
  return res.data.slice(0, 6).map((s) => ({
    placeId: String(s.placeId),
    principal: String(s.mainText ?? s.description ?? ""),
    secondaire: String(s.secondaryText ?? ""),
  }));
}

export async function detailsAdresseAction(
  placeId: string,
  session: string,
): Promise<Resultat<{ libelle: string; latitude: number; longitude: number }>> {
  const res = await appelApi<Brut>(
    `/maps/places/details/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(session)}`,
  );
  if (!res.ok) return res;
  const lat = nombre(res.data.latitude);
  const lng = nombre(res.data.longitude);
  if (!lat || !lng) return { ok: false, message: "Adresse introuvable. Essayez une autre recherche." };
  const nom = String(res.data.name ?? "");
  const adresse = String(res.data.formattedAddress ?? "");
  return { ok: true, data: { libelle: adresse.startsWith(nom) ? adresse : `${nom}, ${adresse}`, latitude: lat, longitude: lng } };
}

export async function adresseDepuisPositionAction(
  latitude: number,
  longitude: number,
): Promise<Resultat<{ libelle: string; latitude: number; longitude: number }>> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return { ok: false, message: "Position invalide." };
  const res = await appelApi<Brut>(`/maps/geocode/reverse?lat=${latitude}&lng=${longitude}`);
  const libelle = res.ok
    ? String(res.data.formattedAddress ?? res.data.formatted_address ?? res.data.address ?? "")
    : "";
  return { ok: true, data: { libelle: libelle || "Ma position actuelle", latitude, longitude } };
}

export async function calculerFraisAction(
  latitude: number,
  longitude: number,
  montantPanier: number,
): Promise<Resultat<IFraisLivraison>> {
  const params = new URLSearchParams({
    lat: String(latitude),
    long: String(longitude),
    order_amount: String(Math.max(0, Math.round(montantPanier))),
  });
  const res = await appelApi<Brut>(`/orders/frais-livraison?${params}`, { public: true });
  if (!res.ok) return res;
  const d = res.data;
  if (d.montant === undefined || d.montant === null) {
    return { ok: false, message: "Cette adresse n'est pas desservie pour le moment." };
  }
  const avant = d.original_montant !== undefined && d.original_montant !== null ? nombre(d.original_montant) : null;
  return {
    ok: true,
    data: {
      montant: nombre(d.montant),
      montantAvantOffre: avant !== null && avant > nombre(d.montant) ? avant : null,
      offre: (d.offer_name as string) || null,
      distanceKm: d.distance !== undefined ? nombre(d.distance) : null,
    },
  };
}

// ── Code promo ou bon ─────────────────────────────────────────────────────

export async function verifierCodeReductionAction(
  code: string,
  lignes: ILignePanier[],
  montantPanier: number,
): Promise<Resultat<{ code: string; remise: number }>> {
  const c = code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,40}$/.test(c)) return { ok: false, message: "Code invalide." };
  const promo = await appelApi<Brut>("/promo-code/apply", {
    methode: "POST",
    corps: {
      code: c,
      order_amount: Math.round(montantPanier),
      order_items: assietteCodePromo(lignes),
    },
  });
  if (promo.ok && promo.data.isValid) {
    return { ok: true, data: { code: c, remise: Math.min(nombre(promo.data.discountAmount), montantPanier) } };
  }
  // Pas un code promo : peut-être un bon d'achat.
  const bon = await appelApi<Brut>(`/voucher/client/check/${encodeURIComponent(c)}`);
  if (bon.ok && bon.data.isValid) {
    return { ok: true, data: { code: c, remise: Math.min(nombre(bon.data.remainingAmount), montantPanier) } };
  }
  const message = !promo.ok ? promo.message : (promo.data.message as string) || "Ce code n'est pas valable pour ce panier.";
  return { ok: false, message };
}

// ── Fidélité : points et cadeaux ──────────────────────────────────────────

/** Réglages de fidélité (route publique), lus à chaque fois : le back office peut les changer. */
async function lireReglagesFidelite(): Promise<Resultat<Omit<IPointsFidelite, "solde">>> {
  const res = await appelApi<Brut>("/fidelity/loyalty/config", { public: true });
  if (!res.ok) return res;
  const d = res.data ?? {};
  return {
    ok: true,
    data: {
      valeurPoint: Math.max(0, nombre(d.point_value_in_xof)),
      minimum: Math.max(0, nombre(d.minimum_redemption_points)),
      // Absent : le serveur applique 50 (loyalty.service, capLoyaltyDiscount).
      plafondPct: d.max_redemption_pct === null || d.max_redemption_pct === undefined ? 50 : nombre(d.max_redemption_pct),
      pointsParFranc: Math.max(0, nombre(d.points_per_xof)),
    },
  };
}

/**
 * Cadeau complété par son article relu au catalogue : le serveur contrôle le
 * plat ou le supplément offert comme un autre (mode, créneau, restaurant) et
 * refuserait la commande ENTIÈRE. Relecture impossible (réseau) : cadeau
 * laissé tel quel, le serveur reste le garde-fou.
 */
async function completerCadeau(c: ICadeau): Promise<ICadeau> {
  const image = c.image ? formatImageUrl(c.image, "/assets/images/logo.png") : "/assets/images/logo.png";
  if (c.type === "PLAT") {
    const plat = await obtenirPlatAction(c.articleId);
    if (!plat.ok) return { ...c, image, ...(plat.statut === 404 ? { indisponible: true } : {}) };
    return {
      ...c,
      image: c.image ? image : plat.data.image,
      available_order_types: plat.data.available_order_types,
      available_from: plat.data.available_from,
      available_until: plat.data.available_until,
      restaurantsExclus: plat.data.restaurantsExclus,
    };
  }
  const supplement = await appelApi<Brut>(`/supplements/${c.articleId}`, { public: true });
  if (!supplement.ok) return { ...c, image, ...(supplement.statut === 404 ? { indisponible: true } : {}) };
  // Réponse vide : rien à contrôler, plutôt que de faire échouer toute la lecture.
  const s = supplement.data ?? {};
  return {
    ...c,
    image,
    available_order_types: modes(s.available_order_types),
    ...(s.available === false ? { indisponible: true } : {}),
  };
}

/**
 * Points et cadeaux du client connecté, pour le panier. Son identifiant est
 * relu ici avec le jeton, jamais reçu du navigateur. Chaque partie peut
 * manquer sans l'autre : la commande reste possible sans elles.
 */
export async function lireFideliteAction(): Promise<Resultat<IFideliteClient>> {
  const client = await obtenirClientAction();
  if (!client) return { ok: false, message: "Connectez-vous pour continuer." };
  const [reglages, compte, gagnes] = await Promise.all([
    lireReglagesFidelite(),
    appelApi<Brut>(`/fidelity/loyalty/customer/${encodeURIComponent(client.id)}`),
    appelApi<Brut[]>("/fidelity/rewards/redeemable-gifts"),
  ]);
  const points = reglages.ok && compte.ok ? { ...reglages.data, solde: soldeUtilisable(compte.data) } : null;
  if (!points && !gagnes.ok) return gagnes;
  const cadeaux = (gagnes.ok && Array.isArray(gagnes.data) ? gagnes.data : [])
    .map(versCadeau)
    .filter((x): x is ICadeau => x !== null)
    .slice(0, 10);
  return { ok: true, data: { points, cadeaux: await Promise.all(cadeaux.map(completerCadeau)) } };
}

// ── Commande ──────────────────────────────────────────────────────────────

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

/**
 * `remise` : remise accordée par le serveur (code ou points). Le panier la
 * compare à son estimation pour prévenir le client avant le paiement.
 */
export async function creerCommandeAction(
  c: ICreationCommande,
): Promise<Resultat<{ id: string; remise: number }>> {
  const lignes = lignesACommander(c.lignes);
  if (lignes.length === 0) return { ok: false, message: "Votre panier est vide." };

  // Une action serveur s'appelle avec n'importe quels arguments : on filtre.
  const points = Number.isInteger(c.points) && (c.points as number) > 0 ? (c.points as number) : 0;
  const cadeaux: CadeauChoisi[] = (Array.isArray(c.cadeaux) ? c.cadeaux : [])
    .filter((x) => !!x && estUuid(String(x.id)) && estUuid(String(x.articleId)) && (x.type === "PLAT" || x.type === "SUPPLEMENT"))
    .slice(0, 10)
    .map((x) => ({ id: x.id, type: x.type, articleId: x.articleId, nom: String(x.nom ?? "").slice(0, 80) }));
  // RG-02 : points OU code, jamais les deux (le serveur refuserait aussi).
  if (points > 0 && c.code) {
    return { ok: false, message: "Les points et un code ne se cumulent pas. Retirez l'un des deux." };
  }
  if (c.mode === "DELIVERY" && !c.adresse) return { ok: false, message: "Choisissez l'adresse de livraison." };
  if (c.mode === "PICKUP" && !c.restaurantId) return { ok: false, message: "Choisissez le restaurant de retrait." };
  const maintenant = new Date();
  for (const l of lignes) {
    const probleme = problemesLigne(l, c.mode, maintenant)[0];
    if (probleme) return { ok: false, message: `« ${l.nom} » : ${probleme}` };
  }
  if (c.mode === "PICKUP" && c.restaurantId) {
    const absents = platsNonProposes(lignes, c.restaurantId);
    if (absents.length) {
      return { ok: false, message: `Ce restaurant ne propose pas : ${absents.join(", ")}. Choisissez-en un autre.` };
    }
  }

  /**
   * Nom, téléphone et courriel relus ICI, depuis le compte du client, et non
   * reçus du navigateur. Un client connecté sans prénom ni nom (code validé,
   * puis page rechargée avant l'étape du nom) partait sinon au nom de
   * « null null », vu par la caisse, le livreur et Turbo.
   */
  const client = await obtenirClientAction();
  if (!client) return { ok: false, message: "Connectez-vous pour continuer." };
  if (!client.first_name || !client.last_name) {
    return { ok: false, message: "Indiquez votre prénom et votre nom avant de commander." };
  }

  /**
   * Plafond des points revérifié avec les réglages du moment (le panier a pu
   * les lire il y a longtemps). Le serveur enregistre les points DEMANDÉS et
   * les déduit tous au paiement, même quand il plafonne la remise : en
   * envoyer plus que le plafond n'en couvre ferait perdre des points au
   * client. Le solde, lui, est contrôlé par le serveur.
   */
  if (points > 0) {
    const reglages = await lireReglagesFidelite();
    if (!reglages.ok) return reglages;
    const erreur = erreurPoints(points, { ...reglages.data, solde: points }, sousTotal(lignes));
    if (erreur) return { ok: false, message: `${erreur} Modifiez vos points puis réessayez.` };
  }

  // Cadeaux placés comme dans l'application (cf. articlesAvecCadeaux).
  const { articles, nonPlaces } = articlesAvecCadeaux(articlesPayants(lignes), cadeaux);
  if (nonPlaces.length) {
    return {
      ok: false,
      message: `« ${nonPlaces[0].nom} » : chaque plat du panier a déjà ce supplément. Retirez le cadeau ou ajoutez un plat.`,
    };
  }

  const corps = {
    type: c.mode,
    ...(c.mode === "PICKUP" ? { restaurant_id: c.restaurantId } : {}),
    items: articles,
    phone: client.phone,
    fullname: `${client.first_name} ${client.last_name}`,
    ...(client.email ? { email: client.email } : {}),
    ...(c.mode === "DELIVERY" && c.adresse
      ? {
          address: JSON.stringify({
            title: "Livraison",
            address: c.adresse.libelle,
            city: "Abidjan",
            latitude: c.adresse.latitude,
            longitude: c.adresse.longitude,
            note: c.adresse.repere.trim().slice(0, 200),
          }),
        }
      : {}),
    payment_method: "ONLINE",
    date: c.heureRetrait ?? new Date().toISOString(),
    ...(c.code ? { code_promo: c.code } : {}),
    ...(points > 0 ? { points } : {}),
  };

  const res = await appelApi<Brut>("/orders/create-v2", {
    methode: "POST",
    corps,
    entetes: { "x-canal-commande": "web" },
  });
  if (!res.ok) return res;
  return { ok: true, data: { id: String(res.data.id), remise: nombre(res.data.discount) } };
}

/**
 * Annulation par le client d'une commande pas encore payée, pour la modifier.
 * Le serveur rend le bon d'achat ou le code promo engagé et les cadeaux
 * (reward.service, restoreConsumedGiftsForOrder), et range le panier annulé
 * dans « À relancer » pour le centre d'appels. Les points, eux, ne sont
 * jamais déduits d'une commande non payée : rien à rendre.
 */
export async function annulerCommandeAction(id: string): Promise<Resultat<null>> {
  if (!estUuid(id)) return { ok: false, message: "Commande introuvable." };
  // Relue juste avant : une commande payée entre-temps ne s'annule pas d'ici
  // (l'annulation déclencherait un remboursement).
  const actuelle = await appelApi<Brut>(`/orders/${id}/client`);
  if (!actuelle.ok) return actuelle;
  if (actuelle.data.paied || actuelle.data.status !== "PENDING") {
    return { ok: false, message: "Cette commande est déjà payée ou en cours : elle ne peut plus être modifiée." };
  }
  const res = await appelApi<Brut>(`/orders/${id}/client/status`, {
    methode: "PATCH",
    corps: { status: "CANCELLED", meta: { reason: "Modification de la commande depuis le site" } },
  });
  return res.ok ? { ok: true, data: null } : res;
}

export async function obtenirCommandeAction(
  id: string,
): Promise<Resultat<{ commande: ICommande; paiement: IConfigPaiement | null }>> {
  if (!estUuid(id)) return { ok: false, message: "Commande introuvable.", statut: 404 };
  const res = await appelApi<Brut>(`/orders/${id}/client`);
  if (!res.ok) return res;
  const p = res.data.payment as Brut | undefined;
  return {
    ok: true,
    data: {
      commande: versCommande(res.data),
      paiement: p?.public_key ? { public_key: String(p.public_key), sandbox: !!p.sandbox } : null,
    },
  };
}

export async function listerCommandesAction(): Promise<Resultat<ICommande[]>> {
  const res = await appelApi<Brut | Brut[]>("/orders/customer?page=1&limit=20");
  if (!res.ok) return res;
  const liste = Array.isArray(res.data) ? res.data : ((res.data.data as Brut[]) ?? []);
  return { ok: true, data: liste.map(versCommande) };
}
