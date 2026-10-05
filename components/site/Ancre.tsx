import type { ComponentPropsWithRef, ReactNode } from "react";

import Link from "next/link";

export type AncreProps = Omit<ComponentPropsWithRef<"a">, "href"> & {
  /** Adresse complète, préfixe /fr compris (« /fr/carte »), ancre (« #box »), tel:, mailto: ou https://. */
  href: string;
  /** Ouvre dans un nouvel onglet et le dit aux lecteurs d'écran. */
  nouvelOnglet?: boolean;
  children?: ReactNode;
};

/**
 * Lien de base des composants du site : next/link pour les pages du site
 * (préchargement, navigation sans rechargement), <a> pour le reste.
 */
export function Ancre({ href, nouvelOnglet, children, ...props }: AncreProps) {
  const cible = nouvelOnglet
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  const contenu = (
    <>
      {children}
      {nouvelOnglet ? <span className="sr-only">, nouvel onglet</span> : null}
    </>
  );

  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} {...cible} {...props}>
        {contenu}
      </Link>
    );
  }

  return (
    <a href={href} {...cible} {...props}>
      {contenu}
    </a>
  );
}
