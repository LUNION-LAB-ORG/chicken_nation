import type { CSSProperties, ReactNode } from "react";

import Image from "next/image";

import styles from "./PhotoPlat.module.css";

import { cn } from "@/lib/utils";

/**
 * Photo d'un plat, entière, sur la couleur de son fond (retouche 5). La zone
 * prend la taille donnée par className (hauteur fixe d'une carte, vignette) ;
 * la photo s'y centre sans être coupée.
 */
export function PhotoPlat({
  src,
  alt,
  sizes,
  fond,
  etiquette,
  etiquetteGauche,
  marge,
  tailleEtiquette,
  preload,
  className,
  style,
  children,
}: {
  src: string;
  /** Nom du plat (texte alternatif exact). */
  alt: string;
  /** Largeurs réellement affichées, par exemple "(min-width: 900px) 280px, 62vw". */
  sizes: string;
  /** Couleur du fond de la photo (photos recadrées) ; #FBEACA par défaut. */
  fond?: string;
  /** Étiquette étoile dessinée : seulement pour les photos recadrées (celles de l'API la portent déjà). */
  etiquette?: boolean;
  etiquetteGauche?: boolean;
  /** Air autour de la photo, en px (12 par défaut). */
  marge?: number;
  /** Largeur de l'étiquette, en px (32 par défaut). */
  tailleEtiquette?: number;
  /** Seulement pour l'image principale du premier écran. */
  preload?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Badge posé sur la photo (BadgePromo). */
  children?: ReactNode;
}) {
  const variables = {
    ...(fond ? { "--fond": fond } : {}),
    ...(marge !== undefined ? { "--marge": `${marge}px` } : {}),
    ...(tailleEtiquette !== undefined
      ? { "--etiq": `${tailleEtiquette}px` }
      : {}),
    ...style,
  } as CSSProperties;

  return (
    <div
      className={cn(
        styles.photo,
        etiquette && styles.avecEtiquette,
        etiquetteGauche && styles.etiquetteGauche,
        className,
      )}
      style={variables}
    >
      <div className={styles.cadre}>
        <Image
          fill
          alt={alt}
          className={styles.image}
          preload={preload}
          sizes={sizes}
          src={src}
        />
      </div>
      {etiquette ? (
        <span aria-hidden="true" className={styles.etiquette} />
      ) : null}
      {children}
    </div>
  );
}
