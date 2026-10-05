import type { ICommande } from "../types/commande.types";
import type { EtatEtape, IEtapeFrise } from "../utils/suivi.utils";

import { libelleStatut } from "../utils/statut.utils";
import { etatStatut } from "../utils/suivi.utils";

import { Statut } from "@/components/site/Etiquettes";
import { Icone } from "@/components/site/Icone";
import { cn } from "@/lib/utils";

/**
 * Pastille d'état d'une commande (« En attente de paiement », « En
 * préparation », « Livrée », « Annulée »), partagée par le suivi et Mes
 * commandes. Jamais coupée (nowrap).
 */
export function PastilleStatut({
  commande,
  className,
}: {
  commande: Pick<ICommande, "status" | "type" | "paied" | "payment_method">;
  className?: string;
}) {
  const etat = etatStatut(commande);

  return (
    <Statut
      className={cn(
        etat === "annulee" && "bg-rouge-fond text-rouge",
        className,
      )}
      etat={etat === "annulee" ? "attente" : etat}
    >
      {libelleStatut(commande)}
    </Statut>
  );
}

const PASTILLES: Record<EtatEtape, string> = {
  fait: "border-ok bg-ok text-white",
  actuel:
    "border-encre bg-orange text-encre shadow-[0_0_0_6px_var(--color-orange-pale)]",
  avenir: "border-trait-fort bg-surface text-encre-doux",
};

/**
 * Frise du suivi (maquette, CSS 1456-1468) : quatre étapes reliées par un
 * trait, vert jusqu'à l'étape atteinte, pastille orange sur l'étape en cours
 * (aria-current="step"), heure de chaque étape franchie. Les étapes viennent
 * de etapesFrise (suivi.utils). Sans état : rendu serveur ou navigateur.
 */
export function FriseSuivi({
  etapes,
  className,
}: {
  etapes: IEtapeFrise[];
  className?: string;
}) {
  return (
    <ol className={cn("grid list-none", className)}>
      {etapes.map((e) => (
        <li
          key={e.icone}
          aria-current={e.etat === "actuel" ? "step" : undefined}
          className={cn(
            "relative grid grid-cols-[40px_minmax(0,1fr)] gap-3.5 pb-5 last:pb-0",
            "before:absolute before:top-10 before:bottom-0 before:left-[19px] before:w-0.5 before:content-[''] last:before:hidden",
            e.etat === "fait" ? "before:bg-ok" : "before:bg-trait",
          )}
        >
          <span
            className={cn(
              "relative z-1 grid size-10 place-items-center rounded-full border-2",
              PASTILLES[e.etat],
            )}
          >
            <Icone className="size-[18px]" nom={e.icone} />
          </span>
          <div className="min-w-0">
            <h3
              className={cn(
                "pt-2 text-base leading-[1.3]",
                e.etat === "avenir"
                  ? "font-semibold text-encre-doux"
                  : "font-bold",
              )}
            >
              {e.libelle}
            </h3>
            <p className="text-[13px] text-encre-doux">
              {e.heure ? `${e.heure} · ` : ""}
              {e.texte}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
