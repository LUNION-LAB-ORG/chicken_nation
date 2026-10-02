"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import type { IPointsFidelite } from "../types/commande.types";
import {
  erreurPoints,
  maximumPointsUtiles,
  pointsLisibles,
  valeurLisible,
} from "../utils/fidelite.utils";
import { fcfa } from "../utils/panier.utils";

/**
 * Bloc « Mes points » du panier. Le panier ne l'affiche que si le minimum
 * est atteignable sur ce panier (fidelite.utils, pointsUtilisables).
 */
export default function MesPoints({
  points: f,
  sousTotal,
  retenus,
  remise,
  avis,
  onUtiliser,
  onRetirer,
}: {
  points: IPointsFidelite;
  sousTotal: number;
  /** Points appliqués à la commande (0 = aucun). */
  retenus: number;
  /** Remise estimée de ces points. */
  remise: number;
  /** Phrase de non-cumul : appliquer les points a retiré le code. */
  avis: string | null;
  onUtiliser: (points: number) => void;
  onRetirer: () => void;
}) {
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const max = maximumPointsUtiles(f, sousTotal);
  // Le plafond, et non le solde, limite les points sur ce panier : on dit pourquoi.
  const limiteParPlafond = max < f.solde && f.plafondPct > 0 && f.plafondPct < 100;

  const utiliser = (n: number) => {
    const e = erreurPoints(n, f, sousTotal);
    setErreur(e);
    if (e) return;
    setSaisie("");
    onUtiliser(n);
  };

  return (
    <>
      <p className="text-sm text-gray-700">
        Vous avez <strong>{pointsLisibles(f.solde)}</strong>. 1 point vaut {valeurLisible(f.valeurPoint)}, à partir de{" "}
        {pointsLisibles(f.minimum)} par commande.
      </p>
      {retenus > 0 ? (
        <div className="flex items-center justify-between rounded-xl bg-success-50 p-3 text-sm">
          <span>
            <strong>{pointsLisibles(retenus)}</strong> : environ − {fcfa(remise)}
          </span>
          <button
            type="button"
            className="font-semibold text-primary underline"
            onClick={() => {
              setErreur(null);
              onRetirer();
            }}
          >
            Retirer
          </button>
        </div>
      ) : (
        <>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              utiliser(Number(saisie));
            }}
          >
            <Input
              aria-label="Nombre de points à utiliser"
              placeholder="Nombre de points"
              inputMode="numeric"
              value={saisie}
              onValueChange={(v) => {
                setSaisie(v.replace(/\D/g, "").slice(0, 7));
                setErreur(null);
              }}
            />
            <Button type="submit" variant="bordered" isDisabled={!saisie}>
              Utiliser
            </Button>
          </form>
          <button type="button" className="self-start text-sm font-semibold text-primary underline" onClick={() => utiliser(max)}>
            Utiliser le maximum ({pointsLisibles(max)})
          </button>
        </>
      )}
      {limiteParPlafond && (
        <p className="text-xs text-gray-500">Les points paient au plus {f.plafondPct} % des plats d&apos;une commande.</p>
      )}
      {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
      {avis && <p role="status" className="text-sm text-warning-700">{avis}</p>}
    </>
  );
}
