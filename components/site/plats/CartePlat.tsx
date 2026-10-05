import type { IPlatCarte } from "@/features/menus/types/carte.types";

import { BadgePromo } from "../Autocollants";
import { styleBouton } from "../Bouton";
import { Icone } from "../Icone";
import { PhotoPlat } from "../PhotoPlat";

import { BoutonChoisirPlat } from "./BoutonChoisirPlat";
import styles from "./CartePlat.module.css";

import { cheminPlat } from "@/features/menus/plats.slug";
import { cn } from "@/lib/utils";
import { fcfa, INSECABLE, nombre, phrase, typo } from "@/lib/typo";

// Largeurs réellement affichées de la photo, selon la grille qui porte la carte.
const TAILLES_PHOTO = {
  // Promotions : rangée défilante (80 %, puis 44 %), 3 colonnes dès 900 px.
  vitrine:
    "(min-width: 1264px) 340px, (min-width: 900px) 28vw, (min-width: 600px) 42vw, 76vw",
  // Carte : 128 px sous 600 px, puis 2, 3 et 4 colonnes.
  carte:
    "(min-width: 1264px) 260px, (min-width: 1100px) 21vw, (min-width: 800px) 30vw, (min-width: 600px) 45vw, 128px",
} as const;

/** Prix payé, et prix barré lu « Au lieu de … » pour un plat en promotion. */
export function PrixPlat({
  plat,
  className,
}: {
  plat: Pick<IPlatCarte, "prix" | "prixAvantPromo">;
  className?: string;
}) {
  return (
    <p className={cn(styles.prix, className)}>
      {plat.prixAvantPromo !== null ? (
        <>
          <strong className={styles.promo}>{fcfa(plat.prix)}</strong>
          <s>
            <span className="sr-only">Au lieu de </span>
            {fcfa(plat.prixAvantPromo)}
          </s>
        </>
      ) : (
        <strong>{fcfa(plat.prix)}</strong>
      )}
    </p>
  );
}

/**
 * Carte d'un plat. Composant serveur ; seuls le nom et « Ajouter » sont des
 * îlots (BoutonChoisirPlat), qui ouvriront la fiche quand elle sera branchée.
 *
 * - `vitrine` : promotions de l'accueil, aplat orange et grande photo ;
 * - `carte` : grilles de la carte, en liste avec une photo de 128 px sous 600 px.
 */
export function CartePlat({
  plat,
  variante = "carte",
  niveauTitre = "h3",
  preload,
  className,
}: {
  plat: IPlatCarte;
  variante?: "vitrine" | "carte";
  /** h3 sous le h2 d'une section ; h2 si la carte est directement sous le h1. */
  niveauTitre?: "h2" | "h3";
  /** Photo préchargée : seulement si c'est l'image principale du premier écran. */
  preload?: boolean;
  className?: string;
}) {
  const Titre = niveauTitre;
  const href = cheminPlat(plat);
  const remise =
    plat.prixAvantPromo !== null ? plat.prixAvantPromo - plat.prix : 0;
  const description = plat.description ? typo(phrase(plat.description)) : "";

  return (
    <article className={cn(styles.plat, styles[variante], className)}>
      <PhotoPlat
        alt={plat.nom}
        className={styles.photo}
        etiquette={plat.photo.etiquette}
        fond={plat.photo.fond}
        preload={preload}
        sizes={TAILLES_PHOTO[variante]}
        src={plat.photo.src}
      >
        {remise > 0 ? (
          <BadgePromo className={styles.badge}>
            −{nombre(remise)}
            {INSECABLE}FCFA
          </BadgePromo>
        ) : null}
      </PhotoPlat>
      <div className={styles.corps}>
        <Titre className={styles.nom}>
          <BoutonChoisirPlat
            className={styles.ouvrir}
            href={href}
            platId={plat.id}
          >
            {plat.nom}
          </BoutonChoisirPlat>
        </Titre>
        {description ? <p className={styles.desc}>{description}</p> : null}
        <div className={styles.pied}>
          <PrixPlat plat={plat} />
          <BoutonChoisirPlat
            aria-label={`Ajouter ${plat.nom}, ${plat.categorie.court.toLowerCase()}`}
            className={cn(
              styleBouton({
                variante: variante === "vitrine" ? "sombre" : "principal",
                taille: "petit",
              }),
              styles.ajouter,
            )}
            href={href}
            platId={plat.id}
          >
            <Icone className="size-[18px]" nom="plus" />
            Ajouter
          </BoutonChoisirPlat>
        </div>
      </div>
    </article>
  );
}
