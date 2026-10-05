import { BandeDefilante, ElementBande } from "../BandeDefilante";

import { INSECABLE } from "@/lib/typo";

/**
 * Bandeau d'infos en travers sous l'accroche (maquette, HTML 108-121,
 * retouche 7). Textes fixes ; défilement en CSS, statique avec le mouvement
 * réduit (BandeDefilante).
 */
export function BandeInfos() {
  return (
    <BandeDefilante libelle="Infos pratiques">
      <ElementBande horloge>Livré en 20 à 35{INSECABLE}min</ElementBande>
      <ElementBande>Retrait au restaurant</ElementBande>
      <ElementBande>Paiement mobile ou carte</ElementBande>
      <ElementBande>
        Ouvert 7{INSECABLE}j/7 dès 10{INSECABLE}h
      </ElementBande>
      <ElementBande>Poulet 100{INSECABLE}% local et halal</ElementBande>
    </BandeDefilante>
  );
}
