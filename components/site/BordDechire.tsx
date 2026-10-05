import type { CSSProperties } from "react";

import styles from "./BordDechire.module.css";

import { cn } from "@/lib/utils";

const COULEURS = {
  papier: "var(--color-papier)",
  surface: "var(--color-surface)",
  encre: "var(--color-encre)",
  jaune: "var(--color-jaune)",
  orange: "var(--color-orange)",
  "orange-pale": "var(--color-orange-pale)",
} as const;

/**
 * Bord de papier déchiré, décoratif. À poser dans un bloc en position
 * relative : il en recouvre le bas avec la couleur du bloc suivant.
 */
export function BordDechire({
  couleur = "papier",
  inverse,
  haut,
  aplati,
  className,
}: {
  /** Couleur du bloc qui suit (celle du papier déchiré). */
  couleur?: keyof typeof COULEURS;
  /** Tracé retourné. */
  inverse?: boolean;
  /** Au-dessus du bloc au lieu d'en bas (pied de page). */
  haut?: boolean;
  /** Bord plus bas (pied de page). */
  aplati?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        styles.bord,
        inverse && styles.inverse,
        haut && styles.haut,
        aplati && styles.aplati,
        className,
      )}
      style={{ "--couleur-bord": COULEURS[couleur] } as CSSProperties}
    />
  );
}
