// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "bun:test";

import { config as configProxy } from "../proxy";
import { dimensionsJpeg } from "../scripts/images-partage-plats.mjs";

import {
  COULEUR_THEME,
  ID_SITE_WEB,
  metadata,
  organizationSchema,
  viewport,
} from "./[locale]/meta";
import manifest from "./manifest";
import robots from "./robots";
import sitemap from "./sitemap";

import { baseURL } from "@/config/api";
import platsProduction from "@/features/menus/tests/plats-production-0210.json";
import photosRecadrees from "@/features/menus/data/photos-plats.json";
import { ID_ORGANISATION, TELEPHONE_SCHEMA } from "@/lib/seo/commun";

/**
 * Référencement global (lot L12) : graphe de l'organisation, métadonnées
 * communes, sitemap, robots, manifeste, fichiers des liens vers l'appli et
 * images de partage des plats.
 */

const RACINE = path.resolve(import.meta.dir, "..");
const SITE = "https://www.chicken-nation.com";

// Numéros de restaurant (retouche 6) : aucun ne doit sortir, sous aucune forme.
const NUMEROS_RESTAURANTS =
  /0720353535|0747000034|0700005556|0712853211|0720208352|07 ?20 ?35|07 ?47 ?00|07 ?00 ?00 ?55|07 ?12 ?85/;

describe("graphe JSON-LD de l'organisation et du site", () => {
  const texte = JSON.stringify(organizationSchema);
  const graphe = JSON.parse(texte)["@graph"];
  const organisation = graphe.find((n) => n["@type"] === "Organization");
  const site = graphe.find((n) => n["@type"] === "WebSite");

  it("publie l'organisation sous l'identifiant visé par les restaurants", () => {
    expect(organisation["@id"]).toBe(ID_ORGANISATION);
    expect(organisation["@id"]).toBe(`${SITE}/#organization`);
    expect(organisation.logo.url).toBe(`${SITE}/icon.png`);
    expect(existsSync(path.join(RACINE, "app", "icon.png"))).toBe(true);
  });

  it("un seul numéro, le 27 21 71 21 30, et aucun numéro de restaurant", () => {
    expect(organisation.contactPoint.telephone).toBe(TELEPHONE_SCHEMA);
    expect(organisation.telephone).toBeUndefined();
    expect(texte).not.toMatch(NUMEROS_RESTAURANTS);
    const numeros = texte.match(/\+225[\d ]+/g) ?? [];

    expect(new Set(numeros)).toEqual(new Set(["+225 27 21 71 21 30"]));
  });

  it("comptes du pied de page seulement, sans Twitter ni catalogue inventé", () => {
    expect(organisation.sameAs).toEqual([
      "https://www.facebook.com/chickennationabj",
      "https://www.instagram.com/chickennationabj/",
    ]);
    expect(texte).not.toMatch(/twitter|chickennationci|ChickenNationCI/i);
    expect(organisation.hasOfferCatalog).toBeUndefined();
    expect(texte).not.toMatch(/aggregateRating|Review/);
  });

  it("le site pointe vers l'accueil /fr et vers l'organisation", () => {
    expect(site["@id"]).toBe(ID_SITE_WEB);
    expect(site.url).toBe(`${SITE}/fr`);
    expect(site.publisher).toEqual({ "@id": ID_ORGANISATION });
  });
});

describe("métadonnées communes", () => {
  it("plus de og:phone_number ni de compte Twitter non vérifié", () => {
    expect(metadata.other?.["og:phone_number"]).toBeUndefined();
    expect(JSON.stringify(metadata)).not.toMatch(NUMEROS_RESTAURANTS);
    expect(metadata.twitter.site).toBeUndefined();
    expect(metadata.twitter.creator).toBeUndefined();
  });

  it("titre et description de l'accueil aux longueurs permises, en bonne typographie", () => {
    expect(metadata.title.default.length).toBeLessThanOrEqual(60);
    expect(metadata.description.length).toBeLessThanOrEqual(155);
    for (const t of [metadata.title.default, metadata.description]) {
      expect(t).not.toMatch(/[—–]/);
      // Insécable avant « : » et « % ».
      expect(t).not.toMatch(/ [:%]/);
    }
  });

  it("couleur de la marque dans le viewport", () => {
    expect(viewport.themeColor).toBe("#FD8127");
  });
});

