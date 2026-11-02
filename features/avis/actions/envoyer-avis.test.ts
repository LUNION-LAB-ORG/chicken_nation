// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

/**
 * Action d'envoi d'un avis, avec le vrai schéma, la vraie limite et le vrai
 * client de l'API : seul le réseau est factice (fetch), ainsi que les
 * en-têtes de la requête que Next fournit hors de ce test.
 * Réponses du serveur copiées du contrat (4.1) et du serveur
 * (backend/src/modules/customer/avis-prives).
 */

let ipVisiteur = "41.202.10.20";

mock.module("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set() {}, delete() {} }),
  headers: async () => new Headers({ "x-real-ip": ipVisiteur }),
}));

const { baseURL } = await import("@/config/api");

let reponse = { statut: 201, corps: { ok: true } };
let reseauCoupe = false;
const appels = [];
const fetchReel = globalThis.fetch;

globalThis.fetch = async (url, init = {}) => {
  appels.push({
    url: String(url),
    methode: init.method ?? "GET",
    entetes: init.headers ?? {},
    corps: init.body ? JSON.parse(init.body) : undefined,
  });
  if (reseauCoupe) throw new TypeError("fetch failed");

  return new Response(JSON.stringify(reponse.corps), {
    status: reponse.statut,
    headers: { "Content-Type": "application/json" },
  });
};
afterAll(() => {
  globalThis.fetch = fetchReel;
});

const { envoyerAvisAction } = await import("./envoyer-avis.action");
const { oublierEnvoisAvis } = await import("../utils/limite-avis");

const UUID = "6b1e3f4a-2c5d-4e6f-8a9b-0c1d2e3f4a5b";

const envoi = (x = {}) => ({
  ressenti: "PAS_CONTENT",
  canal: "TELEPHONE",
  restaurant_id: UUID,
  commentaire: "  Commande arrivée avec 1 h de retard.  ",
  telephone: "07 07 12 34 56",
  prenom: " Awa ",
  accord_rappel: true,
  source: "marque-page",
  site_web: "",
  ...x,
});

beforeEach(() => {
  oublierEnvoisAvis();
  appels.length = 0;
  reponse = { statut: 201, corps: { ok: true } };
  reseauCoupe = false;
  ipVisiteur = "41.202.10.20";
});

describe("envoi d'un avis par le serveur du site", () => {
  it("POST /avis-prives sans jeton, IP du visiteur transmise, corps exact du contrat (5.5)", async () => {
    expect(await envoyerAvisAction(envoi())).toEqual({ ok: true });
    expect(appels).toHaveLength(1);
    const [appel] = appels;

    expect(appel.url).toBe(`${baseURL}/avis-prives`);
    expect(appel.methode).toBe("POST");
    expect(appel.entetes.Authorization).toBeUndefined();
    expect(appel.entetes["X-Forwarded-For"]).toBe("41.202.10.20");
    expect(appel.corps).toEqual({
      ressenti: "PAS_CONTENT",
      canal: "TELEPHONE",
      restaurant_id: UUID,
      commentaire: "Commande arrivée avec 1 h de retard.",
      telephone: "+2250707123456",
      prenom: "Awa",
      accord_rappel: true,
      source: "marque-page",
    });
  });

  it("« Je ne sais pas », sans prénom, sans accord, source inconnue", async () => {
    await envoyerAvisAction(
      envoi({
        restaurant_id: null,
        prenom: "",
        accord_rappel: false,
        source: "facebook",
      }),
    );
    expect(appels[0].corps).toMatchObject({
      restaurant_id: null,
      prenom: null,
      accord_rappel: false,
      source: "site",
    });
    expect(Object.keys(appels[0].corps)).not.toContain("site_web");
  });

  it("champ piège rempli : « envoyé », sans appel à l'API et sans compter l'envoi", async () => {
    for (let i = 0; i < 8; i++)
      expect(
        await envoyerAvisAction(envoi({ site_web: "https://spam.example" })),
      ).toEqual({ ok: true });
    // Même avec des données fausses : un robot ne sait pas ce qui a été refusé.
    expect(
      await envoyerAvisAction({ telephone: "x", site_web: "spam" }),
    ).toEqual({ ok: true });
    expect(appels).toHaveLength(0);
    // La limite n'a rien compté : un vrai visiteur passe encore.
    expect(await envoyerAvisAction(envoi())).toEqual({ ok: true });
    expect(appels).toHaveLength(1);
  });

  it("données refusées avant l'appel, avec la phrase du formulaire", async () => {
    expect(
      await envoyerAvisAction(envoi({ telephone: "27 21 71 21 30" })),
    ).toEqual({
      ok: false,
      message: "Saisis un numéro mobile à 10 chiffres (07, 05 ou 01).",
    });
    expect(await envoyerAvisAction(envoi({ ressenti: null }))).toEqual({
      ok: false,
      message: "Choisis ton ressenti.",
    });
    expect(await envoyerAvisAction(null)).toMatchObject({ ok: false });
    expect(appels).toHaveLength(0);
  });

  it("6e envoi d'une même IP en 15 minutes : refusé sans appel à l'API", async () => {
    for (let i = 0; i < 5; i++)
      expect(await envoyerAvisAction(envoi())).toEqual({ ok: true });
    expect(await envoyerAvisAction(envoi())).toEqual({
      ok: false,
      message:
        "Trop d'envois depuis cette connexion. Réessaie dans 15 minutes.",
    });
    expect(appels).toHaveLength(5);
    // Une autre connexion n'est pas bloquée.
    ipVisiteur = "41.202.10.21";
    expect(await envoyerAvisAction(envoi())).toEqual({ ok: true });
  });

  it("refus du serveur (400 en texte ou en tableau, 429) : son message tel quel", async () => {
    const cas = [
      [400, "Saisis un numéro mobile à 10 chiffres (07, 05 ou 01)."],
      [400, "Ce store n'existe plus. Choisis-en un autre."],
      [
        429,
        "Tu nous as déjà écrit plusieurs fois aujourd'hui. Appelle-nous au 27 21 71 21 30.",
      ],
      [429, "Trop d'avis en ce moment. Réessaie dans quelques minutes."],
      [
        429,
        "Trop d'envois depuis cette connexion. Réessaie dans quelques minutes.",
      ],
    ];

    for (const [statut, texte] of cas) {
      oublierEnvoisAvis();
      reponse = { statut, corps: { statusCode: statut, message: texte } };
      expect(await envoyerAvisAction(envoi())).toEqual({
        ok: false,
        message: texte,
      });
    }
    // Validation du serveur : messages en tableau.
    oublierEnvoisAvis();
    reponse = {
      statut: 400,
      corps: {
        statusCode: 400,
        message: [
          "Choisis comment tu avais commandé.",
          "Choisis ton ressenti.",
        ],
        error: "Bad Request",
      },
    };
    expect(await envoyerAvisAction(envoi())).toEqual({
      ok: false,
      message: "Choisis comment tu avais commandé.",
    });
  });

  it("serveur injoignable ou en erreur : une phrase simple", async () => {
    const panne = {
      ok: false,
      message: "Ton avis n'a pas pu partir. Réessaie dans un instant.",
    };

    for (const statut of [500, 502, 503, 404]) {
      oublierEnvoisAvis();
      reponse = { statut, corps: { message: "Internal server error" } };
      expect(await envoyerAvisAction(envoi())).toEqual(panne);
    }
    oublierEnvoisAvis();
    reseauCoupe = true;
    expect(await envoyerAvisAction(envoi())).toEqual(panne);
  });
});
