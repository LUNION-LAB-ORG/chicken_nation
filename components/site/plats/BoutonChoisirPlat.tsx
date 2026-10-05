"use client";

import type { MouseEvent, ReactNode } from "react";

import { useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";

import {
  ficheBrancheeAtom,
  ficheDemandeeAtom,
} from "@/features/commande/stores/interface.store";

/**
 * Lien vers la page d'un plat qui, une fois la fiche branchée (lot L11b),
 * ouvre la fiche dans une fenêtre sans changer d'adresse. Google suit le
 * lien, un clic du milieu ou avec Ctrl ou Cmd ouvre la page dans un nouvel
 * onglet ; seul le clic simple est intercepté.
 */
export function BoutonChoisirPlat({
  platId,
  href,
  className,
  "aria-label": libelle,
  children,
}: {
  platId: string;
  /** Chemin de la page du plat (`cheminPlat`). */
  href: string;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
}) {
  const ficheBranchee = useAtomValue(ficheBrancheeAtom);
  const demanderFiche = useSetAtom(ficheDemandeeAtom);

  const surClic = (e: MouseEvent<HTMLAnchorElement>) => {
    if (
      !ficheBranchee ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    e.preventDefault();
    demanderFiche({ platId });
  };

  return (
    <Link
      aria-haspopup={ficheBranchee ? "dialog" : undefined}
      aria-label={libelle}
      className={className}
      href={href}
      // Une carte compte jusqu'à 49 plats : pas de préchargement de chaque page.
      prefetch={false}
      onClick={surClic}
    >
      {children}
    </Link>
  );
}
