import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Largeur de 1 200 px au plus, gouttières de 16 px (32 px dès 720 px). */
export function Conteneur({
  as: Balise = "div",
  className,
  children,
}: {
  as?: "div" | "nav" | "header" | "footer";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Balise
      className={cn(
        "mx-auto w-full max-w-(--largeur) px-(--gouttiere)",
        className,
      )}
    >
      {children}
    </Balise>
  );
}

const FONDS = {
  papier: "bg-papier text-encre",
  surface: "bg-surface text-encre",
  "orange-pale": "bg-orange-pale text-encre",
  orange: "bg-orange text-encre",
  jaune: "bg-jaune text-encre",
  "jaune-appli": "bg-jaune-appli text-encre",
  // Fond sombre : texte blanc et contour de focus jaune.
  encre: "bg-encre text-white [--focus:var(--color-jaune)]",
} as const;

export type FondSection = keyof typeof FONDS;

// Motif d'étoiles assorti à chaque aplat (CSS 52-55).
const MOTIFS: Partial<Record<FondSection, string>> = {
  orange: "[background-image:var(--motif-clair)]",
  jaune: "[background-image:var(--motif-sombre)]",
  encre: "[background-image:var(--motif-encre)]",
  surface: "[background-image:var(--motif-nappe)]",
  papier: "[background-image:var(--motif-nappe)]",
  "orange-pale": "[background-image:var(--motif-nappe)]",
};

const ESPACEMENTS = {
  /** Bloc courant : 48 px, 64 px dès 900 px (CSS 409-413). */
  bloc: "py-12 lg:py-16",
  aucun: "",
} as const;

/**
 * Section pleine largeur : aplat de couleur bord à bord, contenu limité à
 * 1 200 px. Composant serveur, sans animation (le contenu est visible dès le
 * premier rendu). Remplace components/primitives/Section.tsx.
 */
export function Section({
  as: Balise = "section",
  id,
  titreId,
  libelle,
  fond = "papier",
  motif,
  espacement = "bloc",
  conteneur = true,
  className,
  classeConteneur,
  children,
}: {
  as?: "section" | "div" | "aside";
  id?: string;
  /** id du titre de la section (aria-labelledby). */
  titreId?: string;
  /** Nom de la section quand elle n'a pas de titre visible. */
  libelle?: string;
  fond?: FondSection;
  /** Motif d'étoiles assorti au fond. */
  motif?: boolean;
  espacement?: keyof typeof ESPACEMENTS;
  /** false : le contenu gère lui-même sa largeur (images bord à bord). */
  conteneur?: boolean;
  className?: string;
  classeConteneur?: string;
  children: ReactNode;
}) {
  return (
    <Balise
      aria-label={titreId ? undefined : libelle}
      aria-labelledby={titreId}
      className={cn(
        "relative isolate",
        FONDS[fond],
        motif && MOTIFS[fond],
        motif && "[background-size:72px_72px] bg-repeat",
        ESPACEMENTS[espacement],
        className,
      )}
      id={id}
    >
      {conteneur ? (
        <Conteneur className={classeConteneur}>{children}</Conteneur>
      ) : (
        children
      )}
    </Balise>
  );
}
