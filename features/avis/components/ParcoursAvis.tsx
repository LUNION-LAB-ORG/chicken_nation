"use client";

import type { FormEvent, ReactNode } from "react";
import type {
  EcranAvis,
  RessentiAvis,
  SaisieAvis,
  StoreAvis,
} from "../types/avis.types";
import type { ErreursExperience, ErreursNumero } from "../utils/regles-avis";

import { useEffect, useRef, useState } from "react";

import { envoyerAvisAction } from "../actions/envoyer-avis.action";
import {
  CLE_BROUILLON,
  SAISIE_VIDE,
  ecranPrecedent,
  envoiDepuisSaisie,
  lireBrouillon,
  texteBrouillon,
} from "../utils/parcours-avis";
import {
  CHAMPS_EXPERIENCE,
  CHAMPS_NUMERO,
  erreursExperience,
  erreursNumero,
} from "../utils/regles-avis";
import { ERREURS_AVIS, sourceDepuisAdresse } from "../utils/textes-avis";

import { EcranExperience, idRessenti } from "./EcranExperience";
import { EcranMerci } from "./EcranMerci";
import { EcranNumero } from "./EcranNumero";
import { EcranPresentation } from "./EcranPresentation";

import { actionPerimee } from "@/features/commande/utils/erreur-action.utils";

/** sessionStorage peut lever une exception (navigation privée, stockage bloqué). */
function lireSession(cle: string): string | null {
  try {
    return window.sessionStorage.getItem(cle);
  } catch {
    return null;
  }
}

function ecrireSession(cle: string, valeur: string | null) {
  try {
    if (valeur === null) window.sessionStorage.removeItem(cle);
    else window.sessionStorage.setItem(cle, valeur);
  } catch {
    /* stockage indisponible : on perd seulement le brouillon */
  }
}

const ID_CHAMP: Record<string, string> = {
  ressenti: idRessenti("AU_TOP"),
  canal: "avis-canal",
  commentaire: "avis-commentaire",
  telephone: "avis-telephone",
  prenom: "avis-prenom",
};

function focusChamp(champ: string) {
  document.getElementById(ID_CHAMP[champ] ?? "")?.focus();
}

/**
 * Îlot de la page « Ton avis compte » : les quatre écrans de la maquette sur
 * une seule adresse (/fr/avis). L'écran courant est un état ; à chaque
 * changement, retour en haut et focus sur le titre. Le brouillon de l'étape 1
 * est gardé le temps de l'onglet (parcours-avis.ts). La source du QR code est
 * lue dans l'adresse au moment de l'envoi.
 */
