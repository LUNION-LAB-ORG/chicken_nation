"use client";

import { usePathname } from "next/navigation";

import { LienBouton } from "../Bouton";

import { CHEMIN_CARTE, sansBoutonCommander } from "./liens";

/** « Commander » vers la carte ; masqué sur la carte, sur la caisse et sous 360 px. */
export function BoutonCommander() {
  const chemin = usePathname();

  if (sansBoutonCommander(chemin)) return null;

  return (
    <LienBouton
      className="min-h-10 px-3.5 text-sm max-xs:hidden xl:min-h-11 xl:px-5 xl:text-[15px]"
      href={CHEMIN_CARTE}
    >
      Commander
    </LienBouton>
  );
}
