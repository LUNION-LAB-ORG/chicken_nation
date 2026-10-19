"use client";

import type { MoyenPaiement } from "../../types/commande.types";

import {
  DETAIL_PAIEMENT_EN_LIGNE,
  DETAIL_PAIEMENT_LIVRAISON,
  TEXTE_PAIEMENT_EN_LIGNE,
  TEXTE_PAIEMENT_LIVRAISON,
} from "./textes-caisse";

import { ChoixRadio, GroupeChoix } from "@/components/site/Choix";

/**
 * Choix du moyen de paiement à l'étape 5, montré seulement pour une livraison
 * quand le serveur propose le paiement à la livraison : en ligne (KKiaPay),
 * ou au livreur. La phrase dessous dit ce qui se passe ensuite.
 */
export function ChoixPaiement({
  moyen,
  onChange,
}: {
  moyen: MoyenPaiement;
  onChange: (moyen: MoyenPaiement) => void;
}) {
  return (
    <div className="grid gap-2">
      <GroupeChoix legende="Moyen de paiement">
        <ChoixRadio
          checked={moyen === "ONLINE"}
          detail={DETAIL_PAIEMENT_EN_LIGNE}
          id="paiement-en-ligne"
          label="Payer en ligne"
          name="moyen-paiement"
          value="ONLINE"
          onChange={() => onChange("ONLINE")}
        />
        <ChoixRadio
          checked={moyen === "OFFLINE"}
          detail={DETAIL_PAIEMENT_LIVRAISON}
          id="paiement-livraison"
          label="Payer à la livraison"
          name="moyen-paiement"
          value="OFFLINE"
          onChange={() => onChange("OFFLINE")}
        />
      </GroupeChoix>
      <p className="text-[13px] leading-[1.45] text-encre-doux">
        {moyen === "OFFLINE"
          ? TEXTE_PAIEMENT_LIVRAISON
          : TEXTE_PAIEMENT_EN_LIGNE}
      </p>
    </div>
  );
}
