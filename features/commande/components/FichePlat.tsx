"use client";

import type {
  IGroupeOptions,
  ILignePanier,
  ISupplementPlat,
  ModeCommande,
  Resultat,
} from "../types/commande.types";
import type { IFicheDemandee } from "../stores/interface.store";
import type { IChoixEnCours, IFichePlat } from "../utils/fiche.utils";
import type { CSSProperties, ReactNode, RefObject } from "react";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { lireFichePlatAction } from "../actions/fiche-plat.action";
import { modeAtom } from "../stores/caisse.store";
import {
  ficheDemandeeAtom,
  tiroirPanierOuvertAtom,
} from "../stores/interface.store";
import {
  ajouterAuPanierAtom,
  panierAtom,
  remplacerLigneAtom,
} from "../stores/panier.store";
import { articleDeLigne } from "../utils/analytique.utils";
import { messageErreurAction } from "../utils/erreur-action.utils";
import {
  aideMaximum,
  choixInitiaux,
  decouperLibelle,
  empechementPlat,
  groupePayant,
  groupesIncomplets,
  ligneAModifier,
  ligneDeFiche,
  mentionPlatHorsMode,
  mentionSupplementHorsMode,
  messageGroupe,
  messageSupplementHorsMode,
  noteSupplementsHorsMode,
  regleGroupe,
  supplementsParCategorie,
  totalFiche,
} from "../utils/fiche.utils";
import {
  basculerOption,
  QUANTITE_MAX,
  QUANTITE_SUPPLEMENT_MAX,
  venduEn,
} from "../utils/panier.utils";

import { ChoixEpice } from "./ChoixEpice";
import styles from "./FichePlat.module.css";

import { Accordeon } from "@/components/site/Accordeon";
import { BadgePromo, Surtitre } from "@/components/site/Autocollants";
import { Bouton, LienBouton } from "@/components/site/Bouton";
import { CaseACocher, ChoixRadio, GroupeChoix } from "@/components/site/Choix";
import { Compteur } from "@/components/site/Compteur";
import { Tag } from "@/components/site/Etiquettes";
import { Feuille } from "@/components/site/Feuille";
import { Icone } from "@/components/site/Icone";
import { afficherMessage, annoncer } from "@/components/site/MessageFlottant";
import { PhotoPlat } from "@/components/site/PhotoPlat";
import { PrixPlat } from "@/components/site/plats/CartePlat";
import { photoPlat } from "@/features/menus/photo-plat";
import { evenementCommerce } from "@/lib/analytique";
import { fcfa, INSECABLE, joli, nombre, phrase, typo } from "@/lib/typo";
import { cn } from "@/lib/utils";

/** id du titre de la fiche (aria-labelledby de la fenêtre). */
const TITRE_ID = "fiche-nom";
const ID_EPICE = "fiche-groupe-epice";
const idGroupe = (g: Pick<IGroupeOptions, "id">) => `fiche-groupe-${g.id}`;

// ── Lecture du plat, gardée quelques minutes ──────────────────────────────

/**
 * Plats déjà ouverts, gardés 5 minutes : rouvrir une fiche (ou « Modifier »
 * une ligne) ne relit pas l'API. Les prix n'y sont qu'un affichage : le
 * serveur relit tout à la création de la commande.
 */
const DUREE_MEMOIRE = 5 * 60 * 1000;
const memoire = new Map<string, { fiche: IFichePlat; lu: number }>();

function ficheGardee(id: string): IFichePlat | null {
  const garde = memoire.get(id);

  return garde && Date.now() - garde.lu < DUREE_MEMOIRE ? garde.fiche : null;
}

async function lireFiche(id: string): Promise<Resultat<IFichePlat>> {
  const gardee = ficheGardee(id);

  if (gardee) return { ok: true, data: gardee };
  const res = await lireFichePlatAction(id);

  if (res.ok) memoire.set(id, { fiche: res.data, lu: Date.now() });

  return res;
}

// ── Contenu (sans état, rendu aussi dans les tests) ───────────────────────

/** Petite pastille d'information (« Servi épicé »), maquette CSS 1121. */
function PastilleInfo({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex w-fit items-center gap-1.5 rounded-pilule border border-trait bg-surface px-3 py-[5px] text-[13px] leading-[1.3] font-semibold">
      {children}
    </p>
  );
}

