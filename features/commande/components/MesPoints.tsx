"use client";

import type { IPointsFidelite } from "../types/commande.types";

import { useId, useState } from "react";

import {
  erreurPoints,
  maximumPointsUtiles,
  pointsLisibles,
  pointsUtilisables,
  valeurLisible,
} from "../utils/fidelite.utils";

import { reglesPoints, textePlafond } from "./caisse/textes-caisse";

import { Bouton } from "@/components/site/Bouton";
import { Lien } from "@/components/site/Lien";
import { fcfa, INSECABLE, pluriel } from "@/lib/typo";

/** Signe moins (U+2212), jamais un tiret. */
const MOINS = "\u2212";

/**
 * Points de fidélité dans l'étape Avantages (maquette, JS 1144-1159) : solde
 * et sa valeur, règles lues sur l'API (fidelite.utils), puis le choix des
 * points pour cette commande. Points OU code, jamais les deux (la caisse
 * retire l'un quand l'autre est appliqué et le dit dans `avis`).
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
  /** Phrase de non-cumul ou d'ajustement (« Points ajustés à 120 »). */
  avis: string | null;
  onUtiliser: (points: number) => void;
  onRetirer: () => void;
}) {
  const id = useId();
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const max = maximumPointsUtiles(f, sousTotal);
  const minimum = Math.max(1, f.minimum);

  const utiliser = (n: number) => {
    const e = erreurPoints(n, f, sousTotal);

    setErreur(e);
    if (e) return;
    setSaisie("");
    onUtiliser(n);
  };

  return (
    <>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <strong className="text-[28px] leading-[1.1] font-extrabold tabular-nums">
          {pointsLisibles(f.solde)}
        </strong>
        {f.valeurPoint > 0 && f.solde > 0 ? (
          <span className="text-sm text-encre-doux">
            soit {fcfa(Math.floor(f.solde * f.valeurPoint))}
          </span>
        ) : null}
      </p>
      <p className="text-[13px] leading-[1.45] text-encre-doux">
        {reglesPoints({
          valeurPointTexte: valeurLisible(f.valeurPoint),
          minimum: f.minimum,
          plafondPct: f.plafondPct,
          joursValidite: f.joursValidite,
        })}
      </p>
      {retenus > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-carte bg-ok-fond px-3.5 py-2 text-sm font-semibold text-ok">
          <span>
            {pluriel(retenus, "point utilisé", "points utilisés")}
            {INSECABLE}: environ {MOINS}
            {fcfa(remise)}
          </span>
          <Lien
            className="text-encre"
            onClick={() => {
              setErreur(null);
              onRetirer();
            }}
          >
            Retirer
          </Lien>
        </div>
      ) : pointsUtilisables(f, sousTotal) ? (
        <form
          noValidate
          className="grid gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            utiliser(Number(saisie));
          }}
        >
          <label className="text-sm font-semibold" htmlFor={`${id}-points`}>
            Points à utiliser
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              aria-describedby={`${id}-aide${erreur ? ` ${id}-erreur` : ""}`}
              aria-invalid={erreur ? true : undefined}
              autoComplete="off"
              className="min-h-12 w-full max-w-[200px] min-w-0 flex-[1_1_140px] rounded-xl border-[1.5px] border-trait-fort bg-white px-3.5 text-base text-encre tabular-nums placeholder:text-encre-doux/80 focus:border-encre focus-visible:outline-offset-1 aria-invalid:border-rouge"
              id={`${id}-points`}
              inputMode="numeric"
              placeholder={String(max)}
              type="text"
              value={saisie}
              onChange={(e) => {
                setSaisie(e.target.value.replace(/\D/g, "").slice(0, 7));
                setErreur(null);
              }}
            />
            <Bouton disabled={!saisie} type="submit" variante="sombre">
              Utiliser
            </Bouton>
            <Bouton variante="secondaire" onClick={() => utiliser(max)}>
              Utiliser le maximum
            </Bouton>
          </div>
          {erreur ? (
            <p
              className="text-[13px] font-semibold text-rouge"
              id={`${id}-erreur`}
              role="alert"
            >
              {erreur}
            </p>
          ) : null}
          <p
            className="text-[13px] leading-[1.45] text-encre-doux"
            id={`${id}-aide`}
          >
            Sur cette commande{INSECABLE}: jusqu&apos;à {pointsLisibles(max)},
            soit {fcfa(Math.min(Math.floor(max * f.valeurPoint), sousTotal))}.
          </p>
        </form>
      ) : (
        <p className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm leading-[1.45]">
          {f.solde < minimum
            ? `Il faut au moins ${pointsLisibles(minimum)} pour payer avec vos points.`
            : `Commande trop petite pour utiliser ${pointsLisibles(minimum)}${INSECABLE}: les points paient au plus ${textePlafond(f.plafondPct)} du prix des plats.`}
        </p>
      )}
      {avis ? (
        <p
          className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm leading-[1.45]"
          role="status"
        >
          {avis}
        </p>
      ) : null}
    </>
  );
}
