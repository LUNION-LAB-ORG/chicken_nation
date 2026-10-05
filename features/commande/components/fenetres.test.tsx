// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { choixInitiaux } from "../utils/fiche.utils";

import { ContenuFiche } from "./FichePlat";
import { ContenuTiroir } from "./TiroirPanier";

// Le texte rendu, sans balises ni insécables, pour lire les phrases.
const texte = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[  ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Motifs [html] et [texte] de scripts/interdits.txt (annexe A du plan).
function sansInterdit(html) {
  const lisible = html.replace(/[  ]/g, " ");
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
      expect(lisible).not.toMatch(
        new RegExp(ligne.replace(/\s+@sauf\s+\S+$/, "")),
      );
  }
}

const item = (id, label, prix = 0, extra = {}) => ({
  id,
  label,
  price_delta: prix,
  is_default: false,
  available: true,
  position: 0,
  ...extra,
});
const PLAT = {
  id: "29cd5e84-707d-4beb-8eb4-30e8f50b8a35",
  name: "MENU À COMPOSER",
  description: "Burger Patron (Sauce Au Choix) + Frites",
  image: "https://cdn.exemple.test/menu.jpg",
  prix: 6000,
  prixAvantPromo: 8500,
  spice_level: "OPTIONAL",
  available_order_types: ["DELIVERY", "PICKUP"],
  available_from: null,
  available_until: null,
  restaurantsExclus: [],
  groupes: [
    {
      id: "g-sauce",
      name: "SAUCE",
      description: "Une sauce maison",
      min_select: 1,
      max_select: 1,
      position: 0,
      items: [
        item("bbq", "BARBECUE", 0, { is_default: true }),
        item("cheddar", "Cheddar : fondu maison", 500),
      ],
    },
    {
      id: "g-acc",
      name: "Accompagnements",
      description: null,
      min_select: 0,
      max_select: 2,
      position: 1,
      items: [
        item("coleslaw", "Coleslaw"),
        item("frites", "Frites"),
        item("pop", "Pop corn", 0, { available: false }),
      ],
    },
  ],
  supplements: [
    {
      id: "coca",
      name: "COCA",
      price: 1000,
      category: "DRINK",
      available_order_types: ["DELIVERY", "PICKUP"],
      image: null,
      position: 0,
    },
    {
      id: "glace",
      name: "GLACE VANILLE",
      price: 1500,
      category: "DRINK",
      available_order_types: ["PICKUP"],
      image: null,
      position: 1,
    },
    {
      id: "bbq-s",
      name: "BARBECUE",
      price: 1000,
      category: "FOOD",
      available_order_types: ["DELIVERY", "PICKUP"],
      image: null,
      position: 0,
    },
  ],
};
const rien = () => {};
const fiche = (props = {}) =>
  renderToStaticMarkup(
    <ContenuFiche
      choix={choixInitiaux(props.plat ?? PLAT)}
      edition={false}
      fiche={{ plat: PLAT, categorie: "Box" }}
      maintenant={new Date("2026-10-05T12:00:00Z")}
      mode="DELIVERY"
      ouverts={new Set(["FOOD"])}
      surEpice={rien}
      surOption={rien}
      surQuantite={rien}
      surSupplement={rien}
      surValider={rien}
      tentative={false}
      {...props}
    />,
  );

