// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { destinationPlat } from "./adresse-plat";
import { redirectionAdressePlat } from "./redirection-plat";
import { BoutonCommanderPlat } from "./BoutonCommanderPlat";
import { DisponibiliteHoraire, texteCreneau } from "./DisponibiliteHoraire";
import { EnteteCarte, introductionCarte, nomDansPhrase } from "./EnteteCarte";
import { mentionPlat, PagePlat, servieSeulementSurPlace } from "./PagePlat";
import { Pastilles } from "./Pastilles";
import {
  lireRetraitDemande,
  memoriserRetraitDemande,
  oublierRetraitDemande,
  slugValide,
} from "./retrait-demande";
import { messageRetrait } from "./RetraitDemande";
import { SectionCategorie } from "./SectionCategorie";
import {
  DESCRIPTION_MAX,
  TITRE_MAX,
  descriptionPlat,
  titrePlat,
} from "./textes-plat";

import { construireCarte, platsDeLaCarte } from "@/features/menus/carte";
// Instantané de production du 02/10, réduit aux champs lus par le site.
import platsProduction from "@/features/menus/tests/plats-production-0210.json";
import { fcfa } from "@/lib/typo";

const NBSP = "\u00a0";
const GABARIT = " | CHICKEN NATION";

// Les 5 plats de l'API de test (:4020), mêmes champs que GET /dishes.
const plat = (id, name, price, category, extra = {}) => ({
  id,
  name,
  description: null,
  price,
  is_promotion: false,
  promotion_price: null,
  image: null,
  available_order_types: ["DELIVERY", "PICKUP", "TABLE"],
  available_from: null,
  available_until: null,
  composable: false,
  entity_status: "ACTIVE",
  updated_at: "2026-10-01T10:00:00.000Z",
  category: { name: category },
  ...extra,
});
const PLATS_TEST = [
  plat("42636181-aaaa", "BABATCHÊ", 22000, "NOS BOX", {
    description: "Vingt morceaux de poulet pané",
    available_order_types: ["PICKUP", "TABLE"],
  }),
  plat("e6f76a6d-bbbb", "BIG CHICKEN", 8000, "NOS BOX"),
  plat("939cf341-cccc", "BOX 2K26 PRO", 10000, "NOS BOX", {
    is_promotion: true,
    promotion_price: 4500,
  }),
  plat("29cd5e84-dddd", "MENU À COMPOSER", 6000, "NOS BOX", {
    composable: true,
  }),
  plat("bf938cda-eeee", "Plat test bascule", 12000, "Test bascule paiement"),
];

const PRODUCTION = construireCarte(platsProduction);
const TEST = construireCarte(PLATS_TEST);
const platsProd = platsDeLaCarte(PRODUCTION);
const parNom = (nom, carte = PRODUCTION) =>
  platsDeLaCarte(carte).find((p) => p.nom === nom);

// Motifs de l'annexe A du plan qui ne doivent jamais sortir de ces pages.
const INTERDITS =
  /07 ?00 ?00 ?00 ?00|0720353535|0747000034|0712853211|NATION10|BON5000|Simulation|data-maquette|\u2014|\u2013/;

describe("introduction de la carte", () => {
  it("catégories réelles, nombres de l'API, insécables", () => {
    expect(
      introductionCarte(PRODUCTION, platsProd.length, 5).replaceAll(NBSP, " "),
    ).toBe(
      "49 plats : box, poulet pané, ailes crispy et tenders, burgers, sandwichs, nuggets et combos. Livraison en 20 à 35 min ou retrait dans l'un de nos 5 restaurants.",
    );
    const texte = introductionCarte(TEST, 5, 2);

    expect(texte).toContain(
      `5${NBSP}plats${NBSP}: box et test bascule paiement.`,
    );
    expect(texte).toContain(`nos 2${NBSP}restaurants`);
    expect(introductionCarte(TEST, 5, 1)).toContain("dans notre restaurant.");
    expect(introductionCarte(TEST, 5, 0)).toContain(
      "ou retrait au restaurant.",
    );
  });

  it("noms de catégorie dans une phrase", () => {
    expect(nomDansPhrase("Nos box")).toBe("box");
    expect(nomDansPhrase("Les burgers")).toBe("burgers");
    expect(nomDansPhrase("Poulet pané")).toBe("poulet pané");
  });
});

