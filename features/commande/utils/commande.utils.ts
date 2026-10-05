import type {
  ICommande,
  IHeuresCommande,
  ILigneCommande,
  ILignePanier,
  IOptionChoisie,
  IPlatDetail,
  ISupplementCommande,
} from "../types/commande.types";

import { commandableEnLigne, construireLigne } from "./panier.utils";

import { formatImageUrl } from "@/utils/formatImageUrl";

type Brut = Record<string, unknown>;
const nombre = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const texte = (v: unknown) => (typeof v === "string" && v ? v : null);

/** Heures posées par le serveur à chaque statut, gardées pour la frise du suivi. */
const HEURES: (keyof IHeuresCommande)[] = [
  "accepted_at",
  "prepared_at",
  "ready_at",
  "picked_up_at",
  "collected_at",
  "completed_at",
];

/**
 * Ligne de commande telle que l'API l'enregistre (order_items, create-v2) :
 *  - `options` : [{ id, label, group_name, price_delta }], les choix figés ;
 *  - `supplements` : [{ id, name, price, quantity, category, offert }] ;
 *  - plat offert : prix unitaire à 0 F alors que le plat a un prix au
 *    catalogue (même règle que le serveur, cadeaux-reactivation.helper).
 */
function versLigne(i: Brut): ILigneCommande {
  const plat = (i.dish as Brut | undefined) ?? {};
  const options = Array.isArray(i.options) ? (i.options as Brut[]) : [];
  const supplements = (
    Array.isArray(i.supplements) ? (i.supplements as Brut[]) : []
  ).filter((x) => x && typeof x.name === "string" && x.name.trim());
  const supplementsChoisis: ISupplementCommande[] = supplements.map((x) => ({
    id: String(x.id ?? ""),
    nom: String(x.name).replace(/\s+/g, " ").trim(),
    quantite: nombre(x.quantity),
    offert: x.offert === true,
  }));

  return {
    dish_id: String(i.dish_id ?? plat.id ?? ""),
    nom: String(plat.name ?? "Article"),
    image:
      typeof plat.image === "string" && plat.image
        ? formatImageUrl(plat.image)
        : "",
    quantite: nombre(i.quantity),
    // `amount` ne compte que le plat (create-v2) : le total de la ligne,
    // options et suppléments compris, est `line_total`.
    montant:
      i.line_total !== null && i.line_total !== undefined
        ? nombre(i.line_total)
        : nombre(i.amount) + nombre(i.options_price),
    options: options.map((x) => String(x?.label ?? "").trim()).filter(Boolean),
    option_item_ids: options
      .map((x) => x?.id)
      .filter((id): id is string => typeof id === "string" && !!id),
    supplements: supplementsChoisis.map(
      (x) =>
        `${x.quantite > 0 ? `${x.quantite} × ` : ""}${x.nom}${x.offert ? " (offert)" : ""}`,
    ),
    supplementsChoisis,
    epice: !!i.epice,
    offert: i.unit_price === 0 && nombre(plat.price) > 0,
  };
}

/**
 * Commande telle que l'API la renvoie (GET /orders/:id/client, /orders/customer),
 * remise sous la forme qu'affiche le site. Fonction pure, à part des actions
 * serveur pour pouvoir la tester.
 *
 * Le numéro du restaurant n'est PAS repris : le seul numéro affiché par le
 * site est le 27 21 71 21 30 (retouche 6).
 */
export function versCommande(o: Brut): ICommande {
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
    // Enregistrés par le serveur seulement s'il a accordé la remise.
    points: Math.max(0, nombre(o.points)),
    tax: nombre(o.tax),
    delivery_fee: nombre(o.delivery_fee),
    amount: nombre(o.amount),
    created_at: String(o.created_at ?? ""),
    date: (o.date as string) ?? null,
    recovery_code: (o.recovery_code as string) ?? null,
    restaurant: r
      ? {
          id: String(r.id),
          name: String(r.name ?? ""),
          address: (r.address as string) ?? null,
        }
      : null,
    adresse,
    heures: Object.fromEntries(
      HEURES.map((h) => [h, texte(o[h])]),
    ) as unknown as IHeuresCommande,
    lignes: (Array.isArray(o.order_items) ? (o.order_items as Brut[]) : []).map(
      versLigne,
    ),
  };
}

/**
 * Ligne de panier refaite depuis une ligne de commande, avec le plat relu au
 * catalogue (« Recommander », « Modifier » depuis Mes commandes) : mêmes
 * choix, mêmes suppléments payants, même quantité, aux prix du jour.
 *
 * `null` : rien à remettre (plat offert, plat retiré, ou plus vendu en ligne).
 * Un choix ou un supplément qui n'existe plus est laissé de côté ; un groupe
 * devenu incomplet sera signalé par la relecture du panier, comme pour un
 * panier ancien.
 */
export function lignePanierDepuisCommande(
  l: ILigneCommande,
  plat: IPlatDetail | null | undefined,
): ILignePanier | null {
  if (l.offert || !plat || plat.id !== l.dish_id || l.quantite < 1) return null;
  if (!commandableEnLigne(plat.available_order_types)) return null;
  const items = new Map(
    plat.groupes.flatMap((g) => g.items.map((i) => [i.id, { i, g }] as const)),
  );
  const options: IOptionChoisie[] = l.option_item_ids
    .map((id) => items.get(id))
    .filter((x): x is NonNullable<typeof x> => !!x && x.i.available)
    .map(({ i, g }) => ({
      item_id: i.id,
      group_id: g.id,
      label: i.label,
      price_delta: i.price_delta,
    }));
  const supplements: Record<string, number> = {};

  for (const s of l.supplementsChoisis) {
    if (!s.offert && s.quantite > 0)
      supplements[s.id] = (supplements[s.id] ?? 0) + s.quantite;
  }
  const epice =
    plat.spice_level === "ALWAYS"
      ? true
      : plat.spice_level === "NEVER"
        ? false
        : l.epice;

  return construireLigne(plat, {
    epice,
    options,
    supplements,
    quantite: l.quantite,
  });
}
