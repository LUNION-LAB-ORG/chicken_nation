import type { ReactNode, Ref } from "react";

import { TEXTES_AVIS } from "../utils/textes-avis";

import { TitreAvis } from "./TitreAvis";

import { BoutonRond } from "@/components/site/BoutonRond";
import { Conteneur } from "@/components/site/Section";
import { cn } from "@/lib/utils";

/** Colonne des écrans : pleine largeur sur téléphone, 560 px au plus ailleurs. */
export const COLONNE_AVIS = "mx-auto w-full max-w-[560px]";

export const ID_TITRE_AVIS = "avis-titre";

/**
 * Haut d'un écran du parcours : aplat orange de la marque avec son motif
 * d'étoiles, bouton Retour et numéro d'étape (étapes 1 et 2), ou mascotte
 * centrée (présentation, merci), puis le titre H1.
 */
export function EnteteAvis({
  titre,
  refTitre,
  etape,
  onRetour,
  centre,
  avant,
  children,
}: {
  titre: string;
  refTitre?: Ref<HTMLHeadingElement>;
  /** « Étape 1 sur 2 ». */
  etape?: string;
  onRetour?: () => void;
  /** Contenu centré (écrans avec mascotte). */
  centre?: boolean;
  /** Au-dessus du titre (la mascotte). */
  avant?: ReactNode;
  /** Sous le titre. */
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby={ID_TITRE_AVIS}
      className={cn(
        "bg-orange [background-image:var(--motif-clair)] [background-size:72px_72px] bg-repeat text-encre",
        centre ? "pt-6 pb-8 md:pt-9 md:pb-11" : "pt-3 pb-7 md:pt-5 md:pb-9",
      )}
    >
      <Conteneur>
        <div
          className={cn(
            COLONNE_AVIS,
            "grid gap-2",
            centre && "justify-items-center text-center",
          )}
        >
          {onRetour ? (
            <BoutonRond
              className="-ml-2.5 hover:bg-orange-pale/60"
              icone="retour"
              libelle={TEXTES_AVIS.retour}
              onClick={onRetour}
            />
          ) : null}
          {avant}
          {etape ? (
            <p className="text-sm font-semibold text-encre">{etape}</p>
          ) : null}
          <TitreAvis ref={refTitre} id={ID_TITRE_AVIS}>
            {titre}
          </TitreAvis>
          {children}
        </div>
      </Conteneur>
    </section>
  );
}

/** Corps d'un écran, sur le fond papier du site. */
export function CorpsAvis({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="bg-papier pt-6 pb-12 md:pt-8 md:pb-16">
      <Conteneur>
        <div className={cn(COLONNE_AVIS, className)}>{children}</div>
      </Conteneur>
    </div>
  );
}