describe("EnteteCarte", () => {
  it("un seul h1 « La carte », décor sans texte alternatif, autocollants masqués", () => {
    const html = renderToStaticMarkup(
      <EnteteCarte
        categories={PRODUCTION}
        nombrePlats={49}
        nombreRestaurants={5}
      />,
    );

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*id="titre-carte"[^>]*>La carte<\/h1>/);
    expect(html).toContain('alt=""');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("49");
  });
});

describe("SectionCategorie", () => {
  it("ancre fixe, titre lié et focalisable, un plat par carte", () => {
    for (const categorie of PRODUCTION) {
      const html = renderToStaticMarkup(
        <SectionCategorie categorie={categorie} />,
      );

      expect(html).toContain(`id="${categorie.cle}"`);
      expect(html).toContain(`aria-labelledby="titre-${categorie.cle}"`);
      expect(html).toMatch(
        new RegExp(`<h2[^>]*id="titre-${categorie.cle}"[^>]*tabindex="-1"`),
      );
      expect(html.match(/<article/g)).toHaveLength(categorie.plats.length);
      expect(html).toContain(
        `${categorie.plats.length}${NBSP}${categorie.plats.length > 1 ? "plats" : "plat"}`,
      );
      expect(html).not.toMatch(INTERDITS);
    }
  });

  it("ordre de la table du site, promotions en tête et sur fond jaune", () => {
    expect(PRODUCTION.map((c) => c.cle)).toEqual([
      "promotions",
      "box",
      "pane",
      "ailes",
      "burgers",
      "sandwichs",
      "nuggets",
      "combos",
    ]);
    const promo = renderToStaticMarkup(
      <SectionCategorie categorie={PRODUCTION[0]} />,
    );

    expect(promo).toContain("bg-jaune");
    expect(
      renderToStaticMarkup(<SectionCategorie categorie={PRODUCTION[1]} />),
    ).not.toContain("rounded-lg bg-jaune");
  });

  it("photos entières : jamais object-fit cover sur un plat", () => {
    const html = PRODUCTION.map((c) =>
      renderToStaticMarkup(<SectionCategorie categorie={c} />),
    ).join("");

    expect(html).not.toContain("object-cover");
    expect(html).not.toContain("object-fit:cover");
  });

  it("API de test : 5 plats, catégorie inconnue rangée après la table", () => {
    expect(TEST.map((c) => c.cle)).toEqual([
      "promotions",
      "box",
      "test-bascule-paiement",
    ]);
    expect(platsDeLaCarte(TEST)).toHaveLength(5);
  });
});

describe("Pastilles", () => {
  it("de vrais liens vers les ancres, la première marquée au rendu serveur", () => {
    const html = renderToStaticMarkup(
      <Pastilles
        categories={PRODUCTION.map((c) => ({
          cle: c.cle,
          nom: c.nom,
          promo: c.cle === "promotions",
        }))}
      />,
    );

    expect(html).toContain('aria-label="Catégories de la carte"');
    expect(html.match(/<a /g)).toHaveLength(8);
    expect(html).toContain('href="#burgers"');
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
    expect(html).toMatch(
      /aria-current="true"[^>]*href="#promotions"|href="#promotions"[^>]*aria-current="true"/,
    );
  });
});

describe("titre et description des pages plats", () => {
  it("titre de 60 caractères au plus, gabarit compris, pour chaque plat de production", () => {
    for (const p of platsProd)
      expect((titrePlat(p) + GABARIT).length).toBeLessThanOrEqual(TITRE_MAX);
    expect(titrePlat(parNom("BOX DE LA NATION"))).toBe(
      "BOX DE LA NATION, box à Abidjan",
    );
    expect(titrePlat(parNom("NUGGETS (12 PCS)"))).toBe(
      "NUGGETS (12 PCS), nuggets à Abidjan",
    );
  });

  it("titre raccourci pour un nom long", () => {
    const long = {
      nom: "MENU FAMILLE DU DIMANCHE",
      categorie: { court: "Ailes et tenders" },
    };
    const tresLong = { ...long, nom: "MENU FAMILLE GÉANTE DU DIMANCHE SOIR" };

    expect(titrePlat(long)).toBe("MENU FAMILLE DU DIMANCHE à Abidjan");
    expect(titrePlat(tresLong)).toBe("MENU FAMILLE GÉANTE DU DIMANCHE SOIR");
  });

  it("description de 155 caractères au plus, prix et fin fixes", () => {
    for (const p of platsProd) {
      const d = descriptionPlat(p);

      expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(d).toEndWith(
        `${fcfa(p.prix)}. Livraison dans le Grand Abidjan ou retrait dans nos restaurants.`,
      );
      expect(d).not.toMatch(/\.\.|…\./);
    }
  });

  it("description coupée à un mot entier, et repli sans description", () => {
    const long = {
      ...parNom("BOX DE LA NATION"),
      description:
        "Burger patron (sauce au choix) + deux morceaux de poulet pané épicé ou non + frites croustillantes + boisson fraîche au choix + sauce maison",
    };
    const d = descriptionPlat(long);

    expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(d).toMatch(/[a-zé]… /);
    expect(descriptionPlat({ ...long, description: "" })).toStartWith(
      "BOX DE LA NATION, box. ",
    );
  });
});

