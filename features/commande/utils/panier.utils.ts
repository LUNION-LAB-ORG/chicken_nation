import type {
  IGroupeOptions,
  ILignePanier,
  IOptionChoisie,
  IPlatDetail,
  ISupplementChoisi,
  ModeCommande,
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

/** Lignes réellement commandées : un plat retiré du catalogue est écarté. */
export const lignesACommander = (lignes: ILignePanier[]) => lignes.filter((l) => !l.retire);

export const sousTotal = (lignes: ILignePanier[]) => lignesACommander(lignes).reduce((s, l) => s + totalLigne(l), 0);

export const nombreArticles = (lignes: ILignePanier[]) => lignesACommander(lignes).reduce((s, l) => s + l.quantite, 0);

/**
 * Lignes envoyées à la vérification d'un code promo, avec la même assiette
 * que le serveur à la création (order.service, « ASSIETTE ») : prix du plat
 * ET de ses options, sans les suppléments. Sans les options, la remise
 * affichée sur un menu composable différait de celle appliquée.
 */
export const assietteCodePromo = (lignes: ILignePanier[]) =>
  lignesACommander(lignes).map((l) => ({
    dish_id: l.dish_id,
    quantity: l.quantite,
    price: l.prixUnitaire + l.options.reduce((s, o) => s + o.price_delta, 0),
  }));

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

/**
 * Ajoute une ligne, ou la fusionne avec une ligne identique.
 *
 * Les suppléments comptent pour la ligne entière, pas pour chaque plat : deux
 * ajouts de « Burger + 1 Coca » donnent 2 burgers et 2 Coca, il faut donc
 * additionner aussi les suppléments. Leur quantité entre dans la clé : la
 * ligne fusionnée change de clé et peut, à son tour, rejoindre une autre ligne
 * (l'appel se termine, le panier perd une ligne à chaque tour).
 */
export function ajouterLigne(lignes: ILignePanier[], nouvelle: ILignePanier): ILignePanier[] {
  const existante = lignes.find((l) => l.cle === nouvelle.cle);
  if (!existante) return [...lignes, nouvelle];
  const parId = new Map(existante.supplements.map((s) => [s.id, s]));
  for (const s of nouvelle.supplements) {
    parId.set(s.id, { ...s, quantite: (parId.get(s.id)?.quantite ?? 0) + s.quantite });
  }
  const supplements = Array.from(parId.values());
  // Les données du plat de la nouvelle ligne sont les plus fraîches.
  const fusion: ILignePanier = {
    ...nouvelle,
    quantite: existante.quantite + nouvelle.quantite,
    supplements,
    cle: signatureLigne(nouvelle.dish_id, nouvelle.epice, nouvelle.options, supplements),
  };
  if (fusion.cle === existante.cle) return lignes.map((l) => (l.cle === existante.cle ? fusion : l));
  return ajouterLigne(
    lignes.filter((l) => l.cle !== existante.cle),
    fusion,
  );
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
 * Créneau "HH:mm"-"HH:mm" comparé à l'heure d'Abidjan (UTC+0). Règle EXACTE
 * du serveur (backend common/utils/dish-availability.util.ts), qui décide
 * d'accepter la commande : créneau absent, illisible ou de durée nulle
 * (00:00 à 00:00) = toujours servi ; minute de fin comprise ; le créneau
 * peut passer minuit.
 */
export function platDisponibleMaintenant(from: string | null, until: string | null, maintenant = new Date()) {
  if (!from || !until) return true;
  const minutes = (h: string) => {
    const [hh, mm] = h.split(":").map((p) => parseInt(p, 10));
    return Number.isNaN(hh) || Number.isNaN(mm) ? null : hh * 60 + mm;
  };
  const debut = minutes(from);
  const fin = minutes(until);
  if (debut === null || fin === null || debut === fin) return true;
  const m = maintenant.getUTCHours() * 60 + maintenant.getUTCMinutes();
  return debut < fin ? m >= debut && m <= fin : m >= debut || m <= fin;
}

/** Liste vide ou absente = vendu dans tous les modes (comme le serveur). */
export const venduEn = (types: string[] | null | undefined, mode: ModeCommande) =>
  !types || types.length === 0 || types.includes(mode);

/** « à emporter uniquement »… pour un article qui n'est pas vendu partout, sinon null. */
export function mentionModes(types: string[] | null | undefined): string | null {
  if (!types || types.length === 0) return null;
  const livraison = types.includes("DELIVERY");
  const retrait = types.includes("PICKUP");
  if (livraison && retrait) return null;
  if (livraison) return "en livraison uniquement";
  if (retrait) return "à emporter uniquement";
  return "sur place uniquement";
}

/**
 * Ce qui empêche de commander une ligne dans ce mode et à cette heure, en
 * phrases prêtes à afficher. Mêmes règles que le serveur, qui refuserait
 * sinon la commande entière avec un message moins précis.
 */
export function problemesLigne(l: ILignePanier, mode: ModeCommande, maintenant = new Date()): string[] {
  const ou = mode === "DELIVERY" ? "en livraison" : "en retrait";
  const problemes: string[] = [];
  const aRevoir = [
    l.indisponibles?.length ? `plus proposé : ${l.indisponibles.join(", ")}` : null,
    l.choixManquant ? `nouveau choix à faire : ${l.choixManquant}` : null,
  ].filter(Boolean);
  if (aRevoir.length) {
    const texte = aRevoir.join(" ; ");
    problemes.push(`${texte.charAt(0).toUpperCase()}${texte.slice(1)}. Retirez ce plat puis ajoutez-le à nouveau.`);
  }
  if (!venduEn(l.available_order_types, mode)) problemes.push(`Indisponible ${ou}.`);
  const supplements = l.supplements.filter((s) => s.quantite > 0 && !venduEn(s.available_order_types, mode));
  if (supplements.length) problemes.push(`${supplements.map((s) => s.nom).join(", ")} : indisponible ${ou}.`);
  if (!platDisponibleMaintenant(l.available_from ?? null, l.available_until ?? null, maintenant)) {
    problemes.push(`Servi seulement de ${l.available_from} à ${l.available_until}.`);
  }
  return problemes;
}

/** Noms des plats du panier qu'un restaurant ne propose pas (refusés au retrait). */
export const platsNonProposes = (lignes: ILignePanier[], restaurantId: string) =>
  lignesACommander(lignes)
    .filter((l) => (l.restaurantsExclus ?? []).includes(restaurantId))
    .map((l) => l.nom);

/**
 * Ligne remise à jour avec le plat relu au catalogue : prix, modes, créneau,
 * restaurants. `null` = plat retiré du catalogue ; `undefined` = relecture
 * impossible (réseau), la ligne reste telle quelle. Une option ou un
 * supplément qui n'existe plus n'est PAS retiré en silence : la ligne est
 * signalée et le client la recompose.
 */
export function rafraichirLigne(l: ILignePanier, plat: IPlatDetail | null | undefined): ILignePanier {
  if (plat === undefined) return l;
  if (plat === null) return { ...l, retire: true };
  const items = new Map(plat.groupes.flatMap((g) => g.items.map((i) => [i.id, i] as const)));
  const supps = new Map(plat.supplements.map((s) => [s.id, s]));
  const indisponibles: string[] = [];
  const optionsValides: IOptionChoisie[] = [];
  const options = l.options.map((o) => {
    const i = items.get(o.item_id);
    if (!i || !i.available) {
      indisponibles.push(o.label);
      return o;
    }
    const option = { ...o, label: i.label, price_delta: i.price_delta };
    optionsValides.push(option);
    return option;
  });
  const supplements = l.supplements.map((s) => {
    const x = supps.get(s.id);
    if (!x) {
      indisponibles.push(s.nom);
      return s;
    }
    return { ...s, nom: x.name, prix: x.price, available_order_types: x.available_order_types };
  });
  // Un plat devenu composable, ou un nouveau choix obligatoire.
  const manque = groupeIncomplet(plat.groupes, optionsValides);
  // Les signalements de la relecture précédente sont recalculés ici.
  const reste: ILignePanier = { ...l };
  delete reste.retire;
  delete reste.indisponibles;
  delete reste.choixManquant;
  return {
    ...reste,
    nom: plat.name,
    image: plat.image,
    prixUnitaire: plat.prix,
    available_order_types: plat.available_order_types,
    available_from: plat.available_from,
    available_until: plat.available_until,
    restaurantsExclus: plat.restaurantsExclus,
    options,
    supplements,
    ...(indisponibles.length ? { indisponibles } : {}),
    ...(manque && !indisponibles.length ? { choixManquant: manque.name } : {}),
  };
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
