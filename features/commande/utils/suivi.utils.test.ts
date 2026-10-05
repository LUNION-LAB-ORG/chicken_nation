// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import { versCommande } from "./commande.utils";
import { signatureLigne } from "./panier.utils";
import {
  creneauRetrait,
  dateCommande,
  etapesFrise,
  etatStatut,
  heureDe,
  lieuCommande,
  lignesPourPanier,
  peutRecommander,
  pointsCredites,
  remettreSansDoubler,
  restaurantDeCommande,
  resumeCommande,
  texteAbsents,
  texteAjout,
  textePointsCredites,
  texteReglesPoints,
  texteTranche,
  versCompte,
} from "./suivi.utils";

const _ = "\u00a0";
const sansInsecables = (t) => String(t).replace(/[\u00a0\u202f]/g, " ");

// Forme de GET /orders/:id/client, réduite aux champs lus (commande de retrait payée).
const API = {
  id: "c0ffee00-0000-4000-8000-000000000002",
  reference: "ORD-261002-58332",
  type: "PICKUP",
  status: "ACCEPTED",
  paied: true,
  payment_method: "ONLINE",
  net_amount: 37000,
  discount: 0,
  points: 0,
  tax: 370,
  delivery_fee: 0,
  amount: 37370,
  created_at: "2026-10-02T08:15:03.099Z",
  date: "2026-10-02T00:00:00.000Z",
  time: "08:15",
  recovery_code: "8348",
  accepted_at: "2026-10-02T08:16:07.917Z",
  prepared_at: null,
  ready_at: null,
  picked_up_at: null,
  collected_at: null,
  completed_at: null,
  address: null,
  restaurant: {
    id: "r1",
    name: "CHICKEN NATION ANGRE",
    address: "Carrefour Angré, Abidjan, Côte d'Ivoire",
  },
  order_items: [
    {
      dish_id: "plat-menu",
      quantity: 2,
      amount: 12000,
      unit_price: 6000,
      options_price: 1000,
      line_total: 15000,
      epice: false,
      options: [
        {
          id: "cheddar",
          label: "Cheddar",
          group_name: "Sauce",
          price_delta: 500,
        },
        {
          id: "frites",
          label: "Frites",
          group_name: "Accompagnements",
          price_delta: 500,
        },
      ],
      supplements: [
        {
          id: "coca",
          name: "COCA",
          price: 1000,
          quantity: 1,
          category: "DRINK",
          offert: false,
        },
      ],
      dish: {
        id: "plat-menu",
        name: "MENU À COMPOSER",
        price: 6000,
        image: "",
      },
    },
    {
      dish_id: "plat-retire",
      quantity: 1,
      amount: 22000,
      unit_price: 22000,
      options_price: 0,
      line_total: 22000,
      epice: false,
      options: [],
      supplements: [],
      dish: { id: "plat-retire", name: "BABATCHÊ", price: 22000, image: "" },
    },
    {
      dish_id: "plat-offert",
      quantity: 1,
      amount: 0,
      unit_price: 0,
      options_price: 0,
      line_total: 0,
      epice: false,
      options: [],
      supplements: [],
      dish: { id: "plat-offert", name: "NUGGETS", price: 3000, image: "" },
    },
  ],
};

const COMMANDE = versCommande(API);

describe("versCommande : heure demandée et repère", () => {
  it("garde l'heure « HH:mm » et le repère de l'adresse", () => {
    expect(COMMANDE.heure).toBe("08:15");
    const livraison = versCommande({
      ...API,
      type: "DELIVERY",
      time: "8h15",
      address: JSON.stringify({
        address: "Cocody, rue des Jardins",
        note: "  Portail bleu  ",
      }),
    });

    expect(livraison.heure).toBeNull();
    expect(livraison.adresse).toBe("Cocody, rue des Jardins");
    expect(livraison.repere).toBe("Portail bleu");
    expect(
      versCommande({
        ...API,
        address: JSON.stringify({ address: "Ici", note: "" }),
      }).repere,
    ).toBeNull();
  });
});

