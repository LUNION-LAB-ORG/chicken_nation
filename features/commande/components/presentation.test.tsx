// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { versCommande } from "../utils/commande.utils";
import { signatureLigne } from "../utils/panier.utils";

import { ChoixEpice } from "./ChoixEpice";
import { LignePanierVue } from "./LignePanierVue";
import {
  lignesRecapDeCommande,
  lignesRecapDuPanier,
  RecapitulatifPhotos,
} from "./RecapitulatifPhotos";
import { Totaux } from "./Totaux";

const _ = " ";
// Le texte rendu, sans balises ni insécables, pour lire les phrases.
const texte = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/[  ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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
    if (section !== "[relire]")
      motifs.push(new RegExp(ligne.replace(/\s+@sauf\s+\S+$/, "")));
  }

  return motifs;
}
const sansInterdit = (html) => {
  const lisible = html.replace(/[   ]/g, " ");

  for (const m of motifsInterdits()) expect(lisible).not.toMatch(m);
};

const coca = {
  id: "coca",
  nom: "COCA",
  prix: 1000,
  quantite: 2,
  available_order_types: ["DELIVERY", "PICKUP"],
};
const glace = {
  id: "glace",
  nom: "GLACE VANILLE",
  prix: 1500,
  quantite: 1,
  available_order_types: ["PICKUP"],
};
const options = [
  { item_id: "frites", group_id: "g", label: "Frites", price_delta: 500 },
];
const LIGNE = {
  cle: signatureLigne("plat-test", false, options, [coca, glace]),
  dish_id: "plat-test",
  nom: "MENU À COMPOSER",
  image: "https://cdn.exemple.test/menu.jpg",
  prixUnitaire: 6000,
  epice: false,
  spice_level: "OPTIONAL",
  options,
  supplements: [coca, glace],
  quantite: 2,
  available_order_types: ["DELIVERY", "PICKUP"],
};

describe("LignePanierVue", () => {
  it("nom, choix, suppléments, prix unitaire, total et compteur", () => {
    const html = renderToStaticMarkup(
      <ul>
        <LignePanierVue
          ligne={LIGNE}
          onModifier={() => {}}
          onQuantite={() => {}}
          onRetirer={() => {}}
        />
      </ul>,
    );
    const t = texte(html);

    expect(t).toContain("MENU À COMPOSER");
    expect(t).toContain("Frites · Non épicé");
    expect(t).toContain("+ 2 Coca, 1 Glace vanille");
    expect(t).toContain("6 500 FCFA l'unité, suppléments 3 500 FCFA");
    expect(html).toContain(`16${_}500${_}FCFA`);
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Modifier MENU À COMPOSER"');
    expect(html).toContain('aria-label="Retirer MENU À COMPOSER"');
    // Cibles tactiles de 44 px pour le compteur.
    expect(html).toContain("[&amp;_button]:size-11");
    sansInterdit(html);
  });

  it("en livraison, la glace porte « à emporter uniquement » ; les problèmes sont écrits", () => {
    const html = renderToStaticMarkup(
      <ul>
        <LignePanierVue
          ligne={LIGNE}
          mode="DELIVERY"
          problemes={["Servi seulement de 11:00 à 15:00."]}
        />
      </ul>,
    );

    expect(texte(html)).toContain("Glace vanille : à emporter uniquement");
    expect(texte(html)).toContain("Servi seulement de 11:00 à 15:00.");
    // Lecture seule : ni compteur ni actions.
    expect(html).not.toContain('role="group"');
    expect(html).not.toContain("Modifier");
  });

  it("plat retiré du catalogue : signalé, sans total", () => {
    const html = renderToStaticMarkup(
      <ul>
        <LignePanierVue
          ligne={{ ...LIGNE, retire: true }}
          onRetirer={() => {}}
        />
      </ul>,
    );

    expect(texte(html)).toContain(
      "Ce plat n'est plus proposé. Il ne sera pas commandé.",
    );
    expect(html).not.toContain(`16${_}500`);
  });
});

