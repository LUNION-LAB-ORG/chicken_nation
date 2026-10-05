"use client";

import type {
  IAdresseLivraison,
  IConditionsCommande,
  ILivraisonDisponible,
  ModeCommande,
} from "../../types/commande.types";
import type { ReactNode } from "react";

import Image from "next/image";
import { useId } from "react";

import AdresseLivraison from "../AdresseLivraison";

import { classePanneau, ErreurEtape, TitreEtape } from "./EtapePanier";
import { fenetreCreneau } from "./textes-caisse";

import { ChampSelection } from "@/components/site/Champs";
import { ChoixRadio, GroupeChoix } from "@/components/site/Choix";
import { fcfa, INSECABLE, kmTexte } from "@/lib/typo";
import { cn } from "@/lib/utils";

/** Restaurant de retrait tel que l'étape l'affiche (évalué à la minute par la caisse). */
export interface IRetraitVue {
  id: string;
  /** « Angré », « Marcory Zone 4 ». */
  nom: string;
  adresse: string | null;
  /** Photo de la devanture (adresse complète), ou null. */
  photo: string | null;
  ouvert: boolean;
  /** « Ouvert, ferme à minuit », « Fermé, ouvre à 10 h ». */
  etat: string;
  /** Plats et cadeaux du panier que ce restaurant ne propose pas. */
  absents: string[];
  creneaux: Date[];
}

const MODES = [
  {
    valeur: "DELIVERY",
    titre: "Livraison",
    detail: `20${INSECABLE}à${INSECABLE}35${INSECABLE}min, frais selon la distance`,
    image: { src: "/assets/site/icone-trajet.png", l: 200, h: 300 },
  },
  {
    valeur: "PICKUP",
    titre: "Retrait",
    detail: "Au comptoir, sans frais de livraison",
    image: { src: "/assets/site/icone-cloche.png", l: 300, h: 295 },
  },
] as const;

