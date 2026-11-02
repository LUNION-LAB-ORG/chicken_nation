// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  CLE_BROUILLON,
  SAISIE_VIDE,
  ecranPrecedent,
  envoiDepuisSaisie,
  lireBrouillon,
  numeroEtape,
  texteBrouillon,
} from "../utils/parcours-avis";

import { EcranExperience } from "./EcranExperience";
import { EcranMerci } from "./EcranMerci";
import { EcranNumero } from "./EcranNumero";
import { EcranPresentation } from "./EcranPresentation";
import { ParcoursAvis } from "./ParcoursAvis";

const _ = " ";
const rien = () => {};
const MASCOTTE = (
  // eslint-disable-next-line @next/next/no-img-element -- image factice du test.
  <img
    alt="Le Champion, mascotte Chicken Nation"
    src="/assets/site/champion-blanc.png"
  />
);
const STORES = [
  { id: "6b1e3f4a-2c5d-4e6f-8a9b-0c1d2e3f4a5b", nom: "Marcory Zone 4" },
  { id: "7c2f4a5b-3d6e-4f70-9bac-1d2e3f4a5b6c", nom: "Angré" },
];

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

/** Texte rendu, sans balises ni insécables. */
const texte = (html) =>
  html
    // Liens et passages en ligne gardés dans leur phrase.
    .replace(/<\/?(a|span|b|strong)\b[^>]*>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[   ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sansInterdit = (html) => {
  const lisible = html.replace(/[   ]/g, " ");

  for (const m of motifsInterdits()) expect(lisible).not.toMatch(m);
};

const niveaux = (html) =>
  [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));

const presentation = (props = {}) =>
  renderToStaticMarkup(
    <EcranPresentation mascotte={MASCOTTE} onCommencer={rien} {...props} />,
  );
const experience = (props = {}) =>
  renderToStaticMarkup(
    <EcranExperience
      erreurs={{}}
      saisie={SAISIE_VIDE}
      stores={STORES}
      onChanger={rien}
      onContinuer={rien}
      onRetour={rien}
      {...props}
    />,
  );
const numero = (props = {}) =>
  renderToStaticMarkup(
    <EcranNumero
      echec={null}
      envoi={false}
      erreurs={{}}
      saisie={SAISIE_VIDE}
      onChanger={rien}
      onEnvoyer={rien}
      onRetour={rien}
      {...props}
    />,
  );
const merci = (ressenti, accordRappel) =>
  renderToStaticMarkup(
    <EcranMerci
      accordRappel={accordRappel}
      mascotte={MASCOTTE}
      ressenti={ressenti}
    />,
  );

describe("enchaînement des quatre écrans", () => {
  it("la page s'ouvre sur la présentation", () => {
    const html = renderToStaticMarkup(
      <ParcoursAvis mascotte={MASCOTTE} stores={STORES} />,
    );

    expect(html).toBe(presentation());
  });

  it("Retour : étape 2 → étape 1 → présentation ; ni retour sur la présentation ni sur le merci", () => {
    expect(ecranPrecedent("numero")).toBe("experience");
    expect(ecranPrecedent("experience")).toBe("presentation");
    expect(ecranPrecedent("presentation")).toBeNull();
    expect(ecranPrecedent("merci")).toBeNull();
    expect(numeroEtape("experience")).toBe(1);
    expect(numeroEtape("numero")).toBe(2);
    expect(numeroEtape("merci")).toBeNull();

    expect(presentation()).not.toContain('aria-label="Retour"');
    expect(experience()).toContain('aria-label="Retour"');
    expect(numero()).toContain('aria-label="Retour"');
    expect(merci("AU_TOP", false)).not.toContain('aria-label="Retour"');
  });

  it("un seul h1 par écran, qui reçoit le focus au changement d'écran", () => {
    for (const html of [
      presentation(),
      experience(),
      numero(),
      merci("PAS_CONTENT", true),
    ]) {
      expect(niveaux(html).filter((n) => n === 1)).toHaveLength(1);
      expect(html).toMatch(/<h1[^>]*id="avis-titre"[^>]*tabindex="-1"/);
      sansInterdit(html);
    }
  });
});

describe("écran 1 : présentation", () => {
  const html = presentation();
  const t = texte(html);

  it("mascotte, titre, promesse de discrétion et bouton", () => {
    expect(html).toContain('alt="Le Champion, mascotte Chicken Nation"');
    expect(t).toContain("MÊME LE CHAMPION SE TROMPE PARFOIS");
    expect(t).toContain("Ton avis compte.");
    expect(t).toContain(
      "Ton message reste privé. Il n'est jamais publié sur le site. Notre équipe le lit et te rappelle si quelque chose ne va pas.",
    );
    expect(t).toContain("Donner mon avis");
    expect(t).toContain("Ça prend moins de 2 minutes.");
  });
});

describe("écran 2 : ton expérience", () => {
  it("trois ressentis, aucun choisi d'avance, dans l'ordre de la maquette", () => {
    const html = experience();

    expect(texte(html)).toContain("Étape 1 sur 2 TON EXPÉRIENCE");
    expect(texte(html)).toContain(
      "Comment s'est passée ta dernière expérience ?",
    );
    const radios = [...html.matchAll(/<input[^>]*type="radio"[^>]*>/g)].map(
      (m) => m[0],
    );

    expect(radios).toHaveLength(3);
    for (const r of radios) expect(r).not.toContain("checked");
    expect(
      [...html.matchAll(/for="avis-ressenti-[A-Z_]+"[^>]*>([^<]+)</g)].map(
        (m) => m[1],
      ),
    ).toEqual(["Au top", "Peut mieux faire", "Pas content"]);
  });

  it("le ressenti choisi est coché", () => {
    const html = experience({
      saisie: { ...SAISIE_VIDE, ressenti: "PEUT_MIEUX_FAIRE" },
    });

    const choisi = (code) =>
      html.match(new RegExp(`<input[^>]*id="avis-ressenti-${code}"[^>]*>`))[0];

    expect(choisi("PEUT_MIEUX_FAIRE")).toContain('checked=""');
    expect(choisi("AU_TOP")).not.toContain("checked");
    expect(choisi("PAS_CONTENT")).not.toContain("checked");
  });

  it("canal : « Choisir » vide puis les six canaux", () => {
    const html = experience();
    const canal = html.match(
      /<select[^>]*id="avis-canal"[\s\S]*?<\/select>/,
    )[0];

    expect(
      [...canal.matchAll(/<option value="([^"]*)"[^>]*>([^<]+)</g)].map((m) => [
        m[1],
        m[2],
      ]),
    ).toEqual([
      ["", "Choisir"],
      ["APPLI", "Appli Chicken Nation"],
      ["SITE_WEB", "Site web"],
      ["TELEPHONE", "Téléphone"],
      ["WHATSAPP", "WhatsApp"],
      ["SUR_PLACE", "Sur place en store"],
      ["AUTRE_PLATEFORME", "Autre plateforme"],
    ]);
  });

  it("store : « Je ne sais pas » puis les restaurants reçus de l'API, rien d'écrit à la main", () => {
    const store = (stores) =>
      [
        ...experience({ stores })
          .match(/<select[^>]*id="avis-store"[\s\S]*?<\/select>/)[0]
          .matchAll(/<option value="([^"]*)"[^>]*>([^<]+)</g),
      ].map((m) => [m[1], m[2]]);

    expect(store(STORES)).toEqual([
      ["", "Je ne sais pas"],
      [STORES[0].id, "Marcory Zone 4"],
      [STORES[1].id, "Angré"],
    ]);
    // API en panne : la page passe une liste vide, le formulaire reste utilisable.
    expect(store([])).toEqual([["", "Je ne sais pas"]]);
  });

  it("commentaire de 1 000 caractères au plus, compteur « 0 / 1 000 »", () => {
    const html = experience();

    expect(html).toMatch(/<textarea[^>]*maxLength="1000"/);
    expect(html).toContain(
      `placeholder="Raconte-nous ce qui s&#x27;est passé. Plus tu es précis, plus on pourra t&#x27;aider."`,
    );
    expect(html).toContain(`0${_}/${_}1${_}000`);
    expect(
      experience({ saisie: { ...SAISIE_VIDE, commentaire: "Froid." } }),
    ).toContain(`6${_}/${_}1${_}000`);
  });

  it("erreurs affichées et lues aussitôt", () => {
    const html = experience({
      erreurs: {
        ressenti: "Choisis ton ressenti.",
        canal: "Choisis comment tu avais commandé.",
        commentaire: "Raconte-nous ce qui s'est passé.",
      },
    });

    expect(html.match(/role="alert"/g)).toHaveLength(3);
    expect(html).toContain('aria-describedby="avis-ressenti-erreur"');
    expect(texte(html)).toContain("Choisis ton ressenti.");
  });
});

