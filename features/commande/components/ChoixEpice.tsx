"use client";

import { ChoixRadio, GroupeChoix } from "@/components/site/Choix";
import { INSECABLE } from "@/lib/typo";

/**
 * « Épicé ou non ? » (maquette, JS 595-601) : choix obligatoire et sans valeur
 * par défaut, pour un plat au niveau d'épice OPTIONAL. Partagé par la fiche
 * plat et l'étape Avantages (plat offert). `valeur` null : rien de choisi.
 *
 * `id` préfixe les identifiants : deux choix sur une même page (deux plats
 * offerts) ne doivent pas se mélanger.
 */
export function ChoixEpice({
  id,
  valeur,
  onChange,
  erreur,
  legende = `Épicé ou non${INSECABLE}?`,
  className,
}: {
  id: string;
  valeur: boolean | null;
  onChange: (epice: boolean) => void;
  /** Message quand le client veut continuer sans avoir choisi. */
  erreur?: string | null;
  legende?: string;
  className?: string;
}) {
  const nom = `${id}-epice`;

  return (
    <GroupeChoix
      pilules
      requis
      className={className}
      erreur={erreur}
      idErreur={`${nom}-erreur`}
      legende={legende}
      precision="Obligatoire"
    >
      <ChoixRadio
        pilule
        aria-invalid={erreur ? true : undefined}
        checked={valeur === true}
        id={`${nom}-oui`}
        label="Épicé"
        name={nom}
        value="epice"
        onChange={() => onChange(true)}
      />
      <ChoixRadio
        pilule
        aria-invalid={erreur ? true : undefined}
        checked={valeur === false}
        id={`${nom}-non`}
        label="Non épicé"
        name={nom}
        value="nature"
        onChange={() => onChange(false)}
      />
    </GroupeChoix>
  );
}