describe("sitemap", () => {
  const fetchOrigine = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = fetchOrigine;
  });

  const RESTAURANTS = {
    data: [
      { id: "a", name: "CHICKEN NATION ZONE 4", entity_status: "ACTIVE" },
      { id: "b", name: "CHICKEN NATION ANGRE", entity_status: "ACTIVE" },
      { id: "c", name: "CHICKEN NATION ABOBO", entity_status: "INACTIVE" },
    ],
  };

  function api() {
    globalThis.fetch = async (url) => {
      const u = String(url);

      if (u === `${baseURL}/dishes`)
        return new Response(JSON.stringify(platsProduction));
      if (u.startsWith(`${baseURL}/restaurants`))
        return new Response(JSON.stringify(RESTAURANTS));

      return new Response("{}", { status: 404 });
    };
  }

  it("pages fixes, chaque plat et chaque restaurant actif, sans franchise ni ancienne carte", async () => {
    api();
    const entrees = await sitemap();
    const adresses = entrees.map((e) => e.url);

    expect(adresses.slice(0, 2)).toEqual([`${SITE}/fr`, `${SITE}/fr/carte`]);
    for (const chemin of [
      "/fr/restaurants",
      "/fr/histoire",
      "/fr/app-mobile",
      "/fr/carte-nation/adhesion",
      "/fr/faq",
      "/fr/contact",
      "/fr/privacy-rules",
      "/fr/deletion-of-account",
      "/fr/restaurants/zone-4",
      "/fr/restaurants/angre",
    ])
      expect(adresses).toContain(`${SITE}${chemin}`);
    expect(adresses).not.toContain(`${SITE}/fr/restaurants/abobo`);
    // Termes et conditions : modèle jamais rempli, hors du sitemap (recette SEO 1).
    expect(adresses).not.toContain(`${SITE}/fr/politique`);
    // Accueil et carte datés du plat modifié le plus récemment (recette SEO 9).
    const dates = entrees
      .filter((e) => e.url.startsWith(`${SITE}/fr/carte/`))
      .map((e) => e.lastModified)
      .filter(Boolean)
      .sort();

    expect(dates.length).toBeGreaterThan(0);
    expect(entrees[0].lastModified).toBe(dates[dates.length - 1]);
    expect(entrees[1].lastModified).toBe(dates[dates.length - 1]);

    const interdits =
      /franchise|nos-menus|confidentiality|commander|deep-link|download|dashboard|auth|\/(en|ar)\//;

    for (const a of adresses) expect(a).not.toMatch(interdits);
    expect(new Set(adresses).size).toBe(adresses.length);

    // Les 49 plats de production, chacun une fois (un plat en promotion
    // figure aussi dans sa catégorie).
    const plats = entrees.filter((e) => e.url.startsWith(`${SITE}/fr/carte/`));

    expect(plats).toHaveLength(platsProduction.length);
  });

  it("chaque plat : date de modification de l'API et photo en adresse complète", async () => {
    api();
    const entrees = await sitemap();
    const box = entrees.find((e) =>
      e.url.startsWith(`${SITE}/fr/carte/box-de-la-nation-`),
    );
    const source = platsProduction.find((p) => p.name === "BOX DE LA NATION");

    expect(box.lastModified).toBe(new Date(source.updated_at).toISOString());
    expect(box.images).toEqual([`${SITE}/assets/plats/${source.id}.webp`]);
    for (const e of entrees)
      for (const image of e.images ?? []) expect(image).toMatch(/^https:\/\//);
  });

  it("API injoignable : l'erreur remonte (Next garde le dernier sitemap valide)", async () => {
    globalThis.fetch = async () => new Response("", { status: 503 });
    await expect(sitemap()).rejects.toThrow();
  });
});

describe("robots", () => {
  const r = robots();

  it("plus de lignes pour le tableau de bord ni la connexion supprimés", () => {
    expect(r.rules.disallow).toEqual([
      "/api/",
      "/*/commander",
      "/*/app-mobile/deep-link",
      "/*/app-mobile/download",
    ]);
    expect(r.sitemap).toBe(`${SITE}/sitemap.xml`);
  });

  it("ne bloque ni les images optimisées ni les images de partage", () => {
    for (const regle of r.rules.disallow)
      expect(regle).not.toMatch(/_next|assets|partage/);
  });
});

