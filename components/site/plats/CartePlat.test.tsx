// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { CartePlat, PrixPlat } from "./CartePlat";

import { construireCarte, platsDeLaCarte } from "@/features/menus/carte";
// Instantané de production du 02/10, réduit aux champs lus par le site.
import platsProduction from "@/features/menus/tests/plats-production-0210.json";

const NBSP = " ";
const plats = platsDeLaCarte(construireCarte(platsProduction));
const parNom = (nom) => plats.find((p) => p.nom === nom);

describe("CartePlat", () => {
  it("plat en promotion (vitrine) : badge de remise, prix barré lu « Au lieu de », bouton sombre", () => {
    const plat = parNom("GBONHI MAX");
    const html = renderToStaticMarkup(
      <CartePlat plat={plat} variante="vitrine" />,
    );

    expect(html).toContain("<article");
    expect(html).toContain(`−6${NBSP}000${NBSP}FCFA`);
    expect(html).toContain(`<strong`);
    expect(html).toContain(`12${NBSP}000${NBSP}FCFA`);
    expect(html).toContain(
      `<s><span class="sr-only">Au lieu de </span>18${NBSP}000${NBSP}FCFA</s>`,
    );
    expect(html).toContain("bg-encre");
    // Texte alternatif exact : le nom du plat.
    expect(html).toContain(`alt="GBONHI MAX"`);
  });

  it("le nom et « Ajouter » mènent à la page du plat, sans préchargement", () => {
    const plat = parNom("BOX DE LA NATION");
    const html = renderToStaticMarkup(<CartePlat plat={plat} />);
    const liens = html.match(/<a [^>]*>/g) ?? [];

    expect(liens).toHaveLength(2);
    for (const a of liens) expect(a).toContain(`href="/fr/carte/${plat.slug}"`);
    expect(html).toContain(`aria-label="Ajouter BOX DE LA NATION, box"`);
    expect(html).toMatch(/<h3[^>]*><a [^>]*>BOX DE LA NATION<\/a><\/h3>/);
    // La fiche n'est pas branchée : aucun aria-haspopup.
    expect(html).not.toContain("aria-haspopup");
  });

  it("plat sans promotion : un seul prix, ni badge ni prix barré", () => {
    const plat = plats.find((p) => p.prixAvantPromo === null);
    const html = renderToStaticMarkup(<CartePlat plat={plat} />);

    expect(html).not.toContain("<s>");
    expect(html).not.toContain("−");
    expect(html).toContain("bg-orange");
  });

  it("description mise en forme (phrase et typo), titre au niveau demandé", () => {
    const plat = parNom("AGBÔLOR");
    const html = renderToStaticMarkup(
      <CartePlat niveauTitre="h2" plat={plat} />,
    );

    expect(html).toContain("<h2");
    expect(html).toContain(
      "Cinq morceaux de poulet pane (épicé ou non) + frite",
    );
  });

  it("photo recadrée : étiquette étoile dessinée ; photo de l'API : sans étiquette", () => {
    const recadree = plats.find((p) => p.photo.recadree && p.photo.etiquette);
    const api = { ...recadree, photo: { ...recadree.photo, etiquette: false } };

    const avec = renderToStaticMarkup(<CartePlat plat={recadree} />);
    const sans = renderToStaticMarkup(<CartePlat plat={api} />);

    expect(avec).toContain(`%2Fassets%2Fplats%2F${recadree.id}.webp`);
    expect(avec).toContain(`<span aria-hidden="true"></span>`);
    expect(sans).not.toContain(`<span aria-hidden="true"></span>`);
  });
});

describe("PrixPlat", () => {
  it("rend le prix seul hors promotion", () => {
    const html = renderToStaticMarkup(
      <PrixPlat plat={{ prix: 2500, prixAvantPromo: null }} />,
    );

    expect(html).toContain(`<strong>2${NBSP}500${NBSP}FCFA</strong>`);
    expect(html).not.toContain("<s>");
  });
});
