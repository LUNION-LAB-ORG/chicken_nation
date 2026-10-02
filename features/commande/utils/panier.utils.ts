import type {
  IGroupeOptions,
  ILignePanier,
  IOptionChoisie,
  ISupplementChoisi,
} from "../types/commande.types";

/**
 * Règles du panier, reprises de l'application (features/cart et
 * features/menus/utils/dishOptions.ts). Elles ne servent qu'à l'affichage :
 * le serveur recalcule tous les montants et c'est son total qui est débité.
 */

export const fcfa = (montant: number) =>
  `${Math.round(montant).toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA`;

/** Supplément au même prix quelle que soit la quantité du plat (comme l'application). */
export function totalLigne(l: Pick<ILignePanier, "prixUnitaire" | "options" | "supplements" | "quantite">) {
  const options = l.options.reduce((s, o) => s + o.price_delta, 0);
  const supplements = l.supplements.reduce((s, x) => s + x.prix * x.quantite, 0);
  return (l.prixUnitaire + options) * l.quantite + supplements;
}

export const sousTotal = (lignes: ILignePanier[]) => lignes.reduce((s, l) => s + totalLigne(l), 0);

export const nombreArticles = (lignes: ILignePanier[]) => lignes.reduce((s, l) => s + l.quantite, 0);

export function signatureLigne(
  dish_id: string,
  epice: boolean,
  options: IOptionChoisie[],
  supplements: ISupplementChoisi[],
) {
  const supps = supplements
    .filter((s) => s.quantite > 0)
    .map((s) => `${s.id}:${s.quantite}`)
    .sort()
    .join("|");
  const opts = options.map((o) => o.item_id).sort().join(",");
  return `${dish_id}-epice:${epice}-supps:[${supps}]-opts:[${opts}]`;
}

/** Ajoute une ligne, ou augmente la quantité d'une ligne identique. */
export function ajouterLigne(lignes: ILignePanier[], nouvelle: ILignePanier): ILignePanier[] {
  const existante = lignes.find((l) => l.cle === nouvelle.cle);
  if (!existante) return [...lignes, nouvelle];
  return lignes.map((l) => (l.cle === nouvelle.cle ? { ...l, quantite: l.quantite + nouvelle.quantite } : l));
}

// ── Options des plats composables ────────────────────────────────────────

/** Bornes ramenées dans un domaine valide, choix triés par position. */
export function normaliserGroupes(brut: unknown): IGroupeOptions[] {
  if (!Array.isArray(brut)) return [];
  const nombre = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return brut
    .filter((g): g is Record<string, unknown> => !!g && typeof g === "object")
    .map((g) => {
      const items = (Array.isArray(g.items) ? (g.items as Record<string, unknown>[]) : [])
        .filter((i) => i && typeof i.id === "string" && typeof i.label === "string")
        .map((i) => ({
          id: i.id as string,
          label: i.label as string,
          price_delta: Math.max(0, nombre(i.price_delta)),
          is_default: !!i.is_default,
          available: i.available !== false,
          position: nombre(i.position),
        }))
        .sort((a, b) => a.position - b.position);
      const max = Math.max(1, Math.min(nombre(g.max_select, 1) || 1, items.length || 1));
      const min = Math.max(0, Math.min(nombre(g.min_select), max));
      return { id: String(g.id ?? ""), name: String(g.name ?? ""), min_select: min, max_select: max, position: nombre(g.position), items };
    })
    .filter((g) => g.id && g.name && g.items.length > 0)
    .sort((a, b) => a.position - b.position);
}

export function selectionParDefaut(groupes: IGroupeOptions[]): IOptionChoisie[] {
  return groupes.flatMap((g) =>
    g.items
      .filter((i) => i.is_default && i.available)
      .slice(0, g.max_select)
      .map((i) => ({ item_id: i.id, group_id: g.id, label: i.label, price_delta: i.price_delta })),
  );
}

/**
 * Geste du client sur un choix. Choix unique : cocher remplace. Choix
 * multiple : bascule, sans dépasser le maximum ni descendre sous le minimum.
 */
export function basculerOption(
  selection: IOptionChoisie[],
  groupe: IGroupeOptions,
  itemId: string,
): IOptionChoisie[] {
  const item = groupe.items.find((i) => i.id === itemId);
  if (!item || !item.available) return selection;
  const duGroupe = selection.filter((o) => o.group_id === groupe.id);
  const choisi = duGroupe.some((o) => o.item_id === itemId);
  const option = { item_id: item.id, group_id: groupe.id, label: item.label, price_delta: item.price_delta };

  if (groupe.max_select === 1) {
    if (choisi) return duGroupe.length > groupe.min_select ? selection.filter((o) => o.item_id !== itemId) : selection;
    return [...selection.filter((o) => o.group_id !== groupe.id), option];
  }
  if (choisi) {
    return duGroupe.length > groupe.min_select ? selection.filter((o) => o.item_id !== itemId) : selection;
  }
  return duGroupe.length < groupe.max_select ? [...selection, option] : selection;
}

/** Premier groupe dont le minimum n'est pas atteint, ou null si tout est bon. */
export function groupeIncomplet(groupes: IGroupeOptions[], selection: IOptionChoisie[]) {
  return groupes.find((g) => selection.filter((o) => o.group_id === g.id).length < g.min_select) ?? null;
}

// ── Disponibilité ─────────────────────────────────────────────────────────

/**
 * Créneau "HH:mm"-"HH:mm" comparé à l'heure d'Abidjan (UTC+0, comme
 * l'application). Le créneau peut passer minuit.
 */
export function platDisponibleMaintenant(from: string | null, until: string | null, maintenant = new Date()) {
  if (!from || !until) return true;
  const minutes = (h: string) => {
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + (mm || 0);
  };
  const m = maintenant.getUTCHours() * 60 + maintenant.getUTCMinutes();
  const debut = minutes(from);
  const fin = minutes(until);
  return debut <= fin ? m >= debut && m < fin : m >= debut || m < fin;
}

// ── Téléphone ─────────────────────────────────────────────────────────────

/**
 * Numéro mobile ivoirien normalisé en +225XXXXXXXXXX, ou null. Le code de
 * connexion part sur WhatsApp : un fixe (27…) ne le recevrait pas.
 */
export function normaliserMobileCI(saisie: string): string | null {
  let chiffres = saisie.replace(/[\s.\-()]/g, "");
  if (chiffres.startsWith("00")) chiffres = `+${chiffres.slice(2)}`;
  chiffres = chiffres.replace(/\D/g, "");
  if (chiffres.startsWith("225") && chiffres.length === 13) chiffres = chiffres.slice(3);
  return /^0[157]\d{8}$/.test(chiffres) ? `+225${chiffres}` : null;
}

export function telephoneLisible(e164: string) {
  const local = e164.replace(/^\+?225/, "");
  return local.length === 10 ? local.replace(/(\d{2})(?=\d)/g, "$1 ") : e164;
}
