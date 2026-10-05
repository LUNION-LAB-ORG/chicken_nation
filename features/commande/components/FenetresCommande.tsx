"use client";

import { useAtom, useSetAtom } from "jotai";
import { usePathname } from "next/navigation";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

import {
  ficheBrancheeAtom,
  ficheDemandeeAtom,
  tiroirPanierBrancheAtom,
  tiroirPanierOuvertAtom,
} from "../stores/interface.store";

// Chargées à la première demande seulement : une page qu'on ne fait que lire
// n'embarque ni la fiche ni le tiroir. Le téléchargement anticipé (à
// l'intention, plus bas) vise les mêmes modules : le rendu le réutilise.
// React.lazy plutôt que next/dynamic : les fenêtres ne sont jamais rendues
// par le serveur (montées après une action), et le chargeur de Next pesait
// quelques ko de plus sur chaque page.
const chargerFiche = () => import("./FichePlat");
const chargerTiroir = () => import("./TiroirPanier");
const FichePlat = lazy(chargerFiche);
const TiroirPanier = lazy(chargerTiroir);

/** Élément qui ouvre une fenêtre (« Ajouter », panier de l'en-tête, barre du panier). */
const OUVRE_FENETRE = '[aria-haspopup="dialog"]';

/**
 * Fenêtres de la commande, montées une fois dans la mise en page publique
 * (plan, section 1.5) : fiche plat et tiroir du panier.
 *
 *  - Monté, il passe les drapeaux « branchée » à vrai : « Ajouter » ouvre
 *    alors la fiche au lieu de suivre le lien de la page du plat, le panier
 *    ouvre le tiroir au lieu de mener à la caisse.
 *  - Le code des fenêtres n'est téléchargé qu'à l'intention (survol, appui,
 *    focus d'un bouton qui en ouvre une), puis rendu à la première demande.
 *  - Un changement de page ferme les deux fenêtres.
 *  - Focus : Feuille le rend à l'élément qui avait le focus. Safari ne donne
 *    pas le focus à un bouton cliqué : le dernier bouton qui a ouvert une
 *    fenêtre le reprend alors.
 */
export function FenetresCommande() {
  const [demande, setDemande] = useAtom(ficheDemandeeAtom);
  const [tiroirOuvert, setTiroirOuvert] = useAtom(tiroirPanierOuvertAtom);
  const setFicheBranchee = useSetAtom(ficheBrancheeAtom);
  const setTiroirBranche = useSetAtom(tiroirPanierBrancheAtom);
  const [ficheUtilisee, setFicheUtilisee] = useState(false);
  const [tiroirUtilise, setTiroirUtilise] = useState(false);
  const chemin = usePathname();
  const cheminPrecedent = useRef(chemin);

  if (demande && !ficheUtilisee) setFicheUtilisee(true);
  if (tiroirOuvert && !tiroirUtilise) setTiroirUtilise(true);

  useEffect(() => {
    setFicheBranchee(true);
    setTiroirBranche(true);

    return () => {
      setFicheBranchee(false);
      setTiroirBranche(false);
    };
  }, [setFicheBranchee, setTiroirBranche]);

  // Une autre page (lien « Passer commande », retour arrière) : rien ne
  // reste ouvert par-dessus.
  useEffect(() => {
    if (cheminPrecedent.current === chemin) return;
    cheminPrecedent.current = chemin;
    setDemande(null);
    setTiroirOuvert(false);
  }, [chemin, setDemande, setTiroirOuvert]);

  // Téléchargement à l'intention, et mémoire du dernier bouton d'ouverture.
  useEffect(() => {
    let precharge = false;
    let declencheur: HTMLElement | null = null;
    const bouton = (e: Event) =>
      e.target instanceof Element
        ? e.target.closest<HTMLElement>(OUVRE_FENETRE)
        : null;

    const intention = (e: Event) => {
      if (precharge || !bouton(e)) return;
      precharge = true;
      // Réseau coupé : rien à faire, la demande réessaiera au clic.
      chargerFiche().catch(() => {});
      chargerTiroir().catch(() => {});
    };
    const clic = (e: Event) => {
      const el = bouton(e);

      if (el && !el.closest("dialog")) declencheur = el;
    };
    // Après le rendu du focus par Feuille (écouteur posé sur la fenêtre) :
    // si personne ne l'a repris (le focus est resté dans la fenêtre fermée,
    // ou sur la page), le bouton d'ouverture le reprend.
    const fermeture = (e: Event) => {
      if (!(e.target instanceof HTMLDialogElement)) return;
      setTimeout(() => {
        const actif = document.activeElement;
        const perdu =
          !actif ||
          actif === document.body ||
          Boolean(actif.closest("dialog:not([open])"));

        if (
          declencheur?.isConnected &&
          perdu &&
          !document.querySelector("dialog[open]")
        )
          declencheur.focus();
      }, 0);
    };

    document.addEventListener("pointerover", intention, { passive: true });
    document.addEventListener("pointerdown", intention, { passive: true });
    document.addEventListener("focusin", intention);
    document.addEventListener("click", clic, true);
    document.addEventListener("close", fermeture, true);

    return () => {
      document.removeEventListener("pointerover", intention);
      document.removeEventListener("pointerdown", intention);
      document.removeEventListener("focusin", intention);
      document.removeEventListener("click", clic, true);
      document.removeEventListener("close", fermeture, true);
    };
  }, []);

  return (
    <>
      {ficheUtilisee ? (
        <Suspense fallback={null}>
          <FichePlat />
        </Suspense>
      ) : null}
      {tiroirUtilise ? (
        <Suspense fallback={null}>
          <TiroirPanier />
        </Suspense>
      ) : null}
    </>
  );
}
