"use client";

import type { IClient } from "../../types/commande.types";
import type { ReactNode } from "react";

import Connexion from "../Connexion";
import { telephoneLisible } from "../../utils/panier.utils";
import { pointsLisibles } from "../../utils/fidelite.utils";

import { classePanneau, TitreEtape } from "./EtapePanier";

import { Lien } from "@/components/site/Lien";
import { INSECABLE } from "@/lib/typo";

/**
 * Étape 2, la connexion (maquette, JS 909-923) : code reçu sur WhatsApp,
 * même compte que l'application. Client déjà connecté : sa carte, et
 * « Changer de compte ». Connecté sans prénom ou nom : on reprend au nom.
 */
export function EtapeConnexion({
  client,
  points,
  onConnecte,
  onDeconnecter,
  deconnexion,
  erreur,
  pied,
}: {
  client: IClient | null;
  /** Solde de points, s'il est connu. */
  points: number | null;
  onConnecte: (client: IClient) => void;
  onDeconnecter: () => void;
  /** Déconnexion en cours. */
  deconnexion: boolean;
  erreur: string | null;
  pied: ReactNode;
}) {
  const complet = !!client?.first_name && !!client?.last_name;

  if (!client || !complet) {
    return (
      <section aria-labelledby="t-etape" className={classePanneau}>
        <TitreEtape>Connexion</TitreEtape>
        <Connexion
          integree
          etapeInitiale={client ? "profil" : "telephone"}
          onConnecte={onConnecte}
        />
      </section>
    );
  }
  const initiale = (client.first_name ?? "").trim().charAt(0).toUpperCase();

  return (
    <>
      <section aria-labelledby="t-etape" className={classePanneau}>
        <TitreEtape>Connexion</TitreEtape>
        <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-carte bg-surface p-3.5">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-full bg-orange text-[17px] font-extrabold text-encre"
          >
            {initiale || "?"}
          </span>
          <p className="min-w-0 text-[13px] text-encre-doux">
            <strong className="block text-[15px] text-encre [overflow-wrap:anywhere]">
              {client.first_name} {client.last_name}
            </strong>
            +225{INSECABLE}
            {telephoneLisible(client.phone).replace(/ /g, INSECABLE)}
            {points !== null ? ` · ${pointsLisibles(points)}` : ""}
          </p>
        </div>
        <p className="text-[13px] leading-[1.45] text-encre-doux">
          C&apos;est votre compte de l&apos;application{INSECABLE}: vos points,
          vos cadeaux et vos adresses vous suivent.
        </p>
        <p>
          {/* aria-disabled et non disabled : un bouton désactivé sous le
              focus le perd (retour en haut de page au clavier). */}
          <Lien
            aria-disabled={deconnexion || undefined}
            onClick={onDeconnecter}
          >
            Ce n&apos;est pas vous{INSECABLE}? Changer de compte
          </Lien>
        </p>
        {erreur ? (
          <p className="text-[13px] font-semibold text-rouge" role="alert">
            {erreur}
          </p>
        ) : null}
      </section>
      {pied}
    </>
  );
}
