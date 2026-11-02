import type { ReactNode, Ref } from "react";

import { TEXTES_AVIS } from "../utils/textes-avis";

import { CorpsAvis, EnteteAvis } from "./EnteteAvis";

import { Bouton } from "@/components/site/Bouton";
import { Icone } from "@/components/site/Icone";
import { TitreAffiche } from "@/components/site/TitreAffiche";

const T = TEXTES_AVIS.presentation;

/** Écran 1 : la mascotte, pourquoi on demande l'avis, la promesse de discrétion. */
export function EcranPresentation({
  mascotte,
  refTitre,
  onCommencer,
}: {
  mascotte: ReactNode;
  refTitre?: Ref<HTMLHeadingElement>;
  onCommencer: () => void;
}) {
  return (
    <>
      <EnteteAvis
        centre
        avant={
          <div className="mb-2 w-[clamp(120px,32vw,170px)]">{mascotte}</div>
        }
        refTitre={refTitre}
        titre={T.titre}
      >
        <TitreAffiche
          className="mt-1 text-white [text-shadow:2px_2px_0_var(--color-encre)]"
          niveau="p"
          taille="panneau"
        >
          {T.sousTitre}
        </TitreAffiche>
      </EnteteAvis>
      <CorpsAvis className="grid gap-[18px]">
        {T.paragraphes.map((p) => (
          <p key={p} className="text-[15px] leading-[1.6]">
            {p}
          </p>
        ))}
        <div className="flex items-start gap-3 rounded-carte bg-orange-pale px-4 py-3.5">
          <Icone
            className="mt-px size-[22px] text-orange-texte"
            nom="cadenas"
          />
          <p className="text-[14px] leading-normal text-encre-clair">
            {T.prive}
          </p>
        </div>
        <div className="mt-2 grid gap-2.5">
          <Bouton bloc taille="grand" onClick={onCommencer}>
            {T.bouton}
          </Bouton>
          <p className="text-center text-[13px] text-encre-doux">{T.duree}</p>
        </div>
      </CorpsAvis>
    </>
  );
}
