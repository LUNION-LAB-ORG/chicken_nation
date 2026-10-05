import type { ModeCommande } from "../../types/commande.types";
import type { ILigneRecap } from "../RecapitulatifPhotos";

import { RecapitulatifPhotos } from "../RecapitulatifPhotos";
import { Totaux } from "../Totaux";

/** Ce que la caisse sait de la commande en cours, pour le récapitulatif. */
export interface IRecapCaisse {
  lieu: { titre: string; detail: string };
  lignes: ILigneRecap[];
  nombreArticles: number;
  sousTotal: number;
  remise: { libelle: string; montant: number } | null;
  cadeaux: string[];
  mode: ModeCommande;
  livraison: number | null;
  fraisService: number | null;
  tauxFraisService: number | null;
  total: number;
  /** « Payée en ligne, cette commande vous rapportera 18 points. », ou null. */
  note: string | null;
}

/**
 * Récapitulatif de la caisse (maquette, CSS 1285-1304) : toujours visible
 * sur ordinateur (colonne de droite, collante sous l'en-tête), replié dans un
 * `<details>` en tête de l'étape sur téléphone, total dans le résumé.
 */
export function Recapitulatif({
  recap,
  variante,
}: {
  recap: IRecapCaisse;
  variante: "colonne" | "volet";
}) {
  return (
    <RecapitulatifPhotos
      lieu={recap.lieu}
      lignes={recap.lignes}
      note={recap.note}
      totalResume={recap.total}
      totaux={
        <Totaux
          cadeaux={recap.cadeaux}
          fraisService={recap.fraisService}
          livraison={recap.livraison}
          mode={recap.mode}
          nombreArticles={recap.nombreArticles}
          remise={recap.remise}
          sousTotal={recap.sousTotal}
          tauxFraisService={recap.tauxFraisService}
        />
      }
      variante={variante}
    />
  );
}
