"use client";

import type {
  ILignePanier,
  IReglagesFidelite,
  ModeCommande,
} from "../types/commande.types";
import type { RefObject } from "react";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

import { lireReglagesFideliteAction } from "../actions/commande.action";
import { modeAtom } from "../stores/caisse.store";
import {
  ficheDemandeeAtom,
  tiroirPanierOuvertAtom,
} from "../stores/interface.store";
import {
  changerQuantiteAtom,
  panierAtom,
  retirerHorsModeAtom,
} from "../stores/panier.store";
import { textePointsGagnes } from "../utils/fidelite.utils";
import { nombreArticles, sousTotal } from "../utils/panier.utils";
import { nomsHorsMode, problemesHorsMode } from "../utils/tiroir.utils";

import { LignePanierVue } from "./LignePanierVue";
import styles from "./TiroirPanier.module.css";

import { Bouton, LienBouton } from "@/components/site/Bouton";
import { BoutonRond } from "@/components/site/BoutonRond";
import { CHEMIN_CAISSE, CHEMIN_CARTE } from "@/components/site/entete/liens";
import { Feuille } from "@/components/site/Feuille";
import { Icone } from "@/components/site/Icone";
import { afficherMessage, annoncer } from "@/components/site/MessageFlottant";
import { TitreAffiche } from "@/components/site/TitreAffiche";
import { fcfa, INSECABLE, pluriel } from "@/lib/typo";
import { cn } from "@/lib/utils";

const TITRE_ID = "panier-titre";

/** Le titre du tiroir reçoit le focus (ouverture, ligne retirée). */
const focaliserTitre = () =>
  document.getElementById(TITRE_ID)?.focus({ preventScroll: true });

// ── Réglages de fidélité publics, lus une fois par visite ─────────────────

let reglagesEnCours: Promise<IReglagesFidelite | null> | null = null;

/**
 * Réglages publics de fidélité (« Cette commande vous rapportera N points »),
 * lus à la première ouverture du tiroir. En cas d'échec, rien n'est affiché
 * (aucun chiffre écrit en dur) et la lecture sera retentée à l'ouverture
 * suivante.
 */
function lireReglages(): Promise<IReglagesFidelite | null> {
  reglagesEnCours ??= lireReglagesFideliteAction()
    .then((r) => (r.ok ? r.data : null))
    .catch(() => null)
    .then((r) => {
      if (!r) reglagesEnCours = null;

      return r;
    });

  return reglagesEnCours;
}

// ── Contenu (sans état, rendu aussi dans les tests) ───────────────────────

export interface IContenuTiroirProps {
  lignes: ILignePanier[];
  mode: ModeCommande;
  /** Points gagnés par franc (réglages publics), ou null s'ils sont inconnus. */
  pointsParFranc: number | null;
  maintenant?: Date;
  retraitRef?: RefObject<HTMLInputElement | null>;
  surFermer: () => void;
  surMode: (mode: ModeCommande) => void;
  surModifier: (ligne: ILignePanier, index: number) => void;
  surRetirer: (ligne: ILignePanier) => void;
  surQuantite: (ligne: ILignePanier, quantite: number) => void;
  surPasserEnRetrait: () => void;
  surRetirerHorsMode: () => void;
  /** Lien vers la caisse ou la carte suivi : le tiroir se ferme. */
  surNavigation: () => void;
}

/**
 * Contenu du tiroir du panier (maquette, HTML 465-490, JS 438-500) : tête
 * orange (titre, résumé, fermer), lignes avec photo, Modifier, Retirer et
 * compteur, puis le pied : Livraison ou Retrait, alerte « à emporter » avec
 * ses deux actions, sous-total, points estimés et « Passer commande ».
 */
