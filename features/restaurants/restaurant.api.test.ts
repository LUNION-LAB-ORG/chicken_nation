// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterEach, describe, expect, it } from "bun:test";

import {
  obtenirRestaurantsDuSite,
  obtenirRestaurantsPublics,
} from "./restaurant.api";

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

// Forme de GET /restaurants?limit=50 sur l'API de test (05/10).
const API = {
  data: [
    {
      id: "cdf609d7",
      name: "CHICKEN NATION ZONE 4",
      manager: "e24edbaa-b02b-47aa-a65f-2127ad2824a9",
      description: null,
      image: null,
      address: "488 Av. N'guetta Timothée Ahoua, Abidjan, Côte d'Ivoire",
      latitude: 5.2860442,
      longitude: -3.9737121,
      phone: "0720353535",
      email: "zone4@exemple.test",
      schedule: '[{"1":"00:00-23:59"}]',
      entity_status: "ACTIVE",
      rating: 0,
      reviews_count: 0,
      is_open: true,
    },
    {
      id: "58a0f818",
      name: "CHICKEN NATION YOPOUGON",
      phone: "0712853211",
      schedule: null,
      entity_status: "ACTIVE",
    },
    {
      id: "ferme",
      name: "CHICKEN NATION ABOBO",
      phone: "0700000001",
      entity_status: "INACTIVE",
    },
  ],
  meta: { total: 3 },
};

describe("lecture des restaurants", () => {
  it("garde une liste blanche : ni téléphone, ni e-mail, ni responsable, ni état mis en cache", async () => {
    reponse(API);
    const liste = await obtenirRestaurantsPublics();

    expect(appels[0].url).toBe(`${baseURL}/restaurants?limit=50`);
    expect(appels[0].init.next).toEqual({
      revalidate: 3600,
      tags: ["restaurants"],
    });
    expect(liste).toEqual([
      {
        id: "cdf609d7",
        name: "CHICKEN NATION ZONE 4",
        address: "488 Av. N'guetta Timothée Ahoua, Abidjan, Côte d'Ivoire",
        latitude: 5.2860442,
        longitude: -3.9737121,
        phone: null,
        email: null,
        image: null,
        schedule: '[{"1":"00:00-23:59"}]',
        entity_status: "ACTIVE",
      },
      {
        id: "58a0f818",
        name: "CHICKEN NATION YOPOUGON",
        address: null,
        latitude: null,
        longitude: null,
        phone: null,
        email: null,
        image: null,
        schedule: null,
        entity_status: "ACTIVE",
      },
    ]);
    expect(JSON.stringify(liste)).not.toMatch(
      /0720353535|0712853211|manager|is_open|exemple\.test/,
    );
  });

  it("donne les restaurants du site dans l'ordre de la table", async () => {
    reponse({ data: [...API.data].reverse() });
    expect(
      (await obtenirRestaurantsDuSite()).map((r) => [r.slug, r.nomAffiche]),
    ).toEqual([
      ["zone-4", "Marcory Zone 4"],
      ["yopougon", "Yopougon"],
    ]);
  });

  it("lève une erreur si l'API répond mal : Next garde alors la dernière page valide", async () => {
    reponse({ message: "erreur" }, 503);
    await expect(obtenirRestaurantsPublics()).rejects.toThrow(
      "GET /restaurants a répondu 503",
    );
    reponse({ data: "rien" });
    await expect(obtenirRestaurantsPublics()).rejects.toThrow(
      "ne renvoie pas de liste",
    );
  });
});
