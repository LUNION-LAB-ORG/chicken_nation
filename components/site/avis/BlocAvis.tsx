import { Icone } from "../Icone";
import { RangeeDefilante } from "../RangeeDefilante";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import styles from "./BlocAvis.module.css";

import { typo } from "@/lib/typo";

// « JEAN emmanuel » → « Jean Emmanuel ».
const majuscules = (texte: string) =>
  texte
    .toLocaleLowerCase("fr")
    .replace(
      /(^|[\s-])([a-zà-öø-ÿ])/g,
      (_, avant: string, lettre: string) =>
        `${avant}${lettre.toLocaleUpperCase("fr")}`,
    );

/** Signature d'un avis : prénom et initiale du nom (« Jean Emmanuel D. »), initiales de la pastille. */
export function auteurAvis(avis: ICommentaire): {
  nom: string;
  initiales: string;
} {
  const prenom = majuscules((avis.customer?.first_name ?? "").trim());
  const initiale = (avis.customer?.last_name ?? "")
    .trim()
    .charAt(0)
    .toLocaleUpperCase("fr");
  const nom = [prenom, initiale ? `${initiale}.` : ""]
    .filter(Boolean)
    .join(" ");

  return {
    nom: nom || "Client",
    initiales: `${prenom.charAt(0)}${initiale}` || "C",
  };
}

/** Note entière de 1 à 5. */
const noteSur5 = (note: number) =>
  Math.min(5, Math.max(1, Math.round(Number(note) || 0)));

/** Un avis : étoiles (lues « Note N sur 5 »), citation, prénom et initiale. */
function Avis({ avis }: { avis: ICommentaire }) {
  const note = noteSur5(avis.rating);
  const auteur = auteurAvis(avis);

  return (
    <figure className={styles.avis}>
      <div
        aria-label={`Note ${note} sur 5`}
        className={styles.etoiles}
        role="img"
      >
        {Array.from({ length: note }, (_, i) => (
          <Icone key={i} nom="etoile" />
        ))}
      </div>
      <blockquote>{typo(avis.message.trim())}</blockquote>
      <figcaption>
        <span aria-hidden="true" className={styles.initiales}>
          {auteur.initiales}
        </span>
        {auteur.nom}
      </figcaption>
    </figure>
  );
}

/**
 * Avis clients approuvés au backoffice (`GET /comments/bests`). Rangée qui
 * défile sur téléphone, colonnes dès 900 px. Section masquée sans avis
 * (cas de la base de test).
 */
export function BlocAvis({
  avis,
  id = "avis",
  className,
}: {
  avis: readonly ICommentaire[];
  id?: string;
  className?: string;
}) {
  if (avis.length === 0) return null;
  const titreId = `${id}-titre`;

  return (
    <Section className={className} id={id} titreId={titreId}>
      <div className="mb-[22px] grid gap-2 lg:mb-[30px]">
        <TitreAffiche id={titreId}>Avis clients</TitreAffiche>
        <p className="max-w-[40em] text-encre-doux">
          Ce que nos clients écrivent après leur commande.
        </p>
      </div>
      <RangeeDefilante
        as="ul"
        className={styles.liste}
        genre="avis"
        libelle="Avis clients"
      >
        {avis.map((a) => (
          <li key={a.id}>
            <Avis avis={a} />
          </li>
        ))}
      </RangeeDefilante>
    </Section>
  );
}
