import type { Metadata } from "next";

import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../meta";

import {
  BlocCommanderRestaurants,
  ListeRestaurantsVide,
} from "@/components/site/restaurants/PageRestaurants";
import {
  descriptionListeRestaurants,
  TITRE_LISTE_RESTAURANTS,
} from "@/components/site/restaurants/PageRestaurant.textes";
import { SectionRestaurants } from "@/components/site/restaurants/SectionRestaurants";
import { obtenirRestaurantsDuSite } from "@/features/restaurants/restaurant.api";
import { jsonLd } from "@/lib/seo/commun";
import { listeRestaurantsSchemaOrg } from "@/lib/seo/restaurant";

// Statique, reconstruite au plus toutes les heures (restaurants lus dans l'API).
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    chemin: "/restaurants",
    titre: TITRE_LISTE_RESTAURANTS,
    description: descriptionListeRestaurants(await obtenirRestaurantsDuSite()),
  });
}

/**
 * Nos restaurants : en-tête sur la photo du seau (titre, horaires généraux,
 * numéro unique), une carte par restaurant avec son lien vers sa page, puis
 * le retrait ou la livraison. JSON-LD `ItemList` des pages restaurants.
 */
export default async function Restaurants({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const restaurants = await obtenirRestaurantsDuSite();

  return (
    <>
      {restaurants.length > 0 ? (
        <script
          dangerouslySetInnerHTML={{
            __html: jsonLd(listeRestaurantsSchemaOrg(restaurants)),
          }}
          type="application/ld+json"
        />
      ) : null}
      {restaurants.length > 0 ? (
        <SectionRestaurants
          preload
          niveauTitre="h1"
          restaurants={restaurants}
          titre="Nos restaurants"
        />
      ) : (
        <ListeRestaurantsVide />
      )}
      <BlocCommanderRestaurants nombre={restaurants.length} />
    </>
  );
}