describe("ChoixEpice", () => {
  it("obligatoire, sans valeur par défaut, insécable avant le point d'interrogation", () => {
    const html = renderToStaticMarkup(
      <ChoixEpice id="fiche" valeur={null} onChange={() => {}} />,
    );

    expect(html).toContain(`Épicé ou non${_}?`);
    expect(html).toContain("Obligatoire");
    expect(html).not.toContain("checked");
    expect(html).toContain('name="fiche-epice"');
  });

  it("erreur lue aussitôt et reliée au groupe", () => {
    const html = renderToStaticMarkup(
      <ChoixEpice
        erreur="Choisissez épicé ou non épicé pour continuer."
        id="cadeau-r1"
        valeur={false}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-describedby="cadeau-r1-epice-erreur"');
    expect(html).toMatch(
      /id="cadeau-r1-epice-non"[^>]*checked|checked[^>]*id="cadeau-r1-epice-non"/,
    );
  });
});

describe("Totaux", () => {
  it("livraison et frais de service inconnus : rien d'inventé", () => {
    const html = renderToStaticMarkup(
      <Totaux
        fraisService={null}
        livraison={null}
        mode="DELIVERY"
        nombreArticles={3}
        sousTotal={12500}
      />,
    );
    const t = texte(html);

    expect(t).toContain("Sous-total (3 articles) 12 500 FCFA");
    expect(t).toContain("Livraison Selon votre adresse");
    expect(t).toContain("Frais de service Calculés au paiement");
    expect(t).toContain("Total hors livraison et frais de service 12 500 FCFA");
  });

  it("remise, cadeaux, frais connus et taux", () => {
    const html = renderToStaticMarkup(
      <Totaux
        cadeaux={["WINGS"]}
        fraisService={130}
        livraison={1500}
        mode="DELIVERY"
        nombreArticles={1}
        remise={{ libelle: "Points de fidélité (100)", montant: 2000 }}
        sousTotal={12500}
        tauxFraisService={0.01}
      />,
    );
    const t = texte(html);

    expect(t).toContain("Points de fidélité (100) −2 000 FCFA");
    expect(t).toContain("Cadeaux WINGS Offert");
    expect(t).toContain("Frais de service (1 %) 130 FCFA");
    expect(t).toContain("Total 12 130 FCFA");
    expect(html).toContain(`1${_}%`);
  });

  it("retrait : 0 FCFA ; total du serveur s'il est connu", () => {
    const t = texte(
      renderToStaticMarkup(
        <Totaux
          fraisService={140}
          livraison={null}
          mode="PICKUP"
          nombreArticles={2}
          sousTotal={13500}
          total={13640}
        />,
      ),
    );

    expect(t).toContain("Retrait au restaurant 0 FCFA");
    expect(t).toContain("Total 13 640 FCFA");
    expect(t).not.toContain("hors");
  });
});

describe("RecapitulatifPhotos", () => {
  it("panier : lignes, plat offert à 0 F, supplément offert sur la première ligne", () => {
    const lignes = lignesRecapDuPanier(
      [LIGNE],
      [
        {
          id: "r1",
          type: "PLAT",
          articleId: "wings",
          nom: "WINGS",
          image: "",
          epice: true,
        },
        {
          id: "r2",
          type: "SUPPLEMENT",
          articleId: "eau",
          nom: "EAU",
          image: "",
        },
      ],
    );

    expect(lignes.map((l) => [l.nom, l.montant, l.offerts])).toEqual([
      ["MENU À COMPOSER", 16500, ["+ 1 Eau offert"]],
      ["WINGS", 0, ["Cadeau"]],
    ]);
    expect(lignes[1].choix).toBe("Épicé");
    // Jamais de cadeau seul.
    expect(
      lignesRecapDuPanier(
        [],
        [{ id: "r1", type: "PLAT", articleId: "w", nom: "W", image: "" }],
      ),
    ).toEqual([]);
  });

  it("commande enregistrée : cadeaux repérés, suppléments payants seuls en clair", () => {
    const commande = versCommande({
      id: "c1",
      order_items: [
        {
          dish_id: "box",
          quantity: 1,
          unit_price: 5000,
          line_total: 6000,
          epice: true,
          options: [],
          supplements: [
            { id: "coca", name: "COCA", quantity: 1, offert: false },
            { id: "eau", name: "EAU", quantity: 1, offert: true },
          ],
          dish: { name: "BOX", price: 5000, image: null },
        },
      ],
    });

    expect(lignesRecapDeCommande(commande)).toEqual([
      {
        cle: "c1-0",
        dish_id: "box",
        image: "",
        nom: "BOX",
        quantite: 1,
        choix: "Épicé",
        supplements: `+ 1${_}Coca`,
        montant: 6000,
        offerts: ["+ 1 Eau offert"],
      },
    ]);
  });

  it("colonne : titre, lieu, photos, totaux ; volet : résumé avec le total", () => {
    const lignes = lignesRecapDuPanier([LIGNE]);
    const colonne = renderToStaticMarkup(
      <RecapitulatifPhotos
        lieu={{
          titre: "Livraison",
          detail: "Cocody Angré, préparée à Angré (4,2 km)",
        }}
        lignes={lignes}
        note="Cette commande vous rapportera 16 points."
        totaux={
          <Totaux
            fraisService={null}
            livraison={null}
            mode="DELIVERY"
            nombreArticles={2}
            sousTotal={16500}
          />
        }
        variante="colonne"
      />,
    );

    expect(colonne).toContain('aria-label="Récapitulatif de la commande"');
    expect(colonne).toMatch(/<h2[^>]*>Récapitulatif<\/h2>/);
    expect(colonne).toContain("min-[1000px]:grid");
    expect(texte(colonne)).toContain("2 × MENU À COMPOSER");
    expect(colonne).toContain("<img");
    sansInterdit(colonne);

    const volet = renderToStaticMarkup(
      <RecapitulatifPhotos
        lignes={lignes}
        totalResume={16500}
        variante="volet"
      />,
    );

    expect(volet).toContain("<details");
    expect(volet).toContain("min-[1000px]:hidden");
    expect(texte(volet)).toMatch(/^Récapitulatif 16 500 FCFA/);
    expect(volet).toMatch(/<h2 class="[^"]*sr-only/);
  });
});
