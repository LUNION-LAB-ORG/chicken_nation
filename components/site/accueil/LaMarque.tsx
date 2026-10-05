import Image from "next/image";

import { Ruban } from "../Autocollants";
import { LienFleche } from "../Lien";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import { LecteurVideo } from "./LecteurVideo";
import styles from "./LaMarque.module.css";

import { INSECABLE } from "@/lib/typo";

const CENT_POUR_CENT = `100${INSECABLE}%`;

/** « dans nos 5 restaurants d'Abidjan » ; le nombre vient de l'API. */
function lieux(nombre: number) {
  if (nombre > 1) return `dans nos ${nombre}${INSECABLE}restaurants d'Abidjan`;
  if (nombre === 1) return "dans notre restaurant d'Abidjan";

  return "dans nos restaurants d'Abidjan";
}

/**
 * « Chicken Nation, c'est… » (maquette, HTML 187-210, retouche 11) : texte de
 * la section À propos du site actuel, lien vers Notre histoire, vidéo de la
 * soirée d'ouverture entre les deux dessins du site actuel (dès 1 024 px).
 * Section `la-marque`, à ne pas confondre avec la page Notre histoire.
 */
export function LaMarque({ nombreRestaurants }: { nombreRestaurants: number }) {
  return (
    <Section id="la-marque" titreId="la-marque-titre">
      <div className={styles.tete}>
        <Ruban>Chicken Nation, c&apos;est…</Ruban>
        <TitreAffiche id="la-marque-titre">Le champion du poulet</TitreAffiche>
        <p>
          Née de la passion pour le poulet de qualité, Chicken Nation s&apos;est
          établie comme une référence de la restauration rapide en Côte
          d&apos;Ivoire. Poulet {CENT_POUR_CENT} local, {CENT_POUR_CENT} halal,
          servi {lieux(nombreRestaurants)} et livré chez vous.
        </p>
        <LienFleche href="/fr/histoire">Notre histoire</LienFleche>
      </div>
      <figure className="m-0">
        <div className={styles.scene}>
          <Image
            alt=""
            className={`${styles.deco} ${styles.seau}`}
            height={492}
            sizes="(min-width: 1240px) 340px, 260px"
            src="/assets/site/seau-renverse-dessin.png"
            width={720}
          />
          <LecteurVideo descriptionId="la-marque-video" />
          <Image
            alt=""
            className={`${styles.deco} ${styles.cuisse}`}
            height={760}
            sizes="(min-width: 1240px) 280px, 210px"
            src="/assets/site/cuisse-poulet-dessin.png"
            width={600}
          />
        </div>
        <figcaption className={styles.legende} id="la-marque-video">
          Soirée d&apos;ouverture d&apos;un restaurant Chicken Nation{INSECABLE}
          : la mascotte Champion dans poulet, les clients à table et les
          artistes sur scène.
        </figcaption>
      </figure>
    </Section>
  );
}
