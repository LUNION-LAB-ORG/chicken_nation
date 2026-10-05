import type { ReactNode } from "react";

import { tv } from "tailwind-variants";

import { Ancre } from "./Ancre";

import { cn } from "@/lib/utils";

/* Petites étiquettes de la maquette (CSS 905-923, 990-993, 1458-1466, 761-764). */

/**
 * Pastille de catégorie (barre de la carte) : lien vers l'ancre de la section.
 * `actif` marque la catégorie visible (aria-current).
 */
export function Pastille({
  href,
  actif,
  promo,
  className,
  children,
}: {
  href: string;
  actif?: boolean;
  /** Point jaune devant les promotions. */
  promo?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Ancre
      aria-current={actif ? "true" : undefined}
      className={cn(
        "inline-flex min-h-10 shrink-0 items-center gap-[7px] rounded-pilule border-[1.5px] border-trait-fort bg-white px-4 text-sm font-semibold whitespace-nowrap text-encre no-underline hover:border-encre",
        "aria-[current=true]:border-encre aria-[current=true]:bg-encre aria-[current=true]:text-white",
        promo &&
          "before:size-[9px] before:rounded-full before:bg-jaune before:shadow-[0_0_0_1.5px_var(--color-encre)] before:content-['']",
        className,
      )}
      href={href}
    >
      {children}
    </Ancre>
  );
}

const styleTag = tv({
  base: "inline-flex w-fit items-center gap-1 rounded-pilule px-2 text-[11.5px] leading-[1.5] font-bold whitespace-nowrap",
  variants: {
    genre: {
      emporter: "bg-rouge-fond text-rouge",
      offert: "bg-ok-fond text-ok",
      neutre: "border border-trait bg-surface text-encre",
    },
  },
  defaultVariants: { genre: "neutre" },
});

/** Mention courte sur une ligne de panier (« À emporter », « Offert »). */
export function Tag({
  genre,
  className,
  children,
}: {
  genre?: "emporter" | "offert" | "neutre";
  className?: string;
  children: ReactNode;
}) {
  return <span className={styleTag({ genre, className })}>{children}</span>;
}

const styleStatut = tv({
  base: "inline-flex w-fit items-center gap-1.5 rounded-pilule px-2.5 py-[3px] text-[12.5px] font-bold whitespace-nowrap before:size-[7px] before:rounded-full before:bg-current before:content-['']",
  variants: {
    etat: {
      attente: "bg-jaune-pale text-orange-texte",
      cours: "bg-orange-pale text-orange-texte",
      fini: "bg-ok-fond text-ok",
    },
  },
});

/** État d'une commande (« En préparation », « Livrée »). */
export function Statut({
  etat,
  className,
  children,
}: {
  etat: "attente" | "cours" | "fini";
  className?: string;
  children: ReactNode;
}) {
  return <span className={styleStatut({ etat, className })}>{children}</span>;
}

const NIVEAUX = {
  standard: { texte: "Standard", classe: "bg-standard text-encre" },
  vip: { texte: "VIP", classe: "bg-vip text-encre" },
  vvip: { texte: "VVIP", classe: "bg-vvip text-white" },
} as const;

/** Niveau de fidélité, aux couleurs de la Carte de la Nation. */
export function Niveau({
  niveau,
  className,
}: {
  niveau: keyof typeof NIVEAUX;
  className?: string;
}) {
  const { texte, classe } = NIVEAUX[niveau];

  return (
    <span
      className={cn(
        "inline-block rounded-pilule px-2.5 text-xs leading-[1.5] font-bold",
        classe,
        className,
      )}
    >
      {texte}
    </span>
  );
}
