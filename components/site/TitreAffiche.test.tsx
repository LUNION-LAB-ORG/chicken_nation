// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { TitreAffiche } from "./TitreAffiche";

describe("TitreAffiche", () => {
  let espion;

  afterEach(() => espion?.mockRestore());

  it("rend un texte permis en police d'affiche, sans signalement", () => {
    espion = spyOn(console, "error").mockImplementation(() => {});
    const html = renderToStaticMarkup(
      <TitreAffiche id="t">Promotions du moment</TitreAffiche>,
    );

    expect(html).toContain("<h2");
    expect(html).toContain("font-affiche");
    expect(espion).not.toHaveBeenCalled();
  });

  it("signale un texte accentué et le rend en Poppins 800", () => {
    espion = spyOn(console, "error").mockImplementation(() => {});
    const html = renderToStaticMarkup(
      <TitreAffiche niveau="h1">Notre équipe</TitreAffiche>,
    );

    expect(html).toContain("<h1");
    expect(html).not.toContain("font-affiche");
    expect(html).toContain("font-extrabold");
    expect(espion).toHaveBeenCalledTimes(1);
    expect(String(espion.mock.calls[0][0])).toContain("Notre équipe");
  });
});
