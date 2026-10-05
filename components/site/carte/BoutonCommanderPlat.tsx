"use client";

import type { IPlatCarte } from "@/features/menus/types/carte.types";

import { useSetAtom } from "jotai";

import { Bouton } from "../Bouton";

import { useDisponibleMaintenant } from "./DisponibiliteHoraire";

import { ficheDemandeeAtom } from "@/features/commande/stores/interface.store";

/**
 * « Choisir et commander » de la page d'un plat : ouvre la fiche (choix,
 * suppléments, quantité) sans quitter la page. Bloqué pour un plat servi
 * seulement au restaurant, et hors de son créneau horaire (calculé dans le
 * navigateur, chaque minute).
 */
export function BoutonCommanderPlat({
  plat,
  surPlaceSeulement,
  className,
}: {
  plat: Pick<IPlatCarte, "id" | "creneau">;
  /** Vendu seulement à table : rien à commander en ligne. */
  surPlaceSeulement: boolean;
  className?: string;
}) {
  const demanderFiche = useSetAtom(ficheDemandeeAtom);
  const disponible = useDisponibleMaintenant(plat.creneau);

  return (
    <Bouton
      aria-haspopup="dialog"
      className={className}
      disabled={surPlaceSeulement || disponible === false}
      icone="plus"
      taille="grand"
      onClick={() => demanderFiche({ platId: plat.id })}
    >
      Choisir et commander
    </Bouton>
  );
}
