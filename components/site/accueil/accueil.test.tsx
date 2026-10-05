// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Accroche, phraseRestaurants } from "./Accroche";
import {
  chiffresPoints,
  conditionsOffre,
  remiseOffre,
  texteNiveaux,
} from "./avantages.textes";
import { BandeInfos } from "./BandeInfos";
import { CommanderEnLigne } from "./CommanderEnLigne";
import { LaMarque } from "./LaMarque";
import { OffresDuMoment } from "./OffresDuMoment";
import { Promotions } from "./Promotions";
import { phraseCarte, TuilesCategories } from "./TuilesCategories";
import { VosAvantages } from "./VosAvantages";

import { lireConfigFidelite } from "@/features/fidelite/fidelite.api";
import { construireCarte, platEnVedette } from "@/features/menus/carte";
// Instantané de production du 02/10, réduit aux champs lus par le site.
import platsProduction from "@/features/menus/tests/plats-production-0210.json";

const NBSP = "\u00a0";

// GET /fidelity/loyalty/config : production (03/10) et base de test (05/10).
const PRODUCTION = lireConfigFidelite({
  points_per_xof: 0.001,
  points_expiration_days: 365,
  minimum_redemption_points: 50,
  point_value_in_xof: 20,
  max_redemption_pct: 50,
  bonus_vip: 150,
  bonus_vvip: 200,
  premium_threshold: 700,
  gold_threshold: 1000,
  is_active: true,
});
const BASE_TEST = lireConfigFidelite({
  points_per_xof: 0.01,
  points_expiration_days: 365,
  minimum_redemption_points: 100,
  point_value_in_xof: 20,
  max_redemption_pct: 50,
  bonus_vip: 150,
  bonus_vvip: 200,
  premium_threshold: 700,
  gold_threshold: 1000,
  is_active: true,
});

// Offres de la base de test (GET /fidelity/promotions/public, 05/10).
const OFFRE = {
  id: "585a0b64",
  title: "ESSAI PUBLIC visible 1",
  description: null,
  discount_type: "PERCENTAGE",
  discount_value: 10,
  min_order_amount: 5000,
  max_discount_amount: null,
  max_usage_per_user: 1,
  start_date: "2026-10-02T11:19:51.319Z",
  expiration_date: "2026-10-08T00:00:00.000Z",
  status: "ACTIVE",
};

const carte = construireCarte(platsProduction);
const sansInsecables = (texte) => texte.replace(/[\u00a0\u202f\u2009]/g, " ");
// Texte visible (balises retirées), comme le lit scripts/controle-site.mjs.
const texteVisible = (html) =>
  sansInsecables(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&#x27;|&apos;/g, "'")
      .replace(/&amp;/g, "&"),
  );

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

describe("Accroche", () => {
  it("un seul h1, seau préchargé avec son texte alternatif, numéro unique cliquable", () => {
    const html = renderToStaticMarkup(
      <Accroche nombreRestaurants={5} vedette={platEnVedette(carte)} />,
    );

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>.*Commandez.*votre poulet.*<\/h1>/);
    expect(html).toContain(
      `alt="Seau Chicken Nation 100${NBSP}% halal rempli de poulet pané"`,
    );
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain('href="tel:+2252721712130"');
    expect(html).toContain(`dans l&#x27;un de nos 5${NBSP}restaurants`);
    expect(html).toContain('href="/fr/carte"');
  });

  it("promotion du moment : la plus forte remise en francs (GBONHI MAX en production)", () => {
    const html = renderToStaticMarkup(
      <Accroche nombreRestaurants={5} vedette={platEnVedette(carte)} />,
    );

    expect(html).toContain("Promotion du moment");
    expect(html).toContain("GBONHI MAX");
    expect(html).toContain(`aria-label="Ajouter GBONHI MAX, `);
  });

  it("sans promotion : étiquette masquée ; le nombre de restaurants n'est jamais écrit en dur", () => {
    const html = renderToStaticMarkup(
      <Accroche nombreRestaurants={0} vedette={null} />,
    );

    expect(html).not.toContain("Promotion du moment");
    expect(phraseRestaurants(1)).toBe("dans notre restaurant");
    expect(phraseRestaurants(0)).toBe("dans nos restaurants");
    expect(html).toContain("dans nos restaurants.");
  });
});

describe("Promotions et tuiles de la carte", () => {
  const promotions = carte.find((c) => c.cle === "promotions").plats;

  it("une carte vitrine par plat en promotion, lien vers la section de la carte", () => {
    const html = renderToStaticMarkup(<Promotions plats={promotions} />);

    expect(html).toContain('id="promotions"');
    expect(html.match(/<article/g)).toHaveLength(promotions.length);
    expect(html).toContain(
      `${promotions.length}${NBSP}plats à prix réduit en ce moment.`,
    );
    expect(html).toContain('href="/fr/carte#promotions"');
  });

  it("section masquée sans promotion, ni carte", () => {
    expect(renderToStaticMarkup(<Promotions plats={[]} />)).toBe("");
    expect(renderToStaticMarkup(<TuilesCategories carte={[]} />)).toBe("");
  });

  it("8 tuiles dans l'ordre de la table, vers /fr/carte#clé, avec le nombre de plats", () => {
    const html = renderToStaticMarkup(<TuilesCategories carte={carte} />);
    const liens = [...html.matchAll(/href="\/fr\/carte#([a-z-]+)"/g)].map(
      (m) => m[1],
    );

    expect(liens).toEqual([
      "promotions",
      "box",
      "pane",
      "ailes",
      "burgers",
      "sandwichs",
      "nuggets",
      "combos",
    ]);
    expect(html).toContain(`9${NBSP}plats`);
    expect(phraseCarte(carte)).toMatch(
      new RegExp(`^\\d+${NBSP}plats, à partir de [\\d${NBSP}]+${NBSP}FCFA\\.`),
    );
  });
});

