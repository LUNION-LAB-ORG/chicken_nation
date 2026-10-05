import type {
  ICategorieCarte,
  IPlatCarte,
} from "@/features/menus/types/carte.types";

import { CartePlat } from "../plats/CartePlat";

import styles from "./Carte.module.css";
import { DisponibiliteHoraire } from "./DisponibiliteHoraire";

import { CLE_PROMOTIONS } from "@/features/menus/carte.categories";
import { pluriel } from "@/lib/typo";
import { cn } from "@/lib/utils";

/** id du titre d'une section de la carte (la section porte la clé : `#box`). */
export const idTitreCategorie = (cle: string) => `titre-${cle}`;

/**
 * Grille de cartes de plats : 1 colonne (liste) sous 600 px, puis 2, 3 et
 * au plus 4. Un plat servi à certaines heures porte son créneau sous la carte.
 */
export function GrillePlats({
  plats,
  className,
}: {
  plats: readonly IPlatCarte[];
  className?: string;
}) {
  return (
    <div className={cn(styles.grille, className)}>
      {plats.map((plat) =>
        plat.creneau ? (
          <div key={plat.id} className={styles.case}>
            <CartePlat plat={plat} />
            <DisponibiliteHoraire className="px-1" creneau={plat.creneau} />
          </div>
        ) : (
          <CartePlat key={plat.id} plat={plat} />
        ),
      )}
    </div>
  );
}

/**
 * Section d'une catégorie de la carte (maquette, CSS 924-952) : ancre fixe
 * (`#box`), titre h2 avec le nombre de plats (sur fond jaune pour les
 * promotions), puis la grille. Le titre reçoit le focus quand on choisit sa
 * pastille. Composant serveur.
 */
export function SectionCategorie({
  categorie,
}: {
  categorie: ICategorieCarte;
}) {
  const titreId = idTitreCategorie(categorie.cle);
  const promo = categorie.cle === CLE_PROMOTIONS;

  return (
    <section
      aria-labelledby={titreId}
      className={styles.section}
      id={categorie.cle}
    >
      <h2
        className="mb-3.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[clamp(20px,3vw,26px)] leading-[1.2] font-bold"
        id={titreId}
        tabIndex={-1}
      >
        <span
          className={promo ? "rounded-lg bg-jaune px-2.5 py-0.5" : undefined}
        >
          {categorie.nom}
        </span>{" "}
        {/* Espace : le titre se lit « Promotions 1 plat », et non « Promotions1 plat ». */}
        <small className="text-sm font-medium text-encre-doux">
          {pluriel(categorie.plats.length, "plat", "plats")}
        </small>
      </h2>
      <GrillePlats plats={categorie.plats} />
    </section>
  );
}
