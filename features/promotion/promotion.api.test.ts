// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterEach, describe, expect, it } from "bun:test";

import { obtenirOffresDuMoment, promotionAPI } from "./promotion.api";

import { baseURL } from "@/config/api";

const fetchOrigine = globalThis.fetch;
let appels = [];

function reponse(corps, status = 200) {
  globalThis.fetch = async (url, init) => {
    appels.push({ url: String(url), init });

    return new Response(JSON.stringify(corps), { status });
  };
}
afterEach(() => {
  globalThis.fetch = fetchOrigine;
  appels = [];
});

// Forme de GET /fidelity/promotions/public sur l'API de test (05/10).
const OFFRE = {
  id: "585a0b64",
  title: "ESSAI PUBLIC visible 1",
  description: null,
  discount_type: "PERCENTAGE",
  discount_value: 10,
  min_order_amount: 5000,
  max_discount_amount: null,
  max_usage_per_user: 1,
  start_date: "2026-10-02T11:19:51.319Z",
  expiration_date: "2026-10-08T11:19:51.319Z",
  status: "ACTIVE",
  coupon_image_url: null,
  background_color: "#fd8127",
  text_color: "#FFFFFF",
  expiration_color: null,
};

describe("offres du moment", () => {
  it("lit la route publique, gardée 5 minutes sous l'étiquette promotions", async () => {
    reponse({
      data: [OFFRE],
      meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
    });
    expect(await obtenirOffresDuMoment()).toEqual([OFFRE]);
    expect(appels[0].url).toBe(
      `${baseURL}/fidelity/promotions/public?limit=12`,
    );
    expect(appels[0].init.next).toEqual({
      revalidate: 300,
      tags: ["promotions"],
    });
  });

  it("masque la section si la route manque (serveur pas encore à jour) ou répond mal", async () => {
    reponse({ message: "Unauthorized" }, 401);
    expect(await obtenirOffresDuMoment()).toEqual([]);
    reponse({ message: "pas de liste" });
    expect(await obtenirOffresDuMoment()).toEqual([]);
  });

  it("garde la forme paginée pour l'ancienne section et lève l'erreur pour son action", async () => {
    reponse({
      data: [OFFRE],
      meta: { total: 1, page: 1, limit: 4, totalPages: 1 },
    });
    expect(
      (await promotionAPI.obtenirPromotionsActives({ limit: 4 })).data,
    ).toHaveLength(1);
    expect(appels[0].url).toBe(`${baseURL}/fidelity/promotions/public?limit=4`);
    reponse({ message: "Unauthorized" }, 401);
    await expect(promotionAPI.obtenirPromotionsActives({})).rejects.toThrow(
      "a répondu 401",
    );
  });
});