describe("Vos avantages", () => {
  it("chiffres de la configuration de production", () => {
    const html = renderToStaticMarkup(
      <VosAvantages config={PRODUCTION} offres={[]} />,
    );
    const texte = texteVisible(html);

    expect(html).toContain('id="avantages"');
    expect(texte).toContain("par tranche de 1 000 FCFA de plats");
    expect(texte).toContain("20 FCFA");
    expect(texte).toContain("dès 50 points");
    expect(texte).toContain("50 %");
    expect(texte).toContain("Points valables 365 jours");
    expect(texte).toContain(
      "VIP à 700 points gagnés dans l'année, VVIP à 1 000.",
    );
    expect(texte).toContain(
      "150 points offerts en passant VIP, 200 en passant VVIP.",
    );
    expect(html).toContain('href="/fr/carte-nation/adhesion"');
    expect(texte).not.toContain("Offres du moment");
  });

  it("chiffres de la base de test : rien n'est écrit en dur", () => {
    const [tranche, valeur, plafond] = chiffresPoints(BASE_TEST);

    expect(sansInsecables(tranche.texte)).toBe(
      "par tranche de 100 FCFA de plats, hors livraison",
    );
    expect(sansInsecables(valeur.texte)).toBe(
      "de réduction par point, dès 100 points",
    );
    expect(sansInsecables(plafond.fort)).toBe("50 %");
    expect(
      sansInsecables(texteNiveaux({ ...BASE_TEST, bonusVip: 0, bonusVvip: 0 })),
    ).toBe("VIP à 700 points gagnés dans l'année, VVIP à 1 000.");
  });

  it("offres du moment : remise, conditions et dernier jour valable", () => {
    expect(sansInsecables(remiseOffre(OFFRE))).toBe("10 % de remise");
    expect(
      sansInsecables(
        remiseOffre({ discount_type: "FIXED_AMOUNT", discount_value: 2000 }),
      ),
    ).toBe("2 000 FCFA de remise");
    expect(
      remiseOffre({ discount_type: "BUY_X_GET_Y", discount_value: 0 }),
    ).toBe("Offre spéciale");
    // Fin enregistrée à minuit : le dernier jour valable est la veille.
    expect(conditionsOffre(OFFRE).map(sansInsecables)).toEqual([
      "Dès 5 000 FCFA de commande",
      "Une fois par client",
      "Jusqu'au 7 octobre",
    ]);
    expect(
      conditionsOffre({
        ...OFFRE,
        max_discount_amount: 3000,
        max_usage_per_user: null,
        expiration_date: "2026-11-02T00:00:00.000Z",
      }).map(sansInsecables),
    ).toEqual([
      "Remise plafonnée à 3 000 FCFA",
      "Dès 5 000 FCFA de commande",
      "Jusqu'au 1er novembre",
    ]);

    const html = renderToStaticMarkup(<OffresDuMoment offres={[OFFRE]} />);

    expect(html).toContain("Offres du moment");
    expect(html).toContain("ESSAI PUBLIC visible 1");
    expect(renderToStaticMarkup(<OffresDuMoment offres={[]} />)).toBe("");
  });
});

describe("Textes de l'accueil", () => {
  const html = [
    renderToStaticMarkup(
      <Accroche nombreRestaurants={5} vedette={platEnVedette(carte)} />,
    ),
    renderToStaticMarkup(<BandeInfos />),
    renderToStaticMarkup(
      <Promotions plats={carte.find((c) => c.cle === "promotions").plats} />,
    ),
    renderToStaticMarkup(<TuilesCategories carte={carte} />),
    renderToStaticMarkup(<CommanderEnLigne />),
    renderToStaticMarkup(<LaMarque nombreRestaurants={5} />),
    renderToStaticMarkup(
      <VosAvantages
        config={PRODUCTION}
        offres={[OFFRE, { ...OFFRE, id: "b", discount_value: 20 }]}
      />,
    ),
  ].join("\n");
  const texte = texteVisible(html);

  it("aucun motif interdit (annexe A) : ni « -20 % », ni « 3 000 cartes », ni tiret cadratin", () => {
    for (const motif of motifsInterdits()) expect(texte).not.toMatch(motif);
    expect(texte).not.toMatch(/[-−]20 ?%/);
    expect(texte).not.toMatch(/3 ?000 cartes/);
  });

  it("insécable avant : ? ! ; et dans les montants", () => {
    const brut = html
      .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
      .replace(/<[^>]+>/g, "");

    expect(brut).not.toMatch(/ [:?!;]/);
    expect(brut).not.toMatch(/\d [%]|\d FCFA/);
  });

  it("la vidéo réencodée, avec affiche, sans lecture automatique au rendu", () => {
    const marque = renderToStaticMarkup(<LaMarque nombreRestaurants={5} />);

    expect(marque).toContain('id="la-marque"');
    expect(marque).toContain('src="/assets/videos/presentation-540.mp4"');
    expect(marque).toContain(
      'poster="/assets/videos/presentation-affiche.webp"',
    );
    expect(marque).toContain('preload="none"');
    expect(marque).not.toMatch(/<video[^>]*autoplay/i);
    expect(marque).toContain('aria-describedby="la-marque-video"');
    expect(marque).toContain('href="/fr/histoire"');
  });
});
