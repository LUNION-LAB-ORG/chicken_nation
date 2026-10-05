"use client";

import type { ICommande } from "../types/commande.types";
import type { ReactNode } from "react";

import { useEffect, useRef, useState } from "react";

import { deconnexionAction } from "../actions/connexion.action";
import { useActionsCommande } from "../hooks/useActionsCommande";
import { messageErreurAction } from "../utils/erreur-action.utils";

import { Bouton } from "@/components/site/Bouton";
import { useRouter } from "@/i18n/navigation";

/**
 * « Modifier ma commande » avec sa confirmation sur place : la commande non
 * payée est annulée et ses plats reviennent dans le panier (règle du site,
 * plan 4.3). Le focus passe sur « Oui, modifier », puis revient au bouton
 * si le client renonce.
 */
export function ConfirmationModifier({
  onConfirmer,
  enCours,
  erreur,
  desactive,
}: {
  onConfirmer: () => void;
  enCours: boolean;
  erreur?: string | null;
  /** Paiement en cours d'ouverture : on ne modifie pas en même temps. */
  desactive?: boolean;
}) {
  const [ouverte, setOuverte] = useState(false);
  const oui = useRef<HTMLButtonElement>(null);
  const declencheur = useRef<HTMLButtonElement>(null);
  // Focus déplacé seulement après un geste du client, jamais au chargement
  // (sinon la page défilait jusqu'au bouton).
  const geste = useRef(false);
  const basculer = (valeur: boolean) => {
    geste.current = true;
    setOuverte(valeur);
  };

  useEffect(() => {
    if (!geste.current) return;
    geste.current = false;
    (ouverte ? oui : declencheur).current?.focus();
  }, [ouverte]);

  // Fragment : les boutons se rangent dans la rangée d'actions du parent ;
  // la confirmation ouverte prend toute la largeur.
  return (
    <>
      {ouverte ? (
        <div
          aria-label="Modifier ma commande"
          className="grid w-full basis-full gap-2.5 rounded-xl bg-surface p-3 text-sm"
          role="group"
        >
          <p>
            Cette commande non payée sera annulée et ses plats remis dans votre
            panier. Vous paierez ensuite la nouvelle commande.
          </p>
          <div className="flex flex-wrap gap-2">
            <Bouton ref={oui} disabled={enCours} onClick={onConfirmer}>
              {enCours ? "Annulation…" : "Oui, modifier"}
            </Bouton>
            <Bouton
              disabled={enCours}
              variante="secondaire"
              onClick={() => basculer(false)}
            >
              Non
            </Bouton>
          </div>
        </div>
      ) : (
        <Bouton
          ref={declencheur}
          disabled={desactive}
          variante="secondaire"
          onClick={() => basculer(true)}
        >
          Modifier ma commande
        </Bouton>
      )}
      {erreur ? (
        <p className="w-full basis-full text-sm text-rouge" role="alert">
          {erreur}
        </p>
      ) : null}
    </>
  );
}

/** « Recommander » : mêmes plats, choix et suppléments remis dans le panier. */
export function BoutonRecommander({
  commande,
  variante = "principal",
}: {
  commande: Pick<ICommande, "id" | "reference" | "lignes">;
  variante?: "principal" | "secondaire";
}) {
  const { recommander, enCours, erreur } = useActionsCommande();

  return (
    <>
      <Bouton
        disabled={enCours !== null}
        variante={variante}
        onClick={() => recommander(commande)}
      >
        {enCours === "recommander" ? "Ajout au panier…" : "Recommander"}
      </Bouton>
      {erreur ? (
        <p className="w-full basis-full text-sm text-rouge" role="alert">
          {erreur}
        </p>
      ) : null}
    </>
  );
}

/**
 * Actions d'une commande dans Mes commandes : `modifier` (commande non payée)
 * ou `recommander`. Les liens (« Payer », « Voir le détail ») sont rendus par
 * le serveur et passés dans `avant` ou `apres`.
 */
export function ActionsCommande({
  commande,
  action,
  avant,
  apres,
}: {
  commande: Pick<ICommande, "id" | "reference" | "lignes">;
  action: "modifier" | "recommander";
  avant?: ReactNode;
  apres?: ReactNode;
}) {
  const { modifier, enCours, erreur } = useActionsCommande();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {avant}
      {action === "modifier" ? (
        <ConfirmationModifier
          enCours={enCours === "modifier"}
          erreur={erreur}
          onConfirmer={() => modifier(commande)}
        />
      ) : (
        <BoutonRecommander commande={commande} variante="secondaire" />
      )}
      {apres}
    </div>
  );
}

/** « Se déconnecter » : le cookie de session est effacé et la page redessinée. */
export function BoutonDeconnexion() {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  return (
    <>
      <Bouton
        disabled={enCours}
        variante="secondaire"
        onClick={async () => {
          setErreur(null);
          setEnCours(true);
          try {
            await deconnexionAction();
            router.refresh();
          } catch (e) {
            setEnCours(false);
            setErreur(messageErreurAction(e));
          }
        }}
      >
        {enCours ? "Déconnexion…" : "Se déconnecter"}
      </Bouton>
      {erreur ? (
        <p className="w-full basis-full text-sm text-rouge" role="alert">
          {erreur}
        </p>
      ) : null}
    </>
  );
}
