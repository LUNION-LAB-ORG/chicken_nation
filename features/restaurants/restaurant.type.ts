/**
 * Restaurant tel que le site le garde de `GET /restaurants` (route publique du
 * backend), réduit à une liste blanche : ni le responsable, ni le téléphone,
 * ni l'e-mail du restaurant n'entrent dans les pages ou leurs données.
 */
export interface IRestaurantPublic {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
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
