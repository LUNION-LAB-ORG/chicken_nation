import type { IRestaurantSite } from "@/features/restaurants/restaurants.site";

import Link from "next/link";

import Image from "../Image";

import { BulleHoraires } from "./BulleHoraires";
import { EtatOuverture } from "./EtatOuverture";
import { LienRetirerIci } from "./LienRetirerIci";
import styles from "./Restaurants.module.css";

import { horairesParJour } from "@/features/restaurants/horaires";
import { cheminRestaurant } from "@/features/restaurants/restaurants.site";
import { cn } from "@/lib/utils";
import { formatImageUrl } from "@/utils/formatImageUrl";

/**
 * Carte d'un restaurant (retouche 8) : photo de la base, logo en pastille,
 * nom (lien vers la page du restaurant), état d'ouverture, adresse, lien
 * « Horaires » et « Retirer ici ». Aucun numéro de restaurant : le seul
 * numéro est le 27 21 71 21 30, dans l'en-tête de la section.
 */
export function CarteRestaurant({
  restaurant: r,
  niveauTitre = "h3",
  lienPage = true,
}: {
  restaurant: IRestaurantSite;
  niveauTitre?: "h2" | "h3";
  /** Nom en lien vers `/fr/restaurants/<slug>` (faux sur la page du restaurant lui-même). */
  lienPage?: boolean;
}) {
  const Titre = niveauTitre;
  const photo = r.image ? formatImageUrl(r.image) : null;
  const jours = horairesParJour(r.schedule);
  const aDesHoraires = jours.some((j) => j.texte !== "Fermé");

  return (
    <li className={styles.resto}>
      {photo ? (
        <div className={styles.photo}>
          <Image
            fill
            alt={`Restaurant Chicken Nation ${r.nomAffiche}`}
            sizes="(min-width: 1000px) 200px, 104px"
            src={photo}
          />
        </div>
      ) : (
        <div aria-hidden="true" className={cn(styles.photo, styles.sansPhoto)}>
          <Image
            alt=""
            height={300}
            sizes="40px"
            src="/assets/site/logo-orange.png"
            width={203}
          />
        </div>
      )}
      <div className={styles.txt}>
        <Titre className={styles.nom}>
          <span aria-hidden="true" className={styles.logo}>
            <Image
              alt=""
              height={300}
              sizes="19px"
              src="/assets/site/logo-orange.png"
              width={203}
            />
          </span>
          {lienPage ? (
            <Link href={cheminRestaurant(r)} prefetch={false}>
              {r.nomAffiche}
            </Link>
          ) : (
            <span>{r.nomAffiche}</span>
          )}
        </Titre>
        <EtatOuverture schedule={r.schedule} />
      </div>
      {r.adresseCourte ? <p className={styles.adr}>{r.adresseCourte}</p> : null}
      <div className={styles.actions}>
        {aDesHoraires ? (
          <BulleHoraires
            id={`horaires-${r.slug}`}
            jours={jours}
            nom={r.nomAffiche}
          />
        ) : null}
        <LienRetirerIci nom={r.nomAffiche} slug={r.slug} />
      </div>
    </li>
  );
}
