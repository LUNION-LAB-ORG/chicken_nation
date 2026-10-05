import Image from "../Image";
import { LienBouton } from "../Bouton";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import styles from "./PageRestaurants.module.css";

import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

/**
 * Bas de la page `/fr/restaurants` : retrait ou livraison, lien vers la carte
 * et numéro unique. Texte propre à la page (référencement), sans promesse
 * absente de la maquette ou du site actuel. Composant serveur.
 */
export function BlocCommanderRestaurants({ nombre }: { nombre: number }) {
  const ou =
    nombre > 1
      ? `dans l'un de nos ${nombre}${INSECABLE}restaurants`
      : nombre === 1
        ? "dans notre restaurant"
        : "au restaurant";

  return (
    <Section
      className={styles.bloc}
      espacement="aucun"
      fond="orange-pale"
      titreId="titre-retrait-livraison"
    >
      <div className={styles.grille}>
        <div className={styles.texte}>
          <TitreAffiche id="titre-retrait-livraison">
            Retrait ou livraison
          </TitreAffiche>
          <p>
            Commandez en ligne{INSECABLE}: votre repas est livré chez vous dans
            le Grand Abidjan, ou prêt à retirer {ou}. Poulet 100{INSECABLE}%
            local, 100{INSECABLE}% halal.
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
            <p className={styles.tel}>
              Ou par téléphone
              <a href={telLien()}>{TELEPHONE}</a>
            </p>
          </div>
        </div>
        <Image
          alt=""
          className={styles.boite}
          height={560}
          sizes="220px"
          src="/assets/site/boite-poulet-dessin.png"
          width={560}
        />
      </div>
    </Section>
  );
}

/**
 * En-tête de repli de `/fr/restaurants` quand l'API ne renvoie aucun
 * restaurant actif : la page garde son titre et le numéro unique.
 */
export function ListeRestaurantsVide() {
  return (
    <Section motif fond="surface" titreId="titre-restaurants">
      <TitreAffiche id="titre-restaurants" niveau="h1">
        Nos restaurants
      </TitreAffiche>
      <p className={styles.vide}>
        La liste de nos restaurants est momentanément indisponible. Vous pouvez
        commander en ligne ou nous appeler au{" "}
        <a href={telLien()}>{TELEPHONE}</a>.
      </p>
    </Section>
  );
}
