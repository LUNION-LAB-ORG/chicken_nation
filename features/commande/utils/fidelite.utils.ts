import type {
  CadeauChoisi,
  IArticleCommande,
  ICadeau,
  IPointsFidelite,
  ModeCommande,
} from "../types/commande.types";
import { platDisponibleMaintenant, venduEn } from "./panier.utils";

/**
 * Règles des points de fidélité et des cadeaux au panier. Le serveur
 * recalcule tout à la création de la commande : ces règles servent à ne
 * proposer que ce qu'il acceptera, et à protéger le client d'un défaut du
 * serveur sur les points (cf. maximumPointsUtiles).
 */

type Brut = Record<string, unknown>;
// Espaces insécables du format français remplacés, comme dans fcfa().
const espaces = (texte: string) => texte.replace(/[  ]/g, " ");
const estUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);

/** « 1 point », « 1 250 points ». */
export const pointsLisibles = (n: number) =>
  `${espaces(Math.round(n).toLocaleString("fr-FR"))} point${Math.abs(Math.round(n)) >= 2 ? "s" : ""}`;

/** Valeur d'un point : elle peut avoir des décimales (2,5 FCFA), que fcfa() arrondirait. */
export const valeurLisible = (francs: number) =>
  `${espaces(francs.toLocaleString("fr-FR", { maximumFractionDigits: 2 }))} FCFA`;

// ── Points ────────────────────────────────────────────────────────────────

/**
 * Solde utilisable, lu sur GET /fidelity/loyalty/customer/:id.
 * `redeemable_points` quand le serveur le donne : le solde moins les points
 * promis à une commande payée pas encore déduite. C'est lui que la création
 * compare aux points demandés, et au-delà la remise vaut 0 sans erreur.
 * Serveur d'avant le 02/10 : `total_points`.
 */
