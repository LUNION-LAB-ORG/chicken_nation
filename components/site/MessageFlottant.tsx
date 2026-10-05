"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { fenetreDuDessus } from "./fenetres";
import styles from "./MessageFlottant.module.css";

/* Messages brefs (« Ajouté au panier ») et annonces aux lecteurs d'écran.
   Remplacent les toasts HeroUI. N'importe quel composant client appelle
   afficherMessage() ; les hôtes MessageFlottant et Annonce sont posés une fois
   dans la mise en page (lot L5), et Annonce aussi dans chaque Feuille. */

type Ecouteur = (texte: string) => void;

const ecouteursMessage = new Set<Ecouteur>();
const ecouteursAnnonce = new Set<Ecouteur>();

/** Texte lu par les lecteurs d'écran, sans rien afficher. */
export function annoncer(texte: string) {
  ecouteursAnnonce.forEach((ecouter) => ecouter(texte));
}

/** Message affiché 3,2 s (dans la fenêtre ouverte s'il y en a une) et annoncé. */
export function afficherMessage(texte: string) {
  ecouteursMessage.forEach((ecouter) => ecouter(texte));
  annoncer(texte);
}

const DUREE = 3200;

/** Hôte du message visible. Masqué aux lecteurs d'écran : Annonce le lit. */
export function MessageFlottant() {
  const [message, setMessage] = useState<{
    texte: string;
    hote: Element;
    cle: number;
  } | null>(null);

  useEffect(() => {
    let minuteur: ReturnType<typeof setTimeout> | undefined;
    const ecouter = (texte: string) => {
      // Une fenêtre ouverte passe au premier plan : le message doit y être,
      // sinon il reste caché dessous.
      setMessage({
        texte,
        hote: fenetreDuDessus() ?? document.body,
        cle: Date.now(),
      });
      clearTimeout(minuteur);
      minuteur = setTimeout(() => setMessage(null), DUREE);
    };

    ecouteursMessage.add(ecouter);

    return () => {
      ecouteursMessage.delete(ecouter);
      clearTimeout(minuteur);
    };
  }, []);

  if (!message) return null;

  return createPortal(
    <div key={message.cle} aria-hidden="true" className={styles.message}>
      {message.texte}
    </div>,
    message.hote,
  );
}

/** Zone lue par les lecteurs d'écran (role=status, polie). */
export function Annonce() {
  const [texte, setTexte] = useState("");

  useEffect(() => {
    let minuteur: ReturnType<typeof setTimeout> | undefined;
    const ecouter = (nouveau: string) => {
      // Vider puis remplir : un même texte répété est relu.
      setTexte("");
      clearTimeout(minuteur);
      minuteur = setTimeout(() => setTexte(nouveau), 30);
    };

    ecouteursAnnonce.add(ecouter);

    return () => {
      ecouteursAnnonce.delete(ecouter);
      clearTimeout(minuteur);
    };
  }, []);

  return (
    <div aria-live="polite" className="sr-only" role="status">
      {texte}
    </div>
  );
}
