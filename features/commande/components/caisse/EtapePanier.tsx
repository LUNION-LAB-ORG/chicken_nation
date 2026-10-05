"use client";

import type { ILignePanier, ModeCommande } from "../../types/commande.types";
import type { ReactNode } from "react";

import { useState } from "react";

import { LignePanierVue } from "../LignePanierVue";

import { Bouton, LienBouton } from "@/components/site/Bouton";
import { Tag } from "@/components/site/Etiquettes";
import { Icone } from "@/components/site/Icone";
import { Lien } from "@/components/site/Lien";
import { PhotoPlat } from "@/components/site/PhotoPlat";
import { photoPlat } from "@/features/menus/photo-plat";
import { INSECABLE } from "@/lib/typo";
import { cn } from "@/lib/utils";

/** Panneau d'une étape (maquette, CSS 1243-1254). */
export const classePanneau =
  "grid min-w-0 gap-4 rounded-panneau border border-trait bg-white px-3 py-5 min-[360px]:px-[18px] md:px-7 md:py-[26px]";

/** Titre de l'étape : reçoit le focus à chaque changement d'étape. */
export function TitreEtape({ children }: { children: ReactNode }) {
  return (
    <h2
      className="text-xl leading-tight font-bold focus:outline-none"
      id="t-etape"
      tabIndex={-1}
    >
      {children}
    </h2>
  );
}

/** Message qui empêche de passer à l'étape suivante (lu aussitôt). */
export function ErreurEtape({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p
      className="rounded-carte bg-rouge-fond px-3.5 py-3 text-sm leading-[1.45] font-semibold text-rouge"
      id="etape-erreur"
      role="alert"
    >
      {message}
    </p>
  );
}

/**
 * Alerte « Livraison impossible avec… » (maquette, JS 464-473) : des articles
 * du panier ne se vendent pas dans le mode choisi. Deux sorties : changer de
 * mode (seulement si tout le panier s'y vend) ou retirer ces articles.
 */
export function AlerteMode({
  mode,
  noms,
  basculePossible,
  onBasculer,
  onRetirer,
}: {
  mode: ModeCommande;
  /** Articles qui ne se vendent pas dans ce mode, noms déjà mis en forme. */
  noms: string[];
  /** Tout le panier se vend dans l'autre mode (et la livraison est ouverte). */
  basculePossible: boolean;
  onBasculer: () => void;
  onRetirer: () => void;
}) {
  if (!noms.length) return null;
  const plusieurs = noms.length > 1;
  const liste = noms.join(", ");

  return (
    <div
      className="grid gap-2.5 rounded-carte bg-rouge-fond p-3.5 text-sm leading-[1.45]"
      role="alert"
    >
      <p>
        <strong className="text-rouge">
          {mode === "DELIVERY" ? "Livraison" : "Retrait"} impossible avec
          {INSECABLE}: {liste}.
        </strong>{" "}
        {basculePossible
          ? mode === "DELIVERY"
            ? `${plusieurs ? "Ces articles se retirent" : "Cet article se retire"} au restaurant uniquement.`
            : `${plusieurs ? "Ces articles se vendent" : "Cet article se vend"} en livraison uniquement.`
          : null}
      </p>
      <div className="flex flex-wrap gap-2">
        {basculePossible ? (
          <Bouton taille="petit" variante="sombre" onClick={onBasculer}>
            {mode === "DELIVERY" ? "Passer en retrait" : "Passer en livraison"}
          </Bouton>
        ) : null}
        <Bouton taille="petit" variante="secondaire" onClick={onRetirer}>
          {plusieurs ? "Retirer ces articles" : "Retirer cet article"}
        </Bouton>
      </div>
    </div>
  );
}

/** Plat offert (cadeau choisi à l'étape Avantages), montré dans le panier. */
export interface IPlatOffertPanier {
  id: string;
  articleId: string;
  nom: string;
  image: string;
  /** Épicé ou non, s'il est déjà connu. */
  epice?: boolean;
}

/**
 * Étape 1, le panier (maquette, JS 893-907) : lignes avec photo, Modifier,
 * Retirer, compteur ; plats offerts ; alerte de mode ; « Vider le panier ».
 * Panier vide : retour à la carte.
 */
