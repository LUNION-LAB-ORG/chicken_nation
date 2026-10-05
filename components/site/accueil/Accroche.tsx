import type { IPlatCarte } from "@/features/menus/types/carte.types";

import Image from "../Image";
import { Eclat, EtiquettePromo, Ruban, Tampon } from "../Autocollants";
import { LienBouton, styleBouton } from "../Bouton";
import { Icone } from "../Icone";
import { BoutonChoisirPlat } from "../plats/BoutonChoisirPlat";
import { PrixPlat } from "../plats/CartePlat";
import { Section } from "../Section";

import styles from "./Accroche.module.css";

import { cheminPlat } from "@/features/menus/plats.slug";
import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";
import { cn } from "@/lib/utils";

const CENT_POUR_CENT = `100${INSECABLE}%`;

/** « dans l'un de nos 5 restaurants » ; le nombre vient de l'API, jamais écrit en dur. */
export function phraseRestaurants(nombre: number) {
  if (nombre > 1) return `dans l'un de nos ${nombre}${INSECABLE}restaurants`;
  if (nombre === 1) return "dans notre restaurant";

  return "dans nos restaurants";
}

/**
 * Étiquette « Promotion du moment » posée sur la photo : le plat en promotion
 * qui a la plus forte remise en francs (platEnVedette). « Ajouter » ouvre la
 * fiche du plat (lien vers sa page tant que la fiche n'est pas branchée).
 */
function EtiquetteVedette({ plat }: { plat: IPlatCarte }) {
  return (
    <EtiquettePromo
      action={
        <BoutonChoisirPlat
          aria-label={`Ajouter ${plat.nom}, ${plat.categorie.court.toLowerCase()}`}
          className={styleBouton({ variante: "principal", taille: "petit" })}
          href={cheminPlat(plat)}
          platId={plat.id}
        >
          <Icone className="size-[18px]" nom="plus" />
          Ajouter
        </BoutonChoisirPlat>
      }
      className={styles.etiquette}
      nom={plat.nom}
      prix={<PrixPlat plat={plat} />}
      surtitre="Promotion du moment"
    />
  );
}

/**
 * Accroche de l'accueil (maquette, HTML 80-106, CSS 261-368) : ruban, H1 en
 * police d'affiche, phrase, appel vers la carte et numéro unique ; à droite,
 * la tuile ardoise avec le seau (image principale, préchargée), les tampons
 * « 100 % Halal » et « 100 % Local » et la promotion du moment. Composant
 * serveur : tout est visible sans JavaScript.
 */
export function Accroche({
  nombreRestaurants,
  vedette,
}: {
  nombreRestaurants: number;
  /** Plat de la promotion du moment ; `null` masque l'étiquette. */
  vedette: IPlatCarte | null;
}) {
  return (
    <Section
      motif
      className={styles.accroche}
      classeConteneur={styles.grille}
      espacement="aucun"
      fond="orange"
      titreId="titre-accueil"
    >
      <div className="min-w-0">
        <Ruban>Délicieux jusqu&apos;à l&apos;os</Ruban>
        <h1 className={cn("font-affiche", styles.titre)} id="titre-accueil">
          <span className={styles.ligne1}>Commandez</span>{" "}
          <span className={styles.ligne2}>votre poulet</span>
        </h1>
        <p className={styles.sous}>
          Livré chez vous dans le Grand Abidjan, ou prêt à retirer{" "}
          {phraseRestaurants(nombreRestaurants)}. Poulet {CENT_POUR_CENT} local,{" "}
          {CENT_POUR_CENT} halal.
        </p>
        <div className={styles.actions}>
          <LienBouton
            href="/fr/carte"
            iconeFin="fleche"
            taille="grand"
            variante="sombre"
          >
            Voir la carte et commander
          </LienBouton>
          <a className={styles.tel} href={telLien()}>
            <span>Ou par téléphone</span>
            <strong>{TELEPHONE}</strong>
          </a>
        </div>
      </div>
      <div className={styles.visuel}>
        <figure className={styles.tuile}>
          <Image
            fill
            alt=""
            className={styles.fond}
            fetchPriority="high"
            loading="eager"
            sizes="(min-width: 900px) 470px, (min-width: 720px) 290px, min(450px, calc(100vw - 44px))"
            src="/assets/site/fond-ardoise-poulet.webp"
          />
          {/* Ni préchargé ni prioritaire : l'image principale mesurée (LCP)
              est le fond, et le seau (25 ko) lui prenait du débit
              (recette vitesse D8). */}
          <Image
            alt={`Seau Chicken Nation ${CENT_POUR_CENT} halal rempli de poulet pané`}
            className={styles.seau}
            height={700}
            loading="eager"
            // Sur téléphone, le seau fait 53 % de la tuile (100vw - 44 px).
            sizes="(min-width: 900px) 210px, (min-width: 720px) 130px, calc(53vw - 23px)"
            src="/assets/site/seau.webp"
            width={586}
          />
        </figure>
        <Tampon className={styles.tampon} fort={CENT_POUR_CENT} texte="Halal" />
        <Eclat className={styles.eclat} fort={CENT_POUR_CENT} texte="Local" />
        {vedette ? <EtiquetteVedette plat={vedette} /> : null}
      </div>
    </Section>
  );
}
