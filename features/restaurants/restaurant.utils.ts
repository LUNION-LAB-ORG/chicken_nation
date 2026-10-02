import { formatImageUrl } from "@/utils/formatImageUrl";
import { ICreneauJour, IRestaurantPublic } from "./restaurant.type";

const JOURS_COURTS = ["", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
const JOURS_SCHEMA = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Plages d'ouverture, une entrée par plage : un jour peut en avoir plusieurs,
 * séparées par une virgule ("10:00-14:00,18:00-23:00"), comme le lit le
 * serveur (RestaurantService.isRestaurantOpen). « Fermé » et toute valeur
 * illisible sont ignorés.
 */
export function lireHoraires(schedule: string | null): ICreneauJour[] {
    if (!schedule) return [];
    try {
        const jours = JSON.parse(schedule) as Record<string, string>[];
        return jours
            .flatMap((j) => Object.entries(j))
            .flatMap(([jour, plages]) =>
                String(plages)
                    .split(",")
                    .map((plage) => plage.trim().split("-").map((h) => h.trim()))
                    .filter((parts) => parts.length === 2 && parts.every((h) => /^\d{1,2}:\d{2}$/.test(h)))
                    .map(([ouverture, fermeture]) => ({ jour: Number(jour), ouverture, fermeture })),
            )
            .filter((c) => c.jour >= 1 && c.jour <= 7)
            .sort((a, b) => a.jour - b.jour || a.ouverture.localeCompare(b.ouverture));
    } catch {
        return [];
    }
}

type Plage = { ouverture: string; fermeture: string };

// Jours consécutifs aux mêmes plages regroupés : lundi à jeudi, puis vendredi...
function regrouper(creneaux: ICreneauJour[]) {
    const parJour = new Map<number, Plage[]>();
    for (const c of creneaux) parJour.set(c.jour, [...(parJour.get(c.jour) ?? []), c]);
    const groupes: { jours: number[]; plages: Plage[] }[] = [];
    const cle = (p: Plage[]) => p.map((x) => `${x.ouverture}-${x.fermeture}`).join(",");
    for (const [jour, plages] of Array.from(parJour.entries()).sort((a, b) => a[0] - b[0])) {
        const dernier = groupes[groupes.length - 1];
        const suit = dernier && dernier.jours[dernier.jours.length - 1] === jour - 1;
        if (suit && cle(dernier.plages) === cle(plages)) dernier.jours.push(jour);
        else groupes.push({ jours: [jour], plages });
    }
    return groupes;
}

// "10:00" → "10h", "00:30" → "0h30", "00:00" → "minuit"
function heure(h: string) {
    if (h === "00:00") return "minuit";
    const [hh, mm] = h.split(":");
    return `${Number(hh)}h${mm === "00" ? "" : mm}`;
}

export function horairesLisibles(schedule: string | null): string[] {
    return regrouper(lireHoraires(schedule)).map(({ jours, plages }) => {
        const premier = JOURS_COURTS[jours[0]];
        const dernier = JOURS_COURTS[jours[jours.length - 1]];
        const libelle =
            jours.length === 1 ? premier : jours.length === 2 ? `${premier} et ${dernier}` : `${premier} au ${dernier}`;
        const heures = plages.map((p) => `${heure(p.ouverture)} à ${heure(p.fermeture)}`).join(" et ");
        return `${libelle.charAt(0).toUpperCase()}${libelle.slice(1)} : ${heures}`;
    });
}

// "CHICKEN NATION ZONE 4" → "Zone 4"
export function nomCourt(nom: string) {
    const sansMarque = nom.replace(/^CHICKEN NATION\s+/i, "").trim();
    return sansMarque
        .toLowerCase()
        .split(" ")
        .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
        .join(" ")
        // La base enregistre ces noms sans accent.
        .replace(/\bAngre\b/, "Angré")
        .replace(/\bSococe\b/, "Sococé");
}

// "0720353535" → "07 20 35 35 35"
export function telephoneLisible(tel: string) {
    const chiffres = tel.replace(/\D/g, "").replace(/^225/, "");
    return chiffres.length === 10 ? chiffres.replace(/(\d{2})(?=\d)/g, "$1 ") : tel;
}

export function lienItineraire(r: IRestaurantPublic) {
    if (r.latitude == null || r.longitude == null) return null;
    return `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`;
}

export function imageRestaurant(r: IRestaurantPublic) {
    return r.image ? formatImageUrl(r.image) : "/assets/images/illustrations/restaurant/marcory-1.png";
}

/** Fiche schema.org « Restaurant » : adresse, position et horaires lus par Google. */
export function restaurantsSchemaOrg(restaurants: IRestaurantPublic[]) {
    return {
        "@context": "https://schema.org",
        "@graph": restaurants.map((r) => ({
            "@type": "Restaurant",
            "@id": `https://www.chicken-nation.com/fr/restaurants#${r.id}`,
            name: `CHICKEN NATION ${nomCourt(r.name)}`,
            brand: { "@id": "https://www.chicken-nation.com" },
            url: "https://www.chicken-nation.com/fr/restaurants",
            menu: "https://www.chicken-nation.com/fr/restaurants/nos-menus",
            servesCuisine: ["Poulet", "Fast-food", "Halal"],
            ...(r.image ? { image: imageRestaurant(r) } : {}),
            ...(r.phone ? { telephone: `+225 ${telephoneLisible(r.phone)}` } : {}),
            ...(r.address
                ? {
                      address: {
                          "@type": "PostalAddress",
                          streetAddress: r.address.replace(/,\s*Abidjan.*$/i, ""),
                          addressLocality: "Abidjan",
                          addressCountry: "CI",
                      },
                  }
                : {}),
            ...(r.latitude != null && r.longitude != null
                ? { geo: { "@type": "GeoCoordinates", latitude: r.latitude, longitude: r.longitude } }
                : {}),
            openingHoursSpecification: regrouper(lireHoraires(r.schedule)).flatMap(({ jours, plages }) =>
                plages.map((p) => ({
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: jours.map((j) => `https://schema.org/${JOURS_SCHEMA[j]}`),
                    opens: p.ouverture,
                    closes: p.fermeture,
                })),
            ),
        })),
    };
}
