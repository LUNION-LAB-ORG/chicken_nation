// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { auteurAvis, BlocAvis } from "./BlocAvis";

const avis = (id, message, rating, first_name, last_name) => ({
  id,
  message,
  rating,
  created_at: "2026-09-30T12:00:00.000Z",
  customer: {
    ...(first_name ? { first_name } : {}),
    ...(last_name ? { last_name } : {}),
  },
});

// Avis approuvés de production (contenu de la maquette), forme de GET /comments/bests.
const AVIS = [
  avis("1", "Bien chaud et bien épicé bon merci", 5, "JEAN EMMANUEL", "D"),
  avis(
    "2",
    "Parfait service Parfait\nLa dame au téléphone très accueillante",
    4,
    "abdel aziz",
    "C",
  ),
  avis("3", "Tout était bon : merci !", 5, "Marie-claire", null),
  avis("4", "Rapide", 0, null, null),
];

describe("auteurAvis", () => {
  it("prénom en capitales initiales, initiale du nom suivie d'un point", () => {
    expect(auteurAvis(AVIS[0])).toEqual({
      nom: "Jean Emmanuel D.",
      initiales: "JD",
    });
    expect(auteurAvis(AVIS[1])).toEqual({
      nom: "Abdel Aziz C.",
      initiales: "AC",
    });
    expect(auteurAvis(AVIS[2])).toEqual({
      nom: "Marie-Claire",
      initiales: "M",
    });
  });

  it("sans prénom ni nom : « Client »", () => {
    expect(auteurAvis(AVIS[3])).toEqual({ nom: "Client", initiales: "C" });
  });
});

describe("BlocAvis", () => {
  it("section masquée sans avis (base de test)", () => {
    expect(renderToStaticMarkup(<BlocAvis avis={[]} />)).toBe("");
  });

  it("étoiles lues « Note N sur 5 », citation typographiée, signature", () => {
    const html = renderToStaticMarkup(<BlocAvis avis={AVIS} />);

    expect(html).toContain(`id="avis"`);
    expect(html).toContain(`aria-labelledby="avis-titre"`);
    expect(html).toContain(">Avis clients</h2>");
    expect(html).toMatch(/aria-label="Note 5 sur 5"[^>]*role="img"/);
    expect(html).toMatch(/aria-label="Note 4 sur 5"[^>]*role="img"/);
    // Note absente ou nulle : au moins une étoile, jamais zéro.
    expect(html).toContain(`aria-label="Note 1 sur 5"`);
    expect(html).toContain("Tout était bon : merci !");
    expect(html).toContain("<figcaption>");
    expect(html).toContain("Jean Emmanuel D.");
    expect((html.match(/<li>/g) ?? []).length).toBe(4);
  });
});
