// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  fraisServiceEstimes,
  versAdresseEnregistree,
  versConditionsCommande,
  versFrais,
  versItineraire,
  versPlatDetail,
  versReglagesFidelite,
} from "./reponses-api.utils";

describe("versPlatDetail", () => {
  // Forme de GET /dishes/:id sur l'API de test (05/10), réduite.
  const API = {
    id: "939cf341-0067-4860-9944-eb1b92e70e84",
    name: " BOX 2K26 PRO ",
    description: "Burger patron,   1 morceau",
    image: "https://cdn.exemple.test/box.jpg",
    price: 10000,
    promotion_price: 4500,
    is_promotion: true,
    spice_level: "OPTIONAL",
    available_order_types: [],
    excluded_restaurant_ids: ["r9", 3],
    option_groups: [
      {
        id: "g1",
        name: "Sauce",
        description: "Une sauce offerte",
        min_select: 1,
        max_select: 1,
        position: 0,
        items: [
          {
            id: "i1",
            label: "Barbecue",
            price_delta: 0,
            is_default: true,
            available: true,
            position: 0,
          },
        ],
      },
    ],
    dish_supplements: [
      {
        supplement: {
          id: "s1",
          name: "BARBECUE",
          price: 1000,
          image: null,
          available: true,
          category: "FOOD",
          position: 2,
          available_order_types: ["DELIVERY", "PICKUP", "TABLE"],
        },
      },
      {
        supplement: {
          id: "s2",
          name: "COCA",
          price: 1000,
          image: "https://cdn.exemple.test/coca.png",
          available: true,
          category: "DRINK",
          position: 1,
          available_order_types: ["PICKUP"],
        },
      },
      {
        supplement: {
          id: "s2",
          name: "COCA",
          price: 1000,
          available: true,
          category: "DRINK",
        },
      },
      {
        supplement: {
          id: "s3",
          name: "GLACE",
          price: 1500,
          available: false,
          category: "DRINK",
        },
      },
    ],
  };

  it("garde la description des groupes, l'image et la position des suppléments", () => {
    const p = versPlatDetail(API);

    expect(p.groupes[0].description).toBe("Une sauce offerte");
    expect(p.supplements.map((s) => [s.id, s.image, s.position])).toEqual([
      ["s1", null, 2],
      ["s2", "https://cdn.exemple.test/coca.png", 1],
    ]);
  });

  it("garde les règles d'avant : promotion, modes, restaurants exclus, dédoublonnage", () => {
    const p = versPlatDetail(API);

    expect(p.name).toBe("BOX 2K26 PRO");
    expect(p.description).toBe("Burger patron, 1 morceau");
    expect(p.prix).toBe(4500);
    expect(p.prixAvantPromo).toBe(10000);
    expect(p.available_order_types).toEqual(["DELIVERY", "PICKUP", "TABLE"]);
    expect(p.restaurantsExclus).toEqual(["r9"]);
    expect(p.supplements).toHaveLength(2);
  });
});

describe("frais et itinéraire de livraison", () => {
  // Réponse réelle de GET /orders/itineraire-livraison sur l'API de test (05/10).
  const ITINERAIRE = {
    restaurant: {
      id: "cdf609d7-d064-405a-bee4-4abe769f3647",
      name: "CHICKEN NATION ZONE 4",
      latitude: 5.2860442,
      longitude: -3.9737121,
    },
    frais: {
      montant: 3500,
      zone: "10-12.5km de CHICKEN NATION ZONE 4",
      distance: 11,
      distance_exacte: 10.864279046871257,
      distance_source: "VOL_OISEAU_CORRIGE",
      service: "TURBO",
      zone_id: null,
    },
    itineraire: null,
  };

  it("restaurant retenu, frais, distance à une décimale", () => {
    expect(versItineraire(ITINERAIRE)).toEqual({
      ok: true,
      data: {
        restaurant: {
          id: "cdf609d7-d064-405a-bee4-4abe769f3647",
          nom: "CHICKEN NATION ZONE 4",
        },
        frais: {
          montant: 3500,
          montantAvantOffre: null,
          offre: null,
          distanceKm: 11,
        },
        distanceKm: 10.9,
      },
    });
  });

  it("distance du trajet Google quand elle est là", () => {
    const r = versItineraire({
      ...ITINERAIRE,
      itineraire: {
        coordinates: [],
        distanceMeters: 12345,
        durationSeconds: 900,
      },
    });

    expect(r.data.distanceKm).toBe(12.3);
  });

  it("adresse non desservie : message, jamais un montant à 0", () => {
    expect(versItineraire({ ...ITINERAIRE, frais: { montant: null } }).ok).toBe(
      false,
    );
    expect(versFrais({}).message).toBe(
      "Cette adresse n'est pas desservie pour le moment.",
    );
    expect(versItineraire(null).ok).toBe(false);
  });

  it("offre de livraison : prix barré seulement s'il est plus haut", () => {
    expect(
      versFrais({
        montant: 0,
        original_montant: 1500,
        offer_name: "Livraison offerte",
        distance: 3,
      }).data,
    ).toEqual({
      montant: 0,
      montantAvantOffre: 1500,
      offre: "Livraison offerte",
      distanceKm: 3,
    });
  });
});

