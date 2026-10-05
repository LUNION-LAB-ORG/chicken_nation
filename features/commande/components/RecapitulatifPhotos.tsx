import type { ReactNode } from "react";
import type {
  CadeauChoisi,
  ICadeau,
  ICommande,
  ILignePanier,
} from "../types/commande.types";

import {
  detailsLigne,
  lignesACommander,
  totalLigne,
} from "../utils/panier.utils";

import { Tag } from "@/components/site/Etiquettes";
import { PhotoPlat } from "@/components/site/PhotoPlat";
import { photoPlat } from "@/features/menus/photo-plat";
import { fcfa, INSECABLE, joli } from "@/lib/typo";
import { cn } from "@/lib/utils";

/** Ligne du récapitulatif, venue du panier ou d'une commande enregistrée. */
export interface ILigneRecap {
  cle: string;
  dish_id: string;
  /** Photo de l'API (adresse complète) ; la photo recadrée du plat passe avant. */
  image: string;
  nom: string;
  quantite: number;
  /** Choix en clair (« XL (3 pcs) · Non épicé »). */
  choix?: string;
  /** Suppléments en clair (« + 2 Coca »). */
  supplements?: string;
  /** Total de la ligne ; 0 pour un plat offert. */
  montant: number;
  /** Mentions vertes (« Cadeau », « + 1 Coca offert »). */
  offerts?: string[];
}

/**
 * Lignes du récapitulatif tirées du panier et des cadeaux choisis (maquette,
 * JS 1222-1243) : plats offerts en lignes à 0 F, suppléments offerts sur la
 * première ligne payante, comme le serveur les place.
 */
export function lignesRecapDuPanier(
  lignes: ILignePanier[],
  cadeaux: (Pick<ICadeau, "id" | "type" | "articleId" | "nom" | "image"> &
    Pick<CadeauChoisi, "epice">)[] = [],
): ILigneRecap[] {
  const offertsSurPremiere = cadeaux
    .filter((c) => c.type === "SUPPLEMENT")
    .map((c) => `+ 1 ${joli(c.nom)} offert`);
  const payantes = lignesACommander(lignes).map((l, i) => {
    const d = detailsLigne(l);

    return {
      cle: l.cle,
      dish_id: l.dish_id,
      image: l.image,
      nom: l.nom,
      quantite: l.quantite,
      choix: d.choix,
      supplements: d.supplements,
      montant: totalLigne(l),
      offerts: i === 0 ? offertsSurPremiere : [],
    };
  });
  const platsOfferts = payantes.length
    ? cadeaux
        .filter((c) => c.type === "PLAT")
        .map((c) => ({
          cle: `cadeau-${c.id}`,
          dish_id: c.articleId,
          image: c.image,
          nom: c.nom,
          quantite: 1,
          choix:
            c.epice === true ? "Épicé" : c.epice === false ? "Non épicé" : "",
          montant: 0,
          offerts: ["Cadeau"],
        }))
    : [];

  return [...payantes, ...platsOfferts];
}

/** Lignes du récapitulatif d'une commande enregistrée (suivi, Mes commandes). */
export function lignesRecapDeCommande(
  commande: Pick<ICommande, "id" | "lignes">,
): ILigneRecap[] {
  return commande.lignes.map((l, i) => {
    const payants = l.supplementsChoisis.filter(
      (s) => !s.offert && s.quantite > 0,
    );

    return {
      cle: `${commande.id}-${i}`,
      dish_id: l.dish_id,
      image: l.image,
      nom: l.nom,
      quantite: l.quantite,
      choix: [...l.options, l.epice ? "Épicé" : null]
        .filter(Boolean)
        .join(" · "),
      supplements: payants.length
        ? `+ ${payants.map((s) => `${s.quantite}${INSECABLE}${joli(s.nom)}`).join(", ")}`
        : "",
      montant: l.montant,
      offerts: [
        ...(l.offert ? ["Cadeau"] : []),
        ...l.supplementsChoisis
          .filter((s) => s.offert)
          .map((s) => `+ 1 ${joli(s.nom)} offert`),
      ],
    };
  });
}

