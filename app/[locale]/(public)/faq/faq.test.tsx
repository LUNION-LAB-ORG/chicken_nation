// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ListeFaq } from "./ListeFaq";
import { faqSchema, questionsFaq, texteReponse } from "./meta";

import { lireConfigFidelite } from "@/features/fidelite/fidelite.api";

// Valeurs de production du 03/10 (repli) et une configuration modifiée au backoffice.
const PRODUCTION = lireConfigFidelite(null);
const MODIFIEE = lireConfigFidelite({
  points_per_xof: 0.0005,
  point_value_in_xof: 25,
  minimum_redemption_points: 40,
  max_redemption_pct: 30,
  points_expiration_days: 180,
  premium_threshold: 800,
  gold_threshold: 1500,
  bonus_vip: 100,
  bonus_vvip: 250,
  is_active: true,
});

/** Texte visible du HTML : balises retirées (les liens restent dans leur phrase), entités décodées, blancs réduits. */
const texteVisible = (html) =>
  html
    .replace(/<\/?(a|span|strong|b)\b[^>]*>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ");

const reduit = (texte) => texte.replace(/\s+/g, " ").trim();

describe("FAQ : page et JSON-LD tirés du même tableau", () => {
  const rubriques = questionsFaq(PRODUCTION);
  const html = renderToStaticMarkup(<ListeFaq rubriques={rubriques} />);
  const visible = texteVisible(html);
  const schema = faqSchema(rubriques);

  it("chaque question et chaque ligne de réponse du JSON-LD est affichée mot pour mot", () => {
    const toutes = rubriques.flatMap((r) => r.questions);

    expect(schema.mainEntity).toHaveLength(toutes.length);
    for (const entite of schema.mainEntity) {
      expect(visible).toContain(reduit(entite.name));
      for (const ligne of entite.acceptedAnswer.text.split("\n"))
        expect(visible).toContain(reduit(ligne));
    }
  });

  it("le JSON-LD reprend les questions dans l'ordre de la page", () => {
    const ordre = rubriques.flatMap((r) => r.questions.map((q) => q.question));

    expect(schema.mainEntity.map((e) => e.name)).toEqual(ordre);
  });

  it("une rubrique (h2) par thème, un volet par question, aucun h1", () => {
    expect(html.match(/<h2/g)).toHaveLength(rubriques.length);
    expect(html.match(/<details/g)).toHaveLength(schema.mainEntity.length);
    expect(html).not.toContain("<h1");
  });

  it("seul numéro cité : le 27 21 71 21 30, toujours en lien tel:", () => {
    const numeros =
      JSON.stringify(schema).match(/(?:0[157]|2[157])(?:[\s ]?\d{2}){4}/g) ??
      [];

    expect(new Set(numeros.map((n) => n.replace(/\D/g, "")))).toEqual(
      new Set(["2721712130"]),
    );
    expect(html).toContain('href="tel:+2252721712130"');
    expect(html).not.toMatch(/href="tel:(?!\+2252721712130)/);
  });

  it("aucune promesse retirée par la retouche 2", () => {
    const tout = `${visible} ${JSON.stringify(schema)}`;

    expect(tout).not.toMatch(/[-\u2212]20 ?%/);
    expect(tout).not.toContain("arrive sur WhatsApp");
    expect(tout).not.toMatch(/3 ?000 cartes/);
    expect(tout).not.toMatch(/[\u2014\u2013]/);
  });
});

describe("FAQ : chiffres de fidélité lus dans la configuration", () => {
  const texteFidelite = (config) =>
    questionsFaq(config)
      .find((r) => r.id === "fidelite")
      .questions.map((q) => texteReponse(q.reponse))
      .join("\n")
      .replace(/[\u00a0\u202f]/g, " ");

  it("valeurs de production (repli)", () => {
    const t = texteFidelite(PRODUCTION);

    expect(t).toContain("1 point par tranche de 1 000 FCFA de plats");
    expect(t).toContain("1 point vaut 20 FCFA de réduction, dès 50 points");
    expect(t).toContain("jusqu'à 50 % du prix des plats");
    expect(t).toContain("valables 365 jours");
    expect(t).toContain("VIP à 700 points");
    expect(t).toContain("VVIP à 1 000");
    expect(t).toContain("150 points vous sont offerts en passant VIP, 200");
  });

  it("une configuration modifiée au backoffice change le texte", () => {
    const t = texteFidelite(MODIFIEE);

    expect(t).toContain("1 point par tranche de 2 000 FCFA de plats");
    expect(t).toContain("1 point vaut 25 FCFA de réduction, dès 40 points");
    expect(t).toContain("jusqu'à 30 % du prix des plats");
    expect(t).toContain("valables 180 jours");
    expect(t).toContain("VIP à 800 points");
    expect(t).toContain("VVIP à 1 500");
    expect(t).toContain("100 points vous sont offerts en passant VIP, 250");
  });
});
