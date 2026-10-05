import type { IConfigFidelite } from "@/features/fidelite/fidelite.api";
import type { IPromotionPublique } from "@/features/promotion/promotion.type";

import { PromotionType } from "@/features/promotion/promotion.type";
import { dernierJourValable } from "@/features/promotion/promotion.utils";
import { fcfa, INSECABLE, nombre, pluriel } from "@/lib/typo";

/**
 * Textes de « Vos avantages » et des offres du moment (retouche 2). Chaque
 * chiffre vient de `GET /fidelity/loyalty/config` ou de l'offre : aucun n'est
 * écrit en dur.
 */

/** 50 → « 50 % », 12.5 → « 12,5 % ». */
export const pourcentage = (n: number) =>
  `${String(n).replace(".", ",")}${INSECABLE}%`;

/** Les trois chiffres-clés des points. */
export function chiffresPoints(config: IConfigFidelite) {
  return [
    {
      fort: `1${INSECABLE}point`,
      texte: `par tranche de ${fcfa(config.tranche)} de plats, hors livraison`,
    },
    {
      fort: fcfa(config.valeurPoint),
      texte: `de réduction par point, dès ${pluriel(config.minimumPoints, "point", "points")}`,
    },
    {
      fort: pourcentage(config.plafondPct),
      texte: "du prix des plats payable en points, au plus",
    },
  ];
}

/** Règles d'usage des points, sous les chiffres-clés. */
export function reglesPoints(config: IConfigFidelite) {
  return `Points valables ${pluriel(config.joursValidite, "jour", "jours")}. Points ou code promo${INSECABLE}: un seul des deux par commande. Codes promo et bons d'achat se saisissent au moment de payer, sur le site comme dans l'application. Les commandes au téléphone ou payées en espèces ne rapportent pas de points.`;
}

/** Seuils et cadeaux des niveaux (le « 1er janvier » est ajouté au rendu). */
export function texteNiveaux(config: IConfigFidelite) {
  const seuils = `VIP à ${pluriel(config.seuilVip, "point", "points")} gagnés dans l'année, VVIP à ${nombre(config.seuilVvip)}.`;
  const bonus =
    config.bonusVip > 0 || config.bonusVvip > 0
      ? ` ${pluriel(config.bonusVip, "point offert", "points offerts")} en passant VIP, ${nombre(config.bonusVvip)} en passant VVIP.`
      : "";

  return `${seuils}${bonus}`;
}

/** « 10 % de remise », « 2 000 FCFA de remise » ou « Offre spéciale ». */
export function remiseOffre(
  offre: Pick<IPromotionPublique, "discount_type" | "discount_value">,
) {
  const valeur = Number(offre.discount_value);

  if (offre.discount_type === PromotionType.PERCENTAGE && valeur > 0)
    return `${pourcentage(valeur)} de remise`;
  if (offre.discount_type === PromotionType.FIXED_AMOUNT && valeur > 0)
    return `${fcfa(valeur)} de remise`;

  return "Offre spéciale";
}

/** « 7 octobre », « 1er novembre », à l'heure d'Abidjan (rendu serveur seulement). */
function jourEtMois(date: Date) {
  const parties = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Abidjan",
    day: "numeric",
    month: "long",
  }).formatToParts(date);
  const jour = parties.find((p) => p.type === "day")?.value ?? "";
  const mois = parties.find((p) => p.type === "month")?.value ?? "";

  return `${jour === "1" ? "1er" : jour}${INSECABLE}${mois}`;
}

/** Conditions lisibles d'une offre : plafond, minimum, usage, dernier jour valable. */
export function conditionsOffre(
  offre: Pick<
    IPromotionPublique,
    | "discount_type"
    | "max_discount_amount"
    | "min_order_amount"
    | "max_usage_per_user"
    | "expiration_date"
  >,
): string[] {
  const conditions: string[] = [];
  const plafond = Number(offre.max_discount_amount);
  const minimum = Number(offre.min_order_amount);
  const usages = Number(offre.max_usage_per_user);

  if (offre.discount_type === PromotionType.PERCENTAGE && plafond > 0)
    conditions.push(`Remise plafonnée à ${fcfa(plafond)}`);
  if (minimum > 0) conditions.push(`Dès ${fcfa(minimum)} de commande`);
  if (usages === 1) conditions.push("Une fois par client");
  else if (usages > 1) conditions.push(`${nombre(usages)} fois par client`);
  if (offre.expiration_date) {
    const fin = dernierJourValable(offre.expiration_date);

    if (!Number.isNaN(fin.getTime()))
      conditions.push(`Jusqu'au ${jourEtMois(fin)}`);
  }

  return conditions;
}
