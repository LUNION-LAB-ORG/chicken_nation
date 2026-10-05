// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "bun:test";

/**
 * Retouche du client (05/10) : aucun numéro de restaurant dans la commande
 * (suivi, mes commandes, caisse, retrait). Seul le 27 21 71 21 30 s'affiche,
 * et aucun faux numéro d'exemple (07 00 00 00 00) ne sert d'aide.
 */

const RACINES = ["features/commande", "app/[locale]/(public)/commander"];

function fichiers(dossier) {
  return fs.readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const chemin = path.join(dossier, e.name);

    if (e.isDirectory()) return fichiers(chemin);

    return /\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)
      ? [chemin]
      : [];
  });
}

// Numéros de la section [html] de scripts/interdits.txt (anciens numéros, faux numéro d'exemple).
const NUMEROS = fs
  .readFileSync(path.join(process.cwd(), "scripts", "interdits.txt"), "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => /^0[\d ]+$/.test(l))
  .map((l) => new RegExp(l));

describe("numéros dans la commande", () => {
  const sources = RACINES.flatMap((r) =>
    fichiers(path.join(process.cwd(), r)),
  ).map((f) => [f, fs.readFileSync(f, "utf8").replace(/[  ]/g, " ")]);

  it("aucun ancien numéro ni faux numéro d'exemple", () => {
    expect(NUMEROS.length).toBeGreaterThan(5);
    for (const [f, s] of sources)
      for (const n of NUMEROS) expect(`${f} ${n.test(s)}`).toBe(`${f} false`);
  });

  it("aucun numéro de restaurant affiché ni gardé", () => {
    for (const [f, s] of sources) {
      expect(
        `${f} ${/restaurant\??\.phone|Appelez le restaurant|appelez le restaurant/.test(s)}`,
      ).toBe(`${f} false`);
    }
  });

  it("le suivi donne le 27 21 71 21 30, en lien tel:", () => {
    const suivi = fs.readFileSync(
      path.join(
        process.cwd(),
        "features/commande/components/SuiviCommande.tsx",
      ),
      "utf8",
    );

    expect(suivi).toContain("telLien()");
    expect(suivi).toContain("TELEPHONE");
  });
});
