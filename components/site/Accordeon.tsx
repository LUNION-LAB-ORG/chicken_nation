import type { ReactNode } from "react";

import styles from "./Accordeon.module.css";

import { cn } from "@/lib/utils";

/**
 * Volet dépliable natif : clavier, lecteurs d'écran et recherche dans la page
 * sans JavaScript. Des volets qui partagent `groupe` ne s'ouvrent qu'un à la
 * fois (navigateurs récents ; les autres les laissent tous ouvrables).
 */
export function Accordeon({
  titre,
  sousTitre,
  ouvert,
  groupe,
  className,
  classeCorps,
  children,
}: {
  titre: ReactNode;
  /** Précision discrète à côté du titre (« 3 choisis »). */
  sousTitre?: ReactNode;
  /** Ouvert au premier affichage. */
  ouvert?: boolean;
  groupe?: string;
  className?: string;
  classeCorps?: string;
  children: ReactNode;
}) {
  return (
    <details
      className={cn(styles.volet, className)}
      name={groupe}
      open={ouvert}
    >
      <summary className={styles.titre}>
        <span className="min-w-0">{titre}</span>
        {sousTitre ? <small>{sousTitre}</small> : null}
      </summary>
      <div className={cn(styles.corps, classeCorps)}>{children}</div>
    </details>
  );
}
