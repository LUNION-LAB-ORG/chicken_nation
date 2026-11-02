import type { ReactNode, Ref } from "react";
import type { RessentiAvis } from "../types/avis.types";

import { TEXTES_AVIS, ecranMerci } from "../utils/textes-avis";

import { EnteteAvis } from "./EnteteAvis";

import { Ancre } from "@/components/site/Ancre";
import { LienBouton } from "@/components/site/Bouton";
import { Icone } from "@/components/site/Icone";
import { TELEPHONE, telLien } from "@/lib/typo";

const T = TEXTES_AVIS.merci;

/** Numéros de l'appli client (07 07 58 14 10 et 11). */
const NUMEROS_APPLI = ["07 07 58 14 10", "07 07 58 14 11"] as const;

const classeLien =
  "inline-flex min-h-11 items-center font-semibold text-encre underline-offset-[3px] hover:underline";

/** Globe au trait (absent du jeu d'icônes du site), couleur du texte. */
function IconeGlobe() {
  return (
    <svg
      aria-hidden="true"
      className="block size-[18px] shrink-0"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </svg>
  );
}

/** Bulle de discussion au trait (maquette), couleur du texte. */
function IconeBulle() {
  return (
    <svg
      aria-hidden="true"
      className="block size-[18px] shrink-0"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
    </svg>
  );
}

function Ligne({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <li className="flex min-w-0 items-center gap-2.5">
      <span className="text-orange-texte">{icone}</span>
      <span className="flex min-w-0 flex-wrap items-center gap-x-1">
        {children}
      </span>
    </li>
  );
}

/**
 * Écran 4 : merci. Titre et message selon le ressenti et l'accord de rappel
 * (ecranMerci), puis une carte blanche identique pour tous : les autres
 * façons de joindre Chicken Nation et le retour à l'accueil.
 */
export function EcranMerci({
  mascotte,
  ressenti,
  accordRappel,
  refTitre,
}: {
  mascotte: ReactNode;
  ressenti: RessentiAvis;
  accordRappel: boolean;
  refTitre?: Ref<HTMLHeadingElement>;
}) {
  const { titre, message } = ecranMerci(ressenti, accordRappel);

  return (
    <EnteteAvis
      centre
      avant={<div className="mb-2 w-[clamp(110px,28vw,150px)]">{mascotte}</div>}
      refTitre={refTitre}
      titre={titre}
    >
      <p className="mt-1 max-w-[30em] text-[16px] leading-normal font-medium text-encre">
        {message}
      </p>
      <div className="mt-6 grid w-full gap-3.5 rounded-panneau bg-white p-5 text-left shadow-1 md:p-6">
        <p className="text-[15px] font-semibold">{T.attente}</p>
        <ul className="grid list-none gap-x-3 gap-y-1 text-[14.5px] sm:grid-cols-2">
          <Ligne icone={<Icone className="size-[18px]" nom="mobile" />}>
            <Ancre className={classeLien} href="/fr/app-mobile">
              {T.appli}
            </Ancre>
          </Ligne>
          <Ligne icone={<IconeGlobe />}>
            <Ancre className={classeLien} href="/fr">
              {T.site}
            </Ancre>
          </Ligne>
          <Ligne icone={<Icone className="size-[18px]" nom="telephone" />}>
            <a className={`${classeLien} whitespace-nowrap`} href={telLien()}>
              {TELEPHONE}
            </a>
          </Ligne>
          <Ligne icone={<IconeBulle />}>
            <a
              className={`${classeLien} whitespace-nowrap`}
              href={telLien(NUMEROS_APPLI[0])}
            >
              {NUMEROS_APPLI[0]}
            </a>{" "}
            <span aria-hidden="true">/</span>{" "}
            <a
              aria-label={NUMEROS_APPLI[1]}
              className={`${classeLien} px-1`}
              href={telLien(NUMEROS_APPLI[1])}
            >
              11
            </a>
          </Ligne>
        </ul>
        <LienBouton
          bloc
          className="mt-1"
          href="/fr"
          taille="grand"
          variante="secondaire"
        >
          {T.accueil}
        </LienBouton>
      </div>
    </EnteteAvis>
  );
}
