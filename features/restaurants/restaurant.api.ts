import { baseURL } from "@/config/api";
import { IRestaurantPublic } from "./restaurant.type";

/**
 * Restaurants actifs, lus côté serveur et gardés en cache une heure : la page
 * ne réinterroge pas le backend à chaque visite, et un restaurant ajouté au
 * backoffice apparaît sur le site sans redéploiement.
 * Renvoie une liste vide si le backend ne répond pas (la page reste affichable).
 */
export async function obtenirRestaurantsPublics(): Promise<IRestaurantPublic[]> {
    try {
        const res = await fetch(`${baseURL}/restaurants?limit=50`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const corps = (await res.json()) as { data?: IRestaurantPublic[] };
        return (corps.data ?? []).filter((r) => r.entity_status === "ACTIVE");
    } catch {
        return [];
    }
}