describe("dates et heures (Abidjan, UTC+0)", () => {
  const maintenant = new Date("2026-10-02T21:00:00Z");

  it("heureDe", () => {
    expect(heureDe("2026-10-02T08:05:00Z")).toBe(`8${_}h${_}05`);
    expect(heureDe("2026-10-02T23:59:00Z")).toBe(`23${_}h${_}59`);
    expect(heureDe(null)).toBeNull();
    expect(heureDe("pas une date")).toBeNull();
  });

  it("dateCommande : aujourd'hui, hier, autre jour, autre année", () => {
    expect(dateCommande("2026-10-02T08:15:00Z", maintenant)).toBe(
      `Aujourd'hui, 8${_}h${_}15`,
    );
    expect(dateCommande("2026-10-01T23:40:00Z", maintenant)).toBe(
      `Hier, 23${_}h${_}40`,
    );
    expect(dateCommande("2026-09-20T12:00:00Z", maintenant)).toBe(
      `20${_}sept., 12${_}h${_}00`,
    );
    expect(dateCommande("2025-12-31T12:00:00Z", maintenant)).toBe(
      `31${_}déc.${_}2025, 12${_}h${_}00`,
    );
    expect(dateCommande("", maintenant)).toBe("");
  });

  it("creneauRetrait : dès que possible ou créneau d'un quart d'heure", () => {
    const base = { type: "PICKUP", created_at: "2026-10-02T08:15:03Z" };

    expect(creneauRetrait({ ...base, heure: "08:15" })).toBe(
      "Dès que possible",
    );
    // Heure envoyée par le site une seconde avant l'enregistrement.
    expect(creneauRetrait({ ...base, heure: "08:14" })).toBe(
      "Dès que possible",
    );
    expect(creneauRetrait({ ...base, heure: "18:15" })).toBe(
      `Créneau de 18${_}h${_}15 à 18${_}h${_}30`,
    );
    // Créneau après minuit pour une commande du soir.
    expect(
      creneauRetrait({
        type: "PICKUP",
        created_at: "2026-10-02T23:40:00Z",
        heure: "00:15",
      }),
    ).toBe(`Créneau de 0${_}h${_}15 à 0${_}h${_}30`);
    expect(
      creneauRetrait({ ...base, type: "DELIVERY", heure: "18:15" }),
    ).toBeNull();
    expect(creneauRetrait({ ...base, heure: null })).toBeNull();
  });
});

describe("état de la commande", () => {
  it("etatStatut", () => {
    const c = { paied: false, payment_method: "ONLINE" };

    expect(etatStatut({ ...c, status: "PENDING" })).toBe("attente");
    expect(etatStatut({ ...c, paied: true, status: "PENDING" })).toBe(
      "attente",
    );
    expect(etatStatut({ ...c, paied: true, status: "IN_PROGRESS" })).toBe(
      "cours",
    );
    expect(etatStatut({ ...c, paied: true, status: "COMPLETED" })).toBe("fini");
    expect(etatStatut({ ...c, paied: true, status: "COLLECTED" })).toBe("fini");
    expect(etatStatut({ ...c, status: "CANCELLED" })).toBe("annulee");
  });
});

describe("peutRecommander", () => {
  it("servie ou annulée, avec au moins un plat payant", () => {
    expect(peutRecommander({ ...COMMANDE, status: "COMPLETED" })).toBe(true);
    expect(peutRecommander({ ...COMMANDE, status: "CANCELLED" })).toBe(true);
    expect(peutRecommander(COMMANDE)).toBe(false);
    // Commande saisie sans ses lignes, ou faite seulement de cadeaux.
    expect(
      peutRecommander({ ...COMMANDE, status: "COMPLETED", lignes: [] }),
    ).toBe(false);
    expect(
      peutRecommander({
        ...COMMANDE,
        status: "COMPLETED",
        lignes: COMMANDE.lignes.filter((l) => l.offert),
      }),
    ).toBe(false);
  });
});