describe("ContenuFiche", () => {
  it("tête : catégorie, nom (titre de la fenêtre), description, prix et remise", () => {
    const html = fiche();
    const t = texte(html);

    expect(html).toContain('id="fiche-nom"');
    expect(html).toContain('tabindex="-1"');
    expect(t).toContain("Box MENU À COMPOSER");
    // phrase() : « Une Majuscule Par Mot » remise en minuscules.
    expect(t).toContain("Burger Patron (sauce au choix) + frites");
    expect(t).toContain("6 000 FCFA Au lieu de 8 500 FCFA");
    expect(t).toContain("−2 500 FCFA");
    // Photo entière : texte alternatif exact, ratio transmis à la zone.
    expect(html).toContain('alt="MENU À COMPOSER"');
    expect(html).toContain("--ratio:1");
  });

  it("groupes : radio ou case, obligatoire ou facultatif, prix ou « Inclus », indisponible", () => {
    const html = fiche();
    const t = texte(html);

    expect(t).toContain("Sauce Obligatoire · 1 choix");
    expect(t).toContain("Une sauce maison");
    expect(html).toMatch(/type="radio"[^>]*name="fiche-groupe-g-sauce"/);
    expect(html).toMatch(/type="checkbox"[^>]*name="fiche-groupe-g-acc"/);
    // Choix par défaut coché.
    expect(html).toMatch(/id="fiche-option-bbq"[^>]*checked=""/);
    expect(t).toContain("Barbecue Inclus");
    expect(t).toContain("Cheddar Fondu maison +500 FCFA");
    expect(t).toContain("Accompagnements Facultatif · jusqu'à 2 choix");
    expect(t).toContain("Pop corn Indisponible pour le moment");
    expect(html).toMatch(/id="fiche-option-pop"[^>]*disabled=""/);
  });

  it("maximum atteint : les autres choix sont bloqués et l'aide s'affiche", () => {
    const choix = {
      ...choixInitiaux(PLAT),
      options: [
        { item_id: "bbq", group_id: "g-sauce", label: "", price_delta: 0 },
        { item_id: "coleslaw", group_id: "g-acc", label: "", price_delta: 0 },
        { item_id: "frites", group_id: "g-acc", label: "", price_delta: 0 },
      ],
    };
    const html = fiche({ choix });

    expect(texte(html)).toContain(
      "2 choix au maximum : décochez-en un pour changer.",
    );
    expect(html).not.toMatch(/id="fiche-option-frites"[^>]*disabled/);
  });

  it("épicé : choix obligatoire sans défaut, ou pastille imposée", () => {
    const html = fiche();

    expect(texte(html)).toContain("Épicé ou non ? Obligatoire");
    expect(html).not.toMatch(/id="fiche-epice-(oui|non)"[^>]*checked/);
    expect(
      texte(
        fiche({
          fiche: { plat: { ...PLAT, spice_level: "ALWAYS" }, categorie: null },
        }),
      ),
    ).toContain("Servi épicé");
    expect(
      texte(
        fiche({
          fiche: { plat: { ...PLAT, spice_level: "NEVER" }, categorie: null },
        }),
      ),
    ).toContain("Non épicé");
  });

  it("tentative incomplète : erreurs annoncées sur le groupe et l'épicé", () => {
    const choix = { ...choixInitiaux(PLAT), options: [] };
    const html = fiche({ choix, tentative: true });
    const t = texte(html);

    expect(t).toContain("Choisissez une option pour continuer.");
    expect(t).toContain("Choisissez épicé ou non épicé pour continuer.");
    expect(html.match(/role="alert"/g)).toHaveLength(2);
  });

  it("suppléments par catégorie, compteur, mention à emporter en livraison", () => {
    const choix = { ...choixInitiaux(PLAT), supplements: { coca: 2 } };
    const html = fiche({ choix, ouverts: new Set(["FOOD", "DRINK"]) });
    const t = texte(html);

    expect(t).toContain(
      "Suppléments Facultatif · comptés une fois pour cette ligne",
    );
    // Sauces avant boissons ; libellé de la catégorie du supplément.
    expect(t.indexOf("Sauces")).toBeLessThan(t.indexOf("Boissons"));
    expect(t).toContain("Boissons 2 au choix 2 choisis");
    expect(t).toContain("Coca +1 000 FCFA");
    expect(t).toContain("Glace vanille +1 500 FCFA À emporter uniquement");
    expect(html).toContain('aria-label="Quantité, Coca"');
    expect(t).toContain(
      "Les articles signalés ne se livrent pas : avec eux, la livraison n'est pas possible.",
    );
    // En retrait, aucune mention ni note.
    const retrait = texte(fiche({ choix, mode: "PICKUP" }));

    expect(retrait).not.toContain("À emporter uniquement");
    expect(retrait).not.toContain("Les articles signalés");
  });

  it("plat qui ne se vend pas dans le mode choisi : mention dans la tête", () => {
    const plat = { ...PLAT, available_order_types: ["PICKUP", "TABLE"] };

    expect(texte(fiche({ fiche: { plat, categorie: null } }))).toContain(
      "À emporter uniquement : ce plat se retire au restaurant",
    );
    expect(
      texte(fiche({ fiche: { plat, categorie: null }, mode: "PICKUP" })),
    ).not.toContain("uniquement :");
  });

  it("pied : « Ajouter » ou « Mettre à jour » avec le total en direct", () => {
    const choix = {
      ...choixInitiaux(PLAT),
      supplements: { coca: 1 },
      quantite: 2,
    };

    expect(texte(fiche({ choix }))).toContain("Ajouter 13 000 FCFA");
    expect(texte(fiche({ choix, edition: true }))).toContain(
      "Mettre à jour 13 000 FCFA",
    );
    expect(fiche({ choix })).toContain(
      'aria-label="Quantité, MENU À COMPOSER"',
    );
  });

  it("plat hors créneau ou servi sur place : ajout bloqué et expliqué", () => {
    const html = fiche({
      fiche: {
        plat: { ...PLAT, available_from: "18:00", available_until: "23:00" },
        categorie: null,
      },
    });

    expect(texte(html)).toContain("Ce plat est servi de 18 h à 23 h.");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*><span[^>]*>Ajouter</);
    expect(fiche()).not.toMatch(
      /<button[^>]*disabled=""[^>]*><span[^>]*>Ajouter</,
    );
  });

  it("aucun motif interdit", () => {
    sansInterdit(fiche());
  });
});