describe("adresses enregistrées", () => {
  it("reprend titre, adresse et point ; jamais la fiche du client", () => {
    const a = versAdresseEnregistree({
      id: "a1",
      title: " Maison ",
      address: "Cocody,  Angré 8e tranche",
      latitude: 5.39,
      longitude: -3.98,
      customer: { phone: "+2250511223344" },
    });

    expect(a).toEqual({
      id: "a1",
      titre: "Maison",
      libelle: "Cocody, Angré 8e tranche",
      latitude: 5.39,
      longitude: -3.98,
    });
  });

  it("écarte une adresse sans point ou sans texte", () => {
    expect(
      versAdresseEnregistree({
        id: "a",
        address: "Rue",
        latitude: 0,
        longitude: 0,
      }),
    ).toBeNull();
    expect(
      versAdresseEnregistree({
        id: "a",
        address: "",
        latitude: 5,
        longitude: -4,
      }),
    ).toBeNull();
    expect(
      versAdresseEnregistree({ address: "Rue", latitude: 5, longitude: -4 }),
    ).toBeNull();
    expect(
      versAdresseEnregistree({
        id: "a",
        title: "",
        address: "Rue",
        latitude: "5.3",
        longitude: "-4",
      }).titre,
    ).toBe("Adresse");
  });
});

describe("réglages de fidélité", () => {
  it("valeurs de l'API, validité en jours", () => {
    // Réponse réelle de l'API de test (05/10).
    const r = versReglagesFidelite({
      points_per_xof: 0.01,
      points_expiration_days: 365,
      minimum_redemption_points: 100,
      point_value_in_xof: 20,
      max_redemption_pct: 50,
    });

    expect(r).toEqual({
      valeurPoint: 20,
      minimum: 100,
      plafondPct: 50,
      pointsParFranc: 0.01,
      joursValidite: 365,
    });
  });

  it("plafond absent : 50 comme le serveur ; validité illisible : null", () => {
    const r = versReglagesFidelite({ points_per_xof: 0.001 });

    expect(r.plafondPct).toBe(50);
    expect(r.joursValidite).toBeNull();
    expect(versReglagesFidelite(null).pointsParFranc).toBe(0);
  });
});

describe("conditions de la commande", () => {
  // Réponse réelle de l'API de test (05/10) : zones du livreur actives, grille de secours.
  const API = {
    taux_frais_service: 0.01,
    grille_frais: [
      { distance_max_km: 2, montant: 1000 },
      { distance_max_km: 12.5, montant: 3500 },
      { distance_max_km: null, montant: 5000 },
    ],
    grille_frais_appliquee: false,
  };

  it("grille montrée seulement si elle s'applique", () => {
    expect(versConditionsCommande(API)).toEqual({
      tauxFraisService: 0.01,
      grille: null,
    });
    expect(
      versConditionsCommande({ ...API, grille_frais_appliquee: true }).grille,
    ).toEqual([
      { distanceMaxKm: 2, montant: 1000 },
      { distanceMaxKm: 12.5, montant: 3500 },
      { distanceMaxKm: null, montant: 5000 },
    ]);
  });

  it("ancien serveur ou réponse illisible : tout inconnu", () => {
    expect(versConditionsCommande(null)).toEqual({
      tauxFraisService: null,
      grille: null,
    });
    expect(
      versConditionsCommande({
        taux_frais_service: null,
        grille_frais: [],
        grille_frais_appliquee: true,
      }),
    ).toEqual({
      tauxFraisService: null,
      grille: null,
    });
    expect(
      versConditionsCommande({
        ...API,
        grille_frais_appliquee: true,
        grille_frais: [{ distance_max_km: 2, montant: 0 }],
      }).grille,
    ).toBeNull();
    expect(
      versConditionsCommande({ taux_frais_service: -0.01 }).tauxFraisService,
    ).toBeNull();
  });

  it("frais de service : arrondis à la dizaine supérieure, comme le serveur", () => {
    expect(fraisServiceEstimes(13500, 0.01)).toBe(140);
    expect(fraisServiceEstimes(5000, 0.01)).toBe(50);
    expect(fraisServiceEstimes(4500, 0.05)).toBe(230);
    expect(fraisServiceEstimes(0, 0.01)).toBe(0);
    expect(fraisServiceEstimes(13500, null)).toBeNull();
  });
});
