"use client";

import { useEffect, useRef, useState } from "react";

import { Icone } from "../Icone";

import styles from "./LaMarque.module.css";

const VIDEO = "/assets/videos/presentation-540.mp4";
const AFFICHE = "/assets/videos/presentation-affiche.webp";

// Réseau lent ou économiseur de données : la vidéo n'est jamais téléchargée
// sans une action du visiteur (budget du plan, 5.4).
type Connexion = {
  saveData?: boolean;
  effectiveType?: string;
  downlink?: number;
};
/** Débit estimé (Mbit/s) en dessous duquel la vidéo (3,8 Mo) attend un geste. */
export const DEBIT_LECTURE_AUTO = 5;

/**
 * Le réseau permet-il de lancer la vidéo sans geste du visiteur ? Chrome
 * classe « 4g » toute connexion de plus de 0,7 Mbit/s : une 4G lente
 * (1,6 Mbit/s) téléchargeait 3 à 4 Mo sans action (recette vitesse D1). Il
 * faut donc aussi un débit estimé d'au moins 5 Mbit/s. Navigateur qui ne
 * donne pas ces mesures (Safari, Firefox) : lecture permise, comme avant.
 */
export function reseauPermetLectureAuto(connexion: Connexion | undefined) {
  if (!connexion) return true;
  if (connexion.saveData === true) return false;
  if (connexion.effectiveType && connexion.effectiveType !== "4g") return false;
  if (
    typeof connexion.downlink === "number" &&
    connexion.downlink < DEBIT_LECTURE_AUTO
  )
    return false;

  return true;
}

const reseauEconome = () =>
  !reseauPermetLectureAuto(
    (navigator as Navigator & { connection?: Connexion }).connection,
  );

const mouvementReduit = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Lance la lecture ; un refus du navigateur (lecture bloquée, fichier illisible) est intercepté. */
function lireVideo(video: HTMLVideoElement, siRefus: () => void) {
  video.play().catch(siRefus);
}

/**
 * Vidéo de présentation (maquette, CSS 589-631, JS 1773-1802, retouche 11).
 *
 * - Lecture muette en boucle quand 35 % du cadre est visible, pause dès
 *   qu'il sort de l'écran ; rien n'est téléchargé avant (preload="none").
 * - Jamais de lecture automatique avec le mouvement réduit (préférence
 *   suivie en direct), l'économiseur de données ou un réseau lent (2G, 3G,
 *   ou débit estimé sous 5 Mbit/s) : l'affiche et le bouton de lecture
 *   restent.
 * - L'affiche (39 ko) n'est demandée qu'à l'approche de la section : elle
 *   ne pèse plus sur le premier affichage de l'accueil (recette vitesse D2).
 *   Sans JavaScript, une image la remplace.
 * - Une pause demandée par le visiteur n'est jamais annulée par le défilement.
 * - « Activer le son » relance la vidéo si elle était arrêtée. Un refus de
 *   lecture du navigateur est intercepté (l'affiche reste).
 */
