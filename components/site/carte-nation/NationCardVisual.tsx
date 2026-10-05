import Image from "../Image";

import styles from "./NationCardVisual.module.css";

import { estTexteAffiche } from "@/lib/typo";
import { cn } from "@/lib/utils";

/**
 * Carte de la Nation dessinée en CSS (aucune image à maintenir hors du logo) :
 * page d'adhésion (penchée) et écran de confirmation (droite). Décorative :
 * masquée aux lecteurs d'écran, le texte de la page dit la même chose.
 * Sans réduction ni autre promesse absente de la retouche 2.
 */
export default function NationCardVisual({
  cardLabel,
  memberLabel,
  tilted = true,
  className,
}: {
  /** « Carte de la Nation », en police d'affiche (texte fixe sans accent). */
  cardLabel: string;
  /** « Niveau Standard ». */
  memberLabel: string;
  tilted?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(styles.carte, !tilted && styles.droite, className)}
    >
      <div className={styles.face}>
        <span className={styles.logo}>
          {/* 36 px de haut : next/image sert 32 ou 48 px de large au lieu des 20 ko d'origine. */}
          <Image
            alt=""
            height={36}
            src="/assets/site/logo-orange.png"
            width={24}
          />
        </span>
        <span className={styles.puce} />
        <span
          className={cn(
            styles.titre,
            // La police d'affiche n'a ni accent ni apostrophe.
            estTexteAffiche(cardLabel)
              ? "font-affiche"
              : "font-texte font-extrabold",
          )}
        >
          {cardLabel}
        </span>
        <span className={styles.membre}>{memberLabel}</span>
        <span className={styles.numero}>•••• 2026</span>
      </div>
    </div>
  );
}
