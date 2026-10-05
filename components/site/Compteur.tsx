"use client";

import { tv } from "tailwind-variants";

import { Icone } from "./Icone";

const styleCompteur = tv({
  slots: {
    groupe:
      "inline-flex shrink-0 items-center rounded-pilule border-[1.5px] border-trait-fort bg-white",
    bouton:
      "grid place-items-center rounded-full border-0 bg-transparent p-0 text-encre hover:not-disabled:bg-surface disabled:cursor-not-allowed disabled:opacity-35",
    valeur: "text-center font-bold tabular-nums",
  },
  variants: {
    taille: {
      normale: { bouton: "size-[38px]", valeur: "min-w-6 text-sm" },
      grand: {
        bouton: "h-12 w-[38px] md:w-11",
        valeur: "min-w-[30px] text-base",
      },
    },
  },
  defaultVariants: { taille: "normale" },
});

/**
 * Sélecteur de quantité : moins, quantité, plus (maquette, CSS 1001-1010).
 * À la quantité minimale, « moins » devient une poubelle si onRetirer est donné.
 */
export function Compteur({
  valeur,
  onChange,
  onRetirer,
  min = 1,
  max = 99,
  nom,
  libelle = "Quantité",
  taille,
  className,
}: {
  valeur: number;
  onChange: (valeur: number) => void;
  /** Retire la ligne (poubelle à la quantité minimale). */
  onRetirer?: () => void;
  min?: number;
  max?: number;
  /** Nom de l'article, pour des boutons explicites (« Retirer Box de la Nation »). */
  nom?: string;
  libelle?: string;
  taille?: "normale" | "grand";
  className?: string;
}) {
  const s = styleCompteur({ taille });
  const auMinimum = valeur <= min;
  const poubelle = auMinimum && Boolean(onRetirer);

  return (
    <div
      aria-label={nom ? `${libelle}, ${nom}` : libelle}
      className={s.groupe({ className })}
      role="group"
    >
      <button
        aria-label={poubelle ? `Retirer${nom ? ` ${nom}` : ""}` : "Un de moins"}
        className={s.bouton()}
        disabled={auMinimum && !poubelle}
        type="button"
        onClick={() =>
          poubelle ? onRetirer?.() : onChange(Math.max(min, valeur - 1))
        }
      >
        <Icone className="size-4" nom={poubelle ? "poubelle" : "moins"} />
      </button>
      <output aria-live="polite" className={s.valeur()}>
        {valeur}
      </output>
      <button
        aria-label="Un de plus"
        className={s.bouton()}
        disabled={valeur >= max}
        type="button"
        onClick={() => onChange(Math.min(max, valeur + 1))}
      >
        <Icone className="size-4" nom="plus" />
      </button>
    </div>
  );
}