describe("etapesFrise", () => {
  const heures = {
    accepted_at: "2026-10-02T08:16:00Z",
    prepared_at: "2026-10-02T08:20:00Z",
    ready_at: "2026-10-02T08:35:00Z",
    picked_up_at: "2026-10-02T08:40:00Z",
    collected_at: null,
    completed_at: "2026-10-02T09:01:00Z",
  };

  it("payée mais pas encore acceptée : première étape en attente de confirmation", () => {
    const e = etapesFrise({
      type: "DELIVERY",
      status: "PENDING",
      heures: { ...heures, accepted_at: null },
    });

    expect(e.map((x) => x.etat)).toEqual([
      "actuel",
      "avenir",
      "avenir",
      "avenir",
    ]);
    expect(e[0].libelle).toBe("En attente de confirmation");
    expect(e[0].heure).toBeNull();
    expect(sansInsecables(e[2].texte)).toBe(
      "Livraison en 20 à 35 min au total",
    );
    expect(e[3].texte).toBe("À venir");
  });

  it("retrait accepté : Confirmée en cours, avec son heure", () => {
    const e = etapesFrise(COMMANDE);

    expect(e.map((x) => x.libelle)).toEqual([
      "Confirmée",
      "En préparation",
      "Prête au comptoir",
      "Récupérée",
    ]);
    expect(e.map((x) => x.etat)).toEqual([
      "actuel",
      "avenir",
      "avenir",
      "avenir",
    ]);
    expect(e[0].heure).toBe(`8${_}h${_}16`);
    expect(e[2].texte).toBe("À venir");
    expect(e[1].heure).toBeNull();
  });

  it("livraison prête (READY) : encore « En préparation » ; en route ensuite", () => {
    expect(
      etapesFrise({ type: "DELIVERY", status: "READY", heures }).map(
        (x) => x.etat,
      ),
    ).toEqual(["fait", "actuel", "avenir", "avenir"]);
    const enRoute = etapesFrise({
      type: "DELIVERY",
      status: "PICKED_UP",
      heures,
    });

    expect(enRoute[2]).toMatchObject({
      libelle: "En route",
      etat: "actuel",
      icone: "scooter",
    });
    expect(enRoute[2].heure).toBe(`8${_}h${_}40`);
  });

  it("livrée : toutes les étapes franchies, avec leurs heures", () => {
    const e = etapesFrise({ type: "DELIVERY", status: "COMPLETED", heures });

    expect(e.every((x) => x.etat === "fait")).toBe(true);
    expect(e[3]).toMatchObject({ libelle: "Livrée", texte: "Bon appétit." });
    expect(e[3].heure).toBe(`9${_}h${_}01`);
  });

  it("retrait récupéré : heure de collected_at, sinon completed_at", () => {
    const e = etapesFrise({
      type: "PICKUP",
      status: "COLLECTED",
      heures: { ...heures, collected_at: "2026-10-02T08:50:00Z" },
    });

    expect(e[3].heure).toBe(`8${_}h${_}50`);
    expect(e[2]).toMatchObject({
      libelle: "Prête au comptoir",
      heure: `8${_}h${_}35`,
    });
  });
});

