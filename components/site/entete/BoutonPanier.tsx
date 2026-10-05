"use client";

import { useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { Icone } from "../Icone";

import styles from "./BoutonPanier.module.css";
import { CHEMIN_CAISSE } from "./liens";

import {
  tiroirPanierBrancheAtom,
  tiroirPanierOuvertAtom,
} from "@/features/commande/stores/interface.store";
import { panierAtom } from "@/features/commande/stores/panier.store";
import {
  nombreArticles,
  sousTotal,
} from "@/features/commande/utils/panier.utils";
import { fcfa, pluriel } from "@/lib/typo";

// Le panier gardé dans le navigateur arrive juste après l'affichage : ce
// n'est pas un ajout, le compteur ne saute pas.
const DELAI_LECTURE_PANIER = 800;

/**
 * Bouton panier de l'en-tête : compteur d'articles, total dès 720 px.
 * Au rendu serveur (panier inconnu), il affiche « Panier » ; la place du
 * total est réservée pour que rien ne bouge quand le panier arrive.
 * Ouvre le tiroir une fois branché (lot L11b), mène à la caisse avant.
 */
export function BoutonPanier() {
  const lignes = useAtomValue(panierAtom);
  const tiroirBranche = useAtomValue(tiroirPanierBrancheAtom);
  const ouvrirTiroir = useSetAtom(tiroirPanierOuvertAtom);
  const nombre = nombreArticles(lignes);
  const total = sousTotal(lignes);

  const compteur = useRef<HTMLSpanElement>(null);
  const precedent = useRef(nombre);
  const monteA = useRef(0);

  useEffect(() => {
    monteA.current = Date.now();
  }, []);

  // Animation « saute » à chaque ajout, relancée même si elle est en cours.
  useEffect(() => {
    const avant = precedent.current;

    precedent.current = nombre;
    const el = compteur.current;

    if (
      !el ||
      nombre <= avant ||
      Date.now() - monteA.current < DELAI_LECTURE_PANIER
    )
      return;
    el.classList.remove(styles.saute);
    void el.offsetWidth;
    el.classList.add(styles.saute);
  }, [nombre]);

  const action = tiroirBranche ? "Ouvrir le panier" : "Voir le panier";
  const libelle = nombre
    ? `${action}, ${pluriel(nombre, "article", "articles")}, ${fcfa(total)}`
    : `${action}, vide`;
  const classe =
    "relative inline-flex h-11 min-w-11 shrink-0 items-center gap-2 rounded-pilule border-0 bg-transparent px-2.5 text-encre no-underline hover:bg-surface md:pr-3.5 md:pl-3";

  const contenu = (
    <>
      <span className="relative inline-grid place-items-center">
        <Icone className="size-6" nom="panier" />
        {nombre > 0 ? (
          <span ref={compteur} className={styles.compteur}>
            {nombre}
          </span>
        ) : null}
      </span>
      {/* Largeur réservée : « Panier » et « 12 500 FCFA » (82 px) prennent la même place. */}
      <span className="hidden min-w-[84px] text-sm font-semibold whitespace-nowrap tabular-nums md:inline">
        {nombre ? fcfa(total) : "Panier"}
      </span>
    </>
  );

  if (tiroirBranche) {
    return (
      <button
        aria-haspopup="dialog"
        aria-label={libelle}
        className={classe}
        type="button"
        onClick={() => ouvrirTiroir(true)}
      >
        {contenu}
      </button>
    );
  }

  return (
    <Link
      aria-label={libelle}
      className={classe}
      href={CHEMIN_CAISSE}
      prefetch={false}
    >
      {contenu}
    </Link>
  );
}
