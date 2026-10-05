// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterEach, describe, expect, it } from "bun:test";

import { commentaireAPI, obtenirAvisPublics } from "./commentaire.api";

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

describe("avis clients", () => {
  it("lit les avis approuvés, gardés une heure sous l'étiquette avis", async () => {
    reponse({
      data: [
        {
          id: "a1",
          message: "Bien chaud et bien épicé",
          rating: 5,
          created_at: "2026-09-30T10:00:00.000Z",
          customer: { first_name: "Awa", last_name: "K" },
        },
      ],
      meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
    });
    expect(await obtenirAvisPublics()).toEqual([
      {
        id: "a1",
        message: "Bien chaud et bien épicé",
        rating: 5,
        created_at: "2026-09-30T10:00:00.000Z",
        customer: { first_name: "Awa", last_name: "K" },
      },
    ]);
    expect(appels[0].url).toBe(`${baseURL}/comments/bests?page=1&limit=12`);
    expect(appels[0].init.next).toEqual({ revalidate: 3600, tags: ["avis"] });
  });

  it("ne garde que la note, le texte, le prénom et l'initiale, même d'un serveur plus ancien", async () => {
    reponse({
      data: [
        {
          id: "a2",
          message: "  Très bon  ",
          rating: 4,
          created_at: "2026-09-29",
          customer_id: "c1",
          order_id: "o1",
          customer: {
            id: "c1",
            first_name: "Jean",
            last_name: "Koné",
            phone: "+2250700000001",
            image: "x.jpg",
          },
          order: { reference: "CN-1" },
        },
        {
          id: "a3",
          message: "Sans nom",
          rating: 5,
          created_at: "2026-09-28",
          customer: { first_name: null, last_name: null },
        },
        {
          id: "a4",
          message: "",
          rating: 5,
          created_at: "2026-09-28",
          customer: null,
        },
      ],
    });
    const avis = await obtenirAvisPublics(3);

    expect(avis).toEqual([
      {
        id: "a2",
        message: "Très bon",
        rating: 4,
        created_at: "2026-09-29",
        customer: { first_name: "Jean", last_name: "K" },
      },
      {
        id: "a3",
        message: "Sans nom",
        rating: 5,
        created_at: "2026-09-28",
        customer: {},
      },
    ]);
    expect(JSON.stringify(avis)).not.toMatch(
      /Koné|0700000001|x\.jpg|CN-1|customer_id|order/,
    );
  });

  it("masque la section si l'API répond mal, et garde la forme paginée pour l'ancienne section", async () => {
    reponse({ message: "erreur" }, 500);
    expect(await obtenirAvisPublics()).toEqual([]);
    await expect(
      commentaireAPI.obtenirMeilleursCommentaires({ page: 1, limit: 12 }),
    ).rejects.toThrow("a répondu 500");
    reponse({
      data: [],
      meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
    });
    expect(
      await commentaireAPI.obtenirMeilleursCommentaires({ page: 1, limit: 12 }),
    ).toEqual({
      data: [],
      meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
    });
  });
});
