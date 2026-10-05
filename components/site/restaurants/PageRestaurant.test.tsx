// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "bun:test";
import { createStore, Provider } from "jotai";
import { renderToStaticMarkup } from "react-dom/server";

import { PageRestaurant } from "./PageRestaurant";
import {
  DESCRIPTION_MAX,
  descriptionListeRestaurants,
  descriptionPageRestaurant,
  introRestaurant,
  listeNoms,
  resumeOuverture,
  TITRE_LISTE_RESTAURANTS,
  TITRE_MAX,
  titrePageRestaurant,
} from "./PageRestaurant.textes";
import {
  BlocCommanderRestaurants,
  ListeRestaurantsVide,
} from "./PageRestaurants";

import { panierAtom } from "@/features/commande/stores/panier.store";
import { restaurantsDuSite } from "@/features/restaurants/restaurants.site";

const NBSP = "\u00a0";
const sansInsecables = (texte) => texte.replace(/[\u00a0\u202f\u2009]/g, " ");

const semaine = (plage, jours = [1, 2, 3, 4, 5, 6, 7]) =>
  JSON.stringify(
    jours.map((j) => ({ [j]: typeof plage === "function" ? plage(j) : plage })),
  );

const resto = (id, name, extra = {}) => ({
  id,
  name,
  address: null,
  latitude: null,
  longitude: null,
  image: null,
  schedule: semaine("10:00-00:00"),
  entity_status: "ACTIVE",
  ...extra,
});

// Instantané de production du 02/10 (.maquette-site/restaurants.json), dans l'ordre de l'API.
const PRODUCTION = restaurantsDuSite([
  resto("y", "CHICKEN NATION YOPOUGON", {
    address: "2762 Avenue Antonin Dioulo, Abidjan, Côte d'Ivoire",
    latitude: 5.331124,
    longitude: -4.103754,
    image: "chicken-nation/restaurants/1785154046182-images.jpg",
    schedule: semaine((j) => (j >= 5 ? "10:00-01:00" : "10:00-00:00")),
  }),
  resto("f", "CHICKEN NATION FAYA", {
    address: "10016 Boulevard Germain Koffi Gadeau, Abidjan, Côte d'Ivoire",
    latitude: 5.3714584,
    longitude: -3.9322304,
    image: "chicken-nation/restaurants/1777032064223-zone_4.webp",
  }),
  resto("s", "CHICKEN NATION SOCOCE 2 PLATEAUX", {
    address: "CENTRE COMMERCIAL SOCOCE, Bd des Martyrs, Abidjan, Côte d'Ivoire",
    latitude: 5.3735398,
    longitude: -3.9990328,
    image: "chicken-nation/restaurants/1777032470900-socose.jpg",
    schedule: semaine((j) =>
      j === 1 ? "10:00-23:45" : j >= 6 ? "10:00-00:30" : "10:00-00:00",
    ),
  }),
  resto("z", "CHICKEN NATION ZONE 4", {
    address: "488 Av. N'guetta Timothée Ahoua, Abidjan, Côte d'Ivoire",
    latitude: 5.2860442,
    longitude: -3.9737121,
    image: "chicken-nation/restaurants/1777032453359-zone_4.webp",
  }),
  resto("a", "CHICKEN NATION ANGRE", {
    address: "3897 Avenue Usher Assouan, Abidjan, Côte d'Ivoire",
    latitude: 5.3899293,
    longitude: -3.9752886,
    image: "chicken-nation/restaurants/1777032462123-angre.webp",
  }),
]);

const trouver = (slug) => PRODUCTION.find((r) => r.slug === slug);

// Motifs [html] et [texte] de scripts/interdits.txt (annexe A du plan).
function motifsInterdits() {
  const motifs = [];
  let section = "";

  for (const brute of fs
    .readFileSync(path.join(process.cwd(), "scripts", "interdits.txt"), "utf8")
    .split("\n")) {
    const ligne = brute.trim();

    if (!ligne || ligne.startsWith("#")) continue;
    if (/^\[\w+\]$/.test(ligne)) {
      section = ligne;
      continue;
    }
    if (section === "[relire]") continue;
    motifs.push(new RegExp(ligne.replace(/\s+@sauf\s+\S+$/, "")));
  }

  return motifs;
}

