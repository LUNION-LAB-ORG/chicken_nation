import { LienFleche } from "../Lien";
import { TitreAffiche } from "../TitreAffiche";

import { cn } from "@/lib/utils";

/**
 * Tête d'un bloc de l'accueil (maquette, CSS 409-413) : titre d'affiche et
 * phrase à gauche, lien fléché à droite (dessous sur téléphone).
 */
export function TeteBloc({
  titre,
  titreId,
  sousTitre,
  lien,
  classeSousTitre,
}: {
  /** Texte fixe, sans accent (police d'affiche). */
  titre: string;
  titreId: string;
  sousTitre?: string;
  lien?: { href: string; texte: string };
  /** Couleur de la phrase (encre douce par défaut). */
  classeSousTitre?: string;
}) {
  return (
    <div className="mb-[22px] flex flex-wrap items-end justify-between gap-x-7 gap-y-2.5 lg:mb-[30px]">
      <div className="grid min-w-0 gap-2">
        <TitreAffiche id={titreId}>{titre}</TitreAffiche>
        {sousTitre ? (
          <p className={cn("max-w-[40em] text-encre-doux", classeSousTitre)}>
            {sousTitre}
          </p>
        ) : null}
      </div>
      {lien ? <LienFleche href={lien.href}>{lien.texte}</LienFleche> : null}
    </div>
  );
}
