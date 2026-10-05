// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import Connexion from "../Connexion";
import MesCadeaux from "../MesCadeaux";
import MesPoints from "../MesPoints";

import { BarreEtapes } from "./BarreEtapes";
import { EtapeLivraisonRetrait } from "./EtapeLivraisonRetrait";
import { AlerteMode, EtapePanier } from "./EtapePanier";
import { PiedEtape } from "./PiedEtape";
import {
  cadeauDemandeEpice,
  epiceDuCadeau,
  fenetreCreneau,
  heureCreneau,
  inconnusDuTotal,
  libelleTotal,
  obstacleAvantages,
  obstaclePanier,
  problemesSansMode,
  reglesPoints,
  textePlafond,
  textePreparation,
} from "./textes-caisse";

const _ = "\u00a0";
// Le texte rendu, sans balises ni insécables, pour lire les phrases.
const texte = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/[  ]/g, " ")
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
  const lisible = html.replace(/[   ]/g, " ");

  for (const m of motifsInterdits()) expect(lisible).not.toMatch(m);
};

const ligne = (x = {}) => ({
  cle: "box",
  dish_id: "11111111-1111-1111-1111-111111111111",
  nom: "BOX DE LA NATION",
  image: "",
  prixUnitaire: 6000,
  epice: true,
  options: [],
  supplements: [],
  quantite: 2,
  available_order_types: ["DELIVERY", "PICKUP"],
  spice_level: "OPTIONAL",
  ...x,
});

describe("textes de la caisse", () => {
  it("créneaux de retrait en fenêtre de 15 min, heure d'Abidjan", () => {
    expect(heureCreneau(new Date("2026-10-05T18:15:00Z"))).toBe(
      `18${_}h${_}15`,
    );
    expect(heureCreneau(new Date("2026-10-05T10:00:00Z"))).toBe(`10${_}h`);
    expect(fenetreCreneau(new Date("2026-10-05T18:15:00Z"))).toBe(
      `18${_}h${_}15 à 18${_}h${_}30`,
    );
    expect(fenetreCreneau(new Date("2026-10-05T23:45:00Z"))).toBe(
      `23${_}h${_}45 à minuit`,
    );
  });

  it("le total dit ce qu'il ne compte pas encore", () => {
    expect(libelleTotal(inconnusDuTotal("DELIVERY", null, 90))).toBe(
      "Total hors livraison",
    );
    expect(libelleTotal(inconnusDuTotal("DELIVERY", null, null))).toBe(
      "Total hors livraison et frais de service",
    );
    expect(libelleTotal(inconnusDuTotal("PICKUP", 0, null))).toBe(
      "Total hors frais de service",
    );
    expect(libelleTotal(inconnusDuTotal("DELIVERY", 1500, 90))).toBe("Total");
  });

  it("problèmes d'une ligne sans le mode (la mention et l'alerte s'en chargent)", () => {
    const emporter = ligne({ available_order_types: ["PICKUP"] });

    expect(problemesSansMode(emporter, "DELIVERY", new Date())).toEqual([]);
    const midi = ligne({ available_from: "11:00", available_until: "15:00" });

    expect(
      problemesSansMode(midi, "DELIVERY", new Date("2026-10-05T20:00:00Z")),
    ).toEqual(["Servi seulement de 11:00 à 15:00."]);
    expect(
      problemesSansMode(
        ligne({ choixManquant: "Sauce" }),
        "PICKUP",
        new Date(),
      )[0],
    ).toContain("Nouveau choix à faire");
  });

  it("obstacle de l'étape Panier", () => {
    expect(obstaclePanier({ aCommander: 2, lignesBloquees: [] })).toBeNull();
    expect(obstaclePanier({ aCommander: 0, lignesBloquees: [] })).toContain(
      "Ajoutez d'autres plats",
    );
    expect(obstaclePanier({ aCommander: 1, lignesBloquees: ["BOX"] })).toBe(
      `Corrigez ou retirez «${_}BOX${_}» pour continuer.`,
    );
  });

  it("épicé d'un plat offert : imposé par le plat ou choisi", () => {
    expect(epiceDuCadeau("ALWAYS", undefined)).toBe(true);
    expect(epiceDuCadeau("NEVER", true)).toBe(false);
    expect(epiceDuCadeau("OPTIONAL", undefined)).toBeUndefined();
    expect(epiceDuCadeau("OPTIONAL", false)).toBe(false);
    expect(cadeauDemandeEpice({ type: "PLAT" }, "OPTIONAL")).toBe(true);
    // Niveau inconnu (relecture impossible) : on demande plutôt que de supposer.
    expect(cadeauDemandeEpice({ type: "PLAT" }, undefined)).toBe(true);
    expect(cadeauDemandeEpice({ type: "PLAT" }, "ALWAYS")).toBe(false);
    expect(cadeauDemandeEpice({ type: "SUPPLEMENT" }, undefined)).toBe(false);
  });

  it("obstacle de l'étape Avantages", () => {
    expect(obstacleAvantages({ cadeauxBloques: [], sansEpice: [] })).toBeNull();
    expect(
      obstacleAvantages({ cadeauxBloques: [], sansEpice: ["BIG CHICKEN"] }),
    ).toBe("Choisissez épicé ou non épicé pour votre BIG CHICKEN offert.");
    expect(
      obstacleAvantages({ cadeauxBloques: ["COCA"], sansEpice: ["BIG"] }),
    ).toContain("COCA");
  });

  it("règles des points lues sur l'API, jamais écrites en dur", () => {
    expect(textePlafond(50)).toBe("la moitié");
    expect(textePlafond(30)).toBe(`30${_}%`);
    expect(
      reglesPoints({
        valeurPointTexte: `20${_}FCFA`,
        minimum: 100,
        plafondPct: 50,
        joursValidite: 365,
      }),
    ).toBe(
      `1${_}point = 20${_}FCFA. À partir de 100${_}points, et au plus la moitié du prix des plats. Valables 365${_}jours.`,
    );
    expect(
      reglesPoints({
        valeurPointTexte: `5${_}FCFA`,
        minimum: 0,
        plafondPct: 0,
        joursValidite: null,
      }),
    ).toBe(`1${_}point = 5${_}FCFA.`);
  });

  it("restaurant qui prépare la livraison", () => {
    expect(textePreparation("Angré", 4.2)).toBe(
      `Préparée au restaurant Angré, à 4,2${_}km`,
    );
    expect(textePreparation("Angré", null)).toBe(
      "Préparée au restaurant Angré",
    );
  });
});

