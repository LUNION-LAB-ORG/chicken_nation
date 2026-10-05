/* eslint-disable @typescript-eslint/no-unused-vars -- types globaux (fichier sans import ni export) : les composants des avis les utilisent sans les importer. */

/**
 * Avis client tel que le renvoie la route publique `GET /comments/bests`
 * (backend `avis-public.util.ts`) : ni téléphone, ni photo, ni commande.
 */
interface ICommentaire {
  id: string;
  message: string;
  /** Note de 1 à 5. */
  rating: number;
  created_at: string;
  customer: {
    /** Prénom ; absent si l'API renvoie null. */
    first_name?: string;
    /** Initiale du nom seulement (« K »), jamais le nom entier ; absente si l'API renvoie null. */
    last_name?: string;
  };
}

type ObtenirCommentairesParams = {
  page?: number;
  limit?: number;
  min_rating?: number;
  max_rating?: number;
  restaurantId?: string;
};
