import { baseURL } from "@/config/api";
import { formatImageUrl } from "@/utils/formatImageUrl";

// Plat tel que renvoyé par GET /dishes pour un visiteur non connecté
// (le backend n'y met que les plats visibles par tout le monde).
interface IPlatApi {
    id: string;
    name: string;
    description: string | null;
    price: number;
    is_promotion: boolean;
    promotion_price: number | null;
    image: string | null;
    entity_status: string;
    category: { id: string; name: string } | null;
}

export interface IPlatCarte {
    id: string;
    nom: string;
    description: string;
    prix: number;
    // Prix barré quand le plat est en promotion.
    prixAvantPromo: number | null;
    image: string;
}

export interface ICategorieCarte {
    nom: string;
    plats: IPlatCarte[];
}

// "POULET PANÉ" → "Poulet pané"
function nomCategorie(nom: string) {
    const bas = nom.trim().toLowerCase();
    return bas.charAt(0).toUpperCase() + bas.slice(1);
}

/**
 * Carte publique lue côté serveur, gardée en cache 15 minutes : un prix ou
 * une promotion changés au backoffice arrivent sur le site sans redéploiement.
 * Renvoie une liste vide si le backend ne répond pas.
 */
export async function obtenirCartePublique(): Promise<ICategorieCarte[]> {
    let plats: IPlatApi[] = [];
    try {
        const res = await fetch(`${baseURL}/dishes`, {
            next: { revalidate: 900 },
            // Le site sait composer un menu (options) : le serveur montre alors
            // aussi les plats composables, cachés aux anciennes applications.
            headers: { "x-app-composable": "1" },
        });
        if (!res.ok) return [];
        const corps = (await res.json()) as IPlatApi[] | { data?: IPlatApi[] };
        plats = Array.isArray(corps) ? corps : (corps.data ?? []);
    } catch {
        return [];
    }

    const parCategorie = new Map<string, IPlatCarte[]>();
    for (const p of plats) {
        if (p.entity_status !== "ACTIVE" || !p.category) continue;
        // Même critère que l'application : promotion ET prix promo renseigné.
        const enPromo = p.is_promotion && !!p.promotion_price && p.promotion_price < p.price;
        const plat: IPlatCarte = {
            id: p.id,
            nom: p.name.trim(),
            description: (p.description ?? "").replace(/\s+/g, " ").trim(),
            prix: enPromo ? p.promotion_price! : p.price,
            prixAvantPromo: enPromo ? p.price : null,
            image: formatImageUrl(p.image ?? undefined, "/assets/images/logo.png"),
        };
        const nom = nomCategorie(p.category.name);
        parCategorie.set(nom, [...(parCategorie.get(nom) ?? []), plat]);
    }

    // L'onglet Promotions réunit tous les plats en promotion, quelle que soit
    // leur catégorie (ils restent aussi visibles dans la leur).
    const promos = new Map<string, IPlatCarte>();
    for (const liste of Array.from(parCategorie.values())) {
        for (const plat of liste) if (plat.prixAvantPromo) promos.set(plat.id, plat);
    }
    for (const plat of parCategorie.get("Promotions") ?? []) promos.set(plat.id, plat);
    if (promos.size > 0) parCategorie.set("Promotions", Array.from(promos.values()));
    else parCategorie.delete("Promotions");

    return Array.from(parCategorie.entries())
        .map(([nom, liste]): ICategorieCarte => ({ nom, plats: liste.sort((a, b) => a.prix - b.prix) }))
        // Les promotions d'abord, puis l'ordre alphabétique.
        .sort((a, b) => (a.nom === "Promotions" ? -1 : b.nom === "Promotions" ? 1 : a.nom.localeCompare(b.nom, "fr")));
}

/** Carte au format schema.org « Menu », lue par Google. */
export function carteSchemaOrg(categories: ICategorieCarte[]) {
    return {
        "@context": "https://schema.org",
        "@type": "Menu",
        name: "La carte CHICKEN NATION",
        url: "https://www.chicken-nation.com/fr/restaurants/nos-menus",
        inLanguage: "fr",
        hasMenuSection: categories.map((c) => ({
            "@type": "MenuSection",
            name: c.nom,
            hasMenuItem: c.plats.map((p) => ({
                "@type": "MenuItem",
                name: p.nom,
                ...(p.description ? { description: p.description } : {}),
                ...(p.image.startsWith("http") ? { image: p.image } : {}),
                offers: { "@type": "Offer", price: p.prix, priceCurrency: "XOF" },
            })),
        })),
    };
}
