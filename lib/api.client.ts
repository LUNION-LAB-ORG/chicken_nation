"use client";

import { Api } from "ak-api-http";

import { reglagesApi } from "@/lib/api";

/**
 * Client de l'API appelé depuis le navigateur (ouverture de l'application par
 * un lien : plat, catégorie). Routes publiques seulement : aucun jeton envoyé,
 * comme le client du serveur (lib/api.ts) dont il reprend les réglages
 * (journal de débogage seulement en développement).
 */
export const apiClient = new Api({
  ...reglagesApi,
  // Laissée active pour garder les intercepteurs de la bibliothèque (message
  // d'erreur de l'API, nouvelles tentatives sur les erreurs 5xx).
  enableAuth: true,
  getSession: async () => null,
  // Un 401 sur une route publique ne déconnecte personne.
  signOut: async () => {},
});
