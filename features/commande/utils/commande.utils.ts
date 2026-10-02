import type { ICommande } from "../types/commande.types";

type Brut = Record<string, unknown>;
const nombre = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/**
 * Commande telle que l'API la renvoie (GET /orders/:id/client, /orders/customer),
 * remise sous la forme qu'affiche le site. Fonction pure, à part des actions
 * serveur pour pouvoir la tester.
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
    lignes: (Array.isArray(o.order_items) ? (o.order_items as Brut[]) : []).map((i) => {
      const options = Array.isArray(i.options) ? (i.options as Brut[]) : [];
      const supplements = Array.isArray(i.supplements) ? (i.supplements as Brut[]) : [];
      return {
        nom: String((i.dish as Brut | undefined)?.name ?? "Article"),
        quantite: nombre(i.quantity),
        // `amount` ne compte que le plat (create-v2) : le total de la ligne,
        // options et suppléments compris, est `line_total`.
        montant:
          i.line_total !== null && i.line_total !== undefined
            ? nombre(i.line_total)
            : nombre(i.amount) + nombre(i.options_price),
        options: options.map((x) => String(x?.label ?? "").trim()).filter(Boolean),
        supplements: supplements
          .filter((x) => x && typeof x.name === "string" && x.name.trim())
          .map((x) => {
            const nom = String(x.name).replace(/\s+/g, " ").trim();
            const quantite = nombre(x.quantity);
            return `${quantite > 0 ? `${quantite} × ` : ""}${nom}${x.offert ? " (offert)" : ""}`;
          }),
        epice: !!i.epice,
      };
    }),
  };
}
