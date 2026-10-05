import type { IRestaurantSite } from "@/features/restaurants/restaurants.site";

import Image from "next/image";

import { Icone } from "../Icone";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import { CarteRestaurant } from "./CarteRestaurant";
import styles from "./Restaurants.module.css";

import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

/** « Ouverts 7 j/7 dès 10 h, jusqu'à minuit environ, plus tard le week-end » (retouche 8). */
export const PHRASE_HORAIRES = `Ouverts 7${INSECABLE}j/7 dès 10${INSECABLE}h, jusqu'à minuit environ, plus tard le week-end.`;

/** Liste des cartes des restaurants, sans en-tête. */
export function GrilleRestaurants({
  restaurants,
  libelle = "Nos restaurants",
}: {
  restaurants: readonly IRestaurantSite[];
  libelle?: string;
}) {
  return (
    <ul aria-label={libelle} className={styles.grille}>
      {restaurants.map((r) => (
        <CarteRestaurant key={r.id} restaurant={r} />
      ))}
    </ul>
  );
}

/**
 * Section « Nos N restaurants » (accueil) : en-tête sur la photo du seau
 * sous un voile, titre jaune, horaires généraux et numéro unique, puis les
 * cartes. Le nombre vient de l'API, jamais écrit en dur ; section masquée
 * s'il n'y a aucun restaurant.
 */
export function SectionRestaurants({
  restaurants,
  id = "restaurants",
  niveauTitre = "h2",
  titre,
  className,
  preload = false,
}: {
  restaurants: readonly IRestaurantSite[];
  id?: string;
  niveauTitre?: "h1" | "h2";
  /** Titre en police d'affiche, sans accent (par défaut « Nos N restaurants »). */
  titre?: string;
  className?: string;
  /**
   * Photo d'en-tête préchargée : seulement quand la section ouvre la page
   * (`/fr/restaurants`), où cette photo est l'image principale du premier écran.
   */
  preload?: boolean;
}) {
  if (restaurants.length === 0) return null;
  const titreId = `${id}-titre`;
  const titreSection =
    titre ??
    (restaurants.length === 1
      ? "Notre restaurant"
      : `Nos ${restaurants.length} restaurants`);

  return (
    <Section className={className} id={id} titreId={titreId}>
      <div className={styles.tete}>
        <Image
          fill
          alt=""
          className={styles.teteFond}
          preload={preload}
          sizes="(min-width: 1264px) 1136px, (min-width: 720px) calc(100vw - 64px), calc(100vw - 32px)"
          src="/assets/site/fond-seau-gris.webp"
        />
        <div className={styles.teteTexte}>
          <TitreAffiche
            className="text-jaune"
            id={titreId}
            niveau={niveauTitre}
          >
            {titreSection}
          </TitreAffiche>
          <p>{PHRASE_HORAIRES}</p>
        </div>
        <p className={styles.tel}>
          <Icone nom="telephone" />
          <span>
            <small>Un seul numéro pour tous nos restaurants</small>
            <a href={telLien()}>{TELEPHONE}</a>
          </span>
        </p>
      </div>
      <GrilleRestaurants restaurants={restaurants} />
    </Section>
  );
}
