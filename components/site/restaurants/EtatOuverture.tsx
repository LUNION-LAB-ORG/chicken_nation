"use client";

import { useMinuteCourante } from "./useMinuteCourante";

import { etatOuverture } from "@/features/restaurants/horaires";
import { cn } from "@/lib/utils";

/**
 * « Ouvert, ferme à 0 h 30 », « Fermé, ouvre à 10 h », « Fermé, ouvre demain
 * à 10 h », à l'heure d'Abidjan, avec la règle du serveur (horaires.ts).
 * Calculé dans le navigateur après hydratation et recalculé chaque minute :
 * le HTML mis en cache n'en contient rien, la ligne y garde seulement sa
 * hauteur (aucun décalage à l'affichage).
 */
export function EtatOuverture({
  schedule,
  className,
}: {
  schedule: string | null;
  className?: string;
}) {
  const minute = useMinuteCourante();
  const etat =
    minute === null ? null : etatOuverture(schedule, new Date(minute));

  return (
    <p
      className={cn(
        "inline-flex items-center gap-[7px] text-[12.5px] leading-[1.55] font-semibold text-encre-doux",
        "before:size-2 before:shrink-0 before:rounded-full before:bg-current before:content-['']",
        etat?.ouvert && "text-ok",
        !etat && "invisible",
        className,
      )}
    >
      {etat ? etat.texte : " "}
    </p>
  );
}
