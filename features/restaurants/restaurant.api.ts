import { cache } from "react";

import { IRestaurantPublic } from "./restaurant.type";
import { restaurantsDuSite, type IRestaurantSite } from "./restaurants.site";

import { baseURL } from "@/config/api";

/** Étiquette de cache des restaurants (à passer à `revalidateTag` après un changement au backoffice). */
export const ETIQUETTE_RESTAURANTS = "restaurants";
const REVALIDATION_RESTAURANTS = 3600;

type RestaurantApi = Partial<IRestaurantPublic> & { id: string; name: string };

const nombreOuNull = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
const texteOuNull = (v: unknown) =>
  typeof v === "string" && v.trim() ? v : null;

// Liste blanche : un champ ajouté plus tard à la réponse de l'API ne peut pas
// sortir par mégarde dans les pages (le responsable et le téléphone y sont).
function versRestaurantPublic(r: RestaurantApi): IRestaurantPublic {
  return {
    id: r.id,
    name: r.name,
    address: texteOuNull(r.address),
    latitude: nombreOuNull(r.latitude),
    longitude: nombreOuNull(r.longitude),
    image: texteOuNull(r.image),
    schedule: texteOuNull(r.schedule),
    entity_status: String(r.entity_status ?? ""),
  };
}

/**
 * Restaurants actifs, lus côté serveur par `fetch` natif (ak-api-http passe
 * par axios, que Next ne met pas en cache) et gardés une heure : la page ne
 * réinterroge pas le backend à chaque visite, et un restaurant ajouté au
 * backoffice apparaît sur le site sans redéploiement.
 *
 * En cas d'échec, une erreur est levée : Next garde alors la dernière version
 * valide de la page pendant une revalidation, et la construction échoue
 * (l'ancien conteneur reste en service). Dans l'ordre de l'API.
 */
export const obtenirRestaurantsPublics = cache(
  async (): Promise<IRestaurantPublic[]> => {
    const res = await fetch(`${baseURL}/restaurants?limit=50`, {
      next: {
        revalidate: REVALIDATION_RESTAURANTS,
        tags: [ETIQUETTE_RESTAURANTS],
      },
    });

    if (!res.ok)
      throw new Error(
        `Restaurants illisibles : GET /restaurants a répondu ${res.status}`,
      );
    const corps = (await res.json()) as
      | RestaurantApi[]
      | { data?: RestaurantApi[] };
    const liste = Array.isArray(corps) ? corps : corps.data;

    if (!Array.isArray(liste))
      throw new Error(
        "Restaurants illisibles : GET /restaurants ne renvoie pas de liste",
      );

    return liste
      .filter((r) => r && r.entity_status === "ACTIVE")
      .map(versRestaurantPublic);
  },
);

/** Restaurants du site (slug, nom affiché, commune), dans l'ordre de `restaurants.site.ts`. */
export const obtenirRestaurantsDuSite = cache(
  async (): Promise<IRestaurantSite[]> =>
    restaurantsDuSite(await obtenirRestaurantsPublics()),
);
