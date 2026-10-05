// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SectionRestaurants } from "./SectionRestaurants";

import { restaurantsDuSite } from "@/features/restaurants/restaurants.site";

const NBSP = " ";
const SEMAINE = (soir) =>
  JSON.stringify(
    [1, 2, 3, 4, 5, 6, 7].map((j) => ({ [j]: `10:00-${soir(j)}` })),
  );

const resto = (id, name, extra = {}) => ({
  id,
  name,
  address: null,
  latitude: null,
  longitude: null,
  image: null,
  schedule: SEMAINE((j) => (j >= 5 ? "00:30" : "00:00")),
  entity_status: "ACTIVE",
  ...extra,
});

// Noms, adresses et horaires de production du 02/10, dans l'ordre de l'API.
const PRODUCTION = restaurantsDuSite([
  resto("y", "CHICKEN NATION YOPOUGON", {
    address: "2762 Avenue Antonin Dioulo, Abidjan, Côte d'Ivoire",
    schedule: SEMAINE((j) => (j >= 5 ? "01:00" : "00:00")),
  }),
  resto("f", "CHICKEN NATION FAYA", {
    address: "10016 Boulevard Germain Koffi Gadeau, Abidjan, Côte d'Ivoire",
  }),
  resto("s", "CHICKEN NATION SOCOCE 2 PLATEAUX", {
    address: "CENTRE COMMERCIAL SOCOCE, Bd des Martyrs, Abidjan, Côte d'Ivoire",
    image:
      "https://dvsxt5681pvqm.cloudfront.net/chicken-nation/restaurants/socose.jpg",
  }),
  resto("z", "CHICKEN NATION ZONE 4", {
    address: "488 Av. N'guetta Timothée Ahoua, Abidjan, Côte d'Ivoire",
  }),
  resto("a", "CHICKEN NATION ANGRE", {
    address: "3897 Avenue Usher Assouan, Abidjan, Côte d'Ivoire",
    schedule: null,
  }),
]);

const rendre = (restaurants) =>
  renderToStaticMarkup(<SectionRestaurants restaurants={restaurants} />);

describe("SectionRestaurants", () => {
  it("titre tiré du nombre de restaurants, jamais écrit en dur", () => {
    expect(rendre(PRODUCTION)).toContain(">Nos 5 restaurants</h2>");
    expect(rendre(PRODUCTION.slice(0, 2))).toContain(">Nos 2 restaurants</h2>");
    expect(rendre(PRODUCTION.slice(0, 1))).toContain(">Notre restaurant</h2>");
  });

  it("section masquée sans restaurant", () => {
    expect(rendre([])).toBe("");
  });

  it("seul numéro : le 27 21 71 21 30, cliquable", () => {
    const html = rendre(PRODUCTION);
    const tel = html.match(/href="tel:[^"]*"/g) ?? [];

    expect(tel).toEqual([`href="tel:+2252721712130"`]);
    expect(html).toContain("Un seul numéro pour tous nos restaurants");
  });

  it("une carte par restaurant, dans l'ordre du site, nom en lien vers sa page", () => {
    const html = rendre(PRODUCTION);
    const noms = [
      ...html.matchAll(
        /<a href="\/fr\/restaurants\/([^"]+)">([^<]+)<\/a><\/h3>/g,
      ),
    ].map((m) => `${m[1]}=${m[2]}`);

    expect(noms).toEqual([
      "zone-4=Marcory Zone 4",
      "angre=Angré",
      "sococe-2-plateaux=Sococé 2 Plateaux",
      "faya=Riviera Faya",
      "yopougon=Yopougon",
    ]);
    expect(html).toContain("Centre commercial Sococé, boulevard des Martyrs");
    expect(html).toContain(`alt="Restaurant Chicken Nation Sococé 2 Plateaux"`);
  });

  it("« Retirer ici » mène à la carte en retrait (panier vide au rendu serveur)", () => {
    const html = rendre(PRODUCTION);

    expect(html).toContain(`href="/fr/carte?retrait=angre"`);
    expect(html).toContain(`<span class="sr-only">, à Angré</span>`);
  });

  it("aucun état d'ouverture dans le HTML (calculé dans le navigateur)", () => {
    const html = rendre(PRODUCTION);

    expect(html).not.toMatch(/Ouvert,|Fermé,/);
    expect(html).toContain(`invisible`);
  });

  it("bulle des horaires fermée, heures insécables, rien sans horaires lisibles", () => {
    const html = rendre(PRODUCTION);

    expect(html).toContain(`aria-controls="horaires-yopougon"`);
    expect(html).toContain(`aria-expanded="false"`);
    expect(html).toMatch(
      /aria-label="Horaires à Yopougon" hidden="" id="horaires-yopougon" role="dialog"/,
    );
    expect(html).toContain(
      `Vendredi</span><span>10${NBSP}h à 1${NBSP}h</span>`,
    );
    expect(html).toContain(`Lundi</span><span>10${NBSP}h à minuit</span>`);
    // Angré sans horaires dans la base : pas de lien « Horaires ».
    expect(html).not.toContain(`horaires-angre`);
  });
});
