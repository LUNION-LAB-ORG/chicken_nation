// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "bun:test";
import { createStore, Provider } from "jotai";
import { renderToStaticMarkup } from "react-dom/server";

import { BlocAppli } from "../appli/BlocAppli";
import { BarrePanier } from "../BarrePanier";
import { PiedDePage } from "../pied/PiedDePage";

import { BoutonPanier } from "./BoutonPanier";
import { Entete } from "./Entete";

import PublicLayout from "@/app/[locale]/(public)/layout";
import PageIntrouvable from "@/app/[locale]/(public)/not-found";
import { tiroirPanierBrancheAtom } from "@/features/commande/stores/interface.store";
import { panierAtom } from "@/features/commande/stores/panier.store";

const NBSP = " ";

// Motifs [html] et [texte] de scripts/interdits.txt (annexe A du plan).
function motifsInterdits() {
  const lignes = fs
    .readFileSync(path.join(process.cwd(), "scripts", "interdits.txt"), "utf8")
    .split("\n");
  const motifs = [];
  let section = "";

  for (const brute of lignes) {
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

const sansInsecables = (html) => html.replace(/[   ]/g, " ");

const ligne = (quantite, prix) => ({
  cle: `plat-${prix}`,
  dish_id: `plat-${prix}`,
  nom: "BOX DE LA NATION",
  image: "",
  prixUnitaire: prix,
  epice: false,
  options: [],
  supplements: [],
  quantite,
  available_order_types: [],
});

function avecPanier(element, lignes, { tiroirBranche = false } = {}) {
  const store = createStore();

  store.set(panierAtom, lignes);
  store.set(tiroirPanierBrancheAtom, tiroirBranche);

  return renderToStaticMarkup(<Provider store={store}>{element}</Provider>);
}

describe("mise en page publique", () => {
  const html = renderToStaticMarkup(
    <PublicLayout>
      <PageIntrouvable />
    </PublicLayout>,
  );

  it("aucune image préchargée par le gabarit (seulement l'image principale des pages)", () => {
    expect(html).not.toContain(`rel="preload"`);
  });

  it("lien « Aller au contenu » en premier, puis en-tête, contenu et pied de page", () => {
    const lien = html.indexOf(`href="#contenu"`);

    expect(lien).toBeGreaterThan(-1);
    expect(lien).toBeLessThan(html.indexOf("<header"));
    expect(html.indexOf("<header")).toBeLessThan(html.indexOf(`<main`));
    expect(html.indexOf("<main")).toBeLessThan(html.indexOf("<footer"));
    expect(html).toMatch(/<main [^>]*id="contenu"/);
    expect(html).toContain(`type="application/ld+json"`);
    // Zone lue par les lecteurs d'écran (Annonce).
    expect(html).toContain(`aria-live="polite"`);
  });

  it("page 404 : un seul h1, liens utiles, numéro unique", () => {
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
    expect(html).toContain(">Page introuvable</h1>");
    expect(html).toContain(`href="/fr/carte"`);
    expect(html).toContain(`href="/fr/restaurants"`);
    expect(html).toContain(`href="tel:+2252721712130"`);
  });

  it("aucun motif interdit (annexe A) ni numéro de restaurant", () => {
    // Sans le JSON-LD de l'organisation (meta.ts), refait au lot L12.
    const texte = sansInsecables(
      html.replace(/<script type="application\/ld\+json">.*?<\/script>/s, ""),
    );

    for (const motif of motifsInterdits()) expect(texte).not.toMatch(motif);
    for (const tel of texte.match(/href="tel:[^"]*"/g) ?? [])
      expect(tel).toBe(`href="tel:+2252721712130"`);
  });
});

describe("en-tête", () => {
  const html = renderToStaticMarkup(<Entete />);

  it("marque, navigation, numéro, Commander, panier et menu du téléphone", () => {
    expect(html).toContain(`aria-label="Chicken Nation, accueil"`);
    expect(html).toContain(`aria-label="Navigation principale"`);
    for (const href of [
      "/fr/carte",
      "/fr/restaurants",
      "/fr#avantages",
      "/fr/histoire",
      "/fr/commander/mes-commandes",
    ])
      expect(html).toContain(`href="${href}"`);
    expect(html).toContain(`href="tel:+2252721712130"`);
    expect(html).toContain(">Commander</a>");
    expect(html).toContain(`aria-controls="menu-mobile"`);
    expect(html).toContain(`aria-expanded="false"`);
    expect(html).toMatch(/hidden="" id="menu-mobile"/);
  });

  it("panier au rendu serveur : « Panier », sans compteur", () => {
    expect(html).toContain(`aria-label="Voir le panier, vide"`);
    expect(html).toContain(">Panier</span>");
    expect(html).toContain(`href="/fr/commander"`);
  });

  it("panier rempli : compteur, total et nom complet", () => {
    const panier = avecPanier(<BoutonPanier />, [
      ligne(2, 6000),
      ligne(1, 500),
    ]);

    expect(panier).toContain(
      `aria-label="Voir le panier, 3${NBSP}articles, 12${NBSP}500${NBSP}FCFA"`,
    );
    expect(panier).toContain(`>3</span>`);
    expect(panier).toContain(`>12${NBSP}500${NBSP}FCFA</span>`);
  });

  it("tiroir branché : bouton qui ouvre le panier au lieu du lien", () => {
    const panier = avecPanier(<BoutonPanier />, [ligne(1, 500)], {
      tiroirBranche: true,
    });

    expect(panier).toMatch(/^<button aria-haspopup="dialog"/);
    expect(panier).toContain(
      `aria-label="Ouvrir le panier, 1${NBSP}article, 500${NBSP}FCFA"`,
    );
  });
});

describe("barre du panier", () => {
  it("absente quand le panier est vide", () => {
    expect(avecPanier(<BarrePanier />, [])).toBe("");
  });

  it("visible avec un panier rempli, cale de hauteur comprise", () => {
    const barre = avecPanier(<BarrePanier />, [ligne(2, 3500)]);

    expect(barre).toContain(`aria-hidden="true"`);
    expect(barre).toContain(`href="/fr/commander"`);
    expect(barre).toContain(">Voir le panier</span>");
    expect(barre).toContain(`7${NBSP}000${NBSP}FCFA`);
  });

  it("un plat retiré du catalogue ne compte pas", () => {
    expect(
      avecPanier(<BarrePanier />, [{ ...ligne(1, 500), retire: true }]),
    ).toBe("");
  });
});

describe("pied de page", () => {
  const html = renderToStaticMarkup(<PiedDePage />);

  it("douze liens, numéro unique et mention LUNION-LAB dans un nouvel onglet", () => {
    for (const href of [
      "/fr/carte",
      "/fr/commander/mes-commandes",
      "/fr/restaurants",
      "/fr#avantages",
      "/fr/carte-nation/adhesion",
      "/fr/app-mobile",
      "/fr/histoire",
      "/fr/histoire#franchise",
      "/fr/contact",
      "/fr/faq",
      "/fr/politique",
      "/fr/deletion-of-account",
    ])
      expect(html).toContain(`href="${href}"`);
    expect(html).toContain(">La franchise est possible.</a>");
    expect(html).toMatch(
      /href="https:\/\/lunion-lab\.com" target="_blank" rel="noopener noreferrer"[^>]*>LUNION-LAB<span class="sr-only">, nouvel onglet<\/span><\/a>/,
    );
    expect(html).toContain(
      `© ${new Date().getFullYear()} Chicken Nation, Abidjan`,
    );
    expect(html.match(/href="tel:[^"]*"/g)).toEqual([
      `href="tel:+2252721712130"`,
    ]);
  });

  it("réseaux sociaux du site actuel (chickennationabj)", () => {
    expect(html).toContain(`href="https://www.facebook.com/chickennationabj"`);
    expect(html).toContain(
      `href="https://www.instagram.com/chickennationabj/?hl=fr"`,
    );
  });
});

describe("bloc Application", () => {
  const html = renderToStaticMarkup(<BlocAppli />);

  it("QR code, badges officiels, numéro unique", () => {
    expect(html).toContain(">La Nation dans votre poche</h2>");
    expect(html).toContain("/assets/site/qr-appli.svg");
    expect(html).toContain(`alt="Disponible sur Google Play"`);
    expect(html).toContain(`alt="Télécharger dans l&#x27;App Store"`);
    expect(html).toContain(`href="tel:+2252721712130"`);
  });

  it("aucun motif interdit", () => {
    for (const motif of motifsInterdits())
      expect(sansInsecables(html)).not.toMatch(motif);
  });
});