describe("adresse d'une page plat", () => {
  const boxNation = parNom("BOX DE LA NATION");

  it("adresse exacte : la page", () => {
    expect(destinationPlat(boxNation.slug, PRODUCTION)).toEqual({
      type: "page",
      plat: boxNation,
    });
  });

  it("capitales ou caractères encodés : la seule adresse du plat", () => {
    expect(destinationPlat(boxNation.slug.toUpperCase(), PRODUCTION)).toEqual({
      type: "redirection",
      chemin: `/fr/carte/${boxNation.slug}`,
    });
  });

  it("nom modifié : redirection vers la nouvelle adresse", () => {
    const suffixe = boxNation.slug.split("-").pop();

    expect(destinationPlat(`ancien-nom-${suffixe}`, PRODUCTION)).toEqual({
      type: "redirection",
      chemin: `/fr/carte/${boxNation.slug}`,
    });
  });

  it("plat retiré : la carte ; adresse sans suffixe : la carte ou la section", () => {
    expect(destinationPlat("plat-retire-abcdef", PRODUCTION)).toEqual({
      type: "redirection",
      chemin: "/fr/carte",
    });
    expect(destinationPlat("xyz", PRODUCTION)).toEqual({
      type: "redirection",
      chemin: "/fr/carte",
    });
    expect(destinationPlat("burgers", PRODUCTION)).toEqual({
      type: "redirection",
      chemin: "/fr/carte#burgers",
    });
    expect(destinationPlat("%E0%A4%A", PRODUCTION).type).toBe("redirection");
  });

  it("proxy.ts redirige toute adresse qui n'est pas exacte, la page ne redirige plus (recette liens 1)", () => {
    const suffixe = boxNation.slug.split("-").pop();

    expect(
      redirectionAdressePlat(`/fr/carte/ancien-nom-${suffixe}`, PRODUCTION),
    ).toBe(`/fr/carte/${boxNation.slug}`);
    expect(
      redirectionAdressePlat("/fr/carte/plat-inexistant-123456", PRODUCTION),
    ).toBe("/fr/carte");
    expect(redirectionAdressePlat("/fr/carte/burgers", PRODUCTION)).toBe(
      "/fr/carte#burgers",
    );
    // Adresse exacte, autre page, carte illisible : rien à décider ici.
    expect(
      redirectionAdressePlat(`/fr/carte/${boxNation.slug}`, PRODUCTION),
    ).toBeNull();
    expect(redirectionAdressePlat("/fr/carte", PRODUCTION)).toBeNull();
    expect(
      redirectionAdressePlat("/fr/restaurants/zone-4", PRODUCTION),
    ).toBeNull();
    expect(redirectionAdressePlat("/fr/carte/a/b", PRODUCTION)).toBeNull();
    expect(redirectionAdressePlat("/fr/carte/xyz", null)).toBeNull();
    expect(redirectionAdressePlat("/fr/carte/xyz", [])).toBeNull();
  });

  it("noms en double : chaque plat garde sa page", () => {
    const doubles = platsProd.filter((p) => p.nom === "HOT CREAMY BEEF");

    expect(doubles).toHaveLength(2);
    expect(doubles[0].slug).not.toBe(doubles[1].slug);
    for (const p of doubles)
      expect(destinationPlat(p.slug, PRODUCTION)).toEqual({
        type: "page",
        plat: p,
      });
  });

  it("chaque plat de production a sa page (49)", () => {
    expect(platsProd).toHaveLength(49);
    for (const p of platsProd)
      expect(destinationPlat(p.slug, PRODUCTION).type).toBe("page");
  });
});