export function EtapePanier({
  lignes,
  mode,
  problemes,
  alerte,
  revalidation,
  prixMisAJour,
  supplementsOfferts,
  platsOfferts,
  onModifier,
  onRetirer,
  onQuantite,
  onVider,
  erreur,
  pied,
}: {
  lignes: ILignePanier[];
  mode: ModeCommande;
  /** Ce qui empêche chaque ligne, hors mode (textes-caisse, problemesSansMode), par clé. */
  problemes: Map<string, string[]>;
  /** Alerte de mode (AlerteMode), ou null. */
  alerte: ReactNode;
  /** Relecture des plats au catalogue en cours. */
  revalidation: boolean;
  prixMisAJour: boolean;
  /**
   * Suppléments offerts par clé de ligne, posés comme le serveur les posera
   * (supplementsOffertsParLigne) : pas forcément sur la première ligne.
   */
  supplementsOfferts: Map<string, string[]>;
  platsOfferts: IPlatOffertPanier[];
  /** « Modifier » : absent tant que la fiche plat n'est pas branchée. */
  onModifier?: (index: number) => void;
  onRetirer: (l: ILignePanier) => void;
  onQuantite: (l: ILignePanier, quantite: number) => void;
  onVider: () => void;
  erreur: string | null;
  pied: ReactNode;
}) {
  const [confirmerVider, setConfirmerVider] = useState(false);

  if (!lignes.length) {
    return (
      <section aria-labelledby="t-etape" className={classePanneau}>
        <div className="grid justify-items-start gap-2.5">
          <TitreEtape>Votre panier est vide</TitreEtape>
          <p className="text-sm text-encre-doux">
            Choisissez vos plats sur la carte{INSECABLE}: taille, sauces, épicé
            ou non et suppléments.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <LienBouton href="/fr/carte" iconeFin="fleche">
              Voir la carte
            </LienBouton>
            <Lien href="/fr/commander/mes-commandes">Mes commandes</Lien>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section aria-labelledby="t-etape" className={classePanneau}>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <TitreEtape>Votre panier</TitreEtape>
          <Lien href="/fr/carte" icone="plus">
            Ajouter des plats
          </Lien>
        </div>
        {revalidation ? (
          <p
            className="flex items-center gap-2 text-sm text-encre-doux"
            role="status"
          >
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-trait border-t-orange motion-reduce:animate-none"
            />
            Vérification des plats du panier…
          </p>
        ) : null}
        {prixMisAJour ? (
          <p
            className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm leading-[1.45]"
            role="status"
          >
            Des prix ont changé depuis votre dernier passage{INSECABLE}: le
            panier affiche les prix du jour.
          </p>
        ) : null}
        {alerte}
        <ul className="m-0 list-none p-0">
          {lignes.map((l, i) => (
            <LignePanierVue
              key={l.cle}
              ligne={l}
              mode={mode}
              offerts={l.retire ? [] : (supplementsOfferts.get(l.cle) ?? [])}
              problemes={problemes.get(l.cle) ?? []}
              onModifier={onModifier ? () => onModifier(i) : undefined}
              onQuantite={(q) => onQuantite(l, q)}
              onRetirer={() => onRetirer(l)}
            />
          ))}
          {platsOfferts.map((c) => {
            const photo = photoPlat(c.articleId, c.image);

            return (
              <li
                key={c.id}
                className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-start gap-3 border-b border-trait py-3.5 last:border-b-0"
              >
                <PhotoPlat
                  alt=""
                  className="h-[50px] w-14"
                  etiquette={false}
                  fond={photo.fond}
                  marge={3}
                  sizes="64px"
                  src={photo.src}
                />
                <div className="grid min-w-0 gap-1">
                  <p className="text-sm leading-[1.3] font-bold [overflow-wrap:anywhere]">
                    {c.nom}
                  </p>
                  <Tag genre="offert">
                    <Icone className="size-3.5" nom="cadeau" />
                    Cadeau Gratte et Gagne
                  </Tag>
                  {c.epice !== undefined ? (
                    <p className="text-[12.5px] text-encre-doux">
                      {c.epice ? "Épicé" : "Non épicé"}
                    </p>
                  ) : null}
                </div>
                <p className="text-right text-sm font-bold">Offert</p>
              </li>
            );
          })}
        </ul>
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-trait pt-3 text-sm",
          )}
        >
          {confirmerVider ? (
            <>
              <span>Vider le panier{INSECABLE}?</span>
              <Lien
                onClick={() => {
                  setConfirmerVider(false);
                  onVider();
                }}
              >
                Oui, vider
              </Lien>
              <Lien onClick={() => setConfirmerVider(false)}>Non</Lien>
            </>
          ) : (
            <Lien
              className="text-encre-doux"
              onClick={() => setConfirmerVider(true)}
            >
              Vider le panier
            </Lien>
          )}
        </div>
      </section>
      <ErreurEtape message={erreur} />
      {pied}
    </>
  );
}