describe("points crédités", () => {
  it("floor(net_amount × taux), seulement payée en ligne et non annulée", () => {
    expect(pointsCredites(COMMANDE, 0.01)).toBe(370);
    expect(pointsCredites(COMMANDE, 0.001)).toBe(37);
    expect(pointsCredites({ ...COMMANDE, paied: false }, 0.01)).toBe(0);
    expect(
      pointsCredites({ ...COMMANDE, payment_method: "OFFLINE" }, 0.01),
    ).toBe(0);
    expect(pointsCredites({ ...COMMANDE, status: "CANCELLED" }, 0.01)).toBe(0);
    expect(pointsCredites(COMMANDE, null)).toBe(0);
    expect(pointsCredites({ ...COMMANDE, net_amount: 900 }, 0.001)).toBe(0);
  });

  it("textes : rien sous 1 point, singulier et pluriel", () => {
    expect(textePointsCredites(0)).toBeNull();
    expect(textePointsCredites(1)).toBe(`+1${_}point crédité`);
    expect(textePointsCredites(1250)).toBe(`+1${_}250${_}points crédités`);
  });

  it("texteTranche : tranche ronde tirée du taux", () => {
    expect(texteTranche(0.001)).toBe(
      `1${_}point par tranche de 1${_}000${_}FCFA de plats payés en ligne`,
    );
    expect(texteTranche(0.01)).toBe(
      `1${_}point par tranche de 100${_}FCFA de plats payés en ligne`,
    );
    expect(texteTranche(0.003)).toBeNull();
    expect(texteTranche(0)).toBeNull();
    expect(texteTranche(null)).toBeNull();
  });

  it("texteReglesPoints : réglages du back office, rien en dur", () => {
    const production = {
      pointsParFranc: 0.001,
      valeurPoint: 20,
      minimum: 50,
      plafondPct: 50,
      joursValidite: 365,
    };

    expect(sansInsecables(texteReglesPoints(production))).toBe(
      "1 point par tranche de 1 000 FCFA de plats payés en ligne. 1 point = 20 FCFA, utilisables dès 50 points, jusqu'à la moitié des plats, pendant 365 jours.",
    );
    expect(
      sansInsecables(
        texteReglesPoints({
          ...production,
          plafondPct: 30,
          joursValidite: null,
        }),
      ),
    ).toBe(
      "1 point par tranche de 1 000 FCFA de plats payés en ligne. 1 point = 20 FCFA, utilisables dès 50 points, jusqu'à 30 % des plats.",
    );
    expect(
      texteReglesPoints({ ...production, pointsParFranc: 0, valeurPoint: 0 }),
    ).toBeNull();
    expect(texteReglesPoints(null)).toBeNull();
  });
});

describe("résumé, lieu et restaurant", () => {
  it("resumeCommande : plats payants puis « cadeaux offerts »", () => {
    expect(sansInsecables(resumeCommande(COMMANDE))).toBe(
      "2 × MENU À COMPOSER, 1 × BABATCHÊ, cadeaux offerts",
    );
    expect(
      sansInsecables(resumeCommande({ lignes: COMMANDE.lignes.slice(0, 1) })),
    ).toBe("2 × MENU À COMPOSER");
  });

  it("restaurant tel que le site le présente, sans numéro", () => {
    expect(restaurantDeCommande(COMMANDE)).toEqual({
      nom: "Angré",
      adresse: "Carrefour Angré",
      slug: "angre",
    });
    expect(restaurantDeCommande({ restaurant: null })).toBeNull();
    expect(lieuCommande(COMMANDE)).toEqual({
      titre: "Retrait au restaurant",
      court: "Retrait",
      detail: "Chicken Nation Angré",
    });
    expect(
      lieuCommande({ ...COMMANDE, type: "DELIVERY", adresse: "Cocody" }),
    ).toMatchObject({
      titre: "Livraison",
      detail: "Cocody",
    });
  });
});

