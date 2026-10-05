import { cache } from "react";

import { baseURL } from "@/config/api";

/**
 * Règles du programme de fidélité, lues sur `GET /fidelity/loyalty/config`
 * (route publique) : aucun chiffre de fidélité n'est écrit en dur sur le site.
 * Les valeurs de repli sont celles de la production au 03/10 ; elles ne
 * servent que si l'API ne répond pas, ou pour un champ absent ou aberrant.
 */

/** Étiquette de cache (à passer à `revalidateTag` après un changement au backoffice). */
export const ETIQUETTE_FIDELITE = "fidelite";
const REVALIDATION_FIDELITE = 3600;

export interface IConfigFidelite {
  /** Points gagnés par franc de plats payés en ligne (0,001 = 1 point par tranche de 1 000 FCFA). */
  pointsParFranc: number;
  /** Tranche de plats qui rapporte un point, en francs (1 / pointsParFranc, arrondi). */
  tranche: number;
  /** Valeur d'un point en francs de réduction. */
  valeurPoint: number;
  /** Points nécessaires avant de pouvoir les utiliser. */
  minimumPoints: number;
  /** Part des plats que les points peuvent payer au plus, en pour cent. */
  plafondPct: number;
  /** Durée de validité des points, en jours. */
  joursValidite: number;
  /** Points gagnés dans l'année pour passer VIP, puis VVIP. */
  seuilVip: number;
  seuilVvip: number;
  /** Points offerts en passant VIP, puis VVIP. */
  bonusVip: number;
  bonusVvip: number;
  /** Programme actif côté serveur. */
  actif: boolean;
  /** `true` si au moins une valeur vient du repli (API injoignable ou champ illisible). */
  repli: boolean;
}

/** Production, 03/10 : 0,001 point par franc, 1 point = 20 FCFA, dès 50 points, 50 %, 365 jours, VIP 700 (+150), VVIP 1 000 (+200). */
export const FIDELITE_REPLI: Omit<IConfigFidelite, "tranche" | "repli"> = {
  pointsParFranc: 0.001,
  valeurPoint: 20,
  minimumPoints: 50,
  plafondPct: 50,
  joursValidite: 365,
  seuilVip: 700,
  seuilVvip: 1000,
  bonusVip: 150,
  bonusVvip: 200,
  actif: true,
};

type Brut = Record<string, unknown>;

/**
 * Configuration de l'API ramenée aux noms du site. Chaque valeur doit être un
 * nombre fini et positif (le plafond entre 0 et 100) ; sinon la valeur de
 * repli la remplace et `repli` vaut `true`.
 */
export function lireConfigFidelite(
  brut: Brut | null | undefined,
): IConfigFidelite {
  let repli = !brut;
  const valeur = (
    champ: string,
    defaut: number,
    ok: (n: number) => boolean = (n) => n > 0,
  ) => {
    const n = Number(brut?.[champ]);

    if (
      brut &&
      brut[champ] !== null &&
      brut[champ] !== undefined &&
      Number.isFinite(n) &&
      ok(n)
    )
      return n;
    repli = true;

    return defaut;
  };
  const config = {
    pointsParFranc: valeur("points_per_xof", FIDELITE_REPLI.pointsParFranc),
    valeurPoint: valeur("point_value_in_xof", FIDELITE_REPLI.valeurPoint),
    minimumPoints: valeur(
      "minimum_redemption_points",
      FIDELITE_REPLI.minimumPoints,
      (n) => n >= 0,
    ),
    plafondPct: valeur(
      "max_redemption_pct",
      FIDELITE_REPLI.plafondPct,
      (n) => n > 0 && n <= 100,
    ),
    joursValidite: valeur(
      "points_expiration_days",
      FIDELITE_REPLI.joursValidite,
    ),
    seuilVip: valeur("premium_threshold", FIDELITE_REPLI.seuilVip),
    seuilVvip: valeur("gold_threshold", FIDELITE_REPLI.seuilVvip),
    bonusVip: valeur("bonus_vip", FIDELITE_REPLI.bonusVip, (n) => n >= 0),
    bonusVvip: valeur("bonus_vvip", FIDELITE_REPLI.bonusVvip, (n) => n >= 0),
    actif:
      typeof brut?.is_active === "boolean"
        ? brut.is_active
        : FIDELITE_REPLI.actif,
  };

  return { ...config, tranche: Math.round(1 / config.pointsParFranc), repli };
}

/**
 * Règles de fidélité pour les pages publiques (« Vos avantages », adhésion,
 * application), gardées une heure. Ne lève jamais d'erreur : en cas d'échec,
 * les valeurs de repli (production du 03/10) s'affichent.
 */
export const obtenirConfigFidelite = cache(
  async (): Promise<IConfigFidelite> => {
    try {
      const res = await fetch(`${baseURL}/fidelity/loyalty/config`, {
        next: { revalidate: REVALIDATION_FIDELITE, tags: [ETIQUETTE_FIDELITE] },
      });

      if (!res.ok)
        throw new Error(`GET /fidelity/loyalty/config a répondu ${res.status}`);

      return lireConfigFidelite((await res.json()) as Brut);
    } catch (erreur) {
      // eslint-disable-next-line no-console -- journal du serveur : repli affiché
      console.warn(
        "Règles de fidélité illisibles, valeurs de repli affichées :",
        (erreur as Error).message,
      );

      return lireConfigFidelite(null);
    }
  },
);