function rendre(element, panier = []) {
  const store = createStore();

  store.set(panierAtom, panier);

  return renderToStaticMarkup(<Provider store={store}>{element}</Provider>);
}

const page = (slug, panier) => {
  const r = trouver(slug);

  return rendre(
    <PageRestaurant
      autres={PRODUCTION.filter((x) => x !== r)}
      restaurant={r}
    />,
    panier,
  );
};

describe("textes des pages restaurants", () => {
  it("titres de 60 caractères au plus, descriptions de 155 au plus", () => {
    for (const r of PRODUCTION) {
      expect(titrePageRestaurant(r).length).toBeLessThanOrEqual(TITRE_MAX);
      expect(titrePageRestaurant(r)).toStartWith(
        `CHICKEN NATION ${r.nomAffiche}`,
      );
      expect(descriptionPageRestaurant(r).length).toBeLessThanOrEqual(
        DESCRIPTION_MAX,
      );
    }
    expect(
      `${TITRE_LISTE_RESTAURANTS} | CHICKEN NATION`.length,
    ).toBeLessThanOrEqual(TITRE_MAX);
    expect(descriptionListeRestaurants(PRODUCTION).length).toBeLessThanOrEqual(
      DESCRIPTION_MAX,
    );
  });

  it("titre et description d'un restaurant, seul numéro le 27 21 71 21 30", () => {
    const angre = trouver("angre");

    expect(sansInsecables(titrePageRestaurant(angre))).toBe(
      "CHICKEN NATION Angré : adresse et horaires",
    );
    expect(sansInsecables(descriptionPageRestaurant(angre))).toBe(
      "3897 Avenue Usher Assouan, Cocody. Ouvert 7 j/7 dès 10 h. Commandez en ligne et retirez sur place, ou appelez le 27 21 71 21 30.",
    );
    expect(
      sansInsecables(descriptionPageRestaurant(trouver("sococe-2-plateaux"))),
    ).toBe(
      "Centre commercial Sococé, boulevard des Martyrs, Cocody. Ouvert 7 j/7 dès 10 h. Commandez en ligne et retirez sur place, ou appelez le 27 21 71 21 30.",
    );
    // Adresse longue : la commune saute pour tenir en 155 caractères.
    const adresseLongue = {
      ...trouver("sococe-2-plateaux"),
      adresseCourte:
        "Centre commercial Sococé, boulevard des Martyrs, 2 Plateaux",
    };

    expect(sansInsecables(descriptionPageRestaurant(adresseLongue))).toBe(
      "Centre commercial Sococé, boulevard des Martyrs, 2 Plateaux. Ouvert 7 j/7 dès 10 h. Commandez en ligne et retirez sur place, ou appelez le 27 21 71 21 30.",
    );
    // Plus longue encore : le nom et la commune à la place de l'adresse.
    const tresLongue = {
      ...adresseLongue,
      adresseCourte: `${adresseLongue.adresseCourte}, en face de la pharmacie`,
    };

    expect(sansInsecables(descriptionPageRestaurant(tresLongue))).toBe(
      "CHICKEN NATION Sococé 2 Plateaux, Cocody. Ouvert 7 j/7 dès 10 h. Commandez en ligne et retirez sur place, ou appelez le 27 21 71 21 30.",
    );
    // Nom très long : forme courte du titre.
    const long = {
      ...angre,
      nomAffiche: "Abobo Pk 18 Carrefour Samaké Belle Ville",
    };

    expect(titrePageRestaurant(long)).toBe(
      "CHICKEN NATION Abobo Pk 18 Carrefour Samaké Belle Ville",
    );
  });

  it("résumé des horaires", () => {
    expect(sansInsecables(resumeOuverture(semaine("10:00-00:00")))).toBe(
      "Ouvert 7 j/7 dès 10 h",
    );
    expect(sansInsecables(resumeOuverture(semaine("00:00-23:59")))).toBe(
      "Ouvert 7 j/7, 24 h sur 24",
    );
    expect(
      sansInsecables(
        resumeOuverture(semaine("11:00-23:00", [1, 2, 3, 4, 5, 6])),
      ),
    ).toBe("Ouvert 6 jours sur 7 dès 11 h");
    expect(
      sansInsecables(
        resumeOuverture(
          semaine((j) => (j === 7 ? "12:00-23:00" : "10:00-23:00")),
        ),
      ),
    ).toBe("Ouvert 7 j/7");
    expect(resumeOuverture(null)).toBe("");
    expect(resumeOuverture("illisible")).toBe("");
  });

  it("liste des restaurants : noms tirés de l'API, repli quand la liste est trop longue", () => {
    expect(listeNoms(["a"])).toBe("a");
    expect(listeNoms(["a", "b", "c"])).toBe("a, b et c");
    expect(sansInsecables(descriptionListeRestaurants(PRODUCTION))).toBe(
      "Nos restaurants à Marcory Zone 4, Angré, Sococé 2 Plateaux, Riviera Faya et Yopougon. Ouverts 7 j/7 dès 10 h. Retrait de votre commande sur place.",
    );
    const beaucoup = Array.from({ length: 12 }, (_, i) => ({
      nomAffiche: `Restaurant numéro ${i}`,
    }));

    expect(descriptionListeRestaurants(beaucoup)).toStartWith(
      "Les restaurants CHICKEN NATION à Abidjan",
    );
    expect(descriptionListeRestaurants(beaucoup).length).toBeLessThanOrEqual(
      DESCRIPTION_MAX,
    );
  });

  it("introduction propre à chaque restaurant (commune et adresse)", () => {
    expect(introRestaurant(trouver("zone-4"))).toStartWith(
      "Chicken Nation Marcory Zone 4 vous accueille à Marcory, 488 Av. N'guetta Timothée Ahoua.",
    );
    expect(
      introRestaurant({
        nomAffiche: "Abobo",
        commune: null,
        adresseCourte: null,
      }),
    ).toStartWith("Chicken Nation Abobo vous accueille à Abidjan.");
  });

  it("insécables avant les deux-points", () => {
    for (const r of PRODUCTION) {
      expect(titrePageRestaurant(r)).not.toMatch(/ :/);
      expect(descriptionPageRestaurant(r)).not.toMatch(/ [:;?!]/);
    }
    expect(TITRE_LISTE_RESTAURANTS).toContain(`${NBSP}:`);
  });
});