describe("remettre une commande dans le panier", () => {
  const menu = {
    id: "plat-menu",
    name: "MENU À COMPOSER",
    description: "",
    image: "https://cdn.exemple.test/menu.jpg",
    prix: 6500,
    prixAvantPromo: null,
    spice_level: "OPTIONAL",
    available_order_types: ["DELIVERY", "PICKUP"],
    available_from: null,
    available_until: null,
    restaurantsExclus: [],
    groupes: [
      {
        id: "sauce",
        name: "Sauce",
        description: null,
        min_select: 1,
        max_select: 1,
        position: 0,
        items: [
          {
            id: "cheddar",
            label: "Cheddar",
            price_delta: 500,
            is_default: false,
            available: true,
            position: 0,
          },
        ],
      },
      {
        id: "acc",
        name: "Accompagnements",
        description: null,
        min_select: 0,
        max_select: 2,
        position: 1,
        items: [
          {
            id: "frites",
            label: "Frites",
            price_delta: 500,
            is_default: false,
            available: true,
            position: 0,
          },
        ],
      },
    ],
    supplements: [
      {
        id: "coca",
        name: "COCA",
        price: 1000,
        category: "DRINK",
        available_order_types: ["DELIVERY", "PICKUP"],
        image: null,
        position: 0,
      },
    ],
  };

  it("lignesPourPanier : mêmes choix et suppléments aux prix du jour ; offerts écartés ; absents nommés", () => {
    const { lignes, absents } = lignesPourPanier(COMMANDE, {
      "plat-menu": menu,
      "plat-retire": null,
    });

    expect(lignes).toHaveLength(1);
    expect(lignes[0]).toMatchObject({
      dish_id: "plat-menu",
      quantite: 2,
      prixUnitaire: 6500,
      epice: false,
    });
    expect(lignes[0].options.map((o) => o.item_id)).toEqual([
      "cheddar",
      "frites",
    ]);
    expect(lignes[0].supplements).toMatchObject([
      { id: "coca", quantite: 1, prix: 1000 },
    ]);
    expect(absents).toEqual(["BABATCHÊ"]);
    expect(sansInsecables(texteAbsents(absents))).toBe(
      "Plus proposé en ligne : BABATCHÊ.",
    );
    expect(sansInsecables(texteAbsents(["A", "B"]))).toBe(
      "Plus proposés en ligne : A, B.",
    );
    expect(texteAbsents([])).toBeNull();
    expect(sansInsecables(texteAjout(lignes))).toBe(
      "Ajouté au panier : 2 × MENU À COMPOSER.",
    );
  });

  it("plat non relu (réseau) : nommé, jamais inventé", () => {
    expect(lignesPourPanier(COMMANDE, {}).absents).toEqual([
      "MENU À COMPOSER",
      "BABATCHÊ",
    ]);
  });

  it("remettreSansDoubler : une ligne déjà au panier n'est pas ajoutée deux fois", () => {
    const { lignes } = lignesPourPanier(COMMANDE, { "plat-menu": menu });
    const autre = {
      ...lignes[0],
      cle: signatureLigne("autre", false, [], []),
      dish_id: "autre",
      quantite: 1,
    };

    expect(remettreSansDoubler([], lignes)).toEqual(lignes);
    // Panier gardé jusqu'au paiement : il contient déjà la ligne.
    expect(remettreSansDoubler(lignes, lignes)).toEqual(lignes);
    // Ce que le client a ajouté depuis reste.
    expect(remettreSansDoubler([autre], lignes)).toEqual([autre, ...lignes]);
  });
});

describe("versCompte", () => {
  it("solde utilisable, niveau, cadeaux et réglages", () => {
    const compte = versCompte(
      {
        points_per_xof: 0.001,
        point_value_in_xof: 20,
        minimum_redemption_points: 50,
        max_redemption_pct: 50,
        points_expiration_days: 365,
      },
      { current_level: "VIP", total_points: 900, redeemable_points: 640 },
      [
        {
          id: "c0ffee00-0000-4000-8000-0000000000a1",
          payload: {
            dish_id: "c0ffee00-0000-4000-8000-0000000000b1",
            label: "Box offerte",
          },
          expires_at: null,
        },
        { id: "illisible", payload: {} },
      ],
    );

    expect(compte).toMatchObject({
      solde: 640,
      niveau: "vip",
      cadeaux: ["Box offerte"],
    });
    expect(compte.reglages).toMatchObject({
      valeurPoint: 20,
      minimum: 50,
      pointsParFranc: 0.001,
    });
  });

  it("chaque partie peut manquer sans l'autre", () => {
    expect(versCompte(null, null, null)).toEqual({
      solde: null,
      niveau: null,
      cadeaux: null,
      reglages: null,
    });
    expect(
      versCompte(null, { current_level: "VVIP", total_points: 3 }, []).niveau,
    ).toBe("vvip");
    expect(versCompte(null, { current_level: "AUTRE" }, []).niveau).toBeNull();
  });
});
