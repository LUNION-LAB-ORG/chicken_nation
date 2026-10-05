import type { ReactNode } from "react";

import styles from "./Autocollants.module.css";

import { cn } from "@/lib/utils";

/* Autocollants de la maquette (CSS 99, 261-345, 461-468). */

/** Petit titre en capitales au-dessus d'un titre (« Promotion du moment »). */
export function Surtitre({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "text-[13px] font-bold tracking-[0.08em] text-orange-texte uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Bande jaune penchée (« Délicieux jusqu'à l'os »). */
export function Ruban({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "inline-block -rotate-2 rounded-md bg-jaune px-3.5 pt-[7px] pb-1.5 text-sm leading-[1.1] font-extrabold tracking-[0.06em] text-encre uppercase shadow-bouton",
        className,
      )}
    >
      {children}
    </p>
  );
}

type PropsCollant = {
  /** Gros texte du haut (« 100 % »), insécable compris. */
  fort: ReactNode;
  /** Texte du bas (« Halal »). */
  texte: ReactNode;
  /** Position (absolute, top, left...) donnée par le parent. */
  className?: string;
};

/** Tampon rond penché (« 100 % Halal »). */
export function Tampon({ fort, texte, className }: PropsCollant) {
  return (
    <p className={cn(styles.tampon, className)}>
      <b>{fort}</b>
      {texte}
    </p>
  );
}

/** Éclat jaune en étoile (« 100 % Local »). */
export function Eclat({ fort, texte, className }: PropsCollant) {
  return (
    <div className={cn(styles.eclat, className)}>
      <p className={styles.forme}>
        <b>{fort}</b>
        {texte}
      </p>
    </div>
  );
}

/**
 * Étiquette blanche penchée posée sur la photo de l'accroche : surtitre, nom
 * du plat, prix et bouton. Marges négatives et position à fixer par le parent.
 */
export function EtiquettePromo({
  surtitre,
  nom,
  prix,
  action,
  className,
}: {
  surtitre: ReactNode;
  nom: ReactNode;
  prix?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative z-[3] grid w-[min(250px,80%)] -rotate-2 grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2.5 gap-y-0.5 rounded-carte bg-white px-3 pt-2.5 pb-3 shadow-photo md:w-[min(272px,94%)] md:px-3.5 md:pt-3 md:pb-3.5",
        className,
      )}
    >
      <Surtitre className="col-span-full">{surtitre}</Surtitre>
      <p className="col-span-full mb-1.5 text-[17px] leading-[1.15] font-extrabold md:text-[19px]">
        {nom}
      </p>
      {prix ? <div>{prix}</div> : null}
      {action ? <div className="relative z-[1]">{action}</div> : null}
    </div>
  );
}

/**
 * Badge sombre penché sur la photo d'un plat en promotion. Placé en haut à
 * gauche de la photo ; `statique` le laisse dans le flux (fiche plat).
 */
export function BadgePromo({
  statique,
  className,
  children,
}: {
  statique?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none z-[1] inline-block -rotate-3 rounded-md bg-encre px-[9px] py-[3px] text-xs leading-[1.3] font-bold tracking-[0.02em] text-jaune",
        statique ? "static w-fit" : "absolute top-2 left-2",
        className,
      )}
    >
      {children}
    </span>
  );
}
