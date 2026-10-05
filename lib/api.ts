import { Api, ApiConfig } from "ak-api-http";
import { baseURL } from "@/config/api";

// Réglages communs au client du serveur (ci-dessous) et à celui du navigateur
// (lib/api.client.ts).
export const reglagesApi = {
  baseUrl: baseURL, // Base URL de l'API
  timeout: 10000, // Timeout de la requête
  headers: {
    "Content-Type": "application/json", // En-têtes par défaut
  },
  maxRetries: 3, // Nombre de tentatives de re tentative
  retryDelay: 1000, // Delais entre les tentatives
  debug: process.env.NODE_ENV === "development", // Debug seulement en développement : il journalise les jetons
} satisfies Partial<ApiConfig>;

/**
 * Client des routes PUBLIQUES (accueil, promotions, avis, connexion), partagé
 * par tout le processus serveur : il n'envoie JAMAIS de jeton.
 *
 * ak-api-http garde le premier jeton obtenu dans l'instance et le réutilise
 * ensuite pour toutes les requêtes privées : sur un serveur, c'était le jeton
 * du premier membre du personnel connecté, prêté à tous les appelants suivants.
 * Ici la session vaut toujours `null` : rien à garder, et un appel privé passé
 * par erreur avec ce client part sans jeton (refusé par l'API). Le site n'a plus
 * d'espace du personnel ; la commande en ligne passe par son propre client
 * (features/commande/apis/api-client.server.ts).
 */
export const api = new Api({
  ...reglagesApi,
  // Laissée active pour garder les intercepteurs de la bibliothèque (message
  // d'erreur de l'API, nouvelles tentatives sur les erreurs 5xx).
  enableAuth: true,
  getSession: async () => null,
  // Un 401 sur une route publique ne déconnecte personne.
  signOut: async () => {},
});
