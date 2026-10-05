"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";

import { Pastille } from "../Etiquettes";
import { Conteneur } from "../Section";

import styles from "./Carte.module.css";

export interface IPastilleCategorie {
  /** Ancre de la section (`box` pour `#box`). */
  cle: string;
  nom: string;
  /** Point jaune devant les promotions. */
  promo: boolean;
}

// Une section devient la catégorie en cours quand son haut passe à 30 px
// sous la barre des pastilles (maquette, JS 770-792).
const MARGE_SUIVI = 30;

const mouvementReduit = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Pastilles de catégorie collantes sous l'en-tête (maquette, HTML 338-344).
 * Ce sont de vrais liens vers les ancres (`#box`), qui marchent sans
 * JavaScript. Une fois la page active, la pastille de la section en cours est
 * marquée (`aria-current`) et centrée dans la rangée pendant le défilement ;
 * un clic fait défiler en douceur (sauf mouvement réduit) et donne le focus
 * au titre de la section.
 */
export function Pastilles({
  categories,
}: {
  categories: readonly IPastilleCategorie[];
}) {
  const [actif, setActif] = useState(categories[0]?.cle ?? "");
  const navRef = useRef<HTMLElement>(null);
  const rangeeRef = useRef<HTMLDivElement>(null);
  // Après un clic, la pastille choisie reste marquée pendant le défilement
  // en douceur, même si la section ne peut pas monter jusqu'en haut (la
  // dernière, sur un grand écran).
  const choisie = useRef<{ cle: string; jusqua: number } | null>(null);

  // Section en cours selon le défilement (une mesure par image affichée).
  useEffect(() => {
    let attente = 0;
    const mesurer = () => {
      attente = 0;
      const forcee = choisie.current;

      if (forcee && Date.now() < forcee.jusqua) {
        setActif(forcee.cle);

        return;
      }
      choisie.current = null;
      const limite =
        (navRef.current?.getBoundingClientRect().bottom ?? 0) + MARGE_SUIVI;
      let enCours = categories[0]?.cle ?? "";

      for (const c of categories) {
        const section = document.getElementById(c.cle);

        if (section && section.getBoundingClientRect().top - limite <= 0)
          enCours = c.cle;
      }
      setActif(enCours);
    };
    const surDefilement = () => {
      if (!attente) attente = requestAnimationFrame(mesurer);
    };

    mesurer();
    window.addEventListener("scroll", surDefilement, { passive: true });
    window.addEventListener("resize", surDefilement);

    return () => {
      window.removeEventListener("scroll", surDefilement);
      window.removeEventListener("resize", surDefilement);
      cancelAnimationFrame(attente);
    };
  }, [categories]);

  // Pastille en cours centrée dans la rangée (sans faire défiler la page).
  useEffect(() => {
    const rangee = rangeeRef.current;
    const pastille = rangee?.querySelector<HTMLElement>(
      '[aria-current="true"]',
    );

    if (!rangee || !pastille || rangee.scrollWidth <= rangee.clientWidth)
      return;
    const gauche =
      pastille.offsetLeft - rangee.clientWidth / 2 + pastille.offsetWidth / 2;

    rangee.scrollTo({
      left: Math.max(0, gauche),
      behavior: mouvementReduit() ? "auto" : "smooth",
    });
  }, [actif]);

  const surClic = (e: MouseEvent<HTMLDivElement>) => {
    const lien = (e.target as HTMLElement).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );

    if (
      !lien ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    const cle = decodeURIComponent(lien.hash.slice(1));
    const section = document.getElementById(cle);

    if (!section) return;
    e.preventDefault();
    const reduit = mouvementReduit();

    choisie.current = { cle, jusqua: Date.now() + (reduit ? 150 : 900) };
    setActif(cle);
    section.scrollIntoView({
      behavior: reduit ? "auto" : "smooth",
      block: "start",
    });
    // L'adresse garde la section (partage, retour) sans ajouter d'étape à l'historique.
    window.history.replaceState(window.history.state, "", `#${cle}`);
    section
      .querySelector<HTMLElement>("h2[tabindex]")
      ?.focus({ preventScroll: true });
  };

  return (
    <nav
      ref={navRef}
      aria-label="Catégories de la carte"
      className={styles.pastilles}
    >
      <Conteneur>
        {/* Le clic est délégué à la rangée : les pastilles restent de simples liens. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- les liens reçoivent le clavier eux-mêmes (Entrée déclenche un clic) */}
        <div ref={rangeeRef} className={styles.defile} onClick={surClic}>
          {categories.map((c) => (
            <Pastille
              key={c.cle}
              actif={c.cle === actif}
              href={`#${c.cle}`}
              promo={c.promo}
            >
              {c.nom}
            </Pastille>
          ))}
        </div>
      </Conteneur>
    </nav>
  );
}
