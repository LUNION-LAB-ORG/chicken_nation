"use client";

import type { ILignePanier, ModeCommande } from "../types/commande.types";

import {
  detailsLigne,
  mentionModes,
  QUANTITE_MAX,
  totalLigne,
  venduEn,
} from "../utils/panier.utils";

import { Compteur } from "@/components/site/Compteur";
import { Tag } from "@/components/site/Etiquettes";
import { Icone } from "@/components/site/Icone";
import { Lien } from "@/components/site/Lien";
import { PhotoPlat } from "@/components/site/PhotoPlat";
import { photoPlat } from "@/features/menus/photo-plat";
import { fcfa, INSECABLE, joli } from "@/lib/typo";
import { cn } from "@/lib/utils";

/** « à emporter uniquement » → « À emporter uniquement ». */
const majuscule = (texte: string) =>
  texte.charAt(0).toUpperCase() + texte.slice(1);

/**
 * Ligne du panier (maquette, CSS 972-1006, JS 438-456), partagée par le tiroir
 * du panier et l'étape Panier de la caisse : photo, nom, choix et
 * suppléments, mentions, prix unitaire, Modifier et Retirer, total et
 * compteur.
 *
 * La ligne se met en page selon SA largeur (requête de conteneur) : sous
 * 384 px (tiroir sur téléphone), total et compteur passent sur une rangée
 * pleine largeur sous le texte (le compteur garde ses cibles de 44 px) ;
 * au-delà, ils prennent la colonne de droite. Sans `onQuantite`, la ligne
 * est en lecture seule.
 */
export function LignePanierVue({
  ligne,
  mode,
  problemes = [],
  offerts = [],
  onModifier,
  onRetirer,
  onQuantite,
  className,
}: {
  ligne: ILignePanier;
  /** Mode choisi : un article qui ne s'y vend pas porte la mention « À emporter uniquement ». */
  mode?: ModeCommande;
  /** Ce qui empêche de commander la ligne (panier.utils, problemesLigne), en phrases. */
  problemes?: string[];
  /** Suppléments offerts posés sur cette ligne (cadeaux), noms. */
  offerts?: string[];
  onModifier?: () => void;
  onRetirer?: () => void;
  onQuantite?: (quantite: number) => void;
  className?: string;
}) {
  const photo = photoPlat(ligne.dish_id, ligne.image);
  const { choix, supplements } = detailsLigne(ligne);
  const prixOptions = ligne.options.reduce((s, o) => s + o.price_delta, 0);
  const prixSupplements = ligne.supplements.reduce(
    (s, x) => s + x.prix * x.quantite,
    0,
  );
  // Mentions des articles qui ne se vendent pas dans le mode choisi.
  const mentions = mode
    ? [
        !venduEn(ligne.available_order_types, mode)
          ? mentionModes(ligne.available_order_types)
          : null,
        ...ligne.supplements
          .filter(
            (s) => s.quantite > 0 && !venduEn(s.available_order_types, mode),
          )
          .map(
            (s) =>
              `${joli(s.nom)}${INSECABLE}: ${mentionModes(s.available_order_types)}`,
          ),
      ].filter((m): m is string => !!m)
    : [];

  return (
    <li
      className={cn(
        "@container border-b border-trait py-3.5 last:border-b-0",
        className,
      )}
    >
      <div
        className={cn(
          "grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-3 gap-y-2",
          "@sm:grid-cols-[64px_minmax(0,1fr)_auto]",
          ligne.retire && "opacity-70",
        )}
      >
        <PhotoPlat
          alt=""
          className="h-[50px] w-14 @sm:h-14 @sm:w-16"
          etiquette={false}
          fond={photo.fond}
          marge={3}
          sizes="64px"
          src={photo.src}
        />

        <div className="grid min-w-0 gap-0.5">
          <p className="text-sm leading-[1.3] font-bold [overflow-wrap:anywhere]">
            {ligne.nom}
          </p>
          {choix ? (
            <p className="text-[12.5px] leading-[1.45] text-encre-doux">
              {choix}
            </p>
          ) : null}
          {supplements ? (
            <p className="text-[12.5px] leading-[1.45] font-semibold text-encre">
              {supplements}
            </p>
          ) : null}
          {offerts.map((nom) => (
            <Tag key={nom} genre="offert">
              <Icone className="size-3.5" nom="cadeau" />+ 1 {joli(nom)} offert
            </Tag>
          ))}
          {mentions.map((m) => (
            <Tag
              key={m}
              className="rounded-md whitespace-normal"
              genre="emporter"
            >
              {majuscule(m)}
            </Tag>
          ))}
          {ligne.retire ? (
            <p className="text-[12.5px] font-semibold text-rouge">
              Ce plat n&apos;est plus proposé. Il ne sera pas commandé.
            </p>
          ) : (
            <>
              {problemes.map((p) => (
                <p key={p} className="text-[12.5px] font-semibold text-rouge">
                  {p}
                </p>
              ))}
              <p className="text-[12.5px] leading-[1.45] text-encre-doux tabular-nums">
                {fcfa(ligne.prixUnitaire + prixOptions)} l&apos;unité
                {prixSupplements
                  ? `, suppléments ${fcfa(prixSupplements)}`
                  : ""}
              </p>
            </>
          )}
          {onModifier || onRetirer ? (
            <div className="flex flex-wrap gap-x-3.5">
              {onModifier && !ligne.retire ? (
                <Lien
                  aria-label={`Modifier ${ligne.nom}`}
                  className="text-[13px]"
                  onClick={onModifier}
                >
                  Modifier
                </Lien>
              ) : null}
              {onRetirer ? (
                <Lien
                  aria-label={`Retirer ${ligne.nom}`}
                  className="text-[13px]"
                  onClick={onRetirer}
                >
                  Retirer
                </Lien>
              ) : null}
            </div>
          ) : null}
        </div>

        {ligne.retire ? null : (
          <div
            className={cn(
              "col-span-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2",
              "@sm:col-span-1 @sm:col-start-3 @sm:row-start-1 @sm:flex-col @sm:items-end @sm:justify-start",
            )}
          >
            <p className="text-sm font-bold whitespace-nowrap tabular-nums">
              {fcfa(totalLigne(ligne))}
            </p>
            {onQuantite ? (
              <Compteur
                className="[&_button]:size-11"
                libelle="Quantité"
                max={QUANTITE_MAX}
                min={1}
                nom={ligne.nom}
                valeur={ligne.quantite}
                onChange={onQuantite}
                onRetirer={onRetirer}
              />
            ) : (
              <p className="text-[12.5px] text-encre-doux">
                Quantité{INSECABLE}: {ligne.quantite}
              </p>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