describe("écrans de la caisse", () => {
  it("barre des étapes : l'étape 1 au premier rendu, rien d'autre de cliquable", () => {
    const html = renderToStaticMarkup(<BarreEtapes />);

    expect(html.match(/<button/g)).toHaveLength(5);
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('aria-label="Étape 1 sur 5, Panier"');
    expect(html.match(/disabled=""/g)).toHaveLength(5);
  });

  it("pied : total et libellé, retour seulement après l'étape 1", () => {
    const html = renderToStaticMarkup(
      <PiedEtape libelleTotal="Total hors livraison" total={18180}>
        <button type="button">Continuer</button>
      </PiedEtape>,
    );

    expect(texte(html)).toContain("Total hors livraison 18 180 FCFA");
    expect(html).not.toContain("Retour");
  });

  it("alerte de mode : deux sorties, ou une seule si le panier ne peut pas changer de mode", () => {
    const html = renderToStaticMarkup(
      <AlerteMode
        basculePossible
        mode="DELIVERY"
        noms={["BABATCHÊ"]}
        onBasculer={() => {}}
        onRetirer={() => {}}
      />,
    );

    expect(texte(html)).toContain("Livraison impossible avec : BABATCHÊ.");
    expect(texte(html)).toContain("Passer en retrait");
    expect(texte(html)).toContain("Retirer cet article");
    const seule = renderToStaticMarkup(
      <AlerteMode
        basculePossible={false}
        mode="PICKUP"
        noms={["A", "B"]}
        onBasculer={() => {}}
        onRetirer={() => {}}
      />,
    );

    expect(texte(seule)).not.toContain("Passer en");
    expect(texte(seule)).toContain("Retirer ces articles");
  });

  it("panier vide : retour à la carte", () => {
    const html = renderToStaticMarkup(
      <EtapePanier
        alerte={null}
        erreur={null}
        lignes={[]}
        mode="DELIVERY"
        pied={null}
        platsOfferts={[]}
        prixMisAJour={false}
        problemes={new Map()}
        revalidation={false}
        supplementsOfferts={new Map()}
        onQuantite={() => {}}
        onRetirer={() => {}}
        onVider={() => {}}
      />,
    );

    expect(texte(html)).toContain("Votre panier est vide");
    expect(html).toContain('href="/fr/carte"');
  });

  it("panier : plats, cadeau, « Modifier » seulement si la fiche est branchée", () => {
    const props = {
      alerte: null,
      erreur: "Corrigez ou retirez « BOX » pour continuer.",
      lignes: [ligne()],
      mode: "DELIVERY",
      pied: null,
      platsOfferts: [
        {
          id: "g",
          articleId: "x",
          nom: "BIG CHICKEN",
          image: "",
          epice: false,
        },
      ],
      prixMisAJour: true,
      problemes: new Map(),
      revalidation: false,
      supplementsOfferts: new Map([["box", ["COCA"]]]),
      onQuantite: () => {},
      onRetirer: () => {},
      onVider: () => {},
    };
    const sans = renderToStaticMarkup(<EtapePanier {...props} />);
    const avec = renderToStaticMarkup(
      <EtapePanier {...props} onModifier={() => {}} />,
    );

    expect(texte(sans)).not.toContain("Modifier");
    expect(texte(avec)).toContain("Modifier");
    expect(texte(avec)).toContain("Cadeau Gratte et Gagne");
    expect(texte(avec)).toContain("+ 1 Coca offert");
    expect(texte(avec)).toContain("Des prix ont changé");
    expect(avec).toContain('role="alert"');
    sansInterdit(avec);
  });

  it("retrait : état de chaque restaurant, créneaux en fenêtre, aucun numéro de restaurant", () => {
    const html = renderToStaticMarkup(
      <EtapeLivraisonRetrait
        adresse={null}
        alerte={null}
        connecte={false}
        detailAdresse={null}
        erreur={null}
        erreurRestaurants={false}
        grille={null}
        heure="2026-10-05T18:15:00.000Z"
        livraison={{ disponible: false, message: "Livraison coupée ce soir." }}
        mode="PICKUP"
        pied={null}
        restaurantId="a"
        restaurants={[
          {
            id: "a",
            nom: "Angré",
            adresse: "3897 Avenue Usher Assouan",
            photo: null,
            ouvert: true,
            etat: "Ouvert, ferme à minuit",
            absents: [],
            creneaux: [
              new Date("2026-10-05T18:15:00Z"),
              new Date("2026-10-05T18:30:00Z"),
            ],
          },
          {
            id: "b",
            nom: "Yopougon",
            adresse: null,
            photo: null,
            ouvert: false,
            etat: "Fermé, ouvre à 10 h",
            absents: ["BABATCHÊ"],
            creneaux: [],
          },
        ]}
        toutesFermees={false}
        onAdresse={() => {}}
        onHeure={() => {}}
        onMode={() => {}}
        onRestaurant={() => {}}
      />,
    );
    const t = texte(html);

    expect(t).toContain("Ouvert, ferme à minuit");
    expect(t).toContain("Ne propose pas : BABATCHÊ");
    expect(t).toContain("18 h 15 à 18 h 30");
    expect(t).toContain("Livraison coupée ce soir.");
    expect(t).toContain("Momentanément indisponible");
    expect(html).not.toMatch(/tel:(?!\+2252721712130)/);
    sansInterdit(html);
  });

  it("grille des frais seulement quand le serveur l'applique", () => {
    const base = {
      adresse: null,
      alerte: null,
      connecte: false,
      detailAdresse: null,
      erreur: null,
      erreurRestaurants: false,
      heure: null,
      livraison: { disponible: true, message: null },
      mode: "DELIVERY",
      pied: null,
      restaurantId: null,
      restaurants: [],
      toutesFermees: false,
      onAdresse: () => {},
      onHeure: () => {},
      onMode: () => {},
      onRestaurant: () => {},
    };
    const sans = texte(
      renderToStaticMarkup(<EtapeLivraisonRetrait {...base} grille={null} />),
    );
    const avec = texte(
      renderToStaticMarkup(
        <EtapeLivraisonRetrait
          {...base}
          grille={[
            { distanceMaxKm: 2, montant: 1000 },
            { distanceMaxKm: 4, montant: 1500 },
            { distanceMaxKm: null, montant: 5000 },
          ]}
        />,
      ),
    );

    expect(sans).toContain("Frais de livraison calculés selon votre adresse.");
    expect(sans).not.toContain("grille");
    expect(avec).toContain("Voir la grille des frais de livraison");
    expect(avec).toContain("Jusqu'à 2 km 1 000 FCFA");
    expect(avec).toContain("Au-delà de 4 km 5 000 FCFA");
  });

  it("connexion : bouton WhatsApp sur une ligne, aide sans faux numéro", () => {
    const html = renderToStaticMarkup(
      <Connexion integree onConnecte={() => {}} />,
    );

    expect(texte(html)).toContain("Recevoir mon code sur WhatsApp");
    expect(html).toContain("#i-whatsapp");
    expect(html).toContain("whitespace-nowrap");
    // Police calée sur la largeur du formulaire (requête de conteneur).
    expect(html).toContain("@container");
    expect(html).toContain("100cqw");
    expect(texte(html)).toContain(
      "Numéro ivoirien à 10 chiffres, qui commence par 07, 05 ou 01.",
    );
    expect(html).not.toContain('placeholder="');
    expect(html).not.toContain("autofocus");
    sansInterdit(html);
  });

  it("points : règles de l'API, maximum de la commande, rien sous le minimum", () => {
    const f = {
      valeurPoint: 20,
      minimum: 100,
      plafondPct: 50,
      pointsParFranc: 0.01,
      joursValidite: 365,
      solde: 600,
    };
    const html = texte(
      renderToStaticMarkup(
        <MesPoints
          avis={null}
          points={f}
          remise={0}
          retenus={0}
          sousTotal={31000}
          onRetirer={() => {}}
          onUtiliser={() => {}}
        />,
      ),
    );

    expect(html).toContain("600 points soit 12 000 FCFA");
    expect(html).toContain("À partir de 100 points");
    expect(html).toContain("jusqu'à 600 points, soit 12 000 FCFA");
    const petit = texte(
      renderToStaticMarkup(
        <MesPoints
          avis={null}
          points={f}
          remise={0}
          retenus={0}
          sousTotal={3000}
          onRetirer={() => {}}
          onUtiliser={() => {}}
        />,
      ),
    );

    expect(petit).toContain("Commande trop petite pour utiliser 100 points");
    expect(petit).not.toContain("Utiliser le maximum");
  });

  it("cadeaux : épicé demandé pour un plat offert ajouté", () => {
    const cadeau = {
      id: "r1",
      type: "PLAT",
      articleId: "d1",
      nom: "BIG CHICKEN offert",
      image: "",
      expireLe: "2026-12-31T00:00:00.000Z",
    };
    const html = texte(
      renderToStaticMarkup(
        <MesCadeaux
          actif
          cadeaux={[cadeau]}
          choisis={["r1"]}
          demandeEpice={() => true}
          epices={{}}
          erreurEpice="r1"
          problemes={new Map()}
          onBasculer={() => {}}
          onEpice={() => {}}
        />,
      ),
    );

    expect(html).toContain("BIG CHICKEN offert");
    expect(html).not.toContain("offert offert");
    expect(html).toContain("valable jusqu'au 31 décembre");
    expect(html).toContain("Épicé ou non, pour BIG CHICKEN ?");
    expect(html).toContain("Choisissez épicé ou non épicé.");
    expect(html).toContain("Retirer");
  });
});

describe("sources de la caisse", () => {
  const dossier = path.join(
    process.cwd(),
    "features/commande/components/caisse",
  );
  const sources = fs
    .readdirSync(dossier)
    .filter((f) => /\.tsx?$/.test(f) && !/\.test\./.test(f))
    .map((f) => fs.readFileSync(path.join(dossier, f), "utf8"));

  it("ni HeroUI ni lucide-react : composants du site seulement", () => {
    for (const s of sources) {
      expect(s).not.toMatch(/@heroui|lucide-react|framer-motion/);
    }
  });

  it("aucune aide de démonstration ni tiret cadratin", () => {
    for (const s of sources) {
      expect(s).not.toMatch(
        /NATION10|BON5000|07 00 00 00 00|Simulation|POSITION_DEMO/,
      );
      expect(s).not.toMatch(/[—–]/);
    }
  });
});
