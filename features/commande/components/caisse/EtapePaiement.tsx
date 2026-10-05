"use client";

import type {
  IClient,
  IConfigPaiement,
  ICreationCommande,
  ILignePanier,
} from "../../types/commande.types";
import type { IEcartPoints } from "../../utils/memoire-navigateur.utils";
import type { ReactNode } from "react";

import { useEffect, useRef, useState } from "react";

import {
  annulerCommandeAction,
  creerCommandeAction,
  obtenirCommandeAction,
} from "../../actions/commande.action";
import { usePaiementCommande } from "../../hooks/usePaiementCommande";
import { decisionPaiement, signatureCommande } from "../../utils/caisse.utils";
import { messageErreurAction } from "../../utils/erreur-action.utils";
import {
  etatPaiement,
  lireCommandeEnAttente,
  noterCommandeEnAttente,
  noterEcartPoints,
  oublierCommandeEnAttente,
  oublierEcartPoints,
  oublierPanierCommande,
  sauverPanierCommande,
} from "../../utils/memoire-navigateur.utils";
import { aPayer } from "../../utils/statut.utils";

import { classePanneau, ErreurEtape, TitreEtape } from "./EtapePanier";

import { Bouton } from "@/components/site/Bouton";
import { Lien } from "@/components/site/Lien";
import { fcfa, INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

/** Moyens acceptés par KKiaPay (maquette, JS 1209). */
const MOYENS = [
  "Wave",
  "Orange Money",
  "MTN MoMo",
  "Moov Money",
  "Carte bancaire",
];

/** Commande créée par cette étape, pas encore payée. */
interface ICommandeOuverte {
  id: string;
  reference: string;
  /** Total enregistré par le serveur : c'est lui qui est débité. */
  montant: number;
  paiement: IConfigPaiement | null;
  signature: string;
}

type Fenetre = Window & {
  addKkiapayCloseListener?: (rappel: () => void) => void;
};

/** Une ligne du résumé : choix fait, détail, lien pour le modifier. */
export interface ILigneResume {
  titre: ReactNode;
  detail: string;
  modifier?: { libelle: string; etape: 1 | 3 | 4 };
}

/**
 * Étape 5, le paiement (plan, section 4.4 ; maquette, JS 1201-1219) :
 *
 *  1. KKiaPay se charge dès l'arrivée sur l'étape ; « Payer » reste
 *     désactivé tant qu'il n'est pas prêt (sinon fenêtre vide).
 *  2. Au clic, la commande est créée (canal web), sauf si cet onglet en a
 *     déjà une non payée pour le MÊME contenu : c'est alors celle-ci qui est
 *     payée (aucune seconde commande). Contenu changé : l'ancienne est
 *     annulée avant d'en créer une nouvelle (règle du site).
 *  3. Le module s'ouvre avec le montant renvoyé par le serveur.
 *  4. Succès : panier vidé, suivi de la commande. Fermeture ou échec : on
 *     reste ici, « Payer » rouvre la même commande.
 *  5. Module impossible à ouvrir, ou paiement en ligne indisponible : la
 *     page de suivi prend le relais avec son bouton « Payer ».
 *  6. Points accordés plus faibles que l'estimation : le client le voit
 *     AVANT de payer.
 */
export function EtapePaiement({
  client,
  creation,
  aCommander,
  totalEstime,
  pointsRetenus,
  remiseDesPoints,
  resume,
  pretAPayer,
  verifier,
  onAller,
  onPaye,
  onRelais,
  onRefus,
  pied,
}: {
  client: IClient;
  /** Ce qui sera envoyé à la création. */
  creation: ICreationCommande;
  aCommander: ILignePanier[];
  totalEstime: number;
  pointsRetenus: number;
  remiseDesPoints: number;
  resume: ILigneResume[];
  /** Rien n'est en cours de calcul (frais, relecture du panier). */
  pretAPayer: boolean;
  /** Contrôle des étapes avant de créer : faux si une étape bloque (la caisse y mène). */
  verifier: () => boolean;
  onAller: (etape: 1 | 3 | 4) => void;
  /** Commande payée : panier vidé, suivi. */
  onPaye: (id: string) => void;
  /** Le suivi prend le relais (module indisponible). */
  onRelais: (id: string) => void;
  /** Création refusée : points ou cadeaux à relire. */
  onRefus: () => void;
  pied: (bouton: ReactNode) => ReactNode;
}) {
  const [ouverte, setOuverte] = useState<ICommandeOuverte | null>(null);
  // « ferme » : module fermé sans paiement (ou paiement refusé).
  const [etat, setEtat] = useState<"libre" | "creation" | "ferme">("libre");
  const [erreur, setErreur] = useState<string | null>(null);
  const [ecart, setEcart] = useState<IEcartPoints | null>(null);
  const succes = useRef(false);
  // Commandes dont le module a été ouvert dans cette page : leur marque
  // « paiement commencé » vient de nous, pas d'une visite précédente.
  const ouvertesIci = useRef(new Set<string>());
  const ouverteRef = useRef(ouverte);

  ouverteRef.current = ouverte;
  const bouton = useRef<HTMLButtonElement>(null);

  const signature = signatureCommande(creation);
  // La commande ouverte vaut pour ce contenu seulement.
  const courante = ouverte && ouverte.signature === signature ? ouverte : null;

  const { pret, erreurChargement, reessayer, payer, echec, marque } =
    usePaiementCommande({
      reference: courante?.reference ?? null,
      client,
      apresSucces: () => {
        succes.current = true;
        const c = ouverteRef.current;

        if (c) onPaye(c.id);
      },
      apresEchec: () => setEtat("ferme"),
    });

  // Fermeture du module sans payer (k.js, addKkiapayCloseListener) : on le
  // dit, et le focus revient sur « Payer ».
  useEffect(() => {
    if (!pret) return;
    const w = window as Fenetre;

    w.addKkiapayCloseListener?.(() => {
      if (succes.current) return;
      setEtat("ferme");
      bouton.current?.focus();
    });

    return () => w.addKkiapayCloseListener?.(() => {});
  }, [pret]);

  // Retour sur l'onglet (application Mobile Money) : la commande a peut-être
  // été payée sans que le module le dise.
  useEffect(() => {
    if (!courante) return;
    const relire = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await obtenirCommandeAction(courante.id);

        if (res.ok && res.data.commande.paied) onPaye(courante.id);
      } catch {
        /* réseau : le prochain retour relira */
      }
    };

    document.addEventListener("visibilitychange", relire);

    return () => document.removeEventListener("visibilitychange", relire);
  }, [courante?.id]);

  const lancer = async () => {
    if (etat === "creation") return;
    if (!verifier()) return;
    setErreur(null);
    setEtat("creation");
    try {
      let commande: ICommandeOuverte | null = null;
      const attente = lireCommandeEnAttente();
      const decision = decisionPaiement(attente, signature);

      if (attente && decision !== "creer") {
        const lue = await obtenirCommandeAction(attente.id);

        if (lue.ok && lue.data.commande.paied) return onPaye(attente.id);
        const payable = lue.ok && aPayer(lue.data.commande);

        if (payable && decision === "reutiliser") {
          commande = {
            id: attente.id,
            reference: attente.reference,
            montant: lue.data.commande.amount,
            paiement: lue.data.paiement,
            signature,
          };
        } else if (payable) {
          // Contenu changé : la commande non payée est annulée (bon, code et
          // cadeaux rendus par le serveur) avant d'en créer une nouvelle.
          const annulee = await annulerCommandeAction(attente.id);

          if (!annulee.ok) {
            const relue = await obtenirCommandeAction(attente.id);

            if (relue.ok && relue.data.commande.paied)
              return onPaye(attente.id);
            setErreur(annulee.message);

            return setEtat("libre");
          }
          oublierPanierCommande(attente.id);
          oublierEcartPoints(attente.id);
          oublierCommandeEnAttente();
        } else {
          // Annulée ailleurs, illisible, ou d'un autre compte : on l'oublie.
          oublierCommandeEnAttente();
        }
      }

      if (!commande) {
        const res = await creerCommandeAction(creation);

        if (!res.ok) {
          onRefus();
          setErreur(res.message);

          return setEtat("libre");
        }
        noterCommandeEnAttente({
          id: res.data.id,
          reference: res.data.reference,
          signature,
        });
        // Gardé le temps de l'onglet : « Modifier ma commande » du suivi le remet.
        sauverPanierCommande(res.data.id, aCommander);
        commande = {
          id: res.data.id,
          reference: res.data.reference,
          montant: res.data.montant,
          paiement: res.data.paiement,
          signature,
        };
        setOuverte(commande);
        if (pointsRetenus > 0 && res.data.remise < remiseDesPoints) {
          const e = { estimee: remiseDesPoints, accordee: res.data.remise };

          noterEcartPoints(res.data.id, e);
          setEcart(e);

          // Le client voit la remise réelle avant de payer.
          return setEtat("libre");
        }
      }
      setOuverte(commande);
      if (!commande.paiement) return onRelais(commande.id);
      succes.current = false;
      const ouvert = payer(
        { reference: commande.reference, amount: commande.montant },
        commande.paiement,
      );

      if (!ouvert) return onRelais(commande.id);
      ouvertesIci.current.add(commande.reference);
      // Le module couvre la page : rien d'autre à bloquer.
      setEtat("libre");
    } catch (e) {
      setErreur(messageErreurAction(e));
      setEtat("libre");
    }
  };

  const montant = courante ? Math.ceil(courante.montant) : totalEstime;
  const occupe = etat === "creation";
  // Paiement commencé lors d'une visite précédente (page rechargée, onglet
  // rouvert) : il a pu aboutir sans qu'on le sache.
  const commence =
    !!courante &&
    !ouvertesIci.current.has(courante.reference) &&
    !occupe &&
    etatPaiement(marque, Date.now()) === "commence";

  const libelle = erreurChargement
    ? `Payer ${fcfa(montant)}`
    : !pret
      ? "Préparation du paiement…"
      : etat === "creation"
        ? "Création de la commande…"
        : `Payer ${fcfa(montant)}`;

  return (
    <>
      <section aria-labelledby="t-etape" className={classePanneau}>
        <TitreEtape>Paiement</TitreEtape>
        <div className="grid gap-2.5">
          {resume.map((r, i) => (
            <div
              key={i}
              className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 rounded-carte bg-surface px-3.5 py-3 text-sm"
            >
              <p className="min-w-0">
                {r.titre}
                <span className="block text-[12.5px] text-encre-doux [overflow-wrap:anywhere]">
                  {r.detail}
                </span>
              </p>
              {r.modifier ? (
                <Lien
                  className="text-[13px]"
                  onClick={() => onAller(r.modifier!.etape)}
                >
                  {r.modifier.libelle}
                </Lien>
              ) : null}
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          <p className="text-base font-bold">Paiement en ligne avec KKiaPay</p>
          <ul className="flex list-none flex-wrap gap-1.5">
            {MOYENS.map((m) => (
              <li
                key={m}
                className="rounded-pilule border border-trait bg-surface px-3 py-1 text-[13px] font-semibold"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] leading-[1.45] text-encre-doux">
          Sur le site, la commande se paie en ligne. Elle part au restaurant dès
          que le paiement est accepté. Tant qu&apos;elle n&apos;est pas payée,
          vous pouvez la modifier.
        </p>
        {ecart && courante ? (
          <p
            className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm leading-[1.45]"
            role="status"
          >
            {ecart.accordee > 0
              ? `Vos points donnent une remise de ${fcfa(ecart.accordee)}, et non ${fcfa(ecart.estimee)} comme estimé.`
              : "Vos points n'ont pas pu être utilisés sur cette commande."}{" "}
            Le total à payer est de {fcfa(montant)}. Vous pouvez payer, ou{" "}
            <Lien className="min-h-0" onClick={() => onAller(4)}>
              changer vos points
            </Lien>
            .
          </p>
        ) : null}
        {courante && !ecart && courante.montant !== totalEstime ? (
          <p className="text-[13px] leading-[1.45] text-encre-doux">
            Montant enregistré pour cette commande{INSECABLE}: {fcfa(montant)}.
          </p>
        ) : null}
        {commence ? (
          <p className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm leading-[1.45]">
            Un paiement a déjà été commencé pour cette commande. Si vous avez
            été débité, ne payez pas une seconde fois{INSECABLE}: appelez le{" "}
            <a
              className="font-semibold whitespace-nowrap underline"
              href={telLien()}
            >
              {TELEPHONE.replace(/ /g, INSECABLE)}
            </a>
            .
          </p>
        ) : null}
        {etat === "ferme" ? (
          <p
            className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm leading-[1.45] font-semibold"
            role="status"
          >
            {echec ? "Le paiement n'a pas abouti." : "Paiement non terminé."}{" "}
            Vous pouvez réessayer{INSECABLE}: c&apos;est la même commande qui
            sera payée.
          </p>
        ) : null}
        {erreurChargement ? (
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1"
            role="alert"
          >
            <p className="text-sm font-semibold text-rouge">
              Le module de paiement n&apos;a pas pu se charger.
            </p>
            <Lien onClick={reessayer}>Réessayer</Lien>
          </div>
        ) : null}
      </section>
      <ErreurEtape message={erreur} />
      {pied(
        <Bouton
          ref={bouton}
          bloc
          aria-busy={occupe || undefined}
          className="gap-1.5 px-4 min-[1000px]:w-auto"
          disabled={!pret || occupe || !pretAPayer || erreurChargement}
          icone="cadenas"
          taille="grand"
          onClick={lancer}
        >
          {libelle}
        </Bouton>,
      )}
    </>
  );
}