describe("manifeste", () => {
  const m = manifest();

  it("nom, adresse de départ et couleurs de la marque", () => {
    expect(m.name).toBe("CHICKEN NATION");
    expect(m.short_name).toBe("Chicken Nation");
    expect(m.start_url).toBe("/fr");
    expect(m.theme_color).toBe(COULEUR_THEME);
    expect(m.background_color).toBe("#FFFCF7");
  });

  it("chaque icône existe, à la taille annoncée (plus aucune 404)", () => {
    for (const icone of m.icons) {
      // /icon.png est servie depuis app/, les autres depuis public/.
      const fichier =
        icone.src === "/icon.png"
          ? path.join(RACINE, "app", "icon.png")
          : path.join(RACINE, "public", icone.src);
      const octets = readFileSync(fichier);
      // En-tête PNG : largeur et hauteur aux octets 16 et 20.
      const taille = `${octets.readUInt32BE(16)}x${octets.readUInt32BE(20)}`;

      expect(taille).toBe(icone.sizes);
    }
  });
});

describe("liens universels de l'appli iOS", () => {
  const fichiers = [
    "public/.well-known/apple-app-site-association",
    "public/apple-app-site-association",
  ];

  it("même fichier JSON aux deux adresses, pour l'appli et ses chemins", () => {
    const [bienConnu, racine] = fichiers.map((f) =>
      readFileSync(path.join(RACINE, f), "utf8"),
    );

    expect(racine).toBe(bienConnu);
    const { applinks } = JSON.parse(bienConnu);
    const detail = applinks.details[0];

    expect(applinks.details).toHaveLength(1);
    expect(detail.appIDs).toEqual(["9KR55K67TG.com.chickennation.app"]);
    // La page d'ouverture est exclue, AVANT les jokers : ouverte par le lien
    // universel, l'appli ne lit que ?to et ?ref, et ?product, ?category ou
    // ?order l'ouvraient sans aller à l'écran visé (recette liens 3).
    expect(detail.components.map((c) => [c["/"], c.exclude === true])).toEqual([
      ["/fr/app-mobile/deep-link", true],
      ["/app-mobile/deep-link", true],
      ["/app-mobile/*", false],
      ["/fr/app-mobile/*", false],
    ]);
    // Ancienne forme, lue par iOS 12 et avant.
    expect(detail.appID).toBe("9KR55K67TG.com.chickennation.app");
    expect(detail.paths).toEqual([
      "NOT /fr/app-mobile/deep-link",
      "NOT /app-mobile/deep-link",
      "/app-mobile/*",
      "/fr/app-mobile/*",
    ]);
  });

  it("servis sans passer par proxy.ts (aucune redirection vers /fr)", () => {
    // Le motif du matcher, lu comme une expression régulière sur tout le chemin.
    const motif = new RegExp(`^${configProxy.matcher[0]}$`);

    expect(motif.test("/.well-known/apple-app-site-association")).toBe(false);
    expect(motif.test("/apple-app-site-association")).toBe(false);
    expect(motif.test("/.well-known/assetlinks.json")).toBe(false);
    for (const chemin of ["/", "/fr", "/carte", "/fr/app-mobile/deep-link"])
      expect(motif.test(chemin)).toBe(true);
    // Fichiers statiques à part ; une autre adresse avec un point passe par
    // proxy.ts et finit sur la 404 française (recette rendu 14).
    for (const chemin of [
      "/icon.png",
      "/robots.txt",
      "/sitemap.xml",
      "/manifest.webmanifest",
      "/assets/videos/presentation-540.mp4",
    ])
      expect(motif.test(chemin)).toBe(false);
    for (const chemin of [
      "/foo.php",
      "/wp-login.php",
      "/fr/carte/big-chicken-e6f76a",
    ])
      expect(motif.test(chemin)).toBe(true);
  });
});

describe("images de partage des plats", () => {
  const ids = Object.keys(photosRecadrees);

  it("une image par photo recadrée, 1200 × 630, moins de 150 ko", () => {
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      const fichier = path.join(
        RACINE,
        "public",
        "assets",
        "partage",
        "plats",
        `${id}.jpg`,
      );

      expect(statSync(fichier).size).toBeLessThan(150_000);
      expect(dimensionsJpeg(readFileSync(fichier))).toEqual({
        l: 1200,
        h: 630,
      });
    }
  });
});
