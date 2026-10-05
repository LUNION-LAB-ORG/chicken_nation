"use client";

import type { ICommande } from "../types/commande.types";

import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  annulerCommandeAction,
  revaliderPanierAction,
} from "../actions/commande.action";
import {
  tiroirPanierBrancheAtom,
  tiroirPanierOuvertAtom,
} from "../stores/interface.store";
import { panierAtom } from "../stores/panier.store";
import { messageErreurAction } from "../utils/erreur-action.utils";
import {
  effacerMarquePaiement,
  lireCommandeEnAttente,
  lirePanierCommande,
  oublierCommandeEnAttente,
  oublierEcartPoints,
  oublierPanierCommande,
} from "../utils/memoire-navigateur.utils";
import { ajouterLigne } from "../utils/panier.utils";
import {
  lignesPourPanier,
  remettreSansDoubler,
  texteAbsents,
  texteAjout,
} from "../utils/suivi.utils";

import { afficherMessage } from "@/components/site/MessageFlottant";
import { INSECABLE } from "@/lib/typo";

type CommandeActionnable = Pick<ICommande, "id" | "reference" | "lignes">;

/** Lignes de la commande relues au catalogue (prix, choix et modes du jour). */
async function relireLignes(c: CommandeActionnable) {
  const ids = Array.from(
    new Set(c.lignes.filter((l) => !l.offert).map((l) => l.dish_id)),
  );

  return lignesPourPanier(
    c,
    ids.length ? await revaliderPanierAction(ids) : {},
  );
}

/**
 * « Modifier ma commande » et « Recommander », partagés par le suivi et Mes
 * commandes. Le panier est refait depuis l'API (plats relus au catalogue,
 * prix du jour), pas seulement depuis ce que l'onglet a gardé.
 */
export function useActionsCommande() {
  const router = useRouter();
  const setPanier = useSetAtom(panierAtom);
  const tiroirBranche = useAtomValue(tiroirPanierBrancheAtom);
  const ouvrirTiroir = useSetAtom(tiroirPanierOuvertAtom);
  const [enCours, setEnCours] = useState<"modifier" | "recommander" | null>(
    null,
  );
  const [erreur, setErreur] = useState<string | null>(null);

  /**
   * Annule la commande non payée (le serveur rend le code ou le bon engagé et
   * les cadeaux ; les points ne sont jamais déduits avant le paiement), remet
   * ses plats dans le panier et ouvre la caisse. Le client paiera ensuite une
   * nouvelle commande (règle du site, plan 4.3).
   */
  const modifier = useCallback(
    async (c: CommandeActionnable) => {
      setErreur(null);
      setEnCours("modifier");
      try {
        const res = await annulerCommandeAction(c.id);

        if (!res.ok) {
          setEnCours(null);
          setErreur(res.message);

          return;
        }
        // Lignes gardées par cet onglet (panier tel quel), sinon relues.
        const gardees = lirePanierCommande(c.id);
        const relues = gardees.length
          ? { lignes: gardees, absents: [] }
          : await relireLignes(c).catch(() => null);

        if (!relues) {
          // Commande déjà annulée : la page la montre annulée, avec « Recommander ».
          setEnCours(null);
          setErreur(
            `Commande annulée, mais ses plats n'ont pas pu être remis dans le panier. Utilisez «${INSECABLE}Recommander${INSECABLE}».`,
          );
          router.refresh();

          return;
        }
        const { lignes, absents } = relues;

        setPanier((panier) => remettreSansDoubler(panier, lignes));
        oublierPanierCommande(c.id);
        oublierEcartPoints(c.id);
        effacerMarquePaiement(c.reference);
        // La caisse ne doit plus proposer de payer la commande annulée.
        if (lireCommandeEnAttente()?.id === c.id) oublierCommandeEnAttente();
        afficherMessage(
          [
            `Commande ${c.reference} annulée, ses plats sont dans votre panier.`,
            texteAbsents(absents),
          ]
            .filter(Boolean)
            .join(" "),
        );
        router.push("/fr/commander");
      } catch (e) {
        setEnCours(null);
        setErreur(messageErreurAction(e));
      }
    },
    [router, setPanier],
  );

  /** Remet les mêmes plats, choix et suppléments dans le panier, puis l'ouvre. */
  const recommander = useCallback(
    async (c: CommandeActionnable) => {
      setErreur(null);
      setEnCours("recommander");
      try {
        const { lignes, absents } = await relireLignes(c);

        if (!lignes.length) {
          setEnCours(null);
          setErreur(
            texteAbsents(absents) ??
              "Ces plats ne sont plus proposés en ligne.",
          );

          return;
        }
        setPanier((panier) => lignes.reduce(ajouterLigne, panier));
        afficherMessage(
          [texteAjout(lignes), texteAbsents(absents)].filter(Boolean).join(" "),
        );
        setEnCours(null);
        // Tiroir du panier s'il est monté dans la page (lot L11b), sinon la caisse.
        if (tiroirBranche) ouvrirTiroir(true);
        else router.push("/fr/commander");
      } catch (e) {
        setEnCours(null);
        setErreur(messageErreurAction(e));
      }
    },
    [router, setPanier, tiroirBranche, ouvrirTiroir],
  );

  return { modifier, recommander, enCours, erreur };
}