const ligne = (extra = {}) => ({
  cle: "l1",
  dish_id: PLAT.id,
  nom: "MENU À COMPOSER",
  image: "https://cdn.exemple.test/menu.jpg",
  prixUnitaire: 6000,
  epice: true,
  spice_level: "OPTIONAL",
  options: [],
  supplements: [],
  quantite: 2,
  available_order_types: ["DELIVERY", "PICKUP"],
  ...extra,
});
const tiroir = (props = {}) =>
  renderToStaticMarkup(
    <ContenuTiroir
      lignes={[ligne()]}
      maintenant={new Date("2026-10-05T12:00:00Z")}
      mode="DELIVERY"
      pointsParFranc={0.001}
      surFermer={rien}
      surMode={rien}
      surModifier={rien}
      surNavigation={rien}
      surPasserEnRetrait={rien}
      surQuantite={rien}
      surRetirer={rien}
      surRetirerHorsMode={rien}
      {...props}
    />,
  );

describe("ContenuTiroir", () => {
  it("tête, lignes, mode, sous-total, points estimés et « Passer commande »", () => {
    const html = tiroir();
    const t = texte(html);

    expect(html).toContain('id="panier-titre"');
    expect(t).toContain("Votre panier 2 articles, 12 000 FCFA");
    expect(html).toContain('aria-label="Fermer le panier"');
    expect(t).toContain("Modifier");
    expect(t).toContain("Retirer");
    expect(t).toContain("Livraison 20 à 35 min");
    expect(t).toContain("Retrait au restaurant");
    expect(html).toMatch(/id="tiroir-mode-livraison"[^>]*checked=""/);
    expect(t).toContain("Sous-total 12 000 FCFA");
    expect(t).toContain(
      "Adresse, code promo, points et cadeaux à l'étape suivante. Cette commande vous rapportera 12 points.",
    );
    expect(html).toMatch(/href="\/fr\/commander"/);
    expect(t).toContain("Passer commande");
    expect(t).not.toContain("Livraison impossible");
  });

  it("points inconnus ou sous 1 point : aucune promesse", () => {
    expect(texte(tiroir({ pointsParFranc: null }))).not.toContain("rapportera");
    expect(
      texte(tiroir({ lignes: [ligne({ prixUnitaire: 400, quantite: 1 })] })),
    ).not.toContain("rapportera");
  });

  it("alerte « à emporter » avec ses deux actions, en livraison seulement", () => {
    const lignes = [
      ligne({ nom: "BABATCHÊ", available_order_types: ["PICKUP", "TABLE"] }),
      ligne({
        cle: "l2",
        supplements: [
          {
            id: "glace",
            nom: "GLACE VANILLE",
            prix: 1500,
            quantite: 1,
            available_order_types: ["PICKUP"],
          },
        ],
      }),
    ];
    const html = tiroir({ lignes });
    const t = texte(html);

    expect(html).toContain('role="alert"');
    expect(t).toContain(
      "Livraison impossible avec : BABATCHÊ, Glace vanille. Ces articles se retirent au restaurant uniquement.",
    );
    expect(t).toContain("Passer en retrait");
    expect(t).toContain("Retirer ces articles");
    expect(texte(tiroir({ lignes: lignes.slice(0, 1) }))).toContain(
      "Cet article se retire au restaurant uniquement. Passer en retrait Retirer cet article",
    );
    expect(texte(tiroir({ lignes, mode: "PICKUP" }))).not.toContain(
      "Livraison impossible",
    );
  });

  it("panier vide : invitation à choisir sur la carte", () => {
    const html = tiroir({ lignes: [] });
    const t = texte(html);

    expect(t).toContain("Aucun plat pour le moment");
    expect(t).toContain("Votre panier est vide");
    expect(html).toMatch(/href="\/fr\/carte"/);
    expect(t).not.toContain("Passer commande");
  });

  it("aucun motif interdit", () => {
    sansInterdit(tiroir());
  });
});
