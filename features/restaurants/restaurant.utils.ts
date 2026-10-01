import { formatImageUrl } from "@/utils/formatImageUrl";
import { ICreneauJour, IRestaurantPublic } from "./restaurant.type";

const JOURS_COURTS = ["", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
const JOURS_SCHEMA = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function lireHoraires(schedule: string | null): ICreneauJour[] {
    if (!schedule) return [];
    try {
        const jours = JSON.parse(schedule) as Record<string, string>[];
        return jours
            .flatMap((j) => Object.entries(j))
            .map(([jour, plage]) => {
                const [ouverture, fermeture] = plage.split("-");
                return { jour: Number(jour), ouverture, fermeture };
            })
            .filter((c) => c.jour >= 1 && c.jour <= 7 && c.ouverture && c.fermeture)
            .sort((a, b) => a.jour - b.jour);
    } catch {
        return [];
    }
}

// Jours consécutifs aux mêmes horaires regroupés : lundi à jeudi, puis vendredi...
function regrouper(creneaux: ICreneauJour[]) {
    const groupes: { jours: number[]; ouverture: string; fermeture: string }[] = [];
    for (const c of creneaux) {
        const dernier = groupes[groupes.length - 1];
        const suit = dernier && dernier.jours[dernier.jours.length - 1] === c.jour - 1;
        if (suit && dernier.ouverture === c.ouverture && dernier.fermeture === c.fermeture) {
            dernier.jours.push(c.jour);
        } else {
            groupes.push({ jours: [c.jour], ouverture: c.ouverture, fermeture: c.fermeture });
        }
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
    return regrouper(lireHoraires(schedule)).map(({ jours, ouverture, fermeture }) => {
        const premier = JOURS_COURTS[jours[0]];
        const dernier = JOURS_COURTS[jours[jours.length - 1]];
        const libelle =
            jours.length === 1 ? premier : jours.length === 2 ? `${premier} et ${dernier}` : `${premier} au ${dernier}`;
        return `${libelle.charAt(0).toUpperCase()}${libelle.slice(1)} : ${heure(ouverture)} à ${heure(fermeture)}`;
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
            openingHoursSpecification: regrouper(lireHoraires(r.schedule)).map(({ jours, ouverture, fermeture }) => ({
                "@type": "OpeningHoursSpecification",
                dayOfWeek: jours.map((j) => `https://schema.org/${JOURS_SCHEMA[j]}`),
                opens: ouverture,
                closes: fermeture,
            })),
        })),
    };
}
