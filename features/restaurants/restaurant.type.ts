// Restaurant tel que renvoyé par GET /restaurants (route publique du backend).
export interface IRestaurantPublic {
    id: string;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    email: string | null;
    image: string | null;
    // JSON en texte : [{"1":"10:00-00:00"}, ...], 1 = lundi, 7 = dimanche.
    schedule: string | null;
    entity_status: string;
}

export interface ICreneauJour {
    jour: number;
    ouverture: string;
    fermeture: string;
}
