"use client";

import type { IPlatCarte } from "@/features/menus/types/carte.types";

import { Icone } from "../Icone";
import { useMinuteCourante } from "../restaurants/useMinuteCourante";

import { platDisponibleMaintenant } from "@/features/commande/utils/panier.utils";
import { heureTexte } from "@/features/restaurants/horaires";
import { cn } from "@/lib/utils";

type Creneau = NonNullable<IPlatCarte["creneau"]>;

/** « Disponible de 11 h à 15 h » (heures d'Abidjan, espaces insécables). */
export const texteCreneau = (creneau: Creneau) =>
  `Disponible de ${heureTexte(creneau.debut)} à ${heureTexte(creneau.fin)}`;

/** Vrai, faux, ou `null` avant l'hydratation (l'heure n'entre jamais dans le HTML mis en cache). */
export function useDisponibleMaintenant(creneau: Creneau | null) {
  const minute = useMinuteCourante();

  if (!creneau) return true;
  if (minute === null) return null;

  // Même règle que le serveur, qui refuserait la commande hors créneau.
  return platDisponibleMaintenant(creneau.debut, creneau.fin, new Date(minute));
}

/**
 * Créneau horaire d'un plat servi à certaines heures seulement. Le texte du
 * créneau est fixe (rendu serveur) ; hors créneau, il passe en rouge avec
 * « pour le moment indisponible », calculé dans le navigateur et recalculé
 * chaque minute.
 */
export function DisponibiliteHoraire({
  creneau,
  className,
}: {
  creneau: Creneau;
  className?: string;
}) {
  const disponible = useDisponibleMaintenant(creneau);

  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-[13px] leading-[1.4] font-semibold text-encre-doux",
        disponible === false && "text-rouge",
        className,
      )}
    >
      <Icone className="mt-px size-4" nom="cuisine" />
      <span>
        {texteCreneau(creneau)}
        {disponible === false ? ", pour le moment indisponible" : null}
      </span>
    </p>
  );
}
