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

    if (document.readyState === "complete") lancer();
    else window.addEventListener("load", lancer, { once: true });

    return () => {
      annule = true;
      window.removeEventListener("load", lancer);
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