export function ParcoursAvis({
  stores,
  mascotte,
}: {
  /** Restaurants actifs lus dans l'API par la page (vide si l'API ne répond pas). */
  stores: StoreAvis[];
  /** Image de la mascotte, rendue par le serveur. */
  mascotte: ReactNode;
}) {
  const [ecran, setEcran] = useState<EcranAvis>("presentation");
  const [saisie, setSaisie] = useState<SaisieAvis>(SAISIE_VIDE);
  const [erreursExp, setErreursExp] = useState<ErreursExperience>({});
  const [erreursNum, setErreursNum] = useState<ErreursNumero>({});
  const [tente, setTente] = useState({ experience: false, numero: false });
  const [envoi, setEnvoi] = useState(false);
  const [echec, setEchec] = useState<string | null>(null);
  const [merci, setMerci] = useState<{
    ressenti: RessentiAvis;
    accordRappel: boolean;
  } | null>(null);
  // Brouillon relu : avant, rien n'est écrit (on effacerait celui qui existe).
  const [pret, setPret] = useState(false);
  const titre = useRef<HTMLHeadingElement>(null);
  const piege = useRef<HTMLInputElement>(null);
  const changement = useRef(false);
  const enCours = useRef(false);

  useEffect(() => {
    const lu = lireBrouillon(lireSession(CLE_BROUILLON), stores);

    setSaisie((avant) => ({ ...avant, ...lu }));
    setPret(true);
  }, [stores]);

  useEffect(() => {
    if (pret && ecran !== "merci")
      ecrireSession(CLE_BROUILLON, texteBrouillon(saisie));
  }, [pret, saisie, ecran]);

  // Nouvel écran : retour en haut, focus sur son titre (pas au premier affichage).
  useEffect(() => {
    if (!changement.current) return;
    changement.current = false;
    window.scrollTo(0, 0);
    titre.current?.focus({ preventScroll: true });
  }, [ecran]);

  function aller(vers: EcranAvis) {
    changement.current = true;
    setEchec(null);
    setEcran(vers);
  }

  function retour() {
    const precedent = ecranPrecedent(ecran);

    if (precedent) aller(precedent);
  }

  function changer<K extends keyof SaisieAvis>(
    champ: K,
    valeur: SaisieAvis[K],
  ) {
    const suivante = { ...saisie, [champ]: valeur };

    setSaisie(suivante);
    // Après une première tentative, les erreurs suivent la saisie.
    if (tente.experience) setErreursExp(erreursExperience(suivante));
    if (tente.numero) setErreursNum(erreursNumero(suivante));
  }

  function continuer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const trouvees = erreursExperience(saisie);

    setTente((t) => ({ ...t, experience: true }));
    setErreursExp(trouvees);
    const premier = CHAMPS_EXPERIENCE.find((champ) => trouvees[champ]);

    if (premier) {
      focusChamp(premier);

      return;
    }
    aller("numero");
  }

  async function envoyer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (enCours.current) return;

    // L'étape 1 n'est plus valable (brouillon modifié) : on y retourne.
    const avant = erreursExperience(saisie);

    if (Object.keys(avant).length) {
      setTente((t) => ({ ...t, experience: true }));
      setErreursExp(avant);
      aller("experience");

      return;
    }

    const trouvees = erreursNumero(saisie);

    setTente((t) => ({ ...t, numero: true }));
    setErreursNum(trouvees);
    setEchec(null);
    const premier = CHAMPS_NUMERO.find((champ) => trouvees[champ]);

    if (premier) {
      focusChamp(premier);

      return;
    }

    enCours.current = true;
    setEnvoi(true);
    try {
      const resultat = await envoyerAvisAction(
        envoiDepuisSaisie(
          saisie,
          sourceDepuisAdresse(window.location.search),
          piege.current?.value ?? "",
        ),
      );

      if (resultat.ok) {
        ecrireSession(CLE_BROUILLON, null);
        setMerci({
          ressenti: saisie.ressenti as RessentiAvis,
          accordRappel: saisie.accordRappel,
        });
        setSaisie(SAISIE_VIDE);
        setTente({ experience: false, numero: false });
        aller("merci");
      } else {
        setEchec(resultat.message);
      }
    } catch (erreur) {
      setEchec(
        actionPerimee(erreur) ? ERREURS_AVIS.pagePerimee : ERREURS_AVIS.panne,
      );
    } finally {
      enCours.current = false;
      setEnvoi(false);
    }
  }

  switch (ecran) {
    case "experience":
      return (
        <EcranExperience
          erreurs={erreursExp}
          refTitre={titre}
          saisie={saisie}
          stores={stores}
          onChanger={changer}
          onContinuer={continuer}
          onRetour={retour}
        />
      );
    case "numero":
      return (
        <EcranNumero
          echec={echec}
          envoi={envoi}
          erreurs={erreursNum}
          refPiege={piege}
          refTitre={titre}
          saisie={saisie}
          onChanger={changer}
          onEnvoyer={envoyer}
          onRetour={retour}
        />
      );
    case "merci":
      return merci ? (
        <EcranMerci
          accordRappel={merci.accordRappel}
          mascotte={mascotte}
          refTitre={titre}
          ressenti={merci.ressenti}
        />
      ) : null;
    default:
      return (
        <EcranPresentation
          mascotte={mascotte}
          refTitre={titre}
          onCommencer={() => aller("experience")}
        />
      );
  }
}