/** Bloc « Livraison ou retrait » en cartes illustrées (maquette, CSS 1341-1356). */
function ChoixMode({
  mode,
  livraisonOuverte,
  onMode,
}: {
  mode: ModeCommande;
  livraisonOuverte: boolean;
  onMode: (mode: ModeCommande) => void;
}) {
  const id = useId();

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">Mode de commande</legend>
      <div className="grid grid-cols-2 gap-2.5">
        {MODES.map((m) => {
          const desactive = m.valeur === "DELIVERY" && !livraisonOuverte;

          return (
            <div key={m.valeur} className="relative">
              <input
                checked={mode === m.valeur}
                className="peer absolute size-px opacity-0"
                disabled={desactive}
                id={`${id}-${m.valeur}`}
                name={`${id}-mode`}
                type="radio"
                value={m.valeur}
                onChange={() => onMode(m.valeur)}
              />
              <label
                className={cn(
                  "grid h-full min-h-[84px] cursor-pointer grid-cols-1 content-start items-center gap-x-3 gap-y-1 rounded-carte border-[1.5px] border-trait-fort bg-white px-3.5 py-3",
                  "min-[420px]:grid-cols-[48px_minmax(0,1fr)]",
                  "hover:border-encre peer-checked:border-encre peer-checked:bg-surface peer-checked:shadow-[inset_0_0_0_1px_var(--color-encre)]",
                  "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--focus) peer-focus-visible:outline-solid",
                  "peer-disabled:cursor-not-allowed peer-disabled:bg-surface peer-disabled:opacity-50 peer-disabled:hover:border-trait-fort",
                )}
                htmlFor={`${id}-${m.valeur}`}
              >
                <Image
                  alt=""
                  className="size-10 object-contain min-[420px]:row-span-2 min-[420px]:size-12"
                  height={m.image.h}
                  sizes="48px"
                  src={m.image.src}
                  width={m.image.l}
                />
                <b className="text-[15px] leading-tight">{m.titre}</b>
                <small className="text-[12.5px] leading-[1.3] text-encre-doux">
                  {desactive ? "Momentanément indisponible" : m.detail}
                </small>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Grille des frais de livraison (retouche 1), seulement si le serveur l'applique vraiment. */
function GrilleFrais({
  grille,
}: {
  grille: NonNullable<IConditionsCommande["grille"]>;
}) {
  let precedent = 0;

  return (
    <details className="group">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-[13px] font-semibold text-orange-texte underline decoration-[1.5px] underline-offset-[3px] [&::-webkit-details-marker]:hidden">
        Voir la grille des frais de livraison
      </summary>
      <ul className="mt-1 grid list-none grid-cols-2 gap-1.5 min-[480px]:grid-cols-3">
        {grille.map((p) => {
          const texte =
            p.distanceMaxKm === null
              ? `Au-delà de ${kmTexte(precedent)}`
              : `Jusqu'à ${kmTexte(p.distanceMaxKm)}`;

          if (p.distanceMaxKm !== null) precedent = p.distanceMaxKm;

          return (
            <li
              key={texte}
              className="grid rounded-lg bg-surface px-2 py-1.5 text-xs leading-[1.3] text-encre-doux"
            >
              <span>{texte}</span>
              <strong className="text-[13px] text-encre tabular-nums">
                {fcfa(p.montant)}
              </strong>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-encre-doux">
        Distance par la route depuis le restaurant qui prépare. Le montant exact
        s&apos;affiche une fois l&apos;adresse choisie.
      </p>
    </details>
  );
}

/**
 * Étape 3, livraison ou retrait (maquette, JS 1016-1110). Règles du site
 * (caisse.utils, obstacleLivraison) : livraison coupée au back office,
 * articles vendus dans un seul mode, restaurant fermé ou qui ne propose pas
 * un plat, créneaux de retrait du serveur (creneauxRetrait), frais de
 * livraison lus sur l'API pour l'adresse choisie.
 */
export function EtapeLivraisonRetrait({
  mode,
  onMode,
  livraison,
  alerte,
  toutesFermees,
  adresse,
  onAdresse,
  connecte,
  detailAdresse,
  grille,
  restaurants,
  erreurRestaurants,
  restaurantId,
  onRestaurant,
  heure,
  onHeure,
  erreur,
  pied,
}: {
  mode: ModeCommande;
  onMode: (mode: ModeCommande) => void;
  livraison: ILivraisonDisponible;
  /** Alerte de mode (AlerteMode), ou null. */
  alerte: ReactNode;
  /** Aucun restaurant ouvert en ce moment. */
  toutesFermees: boolean;
  adresse: IAdresseLivraison | null;
  onAdresse: (a: IAdresseLivraison | null) => void;
  connecte: boolean;
  /** Restaurant qui prépare et frais, sous l'adresse choisie. */
  detailAdresse: ReactNode;
  grille: IConditionsCommande["grille"];
  restaurants: IRetraitVue[];
  /** La liste des restaurants n'a pas pu être lue. */
  erreurRestaurants: boolean;
  restaurantId: string | null;
  onRestaurant: (id: string) => void;
  /** Début du créneau choisi (ISO), null = dès que possible. */
  heure: string | null;
  onHeure: (heure: string | null) => void;
  erreur: string | null;
  pied: ReactNode;
}) {
  const id = useId();
  const choisi = restaurants.find((r) => r.id === restaurantId) ?? null;

  return (
    <>
      <section aria-labelledby="t-etape" className={classePanneau}>
        <TitreEtape>Livraison ou retrait</TitreEtape>
        <ChoixMode
          livraisonOuverte={livraison.disponible}
          mode={mode}
          onMode={onMode}
        />
        {!livraison.disponible && livraison.message ? (
          <p
            className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm leading-[1.45]"
            role="status"
          >
            {livraison.message}
          </p>
        ) : null}
        {toutesFermees ? (
          <p className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm leading-[1.45]">
            Tous nos restaurants sont fermés en ce moment, heure d&apos;Abidjan.
            Vous pourrez commander dès leur ouverture.
          </p>
        ) : null}
        {alerte}
      </section>

      {mode === "DELIVERY" ? (
        <section aria-labelledby={`${id}-adresse`} className={classePanneau}>
          <h3 className="text-lg leading-tight font-bold" id={`${id}-adresse`}>
            Adresse de livraison
          </h3>
          <AdresseLivraison
            adresse={adresse}
            connecte={connecte}
            detail={detailAdresse}
            onChange={onAdresse}
          />
          {!adresse ? (
            <p className="text-[13px] text-encre-doux">
              Frais de livraison calculés selon votre adresse.
            </p>
          ) : null}
          {grille ? <GrilleFrais grille={grille} /> : null}
        </section>
      ) : (
        <section aria-labelledby={`${id}-resto`} className={classePanneau}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5">
            <h3 className="text-lg leading-tight font-bold" id={`${id}-resto`}>
              Restaurant de retrait
            </h3>
            <small className="text-[12.5px] font-medium text-encre-doux">
              Horaires du jour, heure d&apos;Abidjan
            </small>
          </div>
          {erreurRestaurants ? (
            <p className="text-sm font-semibold text-rouge" role="alert">
              La liste des restaurants n&apos;a pas pu être chargée. Rechargez
              la page, ou appelez-nous.
            </p>
          ) : null}
          <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0">
            <legend className="sr-only">Restaurant de retrait</legend>
            {restaurants.map((r) => {
              const indisponible = !r.ouvert || r.absents.length > 0;

              return (
                <div key={r.id} className="relative">
                  <input
                    checked={restaurantId === r.id}
                    className="peer absolute size-px opacity-0"
                    disabled={indisponible && restaurantId !== r.id}
                    id={`${id}-r-${r.id}`}
                    name={`${id}-restaurant`}
                    type="radio"
                    value={r.id}
                    onChange={() => onRestaurant(r.id)}
                  />
                  <label
                    className={cn(
                      "grid min-h-[72px] cursor-pointer grid-cols-[20px_56px_minmax(0,1fr)] items-center gap-2.5 rounded-carte border-[1.5px] border-trait-fort bg-white px-3 py-2 text-sm leading-[1.3] min-[360px]:px-3.5",
                      "before:size-[18px] before:rounded-full before:border-2 before:border-trait-fort before:bg-white before:content-['']",
                      "hover:border-encre peer-checked:border-encre peer-checked:bg-surface peer-checked:before:border-encre peer-checked:before:bg-encre peer-checked:before:shadow-[inset_0_0_0_3px_#fff]",
                      "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--focus) peer-focus-visible:outline-solid",
                      "peer-disabled:cursor-not-allowed peer-disabled:bg-surface peer-disabled:opacity-55 peer-disabled:hover:border-trait-fort",
                      indisponible && "peer-checked:border-rouge",
                    )}
                    htmlFor={`${id}-r-${r.id}`}
                  >
                    <span className="relative block h-11 w-14 overflow-hidden rounded-lg bg-creme">
                      <Image
                        fill
                        alt=""
                        className={
                          r.photo ? "object-cover" : "object-contain p-1.5"
                        }
                        sizes="56px"
                        src={r.photo ?? "/assets/site/logo-orange.png"}
                      />
                    </span>
                    <span className="grid min-w-0 gap-0.5">
                      <b className="font-semibold">{r.nom}</b>
                      {r.adresse ? (
                        <small className="text-[12.5px] text-encre-doux [overflow-wrap:anywhere]">
                          {r.adresse}
                        </small>
                      ) : null}
                      <span
                        className={cn(
                          "inline-flex items-center gap-[7px] text-[12.5px] font-semibold text-encre-doux",
                          "before:size-2 before:shrink-0 before:rounded-full before:bg-current before:content-['']",
                          r.ouvert && "text-ok",
                        )}
                      >
                        {r.etat}
                      </span>
                      {r.absents.length ? (
                        <small className="text-[12.5px] font-semibold text-rouge">
                          Ne propose pas{INSECABLE}: {r.absents.join(", ")}
                        </small>
                      ) : null}
                    </span>
                  </label>
                </div>
              );
            })}
          </fieldset>
          {choisi && choisi.ouvert && !choisi.absents.length ? (
            <GroupeChoix legende="Heure de retrait">
              <ChoixRadio
                checked={heure === null}
                detail="Préparée dès le paiement accepté"
                id={`${id}-asap`}
                label="Dès que possible"
                name={`${id}-heure`}
                value="asap"
                onChange={() => onHeure(null)}
              />
              <ChoixRadio
                checked={heure !== null}
                detail={
                  choisi.creneaux.length
                    ? "Par tranche de 15 min, aujourd'hui"
                    : "Plus de créneau aujourd'hui"
                }
                disabled={!choisi.creneaux.length}
                id={`${id}-creneau`}
                label="Choisir un créneau"
                name={`${id}-heure`}
                value="creneau"
                onChange={() =>
                  onHeure(choisi.creneaux[0]?.toISOString() ?? null)
                }
              />
              {heure !== null && choisi.creneaux.length ? (
                <ChampSelection
                  classeBloc="mt-1"
                  id={`${id}-choix-creneau`}
                  label="Créneau"
                  value={heure}
                  onChange={(e) => onHeure(e.target.value)}
                >
                  {!choisi.creneaux.some((d) => d.toISOString() === heure) ? (
                    <option disabled value={heure}>
                      Créneau passé, choisissez-en un autre
                    </option>
                  ) : null}
                  {choisi.creneaux.map((d) => (
                    <option key={d.toISOString()} value={d.toISOString()}>
                      {fenetreCreneau(d)}
                    </option>
                  ))}
                </ChampSelection>
              ) : null}
            </GroupeChoix>
          ) : null}
        </section>
      )}
      <ErreurEtape message={erreur} />
      {pied}
    </>
  );
}