describe("PageRestaurant", () => {
  const html = page("sococe-2-plateaux");

  it("un seul h1 : « Chicken Nation » puis le nom affiché (accents de la table du site)", () => {
    const h1 = html.match(/<h1[\s\S]*?<\/h1>/g) ?? [];

    expect(h1).toHaveLength(1);
    expect(h1[0].replace(/<[^>]+>/g, "")).toBe(
      "Chicken Nation Sococé 2 Plateaux",
    );
  });

  it("seul numéro : le 27 21 71 21 30, en lien tel:", () => {
    expect(html.match(/href="tel:[^"]*"/g)).toEqual([
      `href="tel:+2252721712130"`,
    ]);
    // Aucun autre numéro à 10 chiffres dans la page.
    const numeros = sansInsecables(html.replace(/<[^>]+>/g, " ")).match(
      /(?<![\d+])(?:0[157]|2[157])(?:[ .-]?\d{2}){4}(?!\d)/g,
    );

    expect(numeros).toEqual(["27 21 71 21 30"]);
  });

  it("horaires de la semaine en texte, sans état ni jour en cours dans le HTML", () => {
    for (const jour of [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ])
      expect(html).toContain(`<dt>${jour}</dt>`);
    expect(html).toContain(
      `<dd class="">10${NBSP}h à 23${NBSP}h${NBSP}45</dd>`,
    );
    expect(html).toContain(`10${NBSP}h à 0${NBSP}h${NBSP}30`);
    expect(html).not.toContain("aujourd");
    expect(html).not.toMatch(/Ouvert, ferme|Fermé, ouvre/);
  });

  it("« Retirer ici » : la carte si le panier est vide, la caisse sinon, en retrait sur ce restaurant", () => {
    expect(html).toContain(`href="/fr/carte?retrait=sococe-2-plateaux"`);
    const avecPanier = page("sococe-2-plateaux", [
      {
        cle: "x",
        dish_id: "x",
        nom: "BOX",
        image: "",
        prixUnitaire: 5000,
        epice: false,
        options: [],
        supplements: [],
        quantite: 1,
        available_order_types: [],
      },
    ]);

    expect(avecPanier).toContain(
      `href="/fr/commander?retrait=sococe-2-plateaux"`,
    );
  });

  it("itinéraire Google Maps vers les coordonnées, dans un nouvel onglet annoncé", () => {
    expect(html).toContain(
      `href="https://www.google.com/maps/dir/?api=1&amp;destination=5.3735398,-3.9990328" target="_blank" rel="noopener noreferrer"`,
    );
    expect(html).toContain(", nouvel onglet");
    // Sans coordonnées, pas de lien.
    const sans = rendre(
      <PageRestaurant
        autres={[]}
        restaurant={{ ...trouver("angre"), latitude: null }}
      />,
    );

    expect(sans).not.toContain("google.com/maps");
  });

  it("fil d'Ariane : accueil, liste, page en cours", () => {
    expect(html).toContain(`aria-label="Fil d&#x27;Ariane"`);
    expect(html).toContain(`<a href="/fr">Accueil</a>`);
    expect(html).toContain(`<a href="/fr/restaurants">Nos restaurants</a>`);
    expect(html).toContain(`<li aria-current="page">Sococé 2 Plateaux</li>`);
  });

  it("les autres restaurants, chacun avec le lien de sa page, sans le restaurant lui-même", () => {
    const liens = [
      ...html.matchAll(/<a href="\/fr\/restaurants\/([^"]+)">/g),
    ].map((m) => m[1]);

    expect(liens).toEqual(["zone-4", "angre", "faya", "yopougon"]);
    expect(html).toContain("Nos autres restaurants");
    expect(html).toContain("--colonnes:4");
  });

  it("photo de la base préchargée (image principale), logo sans photo", () => {
    expect(html).toContain(`alt="Restaurant Chicken Nation Sococé 2 Plateaux"`);
    expect(html).toContain("1777032470900-socose.jpg");
    const sansPhoto = rendre(
      <PageRestaurant
        autres={[]}
        restaurant={{ ...trouver("angre"), image: null }}
      />,
    );

    expect(sansPhoto).toContain("logo-orange.png");
    expect(sansPhoto).not.toContain("Nos autres restaurants");
  });

  it("horaires illisibles : ni bloc horaires ni état, la page reste complète", () => {
    const sans = rendre(
      <PageRestaurant
        autres={[]}
        restaurant={{ ...trouver("angre"), schedule: null }}
      />,
    );

    expect(sans).not.toContain("titre-horaires");
    expect(sans).toContain("titre-commander");
    expect(sans.match(/<h1/g)).toHaveLength(1);
  });

  it("aucun motif interdit (annexe A), aucun tiret long", () => {
    const pages = [
      ...PRODUCTION.map((r) => page(r.slug)),
      rendre(<BlocCommanderRestaurants nombre={5} />),
      rendre(<ListeRestaurantsVide />),
    ].map(sansInsecables);

    for (const motif of motifsInterdits())
      for (const p of pages) expect(p).not.toMatch(motif);
  });
});

describe("page des restaurants", () => {
  it("retrait ou livraison : nombre tiré de l'API, lien vers la carte, numéro unique", () => {
    const html = rendre(<BlocCommanderRestaurants nombre={5} />);

    expect(html).toContain(`l&#x27;un de nos 5${NBSP}restaurants`);
    expect(html).toContain(`href="/fr/carte"`);
    expect(html.match(/href="tel:[^"]*"/g)).toEqual([
      `href="tel:+2252721712130"`,
    ]);
    expect(rendre(<BlocCommanderRestaurants nombre={1} />)).toContain(
      "dans notre restaurant",
    );
  });

  it("liste vide : la page garde son h1 et le numéro unique", () => {
    const html = rendre(<ListeRestaurantsVide />);

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("Nos restaurants");
    expect(html).toContain(`href="tel:+2252721712130"`);
  });
});
