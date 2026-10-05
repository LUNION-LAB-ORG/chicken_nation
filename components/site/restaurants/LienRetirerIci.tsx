"use client";

import { useAtomValue } from "jotai";
import Link from "next/link";

import { styleBouton } from "../Bouton";
import { Icone } from "../Icone";

import { panierAtom } from "@/features/commande/stores/panier.store";
import { nombreArticles } from "@/features/commande/utils/panier.utils";

/**
 * « Retirer ici » : la caisse en retrait sur ce restaurant, ou la carte si le
 * panier est vide (décidé dans le navigateur, le panier n'existe que là).
 * La caisse lit `retrait`, passe en retrait sur ce restaurant, puis retire le
 * paramètre de l'adresse (lot L11).
 */
export function LienRetirerIci({
  slug,
  nom,
  className,
}: {
  slug: string;
  /** Nom affiché du restaurant (« Angré »). */
  nom: string;
  className?: string;
}) {
  const panierVide = nombreArticles(useAtomValue(panierAtom)) === 0;
  const page = panierVide ? "/fr/carte" : "/fr/commander";

  return (
    <Link
      className={styleBouton({ taille: "petit", className })}
      href={`${page}?retrait=${encodeURIComponent(slug)}`}
      prefetch={false}
    >
      <Icone className="size-[18px]" nom="sac" />
      Retirer ici
      <span className="sr-only">, à {nom}</span>
    </Link>
  );
}
