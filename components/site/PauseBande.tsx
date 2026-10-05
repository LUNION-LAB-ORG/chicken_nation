"use client";

import { useState } from "react";

import { Icone } from "./Icone";
import styles from "./BandeDefilante.module.css";

/**
 * Bouton pause du bandeau défilant (critère WCAG 2.2.2 : tout mouvement de
 * plus de 5 s doit pouvoir être arrêté). Masqué quand rien ne bouge.
 */
export function PauseBande() {
  const [enPause, setEnPause] = useState(false);

  return (
    <button
      aria-label="Arrêter le défilement"
      aria-pressed={enPause}
      className={styles.pause}
      type="button"
      onClick={(e) => {
        const suivant = !enPause;

        setEnPause(suivant);
        e.currentTarget
          .closest("[data-bande]")
          ?.setAttribute("data-pause", String(suivant));
      }}
    >
      <Icone nom={enPause ? "lecture" : "pause"} />
    </button>
  );
}
