"use client";

import { useSyncExternalStore } from "react";

/*
 * Horloge partagée par les îlots qui dépendent de l'heure (état d'ouverture,
 * jour en cours). Une seule minuterie pour toute la page, recalée au début de
 * chaque minute, et une relecture au retour sur l'onglet (les minuteries
 * dorment quand l'onglet est caché).
 *
 * Au rendu serveur et à l'hydratation, l'heure vaut `null` : rien de ce qui
 * dépend de l'heure n'entre dans le HTML mis en cache, et l'hydratation ne
 * peut pas différer du serveur.
 */

const MINUTE = 60 * 1000;
const ecouteurs = new Set<() => void>();
let minuteur: ReturnType<typeof setTimeout> | undefined;

const prevenir = () => ecouteurs.forEach((ecouter) => ecouter());

function programmer() {
  clearTimeout(minuteur);
  minuteur = setTimeout(
    () => {
      prevenir();
      programmer();
    },
    MINUTE - (Date.now() % MINUTE) + 50,
  );
}

function surVisibilite() {
  if (document.visibilityState === "visible") {
    prevenir();
    programmer();
  }
}

function abonner(ecouter: () => void) {
  ecouteurs.add(ecouter);
  if (ecouteurs.size === 1) {
    programmer();
    document.addEventListener("visibilitychange", surVisibilite);
  }

  return () => {
    ecouteurs.delete(ecouter);
    if (ecouteurs.size === 0) {
      clearTimeout(minuteur);
      document.removeEventListener("visibilitychange", surVisibilite);
    }
  };
}

// Même valeur pendant toute la minute : React ne refait le rendu qu'au changement.
const minuteCourante = () => Math.floor(Date.now() / MINUTE) * MINUTE;
const avantHydratation = () => null;

/** Début de la minute en cours (millisecondes), ou `null` avant l'hydratation. */
export function useMinuteCourante(): number | null {
  return useSyncExternalStore(abonner, minuteCourante, avantHydratation);
}
