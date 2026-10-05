"use client";

import { lazy, Suspense, useEffect, useState } from "react";

// Code de mesure (web-vitals, environ 3 ko) téléchargé seulement quand la page
// est chargée et le navigateur au repos : rien de plus au premier affichage.
const RapportSignaux = lazy(() => import("./RapportSignaux"));

/**
 * Signaux web réels des visiteurs (LCP, INP, CLS, FCP, TTFB) envoyés à GA4.
 * Les mesures du navigateur sont mises en mémoire tampon : les lire après le
 * chargement ne fait rien perdre.
 */
export function MesureSignaux() {
  const [pret, setPret] = useState(false);

  useEffect(() => {
    let annule = false;
    let repos: number | undefined;
    const lancer = () => {
      if (annule) return;
      if ("requestIdleCallback" in window)
        repos = window.requestIdleCallback(() => setPret(true), {
          timeout: 5000,
        });
      else setPret(true);
    };

    // Une image qui ne répond jamais retarde l'événement load sans fin
    // (recette vitesse D5) : au plus 8 s après le montage.
    let secours: number | undefined;
    let lance = false;
    const unefois = () => {
      if (lance) return;
      lance = true;
      lancer();
    };

    if (document.readyState === "complete") unefois();
    else {
      window.addEventListener("load", unefois, { once: true });
      secours = window.setTimeout(unefois, 8000);
    }

    return () => {
      annule = true;
      window.removeEventListener("load", unefois);
      window.clearTimeout(secours);
      if (repos !== undefined && "cancelIdleCallback" in window)
        window.cancelIdleCallback(repos);
    };
  }, []);

  return pret ? (
    <Suspense fallback={null}>
      <RapportSignaux />
    </Suspense>
  ) : null;
}
