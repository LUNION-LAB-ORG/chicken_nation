import type { Metadata } from "next";

import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../../meta";
import PageIntrouvable from "../../not-found";

import { PageRestaurant } from "@/components/site/restaurants/PageRestaurant";
import {
  descriptionPageRestaurant,
  titrePageRestaurant,
} from "@/components/site/restaurants/PageRestaurant.textes";
import { fourchettePrix } from "@/features/menus/carte";
import { obtenirCartePublique } from "@/features/menus/apis/menu-public.api";
import { obtenirRestaurantsDuSite } from "@/features/restaurants/restaurant.api";
import {
  cheminRestaurant,
  trouverRestaurant,
} from "@/features/restaurants/restaurants.site";
import { jsonLd } from "@/lib/seo/commun";
import { filArianeSchemaOrg } from "@/lib/seo/fil-ariane";
import { pageRestaurantSchemaOrg } from "@/lib/seo/restaurant";

// Statique, reconstruite au plus toutes les heures (restaurants lus dans
// l'API). La fourchette de prix du JSON-LD lit aussi la carte, gardée
// 15 minutes : Next revalide alors la page toutes les 15 minutes.
export const revalidate = 3600;

/*
 * Seules les adresses des restaurants connus à la construction existent.
 * Toute autre adresse (/fr/restaurants/xyz) répond une vraie 404, servie par
 * app/global-not-found.tsx : la page 404 française entière dès le serveur.
 *
 * Pourquoi pas notFound() dans la page : sur une page statique, Next renvoie
 * alors un HTML vide (<html id="__next_error__">, sans langue) et le
 * navigateur affiche la 404 anglaise par défaut de Next. Vérifié sur une
 * construction de production (Next 16.3.5).
 *
 * Conséquence : un restaurant ajouté au backoffice a sa page au déploiement
 * suivant (ajouter aussi son nom accentué et sa commune dans
 * features/restaurants/restaurants.site.ts).
 */
export const dynamicParams = false;

type Params = Promise<{ locale: string; restaurant: string }>;

export async function generateStaticParams() {
  const restaurants = await obtenirRestaurantsDuSite();

  return restaurants.map((r) => ({ restaurant: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { restaurant: slug } = await params;
  const r = trouverRestaurant(await obtenirRestaurantsDuSite(), slug);

  // Restaurant retiré depuis la construction : voir la page plus bas.
  if (!r)
    return {
      title: "Page introuvable",
      robots: { index: false, follow: true },
    };

  const meta = pageMetadata({
    chemin: `/restaurants/${r.slug}`,
    titreAbsolu: titrePageRestaurant(r),
    description: descriptionPageRestaurant(r),
  });

  // Image de partage : celle de opengraph-image.tsx, que Next n'ajoute que si
  // la page ne donne pas d'image elle-même (son adresse porte un suffixe
  // calculé par Next), pour Open Graph comme pour Twitter. La clé doit être
  // absente, et non vide, pour que Next ajoute la sienne.
  const openGraph: NonNullable<Metadata["openGraph"]> = { ...meta.openGraph };
  const twitter: NonNullable<Metadata["twitter"]> = { ...meta.twitter };

  delete openGraph.images;
  delete twitter.images;

  return { ...meta, openGraph, twitter };
}

// Fourchette des prix de la carte pour le JSON-LD (`priceRange`). Facultative :
// une carte illisible ne doit pas empêcher la page du restaurant de paraître.
async function fourchetteDeLaCarte() {
  try {
    return fourchettePrix(await obtenirCartePublique());
  } catch {
    return null;
  }
}

export default async function PageDuRestaurant({ params }: { params: Params }) {
  const { locale, restaurant: slug } = await params;

  setRequestLocale(locale);

  const restaurants = await obtenirRestaurantsDuSite();
  const r = trouverRestaurant(restaurants, slug);

  // Restaurant connu à la construction mais retiré depuis (ou mis en pause)
  // au backoffice : la revalidation affiche la page introuvable, sans index.
  // Ni notFound() ni une redirection : sur une page statique revalidée, Next
  // garderait un HTML vide ou un 308 sans adresse de destination.
  if (!r) return <PageIntrouvable />;

  const prix = await fourchetteDeLaCarte();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: jsonLd(pageRestaurantSchemaOrg(r, { prix })),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            filArianeSchemaOrg([
              { nom: "Nos restaurants", chemin: "/fr/restaurants" },
              {
                nom: `Chicken Nation ${r.nomAffiche}`,
                chemin: cheminRestaurant(r),
              },
            ]),
          ),
        }}
        type="application/ld+json"
      />
      <PageRestaurant
        autres={restaurants.filter((autre) => autre.slug !== r.slug)}
        restaurant={r}
      />
    </>
  );
}
