import type { IPromotionPublique } from "@/features/promotion/promotion.type";

import { RangeeDefilante } from "../RangeeDefilante";

import { conditionsOffre, remiseOffre } from "./avantages.textes";
import styles from "./VosAvantages.module.css";

import { typo } from "@/lib/typo";

/**
 * « Offres du moment » (offres fidélité publiques et en cours,
 * `GET /fidelity/promotions/public`), rangée compacte dans « Vos avantages ».
 * Absente de la maquette : remise en service le 03/10. Masquée s'il n'y a
 * aucune offre (route absente d'un serveur pas encore mis à jour comprise).
 * Les couleurs choisies au backoffice ne sont pas reprises : la rangée garde
 * celles de la section.
 */
export function OffresDuMoment({
  offres,
}: {
  offres: readonly IPromotionPublique[];
}) {
  if (offres.length === 0) return null;

  return (
    <div className={styles.offres}>
      <div className={styles.offresTete}>
        <h3 id="offres-du-moment">Offres du moment</h3>
        <p>
          À utiliser dans l&apos;application, selon les conditions de chaque
          offre.
        </p>
      </div>
      <RangeeDefilante
        as="ul"
        className={styles.offresListe}
        colonnes={3}
        libelle="Offres du moment"
      >
        {offres.map((offre) => {
          const conditions = conditionsOffre(offre);

          return (
            <li key={offre.id} className={styles.offre}>
              <p className={styles.remise}>{remiseOffre(offre)}</p>
              <p className={styles.offreTitre}>{typo(offre.title)}</p>
              {offre.description ? (
                <p className={styles.offreTexte}>{typo(offre.description)}</p>
              ) : null}
              {conditions.length > 0 ? (
                <ul className={styles.conditions}>
                  {conditions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </RangeeDefilante>
    </div>
  );
}
