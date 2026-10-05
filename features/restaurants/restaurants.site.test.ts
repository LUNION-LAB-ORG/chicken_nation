// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  adresseCourte,
  cheminRestaurant,
  restaurantsDuSite,
  slugRestaurant,
  trouverRestaurant,
} from "./restaurants.site";

const resto = (id, name, extra = {}) => ({
  id,
  name,
  address: null,
  latitude: null,
  longitude: null,
  phone: null,
  email: null,
  image: null,
  schedule: null,
  entity_status: "ACTIVE",
  ...extra,
});

// Noms et adresses de production du 02/10 (.maquette-site/restaurants.json), dans l'ordre de l'API.
const PRODUCTION = [
  resto("y", "CHICKEN NATION YOPOUGON", {
    address: "2762 Avenue Antonin Dioulo, Abidjan, Côte d'Ivoire",
  }),
  resto("f", "CHICKEN NATION FAYA", {
    address: "10016 Boulevard Germain Koffi Gadeau, Abidjan, Côte d'Ivoire",
  }),
  resto("s", "CHICKEN NATION SOCOCE 2 PLATEAUX", {
    address: "CENTRE COMMERCIAL SOCOCE, Bd des Martyrs, Abidjan, Côte d'Ivoire",
  }),
  resto("z", "CHICKEN NATION ZONE 4", {
    address: "488 Av. N'guetta Timothée Ahoua, Abidjan, Côte d'Ivoire",
  }),
  resto("a", "CHICKEN NATION ANGRE", {
    address: "3897 Avenue Usher Assouan, Abidjan, Côte d'Ivoire",
  }),
];

describe("restaurants du site", () => {
  it("tire les slugs du plan des noms de l'API", () => {
    expect(PRODUCTION.map((r) => slugRestaurant(r.name))).toEqual([
      "yopougon",
      "faya",
      "sococe-2-plateaux",
      "zone-4",
      "angre",
    ]);
  });

  it("donne nom affiché, commune et adresse courte, dans l'ordre du site", () => {
    expect(
      restaurantsDuSite(PRODUCTION).map((r) => [
        r.slug,
        r.nomAffiche,
        r.commune,
        r.adresseCourte,
      ]),
    ).toEqual([
      [
        "zone-4",
        "Marcory Zone 4",
        "Marcory",
        "488 Av. N'guetta Timothée Ahoua",
      ],
      ["angre", "Angré", "Cocody", "3897 Avenue Usher Assouan"],
      [
        "sococe-2-plateaux",
        "Sococé 2 Plateaux",
        "Cocody",
        "Centre commercial Sococé, boulevard des Martyrs",
      ],
      [
        "faya",
        "Riviera Faya",
        "Cocody",
        "10016 Boulevard Germain Koffi Gadeau",
      ],
      ["yopougon", "Yopougon", "Yopougon", "2762 Avenue Antonin Dioulo"],
    ]);
    expect(cheminRestaurant({ slug: "angre" })).toBe("/fr/restaurants/angre");
  });

  it("garde le nom de l'API pour un restaurant hors table, sans commune", () => {
    const [r] = restaurantsDuSite([
      resto("b", "CHICKEN NATION ABOBO PK 18", {
        address: "Carrefour PK 18, Abidjan",
      }),
    ]);

    expect([r.slug, r.nomAffiche, r.commune, r.adresseCourte]).toEqual([
      "abobo-pk-18",
      "Abobo Pk 18",
      null,
      "Carrefour PK 18",
    ]);
  });

  it("ne dépend pas des identifiants et donne une adresse unique à chaque restaurant", () => {
    const liste = restaurantsDuSite([
      resto("1", "CHICKEN NATION ZONE 4"),
      resto("2", "Chicken Nation Zone 4"),
      resto("abcdef12", "CHICKEN NATION"),
    ]);

    expect(liste.map((r) => r.slug)).toEqual([
      "zone-4",
      "zone-4-2",
      "restaurant-abcdef",
    ]);
    expect(trouverRestaurant(liste, "ZONE-4-2").id).toBe("2");
    expect(trouverRestaurant(liste, "inconnu")).toBeNull();
  });

  it("raccourcit les adresses de la base", () => {
    expect(
      adresseCourte("3897 Avenue Usher Assouan, Abidjan, Côte d'Ivoire"),
    ).toBe("3897 Avenue Usher Assouan");
    expect(adresseCourte("Rue 12, Abidjan")).toBe("Rue 12");
    expect(adresseCourte("  ")).toBeNull();
    expect(adresseCourte(null)).toBeNull();
  });
});