export function soldeUtilisable(compte: Brut | null | undefined): number {
  const n = Number(compte?.redeemable_points ?? compte?.total_points);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

/**
 * Remise maximale, en francs, que des points peuvent couvrir sur ce
 * sous-total. Même calcul que le serveur (loyalty.service, capLoyaltyDiscount)
 * quand le pourcentage est entre 0 et 100 exclus. Sinon le serveur ne pose
 * aucun plafond et la remise pourrait dépasser les plats : le site borne
 * alors au sous-total.
 */
export function plafondRemisePoints(sousTotal: number, plafondPct: number): number {
  const base = Math.max(0, sousTotal);
  return plafondPct > 0 && plafondPct < 100 ? Math.floor((plafondPct / 100) * base) : Math.floor(base);
}

/**
 * Points utilisables au plus sur ce panier : le solde, borné par le plafond.
 * Indispensable : le serveur plafonne la REMISE mais enregistre les points
 * DEMANDÉS, et les déduit tous au paiement (order.service, création v2).
 * Sans cette borne, 150 points demandés sur un panier dont le plafond n'en
 * couvre que 100 coûteraient 150 points pour 100 de remise.
 */
export function maximumPointsUtiles(f: IPointsFidelite, sousTotal: number): number {
  if (!(f.valeurPoint > 0)) return 0;
  const parPlafond = Math.floor(plafondRemisePoints(sousTotal, f.plafondPct) / f.valeurPoint);
  return Math.max(0, Math.min(Math.floor(f.solde), parPlafond));
}

/** Le bloc « Mes points » n'a de sens que si le minimum est atteignable sur ce panier. */
export const pointsUtilisables = (f: IPointsFidelite, sousTotal: number) =>
  maximumPointsUtiles(f, sousTotal) >= Math.max(1, f.minimum);

/**
 * Phrase d'erreur pour un nombre de points saisi, ou null s'il est accepté.
 * Le serveur, lui, accorde une remise nulle SANS rien dire sous le minimum
 * ou au-dessus du solde : mieux vaut l'expliquer ici.
 */
export function erreurPoints(points: number, f: IPointsFidelite, sousTotal: number): string | null {
  if (!Number.isInteger(points) || points <= 0) return "Saisissez un nombre de points.";
  if (points > f.solde) return `Vous avez ${pointsLisibles(f.solde)}.`;
  if (points < f.minimum) return `Utilisez au moins ${pointsLisibles(f.minimum)}.`;
  const max = maximumPointsUtiles(f, sousTotal);
  if (points > max) return `Sur ce panier, vous pouvez utiliser au plus ${pointsLisibles(max)}.`;
  return null;
}

/**
 * Points réellement retenus : le choix du client, ramené au maximum si le
 * panier a diminué depuis, et 0 si cela passe sous le minimum.
 */
export function pointsRetenus(choisis: number, f: IPointsFidelite | null, sousTotal: number): number {
  if (!f || !(choisis > 0)) return 0;
  const n = Math.min(Math.floor(choisis), maximumPointsUtiles(f, sousTotal));
  return n >= Math.max(1, f.minimum) ? n : 0;
}

/** Remise estimée, calculée comme le serveur : floor(points x valeur), plafonnée. */
export function remisePoints(points: number, f: IPointsFidelite | null, sousTotal: number): number {
  if (!f || !(points > 0) || points < f.minimum || points > f.solde) return 0;
  return Math.min(Math.floor(points * f.valeurPoint), plafondRemisePoints(sousTotal, f.plafondPct));
}

/**
 * Points gagnés si la commande est payée : même calcul que le serveur
 * (loyalty.service, calculatePointsForOrder), sur les plats avant remise,
 * hors livraison et frais de service, cadeaux à 0. Calcul local : la route
 * publique points/calculate répond en erreur sur un montant nul.
 */
export const pointsGagnes = (sousTotal: number, pointsParFranc: number) =>
  pointsParFranc > 0 && sousTotal > 0 ? Math.floor(sousTotal * pointsParFranc) : 0;

// ── Cadeaux ───────────────────────────────────────────────────────────────

/**
 * Cadeau tel que GET /fidelity/rewards/redeemable-gifts le renvoie, ou null
 * s'il est inutilisable. Le payload est construit par le serveur
 * (reward-campaign, scratch-lot) : { item_type, dish_id | supplement_id,
 * label, name, price, image }. Comme le serveur à la commande
 * (validateGiftLines), un plat offert a un item_type absent ou « DISH » ; un
 * autre type serait refusé, on ne le propose donc pas. `image` reste la clé
 * brute : l'action la transforme en adresse.
 */
export function versCadeau(r: Brut): ICadeau | null {
  const p = (r.payload && typeof r.payload === "object" ? r.payload : {}) as Brut;
  const supplement = p.item_type === "SUPPLEMENT";
  if (!supplement && p.item_type !== undefined && p.item_type !== null && p.item_type !== "DISH") return null;
  const articleId = supplement ? p.supplement_id : p.dish_id;
  if (!estUuid(r.id) || !estUuid(articleId)) return null;
  const nom = String(p.label || p.name || "").replace(/\s+/g, " ").trim();
  return {
    id: r.id,
    type: supplement ? "SUPPLEMENT" : "PLAT",
    articleId,
    nom: nom || (supplement ? "Supplément offert" : "Plat offert"),
    image: typeof p.image === "string" ? p.image : "",
    expireLe: typeof r.expires_at === "string" ? r.expires_at : null,
  };
}

/**
 * Ce qui empêche ce cadeau dans ce mode et à cette heure, en phrases prêtes à
 * afficher. Mêmes contrôles que le serveur sur l'article offert (mode,
 * créneau) : il refuserait sinon la commande ENTIÈRE.
 */
export function problemesCadeau(c: ICadeau, mode: ModeCommande, maintenant = new Date()): string[] {
  if (c.indisponible) return ["Ce cadeau n'est plus proposé pour le moment."];
  const problemes: string[] = [];
  if (!venduEn(c.available_order_types, mode)) {
    problemes.push(`Indisponible ${mode === "DELIVERY" ? "en livraison" : "en retrait"}.`);
  }
  if (!platDisponibleMaintenant(c.available_from ?? null, c.available_until ?? null, maintenant)) {
    problemes.push(`Servi seulement de ${c.available_from} à ${c.available_until}.`);
  }
  return problemes;
}

/** Noms des cadeaux qu'un restaurant ne propose pas (refusés au retrait, comme un plat payant). */
export const cadeauxNonProposes = (cadeaux: ICadeau[], restaurantId: string) =>
  cadeaux.filter((c) => (c.restaurantsExclus ?? []).includes(restaurantId)).map((c) => c.nom);

/**
 * Lignes payantes complétées des cadeaux choisis, sous la forme exacte de
 * l'application (useCheckoutFlow) :
 *  - plat offert : ligne à part { dish_id, quantity: 1, epice: false,
 *    supplements: [], reward_id }, après les lignes payantes ;
 *  - supplément offert : { id, quantity: 1, reward_id } dans les
 *    suppléments de la première ligne payante (le serveur exige un plat).
 * Une seule différence : une ligne qui porte DÉJÀ ce supplément est sautée.
 * Le serveur refuse le même supplément deux fois sur une ligne (il compare le
 * nombre demandé au nombre retrouvé en base), avec un message incompréhensible
 * pour le client. `nonPlaces` : suppléments offerts sans ligne possible.
 * Jamais de cadeau sans ligne payante : la commande 100 % cadeau est refusée.
 */
export function articlesAvecCadeaux(
  payants: IArticleCommande[],
  cadeaux: CadeauChoisi[],
): { articles: IArticleCommande[]; nonPlaces: CadeauChoisi[] } {
  if (payants.length === 0) return { articles: [], nonPlaces: [...cadeaux] };
  const articles = payants.map((a) => ({ ...a, supplements: [...a.supplements] }));
  const platsOfferts: IArticleCommande[] = [];
  const nonPlaces: CadeauChoisi[] = [];
  const vus = new Set<string>();
  for (const c of cadeaux) {
    // Un même cadeau deux fois : le serveur refuserait la commande.
    if (vus.has(c.id)) continue;
    vus.add(c.id);
    if (c.type === "SUPPLEMENT") {
      const porteuse = articles.find((a) => !a.supplements.some((s) => s.id === c.articleId));
      if (porteuse) porteuse.supplements.push({ id: c.articleId, quantity: 1, reward_id: c.id });
      else nonPlaces.push(c);
    } else {
      platsOfferts.push({ dish_id: c.articleId, quantity: 1, epice: false, supplements: [], reward_id: c.id });
    }
  }
  return { articles: [...articles, ...platsOfferts], nonPlaces };
}
