// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import { ID_MENU, ID_ORGANISATION, adresseAbsolue, jsonLd } from "./commun";
import { filArianeSchemaOrg } from "./fil-ariane";
import { menuSchemaOrg } from "./menu";
import {
  fourchetteTexte,
  listeRestaurantsSchemaOrg,
  pageRestaurantSchemaOrg,
} from "./restaurant";

import { construireCarte, fourchettePrix } from "@/features/menus/carte";
import platsProduction from "@/features/menus/tests/plats-production-0210.json";
import { restaurantsDuSite } from "@/features/restaurants/restaurants.site";

const ZONE_4 = {
  id: "cdf609d7-d064-405a-bee4-4abe769f3647",
  name: "CHICKEN NATION ZONE 4",
  address: "488 Av. N'guetta Timothée Ahoua, Abidjan, Côte d'Ivoire",
  latitude: 5.2860442,
  longitude: -3.9737121,
  image: "chicken-nation/restaurants/1777032453359-zone_4.webp",
  schedule:
    '[{"1":"10:00-00:00"},{"2":"10:00-00:00"},{"3":"10:00-00:00"},{"4":"10:00-00:00"},{"5":"10:00-00:30"},{"6":"10:00-00:30"},{"7":"10:00-00:45"}]',
  entity_status: "ACTIVE",
};
const YOPOUGON = {
  ...ZONE_4,
  id: "58a0f818",
  name: "CHICKEN NATION YOPOUGON",
  address: null,
  latitude: null,
  longitude: null,
  image: null,
  schedule: null,
};

// Numéros de restaurant (retouche 6) : aucun ne doit sortir, sous aucune forme.
const NUMEROS_RESTAURANTS =
  /0720353535|0747000034|0700005556|0712853211|0720208352|07 ?20 ?35|07 ?12 ?85/;

describe("menu de la carte", () => {
  const carte = construireCarte(platsProduction);
  const menu = menuSchemaOrg(carte);

  it("publie une section par catégorie, avec l'ancre de la carte", () => {
    expect(menu["@id"]).toBe(ID_MENU);
    expect(menu.url).toBe("https://www.chicken-nation.com/fr/carte");
    expect(menu.hasMenuSection.map((s) => s.url)).toEqual(
      carte.map((c) => `https://www.chicken-nation.com/fr/carte#${c.cle}`),
    );
  });

  it("décrit chaque plat avec sa page, sa photo et son prix en XOF", () => {
    const box = menu.hasMenuSection[1].hasMenuItem.find(
      (i) => i.name === "BOX DE LA NATION",
    );

    expect(box).toEqual({
      "@type": "MenuItem",
      name: "BOX DE LA NATION",
      url: "https://www.chicken-nation.com/fr/carte/box-de-la-nation-5b020e",
      description: box.description,
      image:
        "https://www.chicken-nation.com/assets/plats/5b020e13-b5de-4564-996e-1880457d6634.webp",
      suitableForDiet: "https://schema.org/HalalDiet",
      offers: {
        "@type": "Offer",
        price: 6000,
        priceCurrency: "XOF",
        url: box.url,
      },
    });
    expect(JSON.stringify(menu)).not.toMatch(/aggregateRating|"Review"/);
  });

  it("reste lisible par JSON.parse et ne peut pas fermer la balise script", () => {
    const texte = jsonLd({ name: "</script><script>alert(1)</script>" });

    expect(texte).not.toContain("<");
    expect(JSON.parse(texte).name).toBe("</script><script>alert(1)</script>");
    expect(JSON.parse(jsonLd(menu))).toEqual(menu);
  });
});

