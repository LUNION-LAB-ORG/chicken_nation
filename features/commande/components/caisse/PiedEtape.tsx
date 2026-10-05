import type { ReactNode } from "react";

import { Bouton } from "@/components/site/Bouton";
import { fcfa } from "@/lib/typo";
import { cn } from "@/lib/utils";

/**
 * Pied d'une étape (maquette, CSS 1255-1281) : « Retour », total, bouton
 * principal. Sous 1 000 px, il colle au bas de l'écran avec le total à
 * gauche (le récapitulatif est replié) et « Retour » disparaît (les pilules
 * de l'en-tête y mènent). Dès 1 000 px, le total est dans le récapitulatif.
 *
 * `pleineLargeur` : sous 375 px, le bouton prend toute la largeur et le total
 * se cache (« Payer 18 180 FCFA » dit déjà le montant).
 */
export function PiedEtape({
  libelleTotal,
  total,
  onRetour,
  pleineLargeur,
  children,
}: {
  /** « Total », « Total hors livraison »… */
  libelleTotal: string;
  total: number;
  /** Retour à l'étape précédente (absent à l'étape 1). */
  onRetour?: () => void;
  pleineLargeur?: boolean;
  /** Bouton principal (« Continuer », « Payer »). */
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-3.5 gap-y-2.5",
        "max-[999px]:sticky max-[999px]:bottom-0 max-[999px]:z-20 max-[999px]:-mx-(--gouttiere-caisse) max-[999px]:flex-nowrap",
        "max-[999px]:border-t max-[999px]:border-trait max-[999px]:bg-papier max-[999px]:px-(--gouttiere-caisse) max-[999px]:pt-2.5 max-[999px]:pb-[calc(10px+env(safe-area-inset-bottom,0px))] max-[999px]:shadow-haut",
      )}
    >
      {onRetour ? (
        <Bouton
          className="max-[999px]:hidden"
          icone="retour"
          variante="secondaire"
          onClick={onRetour}
        >
          Retour
        </Bouton>
      ) : null}
      <p
        className={cn(
          "grid min-w-0 text-xs leading-tight text-encre-doux min-[1000px]:hidden",
          pleineLargeur && "max-[374px]:hidden",
        )}
      >
        <span>{libelleTotal}</span>
        <strong className="text-[17px] whitespace-nowrap text-encre tabular-nums">
          {fcfa(total)}
        </strong>
      </p>
      <div
        className={cn(
          "ml-auto flex min-w-0 shrink-0 justify-end",
          pleineLargeur && "max-[374px]:ml-0 max-[374px]:flex-1",
        )}
      >
        {children}
      </div>
    </div>
  );
}