export function ContenuTiroir({
  lignes,
  mode,
  pointsParFranc,
  maintenant,
  retraitRef,
  surFermer,
  surMode,
  surModifier,
  surRetirer,
  surQuantite,
  surPasserEnRetrait,
  surRetirerHorsMode,
  surNavigation,
}: IContenuTiroirProps) {
  const nombre = nombreArticles(lignes);
  const total = sousTotal(lignes);
  const horsMode = mode === "DELIVERY" ? nomsHorsMode(lignes, "DELIVERY") : [];
  const plusieurs = horsMode.length > 1;
  const points =
    pointsParFranc === null ? null : textePointsGagnes(total, pointsParFranc);

  return (
    <div className={styles.interieur}>
      <div className={styles.tete}>
        <TitreAffiche
          className="text-encre"
          id={TITRE_ID}
          niveau="h2"
          tabIndex={-1}
          taille="panneau"
        >
          Votre panier
        </TitreAffiche>
        <p className="mt-1 text-[13px] font-medium text-encre">
          {nombre
            ? `${pluriel(nombre, "article", "articles")}, ${fcfa(total)}`
            : "Aucun plat pour le moment"}
        </p>
        <BoutonRond
          className="absolute top-1/2 right-3 -translate-y-1/2"
          icone="croix"
          libelle="Fermer le panier"
          variante="blanc"
          onClick={surFermer}
        />
      </div>

      <div className={styles.corps}>
        {lignes.length ? (
          <ul className="m-0 list-none p-0">
            {lignes.map((l, i) => (
              <LignePanierVue
                key={l.cle}
                ligne={l}
                mode={mode}
                problemes={problemesHorsMode(l, mode, maintenant)}
                onModifier={() => surModifier(l, i)}
                onQuantite={(q) => surQuantite(l, q)}
                onRetirer={() => surRetirer(l)}
              />
            ))}
          </ul>
        ) : (
          <div className="grid justify-items-start gap-2.5 pt-6">
            <p className="text-lg font-bold">Votre panier est vide</p>
            <p className="text-sm text-encre-doux">
              Choisissez vos plats sur la carte, ils apparaîtront ici.
            </p>
            <LienBouton href={CHEMIN_CARTE} onClick={surNavigation}>
              Voir la carte
            </LienBouton>
          </div>
        )}
      </div>

      {lignes.length ? (
        <div className={styles.pied}>
          <fieldset className={styles.mode}>
            <legend className="sr-only">Mode de commande</legend>
            <input
              checked={mode === "DELIVERY"}
              id="tiroir-mode-livraison"
              name="tiroir-mode"
              type="radio"
              value="DELIVERY"
              onChange={() => surMode("DELIVERY")}
            />
            <label htmlFor="tiroir-mode-livraison">
              Livraison
              <small>20 à 35{INSECABLE}min</small>
            </label>
            <input
              ref={retraitRef}
              checked={mode === "PICKUP"}
              id="tiroir-mode-retrait"
              name="tiroir-mode"
              type="radio"
              value="PICKUP"
              onChange={() => surMode("PICKUP")}
            />
            <label htmlFor="tiroir-mode-retrait">
              Retrait
              <small>au restaurant</small>
            </label>
          </fieldset>

          {horsMode.length ? (
            <div
              className="grid gap-2.5 rounded-carte bg-rouge-fond p-3.5 text-sm text-encre"
              role="alert"
            >
              <p>
                <strong className="text-rouge">
                  Livraison impossible avec{INSECABLE}: {horsMode.join(", ")}.
                </strong>{" "}
                {plusieurs
                  ? "Ces articles se retirent"
                  : "Cet article se retire"}{" "}
                au restaurant uniquement.
              </p>
              <div className="flex flex-wrap gap-2">
                <Bouton
                  className="min-h-11"
                  taille="petit"
                  variante="sombre"
                  onClick={surPasserEnRetrait}
                >
                  Passer en retrait
                </Bouton>
                <Bouton
                  className="min-h-11"
                  taille="petit"
                  variante="secondaire"
                  onClick={surRetirerHorsMode}
                >
                  {plusieurs ? "Retirer ces articles" : "Retirer cet article"}
                </Bouton>
              </div>
            </div>
          ) : null}

          <dl className="m-0 grid gap-1.5 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="min-w-0 text-encre-doux">Sous-total</dt>
              <dd className="m-0 text-right font-semibold whitespace-nowrap tabular-nums">
                {fcfa(total)}
              </dd>
            </div>
          </dl>

          <p
            className={cn(
              styles.note,
              "grid grid-cols-[20px_minmax(0,1fr)] gap-2 text-[13px] leading-[1.45] text-encre-doux",
            )}
          >
            <Icone className="mt-px size-[18px] text-encre" nom="etoile" />
            <span>
              Adresse, code promo, points et cadeaux à l&apos;étape suivante.
              {points ? ` ${points}` : null}
            </span>
          </p>

          <LienBouton
            bloc
            entre
            href={CHEMIN_CAISSE}
            iconeFin="fleche"
            taille="grand"
            onClick={surNavigation}
          >
            Passer commande
          </LienBouton>
        </div>
      ) : null}
    </div>
  );
}

