import type { ICategorieCarte } from "@/features/menus/types/carte.types";

import Image from "next/image";

import { Eclat, Tampon } from "../Autocollants";
import { Conteneur } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import styles from "./Carte.module.css";

import { CLE_PROMOTIONS } from "@/features/menus/carte.categories";
import { INSECABLE, nombre, pluriel } from "@/lib/typo";

/** « Nos box » → « box », « Les burgers » → « burgers », « Poulet pané » → « poulet pané ». */
export function nomDansPhrase(nom: string) {
  const sans = nom.replace(/^(nos|les)\s+/i, "").trim();

  return sans.charAt(0).toLocaleLowerCase("fr") + sans.slice(1);
}

/** « a, b et c » */
function enumeration(mots: readonly string[]) {
  if (mots.length < 2) return mots.join("");

  return `${mots.slice(0, -1).join(", ")} et ${mots[mots.length - 1]}`;
}

/**
 * Introduction de la carte en deux phrases, avec les catégories et les
 * nombres réels (rien d'écrit en dur) : « 49 plats : box, poulet pané… ».
 */
export function introductionCarte(
  categories: readonly ICategorieCarte[],
  nombrePlats: number,
  nombreRestaurants: number,
) {
  const noms = categories
    .filter((c) => c.cle !== CLE_PROMOTIONS)
    .map((c) => nomDansPhrase(c.nom));
  const plats = pluriel(nombrePlats, "plat", "plats");
  const premiere = noms.length
    ? `${plats}${INSECABLE}: ${enumeration(noms)}.`
    : `${plats}.`;
  const retrait =
    nombreRestaurants > 1
      ? `dans l'un de nos ${nombre(nombreRestaurants)}${INSECABLE}restaurants`
      : nombreRestaurants === 1
        ? "dans notre restaurant"
        : "au restaurant";

  return `${premiere} Livraison en 20${INSECABLE}à${INSECABLE}35${INSECABLE}min ou retrait ${retrait}.`;
}

/**
 * En-tête de la carte (maquette, HTML 323-337) : photo du seau renversé sous
 * un voile, titre jaune en police d'affiche, introduction, autocollants
 * « 100 % Halal » et « 100 % Local » dès 900 px. Composant serveur.
 */
export function EnteteCarte({
  categories,
  nombrePlats,
  nombreRestaurants,
}: {
  categories: readonly ICategorieCarte[];
  nombrePlats: number;
  nombreRestaurants: number;
}) {
  return (
    <section aria-labelledby="titre-carte" className={styles.tete}>
      {/* Image principale de la page : seule à être préchargée. */}
      <Image
        fill
        preload
        alt=""
        className={styles.teteFond}
        quality={60}
        sizes="100vw"
        src="/assets/site/fond-seau-renverse.webp"
      />
      <Conteneur className={styles.teteInt}>
        <div className="min-w-0">
          <TitreAffiche
            className="text-jaune [text-shadow:3px_3px_0_var(--color-encre)]"
            id="titre-carte"
            niveau="h1"
            taille="ecran"
          >
            La carte
          </TitreAffiche>
          {nombrePlats > 0 ? (
            <p>
              {introductionCarte(categories, nombrePlats, nombreRestaurants)}
            </p>
          ) : null}
        </div>
        <div aria-hidden="true" className={styles.collants}>
          <Tampon fort={`100${INSECABLE}%`} texte="Halal" />
          <Eclat fort={`100${INSECABLE}%`} texte="Local" />
        </div>
      </Conteneur>
    </section>
  );
}