export function LecteurVideo({ descriptionId }: { descriptionId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cadreRef = useRef<HTMLDivElement>(null);
  const boutonLectureRef = useRef<HTMLButtonElement>(null);
  // Pause demandée par le visiteur : le défilement ne relance plus la vidéo.
  const pauseVoulue = useRef(false);
  // Lecture lancée par le visiteur : elle reprend au retour à l'écran, même
  // si la lecture automatique n'est pas permise.
  const lanceeParVisiteur = useRef(false);
  const [joue, setJoue] = useState(false);
  const [muette, setMuette] = useState(true);
  const [affiche, setAffiche] = useState<string | undefined>(undefined);

  // Lecture refusée : l'affiche et le bouton de lecture restent.
  const lire = () => {
    if (videoRef.current) lireVideo(videoRef.current, () => setJoue(false));
  };

  useEffect(() => {
    const video = videoRef.current;
    const cadre = cadreRef.current;

    if (!video || !cadre) return;
    // React ne rend pas l'attribut muted côté serveur : posé ici, avant toute
    // lecture (les navigateurs refusent la lecture automatique avec le son).
    video.muted = true;
    video.defaultMuted = true;

    const majEtat = () => {
      setJoue(!video.paused && !video.ended);
      setMuette(video.muted);
    };
    const evenements = ["play", "playing", "pause", "ended", "volumechange"];

    evenements.forEach((e) => video.addEventListener(e, majEtat));

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const surPreference = () => {
      // Mouvement réduit demandé pendant une lecture automatique : arrêt.
      if (preference.matches && !lanceeParVisiteur.current && !video.paused)
        video.pause();
    };

    preference.addEventListener("change", surPreference);

    let observateur: IntersectionObserver | null = null;
    let approche: IntersectionObserver | null = null;

    if (!("IntersectionObserver" in window)) setAffiche(AFFICHE);
    else {
      // Affiche demandée un écran avant la section.
      approche = new IntersectionObserver(
        (entrees) => {
          if (entrees.some((e) => e.isIntersecting)) {
            setAffiche(AFFICHE);
            approche?.disconnect();
          }
        },
        { rootMargin: "600px 0px" },
      );
      approche.observe(cadre);
    }

    if ("IntersectionObserver" in window) {
      observateur = new IntersectionObserver(
        (entrees) => {
          for (const entree of entrees) {
            if (!entree.isIntersecting) {
              if (!video.paused) video.pause();
              continue;
            }
            if (pauseVoulue.current) continue;
            if (
              lanceeParVisiteur.current ||
              (!mouvementReduit() && !reseauEconome())
            )
              lireVideo(video, () => setJoue(false));
          }
        },
        { threshold: 0.35 },
      );
      observateur.observe(cadre);
    }

    return () => {
      evenements.forEach((e) => video.removeEventListener(e, majEtat));
      preference.removeEventListener("change", surPreference);
      observateur?.disconnect();
      approche?.disconnect();
    };
  }, []);

  const lancer = () => {
    pauseVoulue.current = false;
    lanceeParVisiteur.current = true;
    lire();
  };

  const basculerLecture = () => {
    const video = videoRef.current;

    if (!video) return;
    if (video.paused) {
      lancer();
    } else {
      pauseVoulue.current = true;
      video.pause();
    }
  };

  const basculerSon = () => {
    const video = videoRef.current;

    if (!video) return;
    video.muted = !video.muted;
    // Le son demandé sur une vidéo arrêtée la relance.
    if (!video.muted && video.paused) lancer();
  };

  return (
    <div
      ref={cadreRef}
      className={styles.cadre}
      data-etat={joue ? "lecture" : "arret"}
    >
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        aria-describedby={descriptionId}
        aria-label="Vidéo de présentation de Chicken Nation"
        height={540}
        poster={affiche}
        preload="none"
        width={960}
      >
        <source src={VIDEO} type="video/mp4" />
      </video>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- affiche sans JavaScript */}
        <img
          alt=""
          className={styles.afficheSansScript}
          height={540}
          src={AFFICHE}
          width={960}
        />
      </noscript>
      <p aria-hidden="true" className={styles.collant}>
        Soirée d&apos;ouverture
      </p>
      {/* Raccourci pour la souris et le doigt : au clavier, « Lire la vidéo »
          de la barre suffit (pas de double arrêt de tabulation). */}
      <button
        aria-label="Lire la vidéo"
        className={styles.grandBouton}
        tabIndex={-1}
        type="button"
        onClick={() => {
          lancer();
          boutonLectureRef.current?.focus();
        }}
      >
        <Icone nom="lecture" />
      </button>
      <div className={styles.barre}>
        <button
          ref={boutonLectureRef}
          className={styles.boutonVideo}
          type="button"
          onClick={basculerLecture}
        >
          <Icone nom={joue ? "pause" : "lecture"} />
          <span>{joue ? "Mettre en pause" : "Lire la vidéo"}</span>
        </button>
        <button
          className={styles.boutonVideo}
          type="button"
          onClick={basculerSon}
        >
          <Icone nom={muette ? "muet" : "son"} />
          <span>{muette ? "Activer le son" : "Couper le son"}</span>
        </button>
      </div>
    </div>
  );
}