// ── Tiroir branché sur le panier ──────────────────────────────────────────

/**
 * Tiroir du panier (plan, besoin 9 du tableau 4.2), ouvert par le bouton
 * panier de l'en-tête et la barre du panier. Monté par FenetresCommande et
 * chargé à la demande. « Modifier » ferme le tiroir et ouvre la fiche du plat
 * pré-remplie ; la fiche rouvre le tiroir en se fermant.
 */
export default function TiroirPanier() {
  const [ouvert, setOuvert] = useAtom(tiroirPanierOuvertAtom);
  const demanderFiche = useSetAtom(ficheDemandeeAtom);
  const lignes = useAtomValue(panierAtom);
  const [mode, setMode] = useAtom(modeAtom);
  const changerQuantite = useSetAtom(changerQuantiteAtom);
  const retirerHorsMode = useSetAtom(retirerHorsModeAtom);
  const [reglages, setReglages] = useState<IReglagesFidelite | null>(null);

  const retraitRef = useRef<HTMLInputElement>(null);
  const avecLignes = lignes.length > 0;

  // À l'ouverture, le titre reçoit le focus (le lecteur d'écran lit
  // « Votre panier » puis le résumé).
  useEffect(() => {
    if (ouvert) focaliserTitre();
  }, [ouvert]);

  useEffect(() => {
    if (!ouvert || !avecLignes || reglages) return;
    let actif = true;

    lireReglages().then((r) => {
      if (actif && r) setReglages(r);
    });

    return () => {
      actif = false;
    };
  }, [ouvert, avecLignes, reglages]);

  const fermer = () => setOuvert(false);

  return (
    <Feuille
      forme="tiroir"
      ouverte={ouvert}
      titreId={TITRE_ID}
      onFermer={fermer}
    >
      <ContenuTiroir
        lignes={lignes}
        mode={mode}
        pointsParFranc={reglages?.pointsParFranc ?? null}
        retraitRef={retraitRef}
        surFermer={fermer}
        surMode={setMode}
        surModifier={(l, index) => {
          setOuvert(false);
          demanderFiche({
            platId: l.dish_id,
            indexLigne: index,
            cleLigne: l.cle,
            depuis: "panier",
          });
        }}
        surNavigation={fermer}
        surPasserEnRetrait={() => {
          setMode("PICKUP");
          retraitRef.current?.focus();
          afficherMessage("Commande passée en retrait au restaurant.");
        }}
        surQuantite={(l, quantite) => changerQuantite({ cle: l.cle, quantite })}
        surRetirer={(l) => {
          changerQuantite({ cle: l.cle, quantite: 0 });
          focaliserTitre();
          annoncer(`${l.nom} retiré du panier.`);
        }}
        surRetirerHorsMode={() => {
          retirerHorsMode("DELIVERY");
          focaliserTitre();
          afficherMessage(
            `Articles à emporter retirés${INSECABLE}: la livraison est possible.`,
          );
        }}
      />
    </Feuille>
  );
}
