import type { ReactNode } from "react";

import { Icone } from "./Icone";
import { PauseBande } from "./PauseBande";
import styles from "./BandeDefilante.module.css";

import { cn } from "@/lib/utils";

/**
 * Bandeau d'infos en travers qui défile (retouche 7). Rendu au serveur :
 * quatre copies de la liste, les trois dernières masquées aux lecteurs
 * d'écran. Défilement en CSS, en pause au survol, au focus et par le bouton ;
 * statique et à la ligne avec le mouvement réduit. Les éléments sont des
 * ElementBande.
 */
export function BandeDefilante({
  libelle = "Infos pratiques",
  className,
  children,
}: {
  libelle?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(styles.cadre, className)}>
      <div
        aria-label={libelle}
        className={styles.bande}
        data-bande=""
        role="region"
      >
        <div className={styles.piste}>
          <ul className={styles.liste}>{children}</ul>
          {[1, 2, 3].map((copie) => (
            <ul
              key={copie}
              aria-hidden="true"
              className={cn(styles.liste, styles.copie)}
            >
              {children}
            </ul>
          ))}
        </div>
        <PauseBande />
      </div>
    </div>
  );
}

/** Une info du bandeau, précédée d'une étoile orange ou du chronomètre. */
export function ElementBande({
  horloge,
  children,
}: {
  horloge?: boolean;
  children: ReactNode;
}) {
  return (
    <li>
      {horloge ? (
        // Petite icône à taille fixe : pas besoin de next/image. « lazy » :
        // pas de préchargement prioritaire face à l'image principale.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className={styles.horloge}
          decoding="async"
          height={50}
          loading="lazy"
          src="/assets/site/icone-horloge.png"
          width={52}
        />
      ) : (
        <Icone className={styles.etoile} nom="etoile" />
      )}
      {children}
    </li>
  );
}