/** Photo d'un supplément (44 px), ou une case crème s'il n'en a pas. */
function PhotoSupplement({ s }: { s: ISupplementPlat }) {
  if (!s.image)
    return <span aria-hidden="true" className="size-11 rounded-lg bg-creme" />;

  return (
    <Image
      alt=""
      className="size-11 rounded-lg bg-creme object-contain"
      height={44}
      sizes="44px"
      src={s.image}
      width={44}
    />
  );
}

export interface IContenuFicheProps {
  fiche: IFichePlat;
  choix: IChoixEnCours;
  mode: ModeCommande;
  /** « Modifier » une ligne du panier : « Mettre à jour » au lieu d'« Ajouter ». */
  edition: boolean;
  /** Le client a voulu ajouter : les choix obligatoires manquants sont signalés. */
  tentative: boolean;
  /** Catégories de suppléments ouvertes au premier affichage. */
  ouverts: ReadonlySet<string>;
  maintenant?: Date;
  titreRef?: RefObject<HTMLHeadingElement | null>;
  defileRef?: RefObject<HTMLDivElement | null>;
  surOption: (g: IGroupeOptions, itemId: string) => void;
  surEpice: (epice: boolean) => void;
  surSupplement: (s: ISupplementPlat, quantite: number) => void;
  surQuantite: (quantite: number) => void;
  surValider: () => void;
}

/**
 * Contenu de la fiche plat (maquette, JS 566-626) : tête (photo à sa taille,
 * catégorie, nom, description, prix, épicé, mentions), groupes d'options,
 * épicé ou non, suppléments par catégorie, puis le pied (quantité,
 * « Ajouter » ou « Mettre à jour » avec le total en direct).
 */
