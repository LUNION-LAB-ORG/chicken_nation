import type { IRestaurantSite } from "@/features/restaurants/restaurants.site";
import type { CSSProperties } from "react";

import Link from "next/link";

import Image from "../Image";
import { Tampon } from "../Autocollants";
import { LienBouton } from "../Bouton";
import { Icone } from "../Icone";
import { LienFleche } from "../Lien";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import { CarteRestaurant } from "./CarteRestaurant";
import { EtatOuverture } from "./EtatOuverture";
import { LienRetirerIci } from "./LienRetirerIci";
import styles from "./PageRestaurant.module.css";
import { introRestaurant, resumeOuverture } from "./PageRestaurant.textes";
import { PageRestaurantHoraires } from "./PageRestaurantHoraires";
import stylesListe from "./Restaurants.module.css";

import { horairesParJour } from "@/features/restaurants/horaires";
import { lienItineraire } from "@/features/restaurants/restaurant.utils";
import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";
import { cn } from "@/lib/utils";
import { formatImageUrl } from "@/utils/formatImageUrl";

/** Au plus 4 cartes par rangée sur ordinateur pour les autres restaurants. */
const COLONNES_AUTRES = 4;

/** Seul numéro affiché : celui de la commande par téléphone, jamais celui du restaurant. */
function NumeroUnique({ className }: { className?: string }) {
  return (
    <p className={cn(styles.tel, className)}>
      <Icone nom="telephone" />
      <span>
        <small>Un seul numéro pour tous nos restaurants</small>
        <a href={telLien()}>{TELEPHONE}</a>
      </span>
    </p>
  );
}

/**
 * Page d'un restaurant (`/fr/restaurants/<slug>`) : fil d'Ariane, nom,
 * adresse, état d'ouverture (calculé dans le navigateur), « Retirer ici »,
 * itinéraire, photo, horaires de la semaine en texte, numéro unique et les
 * autres restaurants. Composant serveur ; seuls l'état d'ouverture, le jour
 * en cours et « Retirer ici » (qui lit le panier) sont des îlots.
 */
export function PageRestaurant({
  restaurant: r,
  autres,
}: {
  restaurant: IRestaurantSite;
  /** Les autres restaurants du site, dans l'ordre d'affichage. */
  autres: readonly IRestaurantSite[];
}) {
  const photo = r.image ? formatImageUrl(r.image) : null;
  const itineraire = lienItineraire(r);
  const jours = horairesParJour(r.schedule);
  const aDesHoraires = jours.some((j) => j.texte !== "Fermé");
  const ouverture = resumeOuverture(r.schedule);

  return (
    <>
      <Section
        motif
        className={styles.tete}
        espacement="aucun"
        fond="surface"
        titreId="titre-restaurant"
      >
        <nav aria-label="Fil d'Ariane" className={styles.ariane}>
          <ol>
            <li>
              <Link href="/fr" prefetch={false}>
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/fr/restaurants" prefetch={false}>
                Nos restaurants
              </Link>
            </li>
            <li aria-current="page">{r.nomAffiche}</li>
          </ol>
        </nav>

        <div className={styles.teteGrille}>
          <div className={styles.teteTexte}>
            <h1 className={styles.titre} id="titre-restaurant">
              {/* Police d'affiche pour la marque seulement (texte fixe) :
                  le nom vient de la base et peut porter des accents. */}
              <span className={styles.marque}>Chicken Nation</span>{" "}
              <span className={styles.nom}>{r.nomAffiche}</span>
            </h1>
            <p className={styles.lieu}>
              <Icone className="mt-0.5 size-5" nom="repere" />
              <span>
                {r.adresseCourte ? (
                  <>
                    {r.adresseCourte}
                    <br />
                  </>
                ) : null}
                <span className={styles.commune}>
                  {r.commune ? `${r.commune}, Abidjan` : "Abidjan"}
                </span>
              </span>
            </p>
            {aDesHoraires ? (
              <EtatOuverture className={styles.etat} schedule={r.schedule} />
            ) : null}
            <p className={styles.intro}>{introRestaurant(r)}</p>
            <div className={styles.actions}>
              <LienRetirerIci
                className={styles.retirer}
                nom={r.nomAffiche}
                slug={r.slug}
              />
              {itineraire ? (
                <LienBouton
                  nouvelOnglet
                  href={itineraire}
                  icone="repere"
                  variante="secondaire"
                >
                  Itinéraire
                </LienBouton>
              ) : null}
            </div>
          </div>

          <div className={styles.cadre}>
            {photo ? (
              <div className={styles.photo}>
                {/* Image principale de la page : seule préchargée. */}
                <Image
                  fill
                  preload
                  alt={`Restaurant Chicken Nation ${r.nomAffiche}`}
                  sizes="(min-width: 1264px) 582px, (min-width: 900px) calc(50vw - 50px), (min-width: 720px) calc(100vw - 64px), calc(100vw - 32px)"
                  src={photo}
                />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className={cn(styles.photo, styles.sansPhoto)}
              >
                <Image
                  alt=""
                  height={300}
                  sizes="96px"
                  src="/assets/site/logo-orange.png"
                  width={203}
                />
              </div>
            )}
            <Tampon
              className={styles.tampon}
              fort={`100${INSECABLE}%`}
              texte="Halal"
            />
          </div>
        </div>
      </Section>

      <Section
        as="div"
        className={styles.infos}
        espacement="aucun"
        fond="papier"
      >
        <div className={styles.infosGrille}>
          {aDesHoraires ? (
            <section aria-labelledby="titre-horaires" className={styles.bloc}>
              <TitreAffiche id="titre-horaires" taille="panneau">
                Horaires
              </TitreAffiche>
              <p className={styles.sousTitre}>
                {ouverture ? <>{ouverture}. </> : null}Heure d&apos;Abidjan.
              </p>
              <PageRestaurantHoraires jours={jours} />
            </section>
          ) : null}

          <section aria-labelledby="titre-commander" className={styles.bloc}>
            <TitreAffiche id="titre-commander" taille="panneau">
              Commander
            </TitreAffiche>
            <p className={styles.texteBloc}>
              Composez votre commande sur le site et choisissez le retrait à{" "}
              {r.nomAffiche}, ou faites-vous livrer dans le Grand Abidjan.
            </p>
            <LienBouton
              className={styles.lienCarte}
              href="/fr/carte"
              iconeFin="fleche"
              variante="sombre"
            >
              Voir la carte
            </LienBouton>
            <NumeroUnique />
          </section>
        </div>
      </Section>

      {autres.length > 0 ? (
        <Section motif fond="surface" titreId="titre-autres">
          <div className={styles.autresTete}>
            <TitreAffiche id="titre-autres">
              Nos autres restaurants
            </TitreAffiche>
            <LienFleche href="/fr/restaurants">Tous nos restaurants</LienFleche>
          </div>
          <ul
            aria-labelledby="titre-autres"
            className={cn(stylesListe.grille, styles.autres)}
            style={
              {
                "--colonnes": Math.min(autres.length, COLONNES_AUTRES),
              } as CSSProperties
            }
          >
            {autres.map((autre) => (
              <CarteRestaurant key={autre.id} restaurant={autre} />
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