describe("PagePlat", () => {
  const rendre = (p, carte = PRODUCTION) =>
    renderToStaticMarkup(
      <PagePlat
        categorie={carte.find((c) => c.cle === p.categorie.cle) ?? null}
        plat={p}
      />,
    );

  it("plat en promotion : un h1 (nom), fil d'Ariane, prix barré lu, autres plats", () => {
    const p = parNom("GBONHI MAX");
    const html = rendre(p);

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>GBONHI MAX<\/h1>/);
    // Le nom vient de la base : jamais en police d'affiche.
    expect(html).not.toMatch(/<h1[^>]*font-affiche/);
    expect(html).toContain('aria-label="Fil d&#x27;Ariane"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain(`href="/fr/carte#${p.categorie.cle}"`);
    expect(html).toContain('<span class="sr-only">Au lieu de </span>');
    expect(html).toContain('alt="GBONHI MAX"');
    expect(html).toContain("Choisir et commander");
    expect(html).toContain("Partager");
    expect(html).toContain('href="tel:+2252721712130"');
    expect(html.match(/tel:/g)).toHaveLength(1);
    expect(html).not.toMatch(INTERDITS);
  });

  it("autres plats : 4 au plus, sans le plat lui-même", () => {
    const p = parNom("BURGER PATRON");
    const html = rendre(p);
    const autres = html.split("Autres plats de la catégorie")[1];

    expect(autres.match(/<article/g)).toHaveLength(4);
    expect(autres).not.toContain(`href="/fr/carte/${p.slug}"`);
  });

  it("plat composable de production rendu comme les autres", () => {
    const p = parNom("AGBÔLOR");

    expect(p.composable).toBe(true);
    expect(rendre(p)).toMatch(/<h1[^>]*>AGBÔLOR<\/h1>/);
  });

  it("photo à sa taille, ratio de la photo recadrée", () => {
    const wrap = parNom("CHICKEN SANDWICH");
    const html = rendre(wrap);

    expect(wrap.photo.recadree).toBe(true);
    expect(html).toContain(`--ratio:${wrap.photo.ratio}`);
    expect(html).not.toContain("object-cover");
  });

  it("API de test : mention « À emporter uniquement », plat sans catégorie connue", () => {
    const babatche = parNom("BABATCHÊ", TEST);

    expect(rendre(babatche, TEST)).toContain("À emporter uniquement");
    expect(rendre(babatche, TEST)).toContain("À retirer dans l&#x27;un de");
    const bascule = parNom("Plat test bascule", TEST);
    const html = rendre(bascule, TEST);

    expect(html.match(/<h1/g)).toHaveLength(1);
    // Seul plat de sa catégorie : pas de section « Autres plats ».
    expect(html).not.toContain("Autres plats de la catégorie");
  });

  it("modes de vente", () => {
    expect(mentionPlat({ modes: [] })).toBeNull();
    expect(mentionPlat({ modes: ["PICKUP", "TABLE"] })).toBe(
      "À emporter uniquement",
    );
    expect(servieSeulementSurPlace({ modes: ["TABLE"] })).toBe(true);
    expect(servieSeulementSurPlace({ modes: ["PICKUP"] })).toBe(false);
    expect(servieSeulementSurPlace({ modes: [] })).toBe(false);
  });
});

describe("créneau horaire et bouton de commande", () => {
  const creneau = { debut: "11:00", fin: "15:30" };

  it("texte fixe au rendu serveur, jamais l'état du moment dans le HTML", () => {
    const html = renderToStaticMarkup(
      <DisponibiliteHoraire creneau={creneau} />,
    );

    expect(texteCreneau(creneau).replaceAll(NBSP, " ")).toBe(
      "Disponible de 11 h à 15 h 30",
    );
    expect(html).toContain(`Disponible de 11${NBSP}h à 15${NBSP}h${NBSP}30`);
    expect(html).not.toContain("indisponible");
    expect(html).not.toContain("text-rouge");
  });

  it("« Choisir et commander » bloqué pour un plat servi seulement à table", () => {
    const bloque = renderToStaticMarkup(
      <BoutonCommanderPlat
        surPlaceSeulement
        plat={{ id: "x", creneau: null }}
      />,
    );
    const libre = renderToStaticMarkup(
      <BoutonCommanderPlat
        plat={{ id: "x", creneau }}
        surPlaceSeulement={false}
      />,
    );

    expect(bloque).toContain(' disabled=""');
    expect(libre).not.toContain(' disabled=""');
    expect(libre).toContain('aria-haspopup="dialog"');
  });
});

