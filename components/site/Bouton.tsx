import type { ComponentPropsWithRef, ReactNode } from "react";

import { tv, type VariantProps } from "tailwind-variants";

import { Ancre, type AncreProps } from "./Ancre";
import { Icone, type NomIcone } from "./Icone";

/**
 * Boutons en pilule (maquette, CSS 116-179). Le texte ne passe jamais sur deux
 * lignes : police et marges se resserrent sur les petits téléphones, et un
 * libellé trop long prend sa forme courte (libelleCourt) sous 420 px
 * (retouche 14, tenu à 320 px).
 */
export const styleBouton = tv({
  base: [
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-pilule border-[1.5px] border-transparent",
    "px-[clamp(14px,4.4vw,20px)] text-center font-semibold leading-[1.15] whitespace-nowrap no-underline",
    "transition-[background-color,border-color,box-shadow,transform,color] duration-150 active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-trait disabled:text-encre-doux disabled:shadow-none disabled:active:scale-100",
    "aria-disabled:cursor-not-allowed aria-disabled:border-transparent aria-disabled:bg-trait aria-disabled:text-encre-doux aria-disabled:shadow-none",
  ],
  variants: {
    variante: {
      principal:
        "bg-orange text-encre shadow-bouton hover:not-disabled:not-aria-disabled:bg-orange-appui hover:not-disabled:not-aria-disabled:shadow-bouton-survol",
      secondaire:
        "border-trait-fort bg-white text-encre hover:not-disabled:not-aria-disabled:border-encre",
      sombre:
        "bg-encre text-white shadow-bouton hover:not-disabled:not-aria-disabled:bg-encre-forte hover:not-disabled:not-aria-disabled:shadow-bouton-survol",
    },
    taille: {
      normale: "text-[clamp(14px,4vw,15px)]",
      grand:
        "min-h-13 px-[clamp(14px,5vw,26px)] text-[clamp(14px,4vw,16px)] font-bold",
      petit: "min-h-10 px-3.5 text-sm",
    },
    /** Toute la largeur. */
    bloc: { true: "w-full" },
    /** Texte à gauche, icône ou montant à droite (« Passer commande → »). */
    entre: { true: "justify-between" },
  },
  defaultVariants: { variante: "principal", taille: "normale" },
});

type VariantesBouton = VariantProps<typeof styleBouton>;

type ContenuBouton = {
  /** Icône avant le texte (collée au texte). */
  icone?: NomIcone;
  /** Icône après le texte (flèche). */
  iconeFin?: NomIcone;
  /**
   * Libellé affiché sous 420 px quand le libellé complet ne tient pas sur une
   * ligne (« Recevoir mon code » pour « Recevoir mon code sur WhatsApp »).
   * Il doit être le début du libellé complet, qui reste le nom lu.
   */
  libelleCourt?: string;
  children?: ReactNode;
};

function Contenu({ icone, iconeFin, libelleCourt, children }: ContenuBouton) {
  return (
    <>
      {icone ? <Icone className="size-[18px]" nom={icone} /> : null}
      {libelleCourt ? (
        <>
          <span className="max-[419px]:hidden">{children}</span>
          <span className="min-[420px]:hidden">{libelleCourt}</span>
        </>
      ) : (
        children
      )}
      {iconeFin ? <Icone className="size-[18px]" nom={iconeFin} /> : null}
    </>
  );
}

/** Avec un libellé court, le nom lu reste le libellé complet. */
const nomComplet = (libelleCourt: string | undefined, children: ReactNode) =>
  libelleCourt && typeof children === "string" ? children : undefined;

export type BoutonProps = ComponentPropsWithRef<"button"> &
  VariantesBouton &
  ContenuBouton;

export function Bouton({
  variante,
  taille,
  bloc,
  entre,
  icone,
  iconeFin,
  libelleCourt,
  className,
  children,
  type = "button",
  ...props
}: BoutonProps) {
  return (
    <button
      aria-label={nomComplet(libelleCourt, children)}
      className={styleBouton({ variante, taille, bloc, entre, className })}
      type={type}
      {...props}
    >
      <Contenu icone={icone} iconeFin={iconeFin} libelleCourt={libelleCourt}>
        {children}
      </Contenu>
    </button>
  );
}

export type LienBoutonProps = AncreProps & VariantesBouton & ContenuBouton;

/** Lien qui a l'air d'un bouton (« Voir la carte et commander »). */
export function LienBouton({
  variante,
  taille,
  bloc,
  entre,
  icone,
  iconeFin,
  libelleCourt,
  className,
  children,
  ...props
}: LienBoutonProps) {
  return (
    <Ancre
      aria-label={nomComplet(libelleCourt, children)}
      className={styleBouton({ variante, taille, bloc, entre, className })}
      {...props}
    >
      <Contenu icone={icone} iconeFin={iconeFin} libelleCourt={libelleCourt}>
        {children}
      </Contenu>
    </Ancre>
  );
}