describe("restaurants", () => {
  const [zone4, yopougon] = restaurantsDuSite([ZONE_4, YOPOUGON]);

  it("publie la page d'un restaurant avec le seul numéro du site", () => {
    const noeud = pageRestaurantSchemaOrg(zone4, {
      prix: { min: 2000, max: 22000 },
    });

    expect(noeud).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "@id": "https://www.chicken-nation.com/fr/restaurants/zone-4#restaurant",
      name: "CHICKEN NATION Marcory Zone 4",
      url: "https://www.chicken-nation.com/fr/restaurants/zone-4",
      address: {
        "@type": "PostalAddress",
        streetAddress: "488 Av. N'guetta Timothée Ahoua",
        addressLocality: "Marcory",
        addressRegion: "Abidjan",
        addressCountry: "CI",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 5.2860442,
        longitude: -3.9737121,
      },
      telephone: "+225 27 21 71 21 30",
      priceRange: "2 000 à 22 000 FCFA",
      servesCuisine: ["Fast-food", "Poulet frit", "Burgers"],
      hasMenu: { "@id": ID_MENU },
      parentOrganization: { "@id": ID_ORGANISATION },
    });
    expect(
      noeud.image.endsWith(
        "/chicken-nation/restaurants/1777032453359-zone_4.webp",
      ),
    ).toBe(true);
    expect(noeud.potentialAction.target.urlTemplate).toBe(
      "https://www.chicken-nation.com/fr/carte",
    );
    expect(noeud.openingHoursSpecification).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"].map(
          (j) => `https://schema.org/${j}`,
        ),
        opens: "10:00",
        closes: "00:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["https://schema.org/Friday", "https://schema.org/Saturday"],
        opens: "10:00",
        closes: "00:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["https://schema.org/Sunday"],
        opens: "10:00",
        closes: "00:45",
      },
    ]);
  });

  it("omet ce que la base n'a pas, sans jamais d'avis ni de numéro de restaurant", () => {
    const noeud = pageRestaurantSchemaOrg(yopougon);

    expect(noeud.address).toBeUndefined();
    expect(noeud.geo).toBeUndefined();
    expect(noeud.image).toBeUndefined();
    expect(noeud.priceRange).toBeUndefined();
    expect(noeud.openingHoursSpecification).toBeUndefined();
    expect(noeud.telephone).toBe("+225 27 21 71 21 30");
    // Un numéro qui arriverait quand même de l'API ne doit sortir nulle part.
    const avecNumero = { ...ZONE_4, phone: "0720353535" };
    const tout = JSON.stringify([
      listeRestaurantsSchemaOrg(restaurantsDuSite([avecNumero, YOPOUGON])),
      pageRestaurantSchemaOrg(restaurantsDuSite([avecNumero])[0]),
    ]);

    expect(tout).not.toMatch(NUMEROS_RESTAURANTS);
    expect(tout).not.toMatch(/aggregateRating|"Review"/);
  });

  it("liste les pages restaurants", () => {
    expect(listeRestaurantsSchemaOrg([zone4, yopougon])).toEqual({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Les restaurants CHICKEN NATION à Abidjan",
      numberOfItems: 2,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "CHICKEN NATION Marcory Zone 4",
          url: "https://www.chicken-nation.com/fr/restaurants/zone-4",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "CHICKEN NATION Yopougon",
          url: "https://www.chicken-nation.com/fr/restaurants/yopougon",
        },
      ],
    });
  });

  it("écrit la fourchette de prix de la carte", () => {
    expect(
      fourchetteTexte(fourchettePrix(construireCarte(platsProduction))),
    ).toBe("2 000 à 22 000 FCFA");
    expect(fourchetteTexte({ min: 2500, max: 2500 })).toBe("2 500 FCFA");
  });
});

describe("fil d'Ariane", () => {
  it("commence toujours par l'accueil et donne des adresses complètes", () => {
    expect(
      filArianeSchemaOrg([
        { nom: "La carte", chemin: "/fr/carte" },
        { nom: "Nos box", chemin: "/fr/carte#box" },
        {
          nom: "BOX DE LA NATION",
          chemin: "/fr/carte/box-de-la-nation-5b020e",
        },
      ]),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: "https://www.chicken-nation.com/fr",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "La carte",
          item: "https://www.chicken-nation.com/fr/carte",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Nos box",
          item: "https://www.chicken-nation.com/fr/carte#box",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "BOX DE LA NATION",
          item: "https://www.chicken-nation.com/fr/carte/box-de-la-nation-5b020e",
        },
      ],
    });
    expect(adresseAbsolue("https://exemple.test/a")).toBe(
      "https://exemple.test/a",
    );
    expect(adresseAbsolue("fr/histoire")).toBe(
      "https://www.chicken-nation.com/fr/histoire",
    );
  });
});