describe("retrait choisi sur la carte", () => {
  let memoire;

  beforeEach(() => {
    memoire = new Map();
    globalThis.window = {
      sessionStorage: {
        getItem: (k) => (memoire.has(k) ? memoire.get(k) : null),
        setItem: (k, v) => memoire.set(k, String(v)),
        removeItem: (k) => memoire.delete(k),
      },
    };
  });
  afterEach(() => {
    delete globalThis.window;
  });

  it("gardé le temps de l'onglet, oublié après 2 h ou sur demande", () => {
    memoriserRetraitDemande("sococe-2-plateaux", 1000);
    expect(lireRetraitDemande(1000 + 60_000)).toBe("sococe-2-plateaux");
    expect(lireRetraitDemande(1000 + 3 * 60 * 60 * 1000)).toBeNull();
    oublierRetraitDemande();
    expect(lireRetraitDemande(1000)).toBeNull();
  });

  it("slug illisible jamais gardé ; stockage bloqué sans erreur", () => {
    memoriserRetraitDemande("<script>", 1000);
    expect(lireRetraitDemande(1000)).toBeNull();
    expect(slugValide("zone-4")).toBe(true);
    expect(slugValide("Zone 4")).toBe(false);
    globalThis.window = {
      get sessionStorage() {
        throw new Error("bloqué");
      },
    };
    expect(() => memoriserRetraitDemande("angre")).not.toThrow();
    expect(lireRetraitDemande()).toBeNull();
  });

  it("message de la maquette, avec l'état d'un restaurant fermé", () => {
    const horaires = JSON.stringify(
      [1, 2, 3, 4, 5, 6, 7].map((j) => ({ [j]: "10:00-23:00" })),
    );
    // Lundi 5 octobre 2026, 8 h à Abidjan (UTC).
    const matin = new Date(Date.UTC(2026, 9, 5, 8, 0));
    const midi = new Date(Date.UTC(2026, 9, 5, 12, 0));
    const r = { slug: "angre", nom: "Angré", schedule: horaires };

    expect(messageRetrait(r, midi)).toBe(
      "Retrait à Angré. Choisissez vos plats, puis passez commande.",
    );
    expect(messageRetrait(r, matin).replaceAll(NBSP, " ")).toBe(
      "Retrait à Angré (fermé, ouvre à 10 h). Choisissez vos plats, puis passez commande.",
    );
  });
});

describe("composition d'un plat dans sa page (recette référencement, contenu)", () => {
  const { lignesComposition, phraseEpice } = require("./CompositionPlat");
  const N = " ";
  const detail = {
    spice_level: "OPTIONAL",
    groupes: [
      {
        id: "g1",
        name: "Sauce",
        description: null,
        min_select: 1,
        max_select: 1,
        position: 0,
        items: [
          {
            id: "a",
            label: "Barbecue",
            price_delta: 0,
            is_default: true,
            available: true,
            position: 0,
          },
          {
            id: "b",
            label: "Cheddar",
            price_delta: 500,
            is_default: false,
            available: true,
            position: 1,
          },
          {
            id: "c",
            label: "Pop corn",
            price_delta: 0,
            is_default: false,
            available: false,
            position: 2,
          },
        ],
      },
    ],
    supplements: [
      {
        id: "s1",
        name: "COCA",
        price: 1000,
        category: "DRINK",
        available_order_types: [],
        image: null,
        position: 0,
      },
      {
        id: "s2",
        name: "BARBECUE",
        price: 1000,
        category: "FOOD",
        available_order_types: [],
        image: null,
        position: 0,
      },
    ],
  };

  it("épicé, choix disponibles et suppléments par catégorie, avec leur prix", () => {
    expect(phraseEpice("OPTIONAL")).toBe(
      "Épicé ou non, au choix à la commande.",
    );
    expect(phraseEpice("NEVER")).toBeNull();
    expect(lignesComposition(detail)).toEqual([
      {
        titre: "Sauce (1 au choix)",
        texte: `Barbecue ou Cheddar (+500${N}FCFA)`,
      },
      { titre: "Sauces en supplément", texte: `Barbecue (+1${N}000${N}FCFA)` },
      { titre: "Boissons en supplément", texte: `Coca (+1${N}000${N}FCFA)` },
    ]);
  });

  it("rendu serveur : un titre h2, rien sans détail", () => {
    const { CompositionPlat } = require("./CompositionPlat");

    expect(renderToStaticMarkup(<CompositionPlat detail={null} />)).toBe("");
    const html = renderToStaticMarkup(<CompositionPlat detail={detail} />);

    expect(html).toContain(">Composition et choix</h2>");
    expect(html).toContain("Épicé ou non, au choix à la commande.");
  });
});
