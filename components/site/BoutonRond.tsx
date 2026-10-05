import type { ComponentPropsWithRef } from "react";

import { tv, type VariantProps } from "tailwind-variants";

import { Icone, type NomIcone } from "./Icone";

const styleBoutonRond = tv({
  base: "inline-grid size-11 shrink-0 place-items-center rounded-full border-0 p-0 text-encre transition-colors duration-150 hover:bg-surface",
  variants: {
    variante: {
      transparent: "bg-transparent",
      blanc: "bg-white shadow-1",
    },
  },
  defaultVariants: { variante: "transparent" },
});

export type BoutonRondProps = Omit<
  ComponentPropsWithRef<"button">,
  "children"
> &
  VariantProps<typeof styleBoutonRond> & {
    icone: NomIcone;
    /** Nom lu par les lecteurs d'écran (« Fermer la fiche »). */
    libelle: string;
  };

/** Bouton rond de 44 px, icône seule (fermer, menu). */
export function BoutonRond({
  icone,
  libelle,
  variante,
  className,
  type = "button",
  ...props
}: BoutonRondProps) {
  return (
    <button
      aria-label={libelle}
      className={styleBoutonRond({ variante, className })}
      type={type}
      {...props}
    >
      <Icone nom={icone} />
    </button>
  );
}
