import type { MetadataRoute } from "next";

import { obtenirCartePublique } from "@/features/menus/apis/menu-public.api";
import { platsDeLaCarte } from "@/features/menus/carte";
import { cheminPlat } from "@/features/menus/plats.slug";
import { obtenirRestaurantsDuSite } from "@/features/restaurants/restaurant.api";
import { cheminRestaurant } from "@/features/restaurants/restaurants.site";
import { CHEMIN_CARTE, adresseAbsolue } from "@/lib/seo/commun";

// Revu toutes les heures (plan, 5.3). Next applique la plus courte des durées
// de ses lectures : avec la carte (900 s), le sitemap suit donc la carte, et
// un plat ajouté au backoffice y entre en 15 minutes au plus.
export const revalidate = 3600;

type Entree = MetadataRoute.Sitemap[number];
type Frequence = Entree["changeFrequency"];

/**
 * Pages fixes indexables, toutes en /fr (adresses de référence). Les trois
 * premières gardent leur place : plats et restaurants sont rangés après elles.
 * Absentes à dessein : /fr/franchise et /fr/restaurants/nos-menus (redirigées
 * vers l'histoire et la carte), l'accord de confidentialité et les termes et
 * conditions (noindex), la caisse, le suivi et les pages de passage vers
 * l'appli (robots.ts).
 */
const PAGES_FIXES: {
  chemin: string;
  priorite: number;
  frequence: Frequence;
}[] = [
  { chemin: "/fr", priorite: 1, frequence: "daily" },
  { chemin: CHEMIN_CARTE, priorite: 0.9, frequence: "daily" },
  { chemin: "/fr/restaurants", priorite: 0.9, frequence: "monthly" },
  { chemin: "/fr/histoire", priorite: 0.6, frequence: "yearly" },
  { chemin: "/fr/app-mobile", priorite: 0.7, frequence: "monthly" },
  { chemin: "/fr/carte-nation/adhesion", priorite: 0.7, frequence: "monthly" },
  { chemin: "/fr/faq", priorite: 0.5, frequence: "monthly" },
  { chemin: "/fr/contact", priorite: 0.5, frequence: "yearly" },
  { chemin: "/fr/privacy-rules", priorite: 0.2, frequence: "yearly" },
  { chemin: "/fr/deletion-of-account", priorite: 0.2, frequence: "yearly" },
  // Adresse imposée par la déclaration « Data safety » de Google Play
  // (com.chickennation.app). Ne pas renommer sans changer la Play Console.
  { chemin: "/fr/request/deletion-of-delivery-account", priorite: 0.2, frequence: "yearly" },
];

/** Date de l'API gardée seulement si elle est lisible (sinon pas de `lastModified`). */
function dateValide(date: string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = new Date(date);

  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/**
 * Sitemap : pages fixes, une page par plat (photo et date de modification
 * de l'API) et une page par restaurant.
 * Une seule lecture de la carte et des restaurants, partagée avec les pages
 * (`cache`). Si l'API ne répond pas, l'erreur est levée : Next garde le
 * dernier sitemap valide au lieu d'en publier un sans plats.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [carte, restaurants] = await Promise.all([
    obtenirCartePublique(),
    obtenirRestaurantsDuSite(),
  ]);

  // Accueil, carte et liste des restaurants d'abord (ordre de PAGES_FIXES) :
  // chacune est suivie de ses pages filles.
  const [accueil, pageCarte, listeRestaurants, ...autres] = PAGES_FIXES.map(
    (page): Entree => ({
      url: adresseAbsolue(page.chemin),
      changeFrequency: page.frequence,
      priority: page.priorite,
    }),
  );

  // Carte et accueil changent avec les plats : leur date est celle du plat
  // modifié le plus récemment.
  const datesPlats = platsDeLaCarte(carte)
    .map((p) => dateValide(p.modifieLe))
    .filter((d): d is string => !!d)
    .sort();
  const carteModifiee = datesPlats[datesPlats.length - 1];

  if (carteModifiee) {
    accueil.lastModified = carteModifiee;
    pageCarte.lastModified = carteModifiee;
  }

  const plats: Entree[] = platsDeLaCarte(carte).map((plat) => {
    const modifie = dateValide(plat.modifieLe);
    // Photo recadrée du site ou photo de l'API ; jamais le logo de repli.
    const photo =
      plat.photo.recadree || /^https?:\/\//.test(plat.photo.src)
        ? adresseAbsolue(plat.photo.src)
        : null;

    return {
      url: adresseAbsolue(cheminPlat(plat)),
      ...(modifie ? { lastModified: modifie } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
      ...(photo ? { images: [photo] } : {}),
    };
  });

  const pagesRestaurants: Entree[] = restaurants.map((r) => ({
    url: adresseAbsolue(cheminRestaurant(r)),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    accueil,
    pageCarte,
    ...plats,
    listeRestaurants,
    ...pagesRestaurants,
    ...autres,
  ];
}
