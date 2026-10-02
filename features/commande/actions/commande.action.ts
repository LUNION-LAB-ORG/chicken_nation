"use server";

import { formatImageUrl } from "@/utils/formatImageUrl";
import { appelApi } from "../apis/api-client.server";
import type {
  CategorieSupplement,
  IAdresseLivraison,
  ICommande,
  IConfigPaiement,
  IFraisLivraison,
  ILignePanier,
  IPlatDetail,
  ISuggestionAdresse,
  ModeCommande,
  Resultat,
} from "../types/commande.types";
import { normaliserGroupes } from "../utils/panier.utils";

type Brut = Record<string, unknown>;
const nombre = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// ── Carte ─────────────────────────────────────────────────────────────────

/** Détail d'un plat pour la fiche d'ajout au panier (route publique). */
export async function obtenirPlatAction(id: string): Promise<Resultat<IPlatDetail>> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, message: "Plat introuvable." };
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
      available_order_types: Array.isArray(p.available_order_types) && p.available_order_types.length
        ? (p.available_order_types as string[])
        : ["DELIVERY", "PICKUP", "TABLE"],
      available_from: (p.available_from as string) || null,
      available_until: (p.available_until as string) || null,
      groupes: normaliserGroupes(p.option_groups),
      supplements,
    },
  };
}

// ── Adresse et frais de livraison ─────────────────────────────────────────

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
      order_items: lignes.map((l) => ({ dish_id: l.dish_id, quantity: l.quantite, price: l.prixUnitaire })),
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

// ── Commande ──────────────────────────────────────────────────────────────

export interface ICreationCommande {
  mode: ModeCommande;
  lignes: ILignePanier[];
  adresse: IAdresseLivraison | null;
  restaurantId: string | null;
  /** ISO ; null = dès que possible. */
  heureRetrait: string | null;
  code: string | null;
  nomComplet: string;
  telephone: string;
  email: string | null;
}

export async function creerCommandeAction(
  c: ICreationCommande,
): Promise<Resultat<{ id: string }>> {
  if (c.lignes.length === 0) return { ok: false, message: "Votre panier est vide." };
  if (c.mode === "DELIVERY" && !c.adresse) return { ok: false, message: "Choisissez l'adresse de livraison." };
  if (c.mode === "PICKUP" && !c.restaurantId) return { ok: false, message: "Choisissez le restaurant de retrait." };
  const nonLivrable = c.lignes.find((l) => !l.available_order_types.includes(c.mode));
  if (nonLivrable) {
    return {
      ok: false,
      message: `« ${nonLivrable.nom} » n'est pas disponible en ${c.mode === "DELIVERY" ? "livraison" : "retrait"}.`,
    };
  }

  const corps = {
    type: c.mode,
    ...(c.mode === "PICKUP" ? { restaurant_id: c.restaurantId } : {}),
    items: c.lignes.map((l) => ({
      dish_id: l.dish_id,
      quantity: l.quantite,
      epice: l.epice,
      supplements: l.supplements.filter((s) => s.quantite > 0).map((s) => ({ id: s.id, quantity: s.quantite })),
      ...(l.options.length ? { option_item_ids: l.options.map((o) => o.item_id) } : {}),
    })),
    phone: c.telephone,
    fullname: c.nomComplet,
    ...(c.email ? { email: c.email } : {}),
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
  };

  const res = await appelApi<Brut>("/orders/create-v2", {
    methode: "POST",
    corps,
    entetes: { "x-canal-commande": "web" },
  });
  if (!res.ok) return res;
  return { ok: true, data: { id: String(res.data.id) } };
}

function versCommande(o: Brut): ICommande {
  let adresse: string | null = null;
  if (typeof o.address === "string" && o.address) {
    try {
      adresse = String(JSON.parse(o.address).address ?? "") || null;
    } catch {
      adresse = o.address;
    }
  }
  const r = o.restaurant as Brut | null;
  return {
    id: String(o.id),
    reference: String(o.reference ?? ""),
    type: String(o.type ?? ""),
    status: o.status as ICommande["status"],
    paied: !!o.paied,
    payment_method: (o.payment_method as string) ?? null,
    net_amount: nombre(o.net_amount),
    discount: nombre(o.discount),
    tax: nombre(o.tax),
    delivery_fee: nombre(o.delivery_fee),
    amount: nombre(o.amount),
    created_at: String(o.created_at ?? ""),
    date: (o.date as string) ?? null,
    recovery_code: (o.recovery_code as string) ?? null,
    restaurant: r
      ? { id: String(r.id), name: String(r.name ?? ""), phone: (r.phone as string) ?? null, address: (r.address as string) ?? null }
      : null,
    adresse,
    lignes: (Array.isArray(o.order_items) ? (o.order_items as Brut[]) : []).map((i) => ({
      nom: String((i.dish as Brut | undefined)?.name ?? "Article"),
      quantite: nombre(i.quantity),
      montant: nombre(i.amount),
    })),
  };
}

export async function obtenirCommandeAction(
  id: string,
): Promise<Resultat<{ commande: ICommande; paiement: IConfigPaiement | null }>> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, message: "Commande introuvable." };
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
