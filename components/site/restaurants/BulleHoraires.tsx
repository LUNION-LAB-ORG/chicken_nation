"use client";

import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";

import { BoutonRond } from "../BoutonRond";
import { Lien } from "../Lien";

import styles from "./Restaurants.module.css";
import { useMinuteCourante } from "./useMinuteCourante";

import { jourAbidjan } from "@/features/restaurants/horaires";
import { cn } from "@/lib/utils";

// Une seule bulle ouverte sur toute la page : en ouvrir une ferme l'autre.
const bulleOuverteAtom = atom<string | null>(null);

/**
 * Lien « Horaires » et sa bulle, posée par-dessus la carte du restaurant sans
 * changer sa hauteur (retouche 8). À l'ouverture, le focus va sur « Fermer » ;
 * Échap, un clic ou le focus en dehors la ferment. Le jour en cours (heure
 * d'Abidjan) est en gras, calculé dans le navigateur.
 */
export function BulleHoraires({
  id,
  nom,
  jours,
}: {
  /** id unique de la bulle dans la page. */
  id: string;
  /** Nom affiché du restaurant (« Angré »). */
  nom: string;
  /** Horaires de la semaine (`horairesParJour`), heures insécables. */
  jours: { jour: number; nom: string; texte: string }[];
}) {
  const [bulleOuverte, setBulleOuverte] = useAtom(bulleOuverteAtom);
  const ouverte = bulleOuverte === id;
  const lien = useRef<HTMLButtonElement>(null);
  const bulle = useRef<HTMLDivElement>(null);
  const boutonFermer = useRef<HTMLButtonElement>(null);
  const minute = useMinuteCourante();
  const aujourdhui = minute === null ? null : jourAbidjan(new Date(minute));

  useEffect(() => {
    if (!ouverte) return;
    boutonFermer.current?.focus();

    const dehors = (cible: EventTarget | null) =>
      cible instanceof Node &&
      !bulle.current?.contains(cible) &&
      !lien.current?.contains(cible);
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setBulleOuverte(null);
      lien.current?.focus();
    };
    const surPointeur = (e: PointerEvent) => {
      if (dehors(e.target)) setBulleOuverte(null);
    };
    const surFocus = (e: FocusEvent) => {
      if (dehors(e.target)) setBulleOuverte(null);
    };

    document.addEventListener("keydown", surTouche);
    document.addEventListener("pointerdown", surPointeur);
    document.addEventListener("focusin", surFocus);

    return () => {
      document.removeEventListener("keydown", surTouche);
      document.removeEventListener("pointerdown", surPointeur);
      document.removeEventListener("focusin", surFocus);
    };
  }, [ouverte, setBulleOuverte]);

  const fermer = () => {
    setBulleOuverte(null);
    lien.current?.focus();
  };

  return (
    <>
      <Lien
        ref={lien}
        aria-controls={id}
        aria-expanded={ouverte}
        className="min-h-10 text-[13px]"
        onClick={() => setBulleOuverte(ouverte ? null : id)}
      >
        Horaires
        <span className="sr-only"> à {nom}</span>
      </Lien>
      <div
        ref={bulle}
        aria-label={`Horaires à ${nom}`}
        className={styles.bulle}
        hidden={!ouverte}
        id={id}
        role="dialog"
      >
        <p className={styles.bulleTitre}>
          Horaires à {nom}
          <small>Heure d&apos;Abidjan</small>
        </p>
        <ul>
          {jours.map((j) => (
            <li
              key={j.jour}
              className={cn(j.jour === aujourdhui && styles.aujourdhui)}
            >
              <span>
                {j.nom}
                {j.jour === aujourdhui ? " (aujourd'hui)" : null}
              </span>
              <span>{j.texte}</span>
            </li>
          ))}
        </ul>
        <BoutonRond
          ref={boutonFermer}
          className={styles.bulleFermer}
          icone="croix"
          libelle="Fermer les horaires"
          onClick={fermer}
        />
      </div>
    </>
  );
}
