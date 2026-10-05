import type { ComponentPropsWithRef, ReactNode } from "react";

import Link from "next/link";

export type AncreProps = Omit<ComponentPropsWithRef<"a">, "href"> & {
  /** Adresse complète, préfixe /fr compris (« /fr/carte »), ancre (« #box »), tel:, mailto: ou https://. */
  href: string;
  /**
   * Préchargement de la page quand le lien entre à l'écran : coupé par
   * défaut. Next téléchargeait alors aussi l'image principale et la CSS de
   * la page visée, inutiles tant qu'on n'y va pas (données mobiles payantes,
   * plan 5.4). La page reste ouverte sans rechargement complet au clic.
   */
  prefetch?: boolean;
  /** Ouvre dans un nouvel onglet et le dit aux lecteurs d'écran. */
  nouvelOnglet?: boolean;
  children?: ReactNode;
};

/**
 * Lien de base des composants du site : next/link pour les pages du site
 * (navigation sans rechargement), <a> pour le reste.
 */
export function Ancre({
  href,
  nouvelOnglet,
  prefetch = false,
  children,
  ...props
}: AncreProps) {
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
      <Link href={href} prefetch={prefetch} {...cible} {...props}>
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