describe("écran 3 : pour qu'on puisse te retrouver", () => {
  it("numéro +225 de type tel, sans exemple de numéro, prénom facultatif", () => {
    const html = numero();

    expect(texte(html)).toContain(
      "Étape 2 sur 2 POUR QU'ON PUISSE TE RETROUVER",
    );
    expect(html).toMatch(/<input[^>]*type="tel"[^>]*>/);
    const tel = html.match(/<input[^>]*id="avis-telephone"[^>]*>/)[0];

    expect(tel).toContain('inputMode="tel"');
    expect(tel).toContain('autoComplete="tel-national"');
    expect(tel).not.toMatch(/ placeholder="/);
    expect(texte(html)).toContain("+225");
    expect(texte(html)).toContain(
      "Le numéro que tu utilises sur l'appli ou au téléphone.",
    );
    expect(texte(html)).toContain("Ton prénom (facultatif)");
    expect(html).toContain(`placeholder="Ex.${_}: Awa"`);
    expect(html).toMatch(
      /<input[^>]*autoComplete="given-name"[^>]*maxLength="60"/,
    );
  });

  it("case d'accord de rappel jamais cochée d'avance", () => {
    const html = numero();
    const caseRappel = html.match(/<input[^>]*id="avis-rappel"[^>]*>/)[0];

    expect(caseRappel).toContain('type="checkbox"');
    expect(caseRappel).not.toContain("checked");
    expect(texte(html)).toContain(
      "J'accepte d'être rappelé par l'équipe Chicken Nation",
    );
    expect(
      numero({ saisie: { ...SAISIE_VIDE, accordRappel: true } }).match(
        /<input[^>]*id="avis-rappel"[^>]*>/,
      )[0],
    ).toContain('checked=""');
  });

  it("bouton désactivé et occupé pendant l'envoi", () => {
    const pret = numero().match(
      /<button[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/,
    )[0];
    const occupe = numero({ envoi: true }).match(
      /<button[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/,
    )[0];

    expect(pret).not.toMatch(/ disabled=""/);
    expect(pret).not.toContain("aria-busy");
    expect(texte(pret)).toBe("Envoyer mon avis");
    expect(occupe).toContain('disabled=""');
    expect(occupe).toContain('aria-busy="true"');
    expect(texte(occupe)).toBe("Envoi en cours…");
  });

  it("champ piège caché, mention de suppression avec le numéro public", () => {
    const html = numero();

    expect(html).toMatch(/<div hidden="">[\s\S]*name="site_web"/);
    expect(texte(html)).toContain(
      "Ton avis reste privé et n'est utilisé que pour traiter ton retour. Pour le faire supprimer : 27 21 71 21 30.",
    );
    expect(html).toContain('href="tel:+2252721712130"');
  });

  it("échec de l'envoi dit simplement", () => {
    const html = numero({
      echec: "Trop d'envois depuis cette connexion. Réessaie dans 15 minutes.",
    });

    expect(html).toContain('role="alert"');
    expect(texte(html)).toContain(
      "Trop d'envois depuis cette connexion. Réessaie dans 15 minutes.",
    );
  });
});

describe("écran 4 : merci selon le ressenti et l'accord", () => {
  it("pas content avec accord : excuses et rappel sous 24 h", () => {
    const t = texte(merci("PAS_CONTENT", true));

    expect(t).toContain("ON EST DÉSOLÉS");
    expect(t).toContain(
      "Ton message est bien arrivé. Un membre de l'équipe te rappelle sous 24 h pour trouver une solution.",
    );
  });

  it("sans accord de rappel : jamais de promesse de rappel", () => {
    for (const ressenti of ["PAS_CONTENT", "PEUT_MIEUX_FAIRE", "AU_TOP"]) {
      const t = texte(merci(ressenti, false));

      expect(t).not.toMatch(/24 h|rappelle/);
    }
    expect(texte(merci("PAS_CONTENT", false))).toContain(
      "Ton message est bien arrivé. L'équipe le lit et s'en occupe.",
    );
  });

  it("peut mieux faire et au top : leur propre titre", () => {
    expect(texte(merci("PEUT_MIEUX_FAIRE", true))).toContain(
      "MERCI POUR TA FRANCHISE On regarde ce qui s'est passé et on s'améliore.",
    );
    expect(texte(merci("AU_TOP", true))).toContain(
      "MERCI ! Ton message va droit au cœur de l'équipe. Tu fais partie de la Nation.",
    );
  });

  it("carte commune : appli, site, numéros publics et retour à l'accueil", () => {
    const html = merci("AU_TOP", false);
    const t = texte(html);

    expect(t).toContain("En attendant, ton Chicken est toujours là :");
    expect(html).toContain('href="/fr/app-mobile"');
    expect(t).toContain("Appli Chicken Nation");
    expect(t).toContain("chicken-nation.com");
    expect(t).toContain("27 21 71 21 30");
    expect(t).toContain("07 07 58 14 10 / 11");
    expect([...html.matchAll(/href="(tel:[^"]+)"/g)].map((m) => m[1])).toEqual([
      "tel:+2252721712130",
      "tel:+2250707581410",
      "tel:+2250707581411",
    ]);
    expect(html).toMatch(/<a[^>]*href="\/fr"[^>]*>Retour à l&#x27;accueil/);
  });
});

describe("brouillon de l'étape 1 (sessionStorage)", () => {
  it("clé, contenu, et rien quand rien n'est saisi", () => {
    expect(CLE_BROUILLON).toBe("cn-avis-brouillon");
    expect(texteBrouillon(SAISIE_VIDE)).toBeNull();
    const saisie = {
      ...SAISIE_VIDE,
      ressenti: "PAS_CONTENT",
      canal: "APPLI",
      restaurantId: STORES[1].id,
      commentaire: "Froid.",
      telephone: "0707123456",
      prenom: "Awa",
      accordRappel: true,
    };
    const brouillon = JSON.parse(texteBrouillon(saisie));

    // Ni numéro, ni prénom, ni accord de rappel.
    expect(brouillon).toEqual({
      ressenti: "PAS_CONTENT",
      canal: "APPLI",
      restaurantId: STORES[1].id,
      commentaire: "Froid.",
    });
    expect(lireBrouillon(texteBrouillon(saisie), STORES)).toEqual(brouillon);
  });

  it("valeurs inconnues ignorées (store fermé, texte modifié, JSON illisible)", () => {
    expect(
      lireBrouillon(
        JSON.stringify({
          ressenti: "CONTENT",
          canal: "MANUEL",
          restaurantId: "ferme",
          commentaire: "x".repeat(1200),
        }),
        STORES,
      ),
    ).toEqual({ commentaire: "x".repeat(1000) });
    expect(lireBrouillon("{", STORES)).toEqual({});
    expect(lireBrouillon(null, STORES)).toEqual({});
    expect(lireBrouillon("42", STORES)).toEqual({});
  });

  it("envoi : « Je ne sais pas » devient null, source et piège transmis", () => {
    expect(
      envoiDepuisSaisie(
        { ...SAISIE_VIDE, ressenti: "AU_TOP", canal: "SUR_PLACE" },
        "ticket",
        "",
      ),
    ).toEqual({
      ressenti: "AU_TOP",
      canal: "SUR_PLACE",
      restaurant_id: null,
      commentaire: "",
      telephone: "",
      prenom: "",
      accord_rappel: false,
      source: "ticket",
      site_web: "",
    });
  });
});
