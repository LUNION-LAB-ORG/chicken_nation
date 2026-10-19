// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

/**
 * CONTRAT AVEC LE SERVEUR pour le paiement à la livraison (19/10/2026).
 *
 * Les actions serveur RÉELLES du site parlent à un serveur factice qui
 * répond EXACTEMENT ce que le vrai serveur répond. Les corps du serveur
 * ci-dessous sont des copies de
 * backend/src/modules/order/contrat-paiement-livraison.spec.ts, où le vrai
 * code les produit : les deux copies changent ensemble.
 *
 * Seul le réseau est factice (fetch, et le cookie de session que Next lit
 * hors de ce test) : chemin, méthode, en-têtes et corps sont ceux qui
 * partiraient vraiment.
 */

mock.module("next/headers", () => ({
  cookies: async () => ({
    get: (nom) => (nom === "cn_client" ? { value: "jeton-client" } : undefined),
    set() {},
    delete() {},
  }),
  headers: async () => new Headers(),
}));

/** Réponses du serveur factice, par « MÉTHODE /chemin ». */
let routes = {};
const appels = [];
const fetchReel = globalThis.fetch;

// Adresse de l'API telle que le site la construit (réglée par l'environnement).
const { baseURL } = await import("@/config/api");

globalThis.fetch = async (url, init = {}) => {
  const chemin = String(url).replace(baseURL, "");
  const methode = init.method ?? "GET";

  appels.push({
    methode,
    chemin,
    entetes: init.headers ?? {},
    corps: init.body ? JSON.parse(init.body) : undefined,
  });
  const r = routes[`${methode} ${chemin}`];

  if (!r) return new Response("", { status: 404 });

  return new Response(JSON.stringify(r.corps), {
    status: r.statut ?? 200,
    headers: { "Content-Type": "application/json" },
  });
};
afterAll(() => {
  globalThis.fetch = fetchReel;
});

const {
  annulerCommandeAction,
  creerCommandeAction,
  lireConditionsCommandeAction,
  obtenirCommandeAction,
} = await import("./actions/commande.action");
const { aConfirmer, aPayer, aPayerALaLivraison, libelleStatut } = await import(
  "./utils/statut.utils"
);

beforeEach(() => {
  routes = {};
  appels.length = 0;
});

// ── Corps renvoyés par le serveur (copies du test du serveur) ──────────────

/** GET /orders/conditions-commande, réglage absent (proposé par défaut). */
const CONDITIONS = {
  taux_frais_service: 0.05,
  grille_frais: [
    { distance_max_km: 2, montant: 1000 },
    { distance_max_km: null, montant: 2000 },
  ],
  grille_frais_appliquee: true,
  paiement_livraison: { disponible: true },
};

/** 409 de POST /orders/create-v2 : une commande à confirmer attend déjà. */
const DEJA_EN_ATTENTE = {
  message:
    "Vous avez déjà une commande en attente de confirmation (ORD-261019-00002)\u00a0: notre équipe vous appelle. " +
    "Pour la changer, ouvrez-la puis «\u00a0Modifier ma commande\u00a0».",
  error: "Conflict",
  statusCode: 409,
};

/** 400 de POST /orders/create-v2 : option coupée dans Paramètres > Commandes. */
const INDISPONIBLE = {
  message:
    "Le paiement à la livraison est indisponible pour le moment\u00a0: payez en ligne.",
  error: "Bad Request",
  statusCode: 400,
};

const ID = "a0000000-0000-4000-8000-000000000002";

/** GET /orders/:id/client : commande du site à payer à la livraison, telle que createv2 l'écrit. */
const A_CONFIRMER = {
  id: ID,
  reference: "ORD-261019-00002",
  type: "DELIVERY",
  status: "PENDING",
  paied: false,
  payment_method: "OFFLINE",
  channel: "WEB",
  auto: true,
  entity_status: "ACTIVE",
  net_amount: 7000,
  discount: 0,
  tax: 100,
  delivery_fee: 500,
  amount: 7600,
  created_at: "2026-10-19T11:59:00.000Z",
  date: "2026-10-19T11:59:00.000Z",
  recovery_code: "4821",
  restaurant_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  restaurant: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Riviera" },
  order_items: [],
  paiements: [],
};

/** La même, reprise au téléphone par le centre d'appels (« Manuel », acceptée). */
const CONFIRMEE = {
  ...A_CONFIRMER,
  status: "ACCEPTED",
  auto: false,
  accepted_at: "2026-10-19T12:05:00.000Z",
};

// ── Ce que le site envoie ──────────────────────────────────────────────────

const ligne = {
  cle: "box",
  dish_id: "11111111-1111-4111-8111-111111111111",
  nom: "BOX DE LA NATION",
  image: "",
  prixUnitaire: 6000,
  epice: false,
  options: [],
  supplements: [],
  quantite: 1,
  available_order_types: ["DELIVERY", "PICKUP"],
};

const adresse = {
  libelle: "Riviera 3, Abidjan",
  latitude: 5.35,
  longitude: -3.97,
  repere: "Portail bleu",
};

const CLIENT = {
  id: "c0000000-0000-4000-8000-0000000000a1",
  phone: "+2250700000001",
  first_name: "Awa",
  last_name: "Koné",
  email: null,
};

const creation = (statut, corps) => {
  routes["GET /customer/detail"] = { corps: CLIENT };
  routes["POST /orders/create-v2"] = { statut, corps };
};
const envoi = () => appels.find((a) => a.chemin === "/orders/create-v2");

