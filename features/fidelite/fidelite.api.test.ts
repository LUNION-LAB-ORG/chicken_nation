// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterEach, describe, expect, it } from "bun:test";

import {
  FIDELITE_REPLI,
  lireConfigFidelite,
  obtenirConfigFidelite,
} from "./fidelite.api";

import { baseURL } from "@/config/api";

const fetchOrigine = globalThis.fetch;
let appels = [];

function reponse(corps, status = 200) {
  globalThis.fetch = async (url, init) => {
    appels.push({ url: String(url), init });
    if (corps instanceof Error) throw corps;

    return new Response(JSON.stringify(corps), { status });
  };
}
afterEach(() => {
  globalThis.fetch = fetchOrigine;
  appels = [];
});

// GET /fidelity/loyalty/config : production (03/10) et base de test (05/10).
const PRODUCTION = {
  points_per_xof: 0.001,
  points_expiration_days: 365,
  minimum_redemption_points: 50,
  point_value_in_xof: 20,
  max_redemption_pct: 50,
  bonus_standard: 0,
  bonus_vip: 150,
  bonus_vvip: 200,
  standard_threshold: 0,
  premium_threshold: 700,
  gold_threshold: 1000,
  is_active: true,
};
const TEST = {
  ...PRODUCTION,
  points_per_xof: 0.01,
  minimum_redemption_points: 100,
};

const VALEURS_PRODUCTION = {
  pointsParFranc: 0.001,
  tranche: 1000,
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

describe("règles de fidélité", () => {
  it("lit la configuration de l'API, gardée une heure sous l'étiquette fidelite", async () => {
    reponse(TEST);
    expect(await obtenirConfigFidelite()).toEqual({
      ...VALEURS_PRODUCTION,
      pointsParFranc: 0.01,
      tranche: 100,
      minimumPoints: 100,
      repli: false,
    });
    expect(appels[0].url).toBe(`${baseURL}/fidelity/loyalty/config`);
    expect(appels[0].init.next).toEqual({
      revalidate: 3600,
      tags: ["fidelite"],
    });
  });

  it("donne la tranche d'un point : 1 / points par franc", () => {
    expect(lireConfigFidelite(PRODUCTION)).toEqual({
      ...VALEURS_PRODUCTION,
      repli: false,
    });
    expect(
      lireConfigFidelite({ ...PRODUCTION, points_per_xof: 0.0005 }).tranche,
    ).toBe(2000);
  });

  it("affiche les valeurs de production du 03/10 si l'API ne répond pas", async () => {
    reponse({ message: "indisponible" }, 503);
    expect(await obtenirConfigFidelite()).toEqual({
      ...VALEURS_PRODUCTION,
      repli: true,
    });
    reponse(new TypeError("fetch failed"));
    expect(await obtenirConfigFidelite()).toEqual({
      ...VALEURS_PRODUCTION,
      repli: true,
    });
    expect({ ...FIDELITE_REPLI }).toEqual(
      Object.fromEntries(
        Object.entries(VALEURS_PRODUCTION).filter(([k]) => k !== "tranche"),
      ),
    );
  });

  it("remplace un champ absent ou aberrant par sa valeur de repli", () => {
    const config = lireConfigFidelite({
      ...TEST,
      points_per_xof: 0,
      max_redemption_pct: 150,
      gold_threshold: "beaucoup",
      bonus_vip: null,
    });

    expect(config).toMatchObject({
      pointsParFranc: 0.001,
      tranche: 1000,
      plafondPct: 50,
      seuilVvip: 1000,
      bonusVip: 150,
      minimumPoints: 100,
      repli: true,
    });
    expect(lireConfigFidelite({ ...PRODUCTION, is_active: false }).actif).toBe(
      false,
    );
  });
});
