"use client";

import styles from "./PageRestaurant.module.css";
import { useMinuteCourante } from "./useMinuteCourante";

import { jourAbidjan } from "@/features/restaurants/horaires";
import { cn } from "@/lib/utils";

/**
 * Horaires de la semaine d'un restaurant, un jour par ligne. Le texte est
 * rendu par le serveur ; le jour en cours (heure d'Abidjan) n'est mis en gras
 * qu'après hydratation, pour que le HTML mis en cache ne dise jamais
 * « aujourd'hui ».
 */
export function PageRestaurantHoraires({
  jours,
}: {
  /** `horairesParJour` : du lundi au dimanche, heures insécables. */
  jours: { jour: number; nom: string; texte: string }[];
}) {
  const minute = useMinuteCourante();
  const aujourdhui = minute === null ? null : jourAbidjan(new Date(minute));

  return (
    <dl className={styles.horaires}>
      {jours.map((j) => (
        <div
          key={j.jour}
          className={cn(j.jour === aujourdhui && styles.aujourdhui)}
        >
          <dt>
            {j.nom}
            {j.jour === aujourdhui ? (
              <span className={styles.marqueJour}>
                <span className="sr-only">, </span>aujourd&apos;hui
              </span>
            ) : null}
          </dt>
          <dd className={cn(j.texte === "Fermé" && styles.ferme)}>{j.texte}</dd>
        </div>
      ))}
    </dl>
  );
}
