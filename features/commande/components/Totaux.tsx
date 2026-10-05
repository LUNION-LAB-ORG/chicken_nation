import type { ModeCommande } from "../types/commande.types";

import { fcfa, INSECABLE, pluriel } from "@/lib/typo";
import { cn } from "@/lib/utils";

/** « −1 500 FCFA » : signe moins (U+2212), jamais un tiret. */
const MOINS = "\u2212";
const moins = (montant: number) => `${MOINS}${fcfa(montant)}`;

/** 0,01 → « 1 % », 0,025 → « 2,5 % » (une décimale au plus). */
const pourcent = (taux: number) =>
  `${String(Math.round(taux * 1000) / 10).replace(".", ",")}${INSECABLE}%`;

/**
 * Totaux d'une commande (maquette, CSS 1034-1042) : sous-total, remise,
 * cadeaux, livraison ou retrait, frais de service, total. Partagé par le
 * tiroir, la caisse et le suivi. Composant sans état, rendu côté serveur ou
 * navigateur.
 *
 * Ce que le site ne connaît pas encore n'est jamais inventé :
 *  - livraison `null` : « Selon votre adresse » et total « hors livraison » ;
 *  - frais de service `null` (serveur qui ne publie pas son taux) :
 *    « Calculés au paiement » et total « hors frais de service ».
 * Le total débité reste celui du serveur : `total` le remplace quand il est
 * connu (suivi d'une commande créée).
 */
export function Totaux({
  nombreArticles,
  sousTotal,
  remise,
  cadeaux = [],
  mode,
  livraison,
  fraisService,
  tauxFraisService,
  total,
  className,
}: {
  nombreArticles: number;
  /** Plats, options et suppléments, avant remise. */
  sousTotal: number;
  /** Code ou points (jamais les deux) : libellé (« Code promo », « Points de fidélité (120) ») et montant. */
  remise?: { libelle: string; montant: number } | null;
  /** Noms des cadeaux ajoutés, offerts. */
  cadeaux?: string[];
  mode: ModeCommande;
  /** Frais de livraison ; null tant que l'adresse n'est pas choisie et calculée. Ignoré en retrait. */
  livraison: number | null;
  /** Frais de service ; null s'ils ne sont connus qu'au paiement. */
  fraisService: number | null;
  /** Taux, pour écrire « Frais de service (1 %) ». */
  tauxFraisService?: number | null;
  /** Total enregistré par le serveur, s'il est connu. */
  total?: number;
  className?: string;
}) {
  const montantRemise =
    remise && remise.montant > 0 ? Math.min(remise.montant, sousTotal) : 0;
  const fraisLivraison = mode === "DELIVERY" ? livraison : 0;
  const totalAffiche =
    total ??
    Math.max(0, sousTotal - montantRemise) +
      (fraisLivraison ?? 0) +
      (fraisService ?? 0);
  const manque = [
    mode === "DELIVERY" && livraison === null ? "livraison" : null,
    fraisService === null ? "frais de service" : null,
  ].filter(Boolean);

  return (
    <dl className={cn("m-0 grid gap-1.5 text-sm", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <dt className="min-w-0 text-encre-doux">
          Sous-total ({pluriel(nombreArticles, "article", "articles")})
        </dt>
        <dd className="m-0 text-right font-semibold whitespace-nowrap tabular-nums">
          {fcfa(sousTotal)}
        </dd>
      </div>
      {montantRemise > 0 && remise ? (
        <div className="flex items-baseline justify-between gap-3">
          <dt className="min-w-0 text-encre-doux">{remise.libelle}</dt>
          <dd className="m-0 text-right font-semibold whitespace-nowrap text-ok tabular-nums">
            {moins(montantRemise)}
          </dd>
        </div>
      ) : null}
      {cadeaux.length ? (
        <div className="flex items-baseline justify-between gap-3">
          <dt className="min-w-0 text-encre-doux">
            Cadeaux
            <small className="block text-xs">{cadeaux.join(", ")}</small>
          </dt>
          <dd className="m-0 text-right font-semibold whitespace-nowrap text-ok">
            Offert
          </dd>
        </div>
      ) : null}
      {mode === "DELIVERY" ? (
        <div className="flex items-baseline justify-between gap-3">
          <dt className="min-w-0 text-encre-doux">Livraison</dt>
          <dd className="m-0 text-right font-semibold whitespace-nowrap tabular-nums">
            {livraison === null
              ? "Selon votre adresse"
              : livraison === 0
                ? "Offerte"
                : fcfa(livraison)}
          </dd>
        </div>
      ) : (
        <div className="flex items-baseline justify-between gap-3">
          <dt className="min-w-0 text-encre-doux">Retrait au restaurant</dt>
          <dd className="m-0 text-right font-semibold whitespace-nowrap tabular-nums">
            {fcfa(0)}
          </dd>
        </div>
      )}
      <div className="flex items-baseline justify-between gap-3">
        <dt className="min-w-0 text-encre-doux">
          Frais de service
          {fraisService !== null && tauxFraisService
            ? ` (${pourcent(tauxFraisService)})`
            : ""}
        </dt>
        <dd className="m-0 text-right font-semibold whitespace-nowrap tabular-nums">
          {fraisService === null ? "Calculés au paiement" : fcfa(fraisService)}
        </dd>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-dashed border-trait-fort pt-2.5 text-lg">
        <dt className="min-w-0 font-bold text-encre">
          Total
          {manque.length ? (
            <small className="block text-xs font-normal text-encre-doux">
              hors {manque.join(" et ")}
            </small>
          ) : null}
        </dt>
        <dd className="m-0 text-right font-extrabold whitespace-nowrap tabular-nums">
          {fcfa(totalAffiche)}
        </dd>
      </div>
    </dl>
  );
}
