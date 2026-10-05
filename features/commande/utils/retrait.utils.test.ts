// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import { creneauxRetrait, heureLisible, plageOuverte } from "./retrait.utils";

// Lundi 5 octobre 2026 ; Abidjan est à UTC+0.
const a = (h, m = 0, jour = 5) => new Date(Date.UTC(2026, 9, jour, h, m));
const TOUS_LES_JOURS = (plage) =>
  JSON.stringify([1, 2, 3, 4, 5, 6, 7].map((j) => ({ [j]: plage })));

describe("plageOuverte (règle du serveur)", () => {
  it("plage du jour, fermeture après minuit comprise", () => {
    const p = plageOuverte(TOUS_LES_JOURS("10:00-00:30"), a(23, 50));

    expect(p?.debut.toISOString()).toBe("2026-10-05T10:00:00.000Z");
    expect(p?.fin.toISOString()).toBe("2026-10-06T00:30:00.000Z");
    expect(plageOuverte(TOUS_LES_JOURS("10:00-00:30"), a(9, 59))).toBeNull();
  });

  it("la plage de la veille qui passe minuit ne compte pas (comme le serveur)", () => {
    expect(plageOuverte(TOUS_LES_JOURS("10:00-00:30"), a(0, 10, 6))).toBeNull();
  });
});

describe("creneauxRetrait", () => {
  it("par quart d'heure, du temps de préparation (20 min) à la fermeture", () => {
    const c = creneauxRetrait(TOUS_LES_JOURS("10:00-22:00"), a(20, 7));

    expect(c.map(heureLisible)).toEqual([
      "20h30",
      "20h45",
      "21h00",
      "21h15",
      "21h30",
      "21h45",
    ]);
  });

  it("au plus 40 créneaux, aucun quand le restaurant est fermé", () => {
    expect(
      creneauxRetrait(TOUS_LES_JOURS("00:00-23:59"), a(0, 0)),
    ).toHaveLength(40);
    expect(creneauxRetrait(TOUS_LES_JOURS("10:00-22:00"), a(23, 0))).toEqual(
      [],
    );
    expect(creneauxRetrait(null, a(12))).toEqual([]);
  });
});