/**
 * Récapitulatif d'une commande avec les photos des plats (maquette, CSS
 * 1285-1304) : lieu, lignes, totaux et une note. Trois formes :
 *  - `carte` : toujours visible (suivi d'une commande) ;
 *  - `colonne` : colonne de droite de la caisse, collante sous l'en-tête,
 *    visible seulement dès 1 000 px ;
 *  - `volet` : `<details>` replié sous 1 000 px, total dans le résumé.
 * La caisse pose `colonne` et `volet` ensemble ; un seul est visible.
 */
export function RecapitulatifPhotos({
  titre = "Récapitulatif",
  niveauTitre = "h2",
  lieu,
  lignes,
  totaux,
  note,
  totalResume,
  variante = "carte",
  className,
}: {
  titre?: string;
  niveauTitre?: "h2" | "h3";
  /** Mode et lieu : « Livraison » et « Cocody, préparée à Angré (4,2 km) ». */
  lieu?: { titre: string; detail: string } | null;
  lignes: ILigneRecap[];
  /** Totaux (composant Totaux). */
  totaux?: ReactNode;
  /** Phrase sous la carte (« Cette commande vous rapportera 12 points. »). */
  note?: ReactNode;
  /** Total écrit dans le résumé du volet. */
  totalResume?: number;
  variante?: "carte" | "colonne" | "volet";
  className?: string;
}) {
  const Titre = niveauTitre;
  const corps = (
    <div
      className={cn(
        "grid gap-3.5 rounded-panneau border border-trait bg-white p-5 shadow-1",
        variante === "volet" && "rounded-none border-0 pt-1 shadow-none",
      )}
    >
      <Titre
        className={cn("text-lg font-bold", variante === "volet" && "sr-only")}
      >
        {titre}
      </Titre>
      {lieu ? (
        <p className="grid gap-0.5 rounded-xl bg-surface [background-image:var(--motif-nappe)] [background-size:72px_72px] bg-repeat px-3 py-2.5 text-[13px]">
          <b className="text-sm">{lieu.titre}</b>
          <span className="[overflow-wrap:anywhere]">{lieu.detail}</span>
        </p>
      ) : null}
      {lignes.length ? (
        <ul
          className={cn(
            "grid list-none gap-2.5",
            variante === "colonne" &&
              "max-h-[300px] overflow-y-auto overscroll-contain pr-1",
          )}
        >
          {lignes.map((l) => {
            const photo = photoPlat(l.dish_id, l.image);

            return (
              <li
                key={l.cle}
                className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-start gap-2.5 text-[13px] leading-[1.35]"
              >
                <PhotoPlat
                  alt=""
                  className="h-[42px] w-12 rounded-lg"
                  fond={photo.fond}
                  marge={2}
                  sizes="48px"
                  src={photo.src}
                />
                <div className="grid min-w-0 gap-0.5">
                  <p className="font-bold [overflow-wrap:anywhere]">
                    {l.quantite} × {l.nom}
                  </p>
                  {l.choix ? (
                    <p className="text-xs text-encre-doux">{l.choix}</p>
                  ) : null}
                  {l.supplements ? (
                    <p className="text-xs text-encre-doux">{l.supplements}</p>
                  ) : null}
                  {(l.offerts ?? []).map((o) => (
                    <p key={o}>
                      <Tag genre="offert">{o}</Tag>
                    </p>
                  ))}
                </div>
                <span className="font-semibold whitespace-nowrap tabular-nums">
                  {fcfa(l.montant)}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
      {totaux}
    </div>
  );

  if (variante === "volet") {
    return (
      <details
        className={cn(
          "group rounded-carte border border-trait bg-white min-[1000px]:hidden",
          className,
        )}
      >
        <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-2.5 px-4 py-1.5 font-semibold [&::-webkit-details-marker]:hidden">
          <span>{titre}</span>
          {totalResume !== undefined ? (
            <strong className="tabular-nums">{fcfa(totalResume)}</strong>
          ) : null}
        </summary>
        {corps}
        {note ? (
          <div className="px-5 pb-4 text-[12.5px] text-encre-doux">{note}</div>
        ) : null}
      </details>
    );
  }

  return (
    <aside
      aria-label={`${titre} de la commande`}
      className={cn(
        "grid content-start gap-3",
        variante === "colonne" &&
          "sticky top-[calc(var(--h-entete)+20px)] hidden min-[1000px]:grid",
        className,
      )}
    >
      {corps}
      {note ? (
        <div className="text-[12.5px] text-encre-doux">{note}</div>
      ) : null}
    </aside>
  );
}
