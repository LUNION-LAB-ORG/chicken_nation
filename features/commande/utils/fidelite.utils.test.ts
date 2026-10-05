// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import { creerCommandeAction } from "../actions/commande.action";

import {
  articlesAvecCadeaux,
  avisPoints,
  erreurPoints,
  maximumPointsUtiles,
  pointsGagnes,
  pointsLisibles,
  pointsRetenus,
  remisePoints,
  textePointsGagnes,
  valeurLisible,
} from "./fidelite.utils";

import { INSECABLE as _ } from "@/lib/typo";

// Réglages de la base de test (05/10) : 1 point = 20 FCFA, dès 100 points, 50 %.
const F = {
  solde: 640,
  valeurPoint: 20,
  minimum: 100,
  plafondPct: 50,
  pointsParFranc: 0.01,
  joursValidite: 365,
};

describe("points utilisés", () => {
  it("plafond de 50 % des plats : 10 000 FCFA de plats → 250 points au plus", () => {
    expect(maximumPointsUtiles(F, 10000)).toBe(250);
    expect(remisePoints(250, F, 10000)).toBe(5000);
    // Le serveur plafonne la remise, pas les points : le site borne les points.
    expect(pointsRetenus(640, F, 10000)).toBe(250);
  });

  it("minimum : sous 100 points, rien n'est retenu ni remisé", () => {
    expect(pointsRetenus(99, F, 50000)).toBe(0);
    expect(remisePoints(99, F, 50000)).toBe(0);
    expect(erreurPoints(99, F, 50000)).toBe(`Utilisez au moins 100${_}points.`);
  });

  it("panier trop petit pour le minimum : points retirés", () => {
    // 3 000 FCFA → 1 500 FCFA au plus → 75 points < 100.
    expect(pointsRetenus(200, F, 3000)).toBe(0);
  });

  it("solde : jamais plus que le solde", () => {
    expect(erreurPoints(700, F, 100000)).toBe(`Vous avez 640${_}points.`);
    expect(pointsRetenus(700, F, 100000)).toBe(640);
  });

  it("pas de cumul avec un code : la commande est refusée avant tout appel au serveur", async () => {
    const res = await creerCommandeAction({
      mode: "PICKUP",
      lignes: [
        {
          cle: "a",
          dish_id: "00000000-0000-4000-8000-000000000001",
          nom: "BOX",
          image: "",
          prixUnitaire: 5000,
          epice: false,
          options: [],
          supplements: [],
          quantite: 1,
          available_order_types: [],
        },
      ],
      adresse: null,
      restaurantId: "00000000-0000-4000-8000-000000000002",
      heureRetrait: null,
      code: "BIENVENUE",
      points: 120,
    });

    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/ne se cumulent pas/);
  });
});

describe("avisPoints (« Points ajustés »)", () => {
  it("rien à dire quand les points choisis tiennent", () => {
    expect(avisPoints(200, F, 10000)).toBeNull();
    expect(avisPoints(0, F, 10000)).toBeNull();
    expect(avisPoints(200, null, 10000)).toBeNull();
  });

  it("panier baissé sous le plafond : points ajustés, avec la raison", () => {
    expect(avisPoints(250, F, 8000)).toBe(
      `Points ajustés à 200${_}: ils paient au plus 50${_}% des plats.`,
    );
  });

  it("solde baissé : points ajustés au solde", () => {
    expect(avisPoints(640, { ...F, solde: 300 }, 100000)).toBe(
      `Points ajustés à 300${_}: c'est votre solde.`,
    );
  });

  it("panier trop petit : points retirés", () => {
    expect(avisPoints(200, F, 3000)).toBe(
      `Vos points ont été retirés${_}: la commande est trop petite pour en utiliser au moins 100${_}points.`,
    );
  });
});

describe("points gagnés", () => {
  it("floor(sous-total des plats × taux), rien sous 1 point", () => {
    expect(pointsGagnes(12500, 0.001)).toBe(12);
    expect(pointsGagnes(999, 0.001)).toBe(0);
    expect(pointsGagnes(5000, 0)).toBe(0);
    expect(textePointsGagnes(12500, 0.001)).toBe(
      `Cette commande vous rapportera 12${_}points.`,
    );
    expect(textePointsGagnes(1500, 0.001)).toBe(
      `Cette commande vous rapportera 1${_}point.`,
    );
    expect(textePointsGagnes(999, 0.001)).toBeNull();
  });

  it("textes avec insécables, sans espace simple dans un nombre", () => {
    expect(pointsLisibles(1250)).toBe(`1${_}250${_}points`);
    expect(valeurLisible(2.5)).toBe(`2,5${_}FCFA`);
    expect(valeurLisible(1250)).toBe(`1${_}250${_}FCFA`);
  });
});

describe("cadeaux", () => {
  const payants = [
    { dish_id: "box", quantity: 1, epice: false, supplements: [] },
  ];
  const plat = {
    id: "r1",
    type: "PLAT",
    articleId: "plat-offert",
    nom: "WINGS",
  };

  it("plat offert : épicé selon le choix du client, non épicé par défaut", () => {
    const { articles } = articlesAvecCadeaux(payants, [
      { ...plat, epice: true },
    ]);

    expect(articles[1]).toEqual({
      dish_id: "plat-offert",
      quantity: 1,
      epice: true,
      supplements: [],
      reward_id: "r1",
    });
    expect(articlesAvecCadeaux(payants, [plat]).articles[1].epice).toBe(false);
  });

  it("supplément offert posé sur la première ligne qui ne l'a pas", () => {
    const coca = {
      id: "r2",
      type: "SUPPLEMENT",
      articleId: "coca",
      nom: "COCA",
    };
    const { articles, nonPlaces } = articlesAvecCadeaux(payants, [coca]);

    expect(articles[0].supplements).toEqual([
      { id: "coca", quantity: 1, reward_id: "r2" },
    ]);
    expect(nonPlaces).toEqual([]);
    expect(articlesAvecCadeaux([], [coca]).nonPlaces).toEqual([coca]);
  });
});
