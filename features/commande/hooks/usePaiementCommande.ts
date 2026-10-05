"use client";

import type {
  IClient,
  ICommande,
  IConfigPaiement,
} from "../types/commande.types";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ecrireMarquePaiement,
  effacerMarquePaiement,
  type IMarquePaiement,
  lireMarquePaiement,
} from "../utils/memoire-navigateur.utils";

import { useKkiapay } from "./useKkiapay";

/**
 * Paiement d'une commande par KKiaPay, avec ses garde-fous, partagé par la
 * page de suivi (bouton « Payer ») et l'étape Paiement de la caisse.
 *
 *  - Ouverture du module avec le montant ENREGISTRÉ par le serveur et la
 *    référence de la commande (le webhook la renvoie au serveur, qui confirme).
 *  - Marque `cn-paiement-<référence>` dans le navigateur (memoire-navigateur) :
 *    module ouvert, puis succès annoncé. Elle survit au rechargement et au
 *    retour de l'application Mobile Money, et empêche de payer deux fois.
 *  - Succès ou échec : la marque est mise à jour, puis `apresSucces` ou
 *    `apresEchec` (la page relit la commande ; le site ne confirme jamais rien
 *    lui-même).
 *
 * `reference` : commande suivie par la page (null tant qu'elle n'est pas lue).
 * La marque d'une commande ouverte par `payer` suit cette commande-là, même
 * si la page n'en suivait aucune (étape Paiement de la caisse).
 */
export function usePaiementCommande({
  reference,
  client,
  apresSucces,
  apresEchec,
}: {
  reference: string | null;
  client: IClient;
  apresSucces?: () => void;
  apresEchec?: () => void;
}) {
  // Tentative de paiement gardée dans le navigateur (cf. memoire-navigateur.utils).
  const [marque, setMarque] = useState<IMarquePaiement | null>(null);
  const [echec, setEchec] = useState(false);
  // Référence de la dernière commande ouverte par `payer` dans cette page.
  const ouverte = useRef<string | null>(null);
  const rappels = useRef({ apresSucces, apresEchec });

  rappels.current = { apresSucces, apresEchec };
  const suivie = useRef(reference);

  suivie.current = reference;
  const cible = () => ouverte.current ?? suivie.current;

  useEffect(() => {
    if (!reference) return;
    setMarque(lireMarquePaiement(reference));
  }, [reference]);

  const { pret, ouvrir, erreurChargement, reessayer } = useKkiapay({
    onSucces: () => {
      setEchec(false);
      const ref = cible();

      if (ref) {
        const m = { ...lireMarquePaiement(ref), succesA: Date.now() };

        ecrireMarquePaiement(ref, m);
        setMarque(m);
      }
      rappels.current.apresSucces?.();
    },
    onEchec: () => {
      setEchec(true);
      const ref = cible();

      if (ref) effacerMarquePaiement(ref);
      setMarque(null);
      rappels.current.apresEchec?.();
    },
  });

  /**
   * Ouvre le module pour cette commande. Faux si le module n'a pas pu
   * s'ouvrir (pas encore prêt) : rien n'est alors noté, la page propose un
   * autre chemin (bouton « Payer » de la page de suivi).
   */
  const payer = useCallback(
    (
      commande: Pick<ICommande, "reference" | "amount">,
      paiement: IConfigPaiement,
    ) => {
      setEchec(false);
      const ouvert = ouvrir({
        amount: Math.ceil(commande.amount),
        key: paiement.public_key,
        sandbox: paiement.sandbox,
        phone: client.phone.replace(/^\+225/, ""),
        name: [client.first_name, client.last_name].filter(Boolean).join(" "),
        ...(client.email ? { email: client.email } : {}),
        reason: `Règlement Commande ${commande.reference}`,
        data: commande.reference,
      });

      if (!ouvert) return false;
      ouverte.current = commande.reference;
      const m = { ouvertA: Date.now() };

      ecrireMarquePaiement(commande.reference, m);
      setMarque(m);

      return true;
    },
    [client, ouvrir],
  );

  /** Commande payée : la tentative gardée ne sert plus. */
  const oublierMarque = useCallback((ref: string) => {
    effacerMarquePaiement(ref);
    setMarque(null);
  }, []);

  return {
    pret,
    erreurChargement,
    reessayer,
    payer,
    echec,
    marque,
    oublierMarque,
  };
}