export function ContenuFiche({
  fiche,
  choix,
  mode,
  edition,
  tentative,
  ouverts,
  maintenant,
  titreRef,
  defileRef,
  surOption,
  surEpice,
  surSupplement,
  surQuantite,
  surValider,
}: IContenuFicheProps) {
  const { plat, categorie } = fiche;
  const photo = photoPlat(plat.id, plat.image);
  const remise =
    plat.prixAvantPromo !== null ? plat.prixAvantPromo - plat.prix : 0;
  const empechement = empechementPlat(plat, maintenant);
  const incomplets = tentative
    ? new Set(groupesIncomplets(plat.groupes, choix.options).map((g) => g.id))
    : new Set<string>();
  const epiceManquant =
    tentative && plat.spice_level === "OPTIONAL" && choix.epice === null;
  const mentionPlat = empechement
    ? null
    : mentionPlatHorsMode(plat.available_order_types, mode);
  const categories = supplementsParCategorie(plat.supplements);
  const supplementsHorsMode = plat.supplements.some(
    (s) => !venduEn(s.available_order_types, mode),
  );
  const description = plat.description ? typo(phrase(plat.description)) : "";

  return (
    <div className={styles.interieur}>
      <div ref={defileRef} className={styles.defile}>
        <div className={styles.haut}>
          {/* Image principale de la fenêtre, visible dès l'ouverture :
              chargée tout de suite. */}
          <PhotoPlat
            etiquetteGauche
            preload
            alt={plat.name}
            className={cn(styles.photo, !photo.recadree && styles.photoApi)}
            etiquette={photo.etiquette}
            fond={photo.fond}
            marge={14}
            sizes="(min-width: 960px) 428px, (min-width: 760px) 368px, 100vw"
            src={photo.src}
            style={{ "--ratio": photo.ratio } as CSSProperties}
            tailleEtiquette={36}
          />
          <div className={styles.tete}>
            {categorie ? <Surtitre>{categorie}</Surtitre> : null}
            <h2
              ref={titreRef}
              className="text-[22px] leading-[1.15] font-extrabold [overflow-wrap:anywhere] min-[760px]:text-[26px]"
              id={TITRE_ID}
              tabIndex={-1}
            >
              {plat.name}
            </h2>
            {description ? (
              <p className="text-[14.5px] text-encre-doux">{description}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <PrixPlat className={styles.prix} plat={plat} />
              {remise > 0 ? (
                <BadgePromo statique>
                  −{nombre(remise)}
                  {INSECABLE}FCFA
                </BadgePromo>
              ) : null}
            </div>
            {plat.spice_level === "ALWAYS" ? (
              <PastilleInfo>
                <Icone className="size-4 text-orange-texte" nom="feu" />
                Servi épicé
              </PastilleInfo>
            ) : null}
            {plat.spice_level === "NEVER" ? (
              <PastilleInfo>Non épicé</PastilleInfo>
            ) : null}
            {mentionPlat ? (
              <p>
                <Tag className="rounded-md whitespace-normal" genre="emporter">
                  {mentionPlat}
                </Tag>
              </p>
            ) : null}
            {empechement ? (
              <p className="rounded-carte bg-rouge-fond px-3.5 py-3 text-sm font-semibold text-rouge">
                {empechement}
              </p>
            ) : null}
          </div>
        </div>

        {plat.groupes.map((g) => {
          const multiple = g.max_select > 1;
          const nombreChoisis = choix.options.filter(
            (o) => o.group_id === g.id,
          ).length;
          const plein = multiple && nombreChoisis >= g.max_select;
          const payant = groupePayant(g);
          const Choix = multiple ? CaseACocher : ChoixRadio;

          return (
            <div key={g.id} id={idGroupe(g)}>
              <GroupeChoix
                colonnes
                erreur={incomplets.has(g.id) ? messageGroupe(g) : null}
                idErreur={`${idGroupe(g)}-erreur`}
                legende={joli(g.name)}
                precision={regleGroupe(g)}
                requis={g.min_select > 0}
              >
                {g.description ? (
                  <p className="col-span-full -mt-1 text-[13px] text-encre-doux">
                    {typo(g.description)}
                  </p>
                ) : null}
                {g.items.map((item) => {
                  const coche = choix.options.some(
                    (o) => o.item_id === item.id,
                  );
                  const { titre, detail } = decouperLibelle(item.label);

                  return (
                    <Choix
                      key={item.id}
                      aria-invalid={incomplets.has(g.id) ? true : undefined}
                      checked={coche}
                      detail={
                        detail || !item.available ? (
                          <>
                            {detail}
                            {!item.available ? (
                              <span className="block">
                                Indisponible pour le moment
                              </span>
                            ) : null}
                          </>
                        ) : undefined
                      }
                      disabled={!item.available || (plein && !coche)}
                      id={`fiche-option-${item.id}`}
                      inclus={item.price_delta <= 0}
                      label={titre}
                      name={`fiche-groupe-${g.id}`}
                      prix={
                        item.price_delta > 0
                          ? `+${fcfa(item.price_delta)}`
                          : payant
                            ? "Inclus"
                            : undefined
                      }
                      value={item.id}
                      onChange={() => surOption(g, item.id)}
                      // Choix unique facultatif : un second clic le retire
                      // (un bouton radio ne se décoche pas de lui-même).
                      onClick={
                        !multiple && coche && g.min_select === 0
                          ? () => surOption(g, item.id)
                          : undefined
                      }
                    />
                  );
                })}
                {plein ? (
                  <p className="col-span-full text-[13px] text-encre-doux">
                    {aideMaximum(g)}
                  </p>
                ) : null}
              </GroupeChoix>
            </div>
          );
        })}

        {plat.spice_level === "OPTIONAL" ? (
          <div id={ID_EPICE}>
            <ChoixEpice
              erreur={
                epiceManquant
                  ? "Choisissez épicé ou non épicé pour continuer."
                  : null
              }
              id="fiche"
              valeur={choix.epice}
              onChange={surEpice}
            />
          </div>
        ) : null}

        {categories.length ? (
          <section
            aria-labelledby="fiche-supplements"
            className={cn(styles.supps, "grid min-w-0 gap-2.5")}
          >
            <h3
              className="flex w-full flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5 text-base font-bold"
              id="fiche-supplements"
            >
              Suppléments
              <small className="text-[12.5px] font-medium text-encre-doux">
                Facultatif · comptés une fois pour cette ligne
              </small>
            </h3>
            {categories.map((c) => {
              const choisis = c.supplements.reduce(
                (n, s) => n + (choix.supplements[s.id] ?? 0),
                0,
              );

              return (
                <Accordeon
                  key={c.cle}
                  classeCorps={styles.corps}
                  ouvert={ouverts.has(c.cle)}
                  sousTitre={
                    <>
                      {c.supplements.length}
                      {INSECABLE}au choix
                      {choisis ? (
                        <span className="ml-2.5 inline-grid h-[22px] min-w-[22px] place-items-center rounded-pilule bg-orange px-1.5 text-xs font-bold text-encre tabular-nums">
                          {choisis}
                          <span className="sr-only">
                            {" "}
                            {choisis > 1 ? "choisis" : "choisi"}
                          </span>
                        </span>
                      ) : null}
                    </>
                  }
                  titre={c.libelle}
                >
                  <ul className="contents">
                    {c.supplements.map((s) => {
                      const quantite = choix.supplements[s.id] ?? 0;
                      const nom = joli(s.name);
                      const mention = mentionSupplementHorsMode(
                        s.available_order_types,
                        mode,
                      );

                      return (
                        <li key={s.id} className={styles.supp}>
                          <PhotoSupplement s={s} />
                          <p className="grid min-w-0 gap-px text-sm leading-[1.3] font-semibold">
                            <span className="[overflow-wrap:anywhere]">
                              {nom}
                            </span>
                            <small className="text-[12.5px] font-medium text-encre-doux tabular-nums">
                              +{fcfa(s.price)}
                            </small>
                            {mention ? (
                              <Tag
                                className="rounded-md whitespace-normal"
                                genre="emporter"
                              >
                                {mention}
                              </Tag>
                            ) : null}
                          </p>
                          <Compteur
                            className={cn(
                              "[&_button]:size-11",
                              quantite > 0 && "border-encre bg-surface",
                            )}
                            max={QUANTITE_SUPPLEMENT_MAX}
                            min={0}
                            nom={nom}
                            valeur={quantite}
                            onChange={(q) => surSupplement(s, q)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </Accordeon>
              );
            })}
          </section>
        ) : null}

        {supplementsHorsMode ? (
          <p className="grid grid-cols-[20px_minmax(0,1fr)] gap-2 text-[13px] leading-[1.45] text-encre-doux">
            <Icone className="mt-px size-[18px] text-encre" nom="sac" />
            <span>{noteSupplementsHorsMode(mode)}</span>
          </p>
        ) : null}
      </div>

      <div className={styles.pied}>
        <Compteur
          className="[&_button]:w-11"
          libelle="Quantité"
          max={QUANTITE_MAX}
          min={1}
          nom={plat.name}
          taille="grand"
          valeur={choix.quantite}
          onChange={surQuantite}
        />
        {/* Libellé à gauche, total à droite. Trop étroit (« Mettre à jour »
            sur téléphone) : le total passe sous le libellé, aligné à gauche ;
            ni l'un ni l'autre ne se coupe. */}
        <Bouton
          entre
          className="min-w-0 flex-1 flex-wrap content-center gap-x-2.5 gap-y-0 px-[clamp(14px,4vw,18px)] text-left whitespace-normal"
          disabled={Boolean(empechement)}
          taille="grand"
          onClick={surValider}
        >
          <span className="whitespace-nowrap">
            {edition ? "Mettre à jour" : "Ajouter"}
          </span>
          <span className="whitespace-nowrap tabular-nums">
            {fcfa(totalFiche(plat, choix))}
          </span>
        </Bouton>
      </div>
    </div>
  );
}

// ── Fiche branchée sur le panier ──────────────────────────────────────────

type Etat =
  | { statut: "chargement" }
  | { statut: "erreur"; message: string; introuvable: boolean }
  | { statut: "pret"; fiche: IFichePlat };

/** Catégories ouvertes d'emblée : la première, et celles où un supplément est déjà pris. */
function categoriesOuvertes(fiche: IFichePlat, choix: IChoixEnCours) {
  return new Set(
    supplementsParCategorie(fiche.plat.supplements)
      .filter(
        (c, i) => i === 0 || c.supplements.some((s) => choix.supplements[s.id]),
      )
      .map((c) => c.cle),
  );
}

/** Mouvement réduit demandé par le visiteur (lu à chaque fois : il peut changer). */
const mouvementReduit = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Fiche plat en fenêtre (plan, section 1.1 et lot L11b), ouverte depuis
 * l'accueil, la carte, une page plat ou « Modifier » dans le panier :
 * `ficheDemandeeAtom` dit quel plat, et quelle ligne modifier. Montée par
 * FenetresCommande et chargée à la demande.
 *
 * « Ajouter » vérifie les choix obligatoires (défilement jusqu'au premier
 * manquant et annonce), puis ajoute la ligne au panier, ou la remplace à sa
 * place pour « Mettre à jour ». Venue du tiroir, la fiche rend la main au
 * tiroir en se fermant.
 */
export default function FichePlat() {
  const [demande, setDemande] = useAtom(ficheDemandeeAtom);
  const ouvrirTiroir = useSetAtom(tiroirPanierOuvertAtom);
  const lignes = useAtomValue(panierAtom);
  const mode = useAtomValue(modeAtom);
  const ajouter = useSetAtom(ajouterAuPanierAtom);
  const remplacer = useSetAtom(remplacerLigneAtom);

  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });
  const [choix, setChoix] = useState<IChoixEnCours | null>(null);
  const [ouverts, setOuverts] = useState<ReadonlySet<string>>(new Set());
  const [tentative, setTentative] = useState(false);
  const [relance, setRelance] = useState(0);
  const [ligneEditee, setLigneEditee] = useState<ILignePanier | null>(null);
  const [demandeVue, setDemandeVue] = useState<IFicheDemandee | null>(null);
  // Chaque ouverture repart d'un contenu neuf (volets des suppléments compris).
  const [ouverture, setOuverture] = useState(0);

  const titreRef = useRef<HTMLHeadingElement>(null);
  const defileRef = useRef<HTMLDivElement>(null);
  const lignesRef = useRef(lignes);

  useEffect(() => {
    lignesRef.current = lignes;
  }, [lignes]);

  /** Choix de départ : nouveau plat, ou ligne du panier à modifier. */
  const preparer = (
    fiche: IFichePlat,
    pour: IFicheDemandee,
    panier: ILignePanier[],
  ) => {
    const ligne = ligneAModifier(panier, pour);
    const depart = choixInitiaux(fiche.plat, ligne);

    setLigneEditee(ligne);
    setChoix(depart);
    setOuverts(categoriesOuvertes(fiche, depart));
    setTentative(false);
    setEtat({ statut: "pret", fiche });
  };

  // Nouvelle demande : la fiche repart de zéro DÈS ce rendu (jamais le plat
  // précédent affiché un instant). Plat déjà lu : prêt tout de suite.
  if (demande && demande !== demandeVue) {
    setDemandeVue(demande);
    setOuverture((n) => n + 1);
    const gardee = ficheGardee(demande.platId);

    if (gardee) preparer(gardee, demande, lignes);
    else setEtat({ statut: "chargement" });
  }

  // Plat pas encore lu : lecture (et relecture à « Réessayer »).
  useEffect(() => {
    if (!demande || ficheGardee(demande.platId)) return;
    let actif = true;

    lireFiche(demande.platId)
      .then((res) => {
        if (!actif) return;
        if (res.ok) preparer(res.data, demande, lignesRef.current);
        else
          setEtat({
            statut: "erreur",
            message: res.message,
            introuvable: res.statut === 404,
          });
      })
      .catch((e) => {
        if (actif)
          setEtat({
            statut: "erreur",
            message: messageErreurAction(e),
            introuvable: false,
          });
      });

    return () => {
      actif = false;
    };
  }, [demande, relance]);

  // Plat prêt : le nom reçoit le focus (lu par les lecteurs d'écran), la
  // fiche repart du haut.
  const pret = etat.statut === "pret";

  useEffect(() => {
    if (!demande || !pret) return;
    defileRef.current?.scrollTo({ top: 0 });
    titreRef.current?.focus({ preventScroll: true });
  }, [demande, pret]);

  // Mesure d'audience (GA4) : fiche d'un plat vue, hors « Modifier ».
  const platVu = etat.statut === "pret" ? etat.fiche : null;

  useEffect(() => {
    if (!demande || !platVu || demande.indexLigne !== undefined) return;
    const { plat, categorie } = platVu;

    evenementCommerce("view_item", [
      {
        item_id: plat.id,
        item_name: plat.name,
        price: plat.prix,
        quantity: 1,
        ...(categorie ? { item_category: categorie } : {}),
      },
    ]);
  }, [demande, platVu]);

  const fermer = () => {
    const depuis = demande?.depuis;

    setDemande(null);
    if (depuis === "panier") ouvrirTiroir(true);
  };

  /** Message affiché une fois la fiche fermée (sinon il partirait avec elle). */
  const messageApresFermeture = (texte: string) => {
    const fenetre = titreRef.current?.closest("dialog");

    if (fenetre?.open)
      fenetre.addEventListener("close", () => afficherMessage(texte), {
        once: true,
      });
    else afficherMessage(texte);
  };

  const valider = () => {
    if (etat.statut !== "pret" || !choix || !demande) return;
    const { plat } = etat.fiche;

    if (empechementPlat(plat)) return;
    const manquants = groupesIncomplets(plat.groupes, choix.options);
    const epiceManquant =
      plat.spice_level === "OPTIONAL" && choix.epice === null;

    if (manquants.length || epiceManquant) {
      setTentative(true);
      const bloc = document.getElementById(
        manquants.length ? idGroupe(manquants[0]) : ID_EPICE,
      );
      const defile = defileRef.current;

      // Défilement de la fiche seulement (jamais de la page dessous), le
      // groupe au milieu.
      if (bloc && defile) {
        const b = bloc.getBoundingClientRect();
        const d = defile.getBoundingClientRect();

        defile.scrollTo({
          top: defile.scrollTop + b.top - d.top - (d.height - b.height) / 2,
          behavior: mouvementReduit() ? "auto" : "smooth",
        });
      }
      bloc
        ?.querySelector<HTMLInputElement>("input:not(:disabled)")
        ?.focus({ preventScroll: true });
      annoncer("Il manque un choix obligatoire.");

      return;
    }

    const ligne = ligneDeFiche(plat, choix);

    if (ligneEditee && demande.indexLigne !== undefined) {
      remplacer({
        index: demande.indexLigne,
        ligne,
        cleAvant: ligneEditee.cle,
      });
      messageApresFermeture(`Ligne mise à jour${INSECABLE}: ${plat.name}`);
    } else {
      ajouter(ligne);
      evenementCommerce("add_to_cart", [
        articleDeLigne(ligne, etat.fiche.categorie),
      ]);
      messageApresFermeture(
        `Ajouté au panier${INSECABLE}: ${ligne.quantite}${INSECABLE}×${INSECABLE}${plat.name}`,
      );
    }
    fermer();
  };

  const surSupplement = (s: ISupplementPlat, quantite: number) => {
    const avant = choix?.supplements[s.id] ?? 0;

    setChoix((c) =>
      c ? { ...c, supplements: { ...c.supplements, [s.id]: quantite } } : c,
    );
    if (avant === 0 && quantite > 0 && !venduEn(s.available_order_types, mode))
      afficherMessage(messageSupplementHorsMode(joli(s.name), mode));
  };

  return (
    <Feuille
      forme="fiche"
      libelleFermer="Fermer la fiche"
      ouverte={Boolean(demande)}
      titreId={TITRE_ID}
      onFermer={fermer}
    >
      {etat.statut === "pret" && choix ? (
        <ContenuFiche
          key={ouverture}
          choix={choix}
          defileRef={defileRef}
          edition={Boolean(ligneEditee)}
          fiche={etat.fiche}
          mode={mode}
          ouverts={ouverts}
          surEpice={(epice) => setChoix((c) => (c ? { ...c, epice } : c))}
          surOption={(g, itemId) =>
            setChoix((c) =>
              c ? { ...c, options: basculerOption(c.options, g, itemId) } : c,
            )
          }
          surQuantite={(quantite) =>
            setChoix((c) => (c ? { ...c, quantite } : c))
          }
          surSupplement={surSupplement}
          surValider={valider}
          tentative={tentative}
          titreRef={titreRef}
        />
      ) : etat.statut === "erreur" ? (
        <div className="grid justify-items-start gap-3 p-6 pr-16 min-[760px]:p-8 min-[760px]:pr-16">
          <h2
            className="text-lg leading-[1.3] font-bold"
            id={TITRE_ID}
            tabIndex={-1}
          >
            {etat.introuvable
              ? "Ce plat n'est plus proposé"
              : "La fiche du plat ne s'affiche pas"}
          </h2>
          <p className="text-sm text-encre-doux">
            {etat.introuvable
              ? "Il a été retiré de la carte. Choisissez un autre plat."
              : etat.message}
          </p>
          {etat.introuvable ? (
            <LienBouton href="/fr/carte" onClick={() => setDemande(null)}>
              Voir la carte
            </LienBouton>
          ) : (
            <Bouton
              onClick={() => {
                setEtat({ statut: "chargement" });
                setRelance((n) => n + 1);
              }}
            >
              Réessayer
            </Bouton>
          )}
        </div>
      ) : (
        <div
          className={cn(
            styles.chargement,
            "grid min-h-48 place-items-center gap-3 p-8",
          )}
        >
          <h2 className="sr-only" id={TITRE_ID}>
            Fiche du plat
          </h2>
          <p
            className="flex items-center gap-3 text-sm font-semibold text-encre-doux"
            role="status"
          >
            <span
              aria-hidden="true"
              className="size-6 rounded-full border-[3px] border-trait border-t-orange motion-safe:animate-spin"
            />
            Chargement du plat…
          </p>
        </div>
      )}
    </Feuille>
  );
}