describe("contrat serveur : GET /orders/conditions-commande", () => {
  it("réponse exacte du serveur : option proposée, sans jeton (route publique)", async () => {
    routes["GET /orders/conditions-commande"] = { corps: CONDITIONS };

    const conditions = await lireConditionsCommandeAction();

    expect(conditions.paiementLivraison).toBe(true);
    expect(conditions.tauxFraisService).toBe(0.05);
    expect(appels[0].entetes.Authorization).toBeUndefined();
  });

  it("réglage à « 0 » : `disponible: false`, option cachée", async () => {
    routes["GET /orders/conditions-commande"] = {
      corps: { ...CONDITIONS, paiement_livraison: { disponible: false } },
    };

    expect((await lireConditionsCommandeAction()).paiementLivraison).toBe(
      false,
    );
  });
});

describe("contrat serveur : POST /orders/create-v2", () => {
  it("à la livraison : OFFLINE, type DELIVERY, en-tête x-canal-commande: web", async () => {
    creation(201, {
      id: ID,
      reference: "ORD-261019-00002",
      amount: 7600,
      discount: 0,
    });

    const res = await creerCommandeAction({
      mode: "DELIVERY",
      lignes: [ligne],
      adresse,
      paiement: "OFFLINE",
    });

    expect(res).toEqual({
      ok: true,
      data: expect.objectContaining({
        id: ID,
        reference: "ORD-261019-00002",
        montant: 7600,
      }),
    });
    const { methode, entetes, corps } = envoi();

    expect(methode).toBe("POST");
    expect(entetes["x-canal-commande"]).toBe("web");
    expect(entetes.Authorization).toBe("Bearer jeton-client");
    expect(corps).toEqual(
      expect.objectContaining({ type: "DELIVERY", payment_method: "OFFLINE" }),
    );
  });

  it("en ligne (choix par défaut) et retrait : toujours ONLINE", async () => {
    creation(201, { id: ID, reference: "R", amount: 1 });
    await creerCommandeAction({ mode: "DELIVERY", lignes: [ligne], adresse });
    expect(envoi().corps.payment_method).toBe("ONLINE");

    appels.length = 0;
    await creerCommandeAction({
      mode: "PICKUP",
      lignes: [ligne],
      restaurantId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      paiement: "OFFLINE",
    });
    expect(envoi().corps).toEqual(
      expect.objectContaining({ type: "PICKUP", payment_method: "ONLINE" }),
    );
  });

  it("409 et 400 du serveur : leur message, tel quel, et le statut", async () => {
    creation(409, DEJA_EN_ATTENTE);
    expect(
      await creerCommandeAction({
        mode: "DELIVERY",
        lignes: [ligne],
        adresse,
        paiement: "OFFLINE",
      }),
    ).toEqual({ ok: false, message: DEJA_EN_ATTENTE.message, statut: 409 });

    creation(400, INDISPONIBLE);
    expect(
      await creerCommandeAction({
        mode: "DELIVERY",
        lignes: [ligne],
        adresse,
        paiement: "OFFLINE",
      }),
    ).toEqual({ ok: false, message: INDISPONIBLE.message, statut: 400 });
  });
});

describe("contrat serveur : GET /orders/:id/client", () => {
  it("à confirmer : WEB, auto, OFFLINE, en attente ; « Modifier » possible, jamais « Payer »", async () => {
    routes[`GET /orders/${ID}/client`] = { corps: A_CONFIRMER };

    const res = await obtenirCommandeAction(ID);
    const c = res.data.commande;

    expect(c).toEqual(expect.objectContaining({ canal: "WEB", auto: true }));
    expect(aConfirmer(c)).toBe(true);
    expect(libelleStatut(c)).toBe("À confirmer");
    expect(aPayerALaLivraison(c)).toBe(true);
    expect(aPayer(c)).toBe(false);
  });

  it("reprise au téléphone : plus à confirmer, toujours à payer à la livraison", async () => {
    routes[`GET /orders/${ID}/client`] = { corps: CONFIRMEE };

    const c = (await obtenirCommandeAction(ID)).data.commande;

    expect(aConfirmer(c)).toBe(false);
    expect(libelleStatut(c)).not.toBe("À confirmer");
    expect(aPayerALaLivraison(c)).toBe(true);
  });
});

describe("contrat serveur : « Modifier ma commande » (PATCH /orders/:id/client/status)", () => {
  it("à confirmer : annulée par le client, avec le corps que le serveur lit", async () => {
    routes[`GET /orders/${ID}/client`] = { corps: A_CONFIRMER };
    routes[`PATCH /orders/${ID}/client/status`] = {
      corps: {
        ...A_CONFIRMER,
        status: "CANCELLED",
        entity_status: "DELETED",
        cancelled_by: "client",
      },
    };

    expect(await annulerCommandeAction(ID)).toEqual({ ok: true, data: null });
    const patch = appels.find((a) => a.methode === "PATCH");

    expect(patch.chemin).toBe(`/orders/${ID}/client/status`);
    expect(patch.corps).toEqual(
      expect.objectContaining({ status: "CANCELLED" }),
    );
  });

  it("déjà confirmée par le centre d'appels : rien n'est envoyé", async () => {
    routes[`GET /orders/${ID}/client`] = { corps: CONFIRMEE };

    const res = await annulerCommandeAction(ID);

    expect(res.ok).toBe(false);
    expect(res.message).toContain("déjà confirmée");
    expect(appels.some((a) => a.methode === "PATCH")).toBe(false);
  });
});
