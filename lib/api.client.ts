"use client";

import { Api } from "ak-api-http";
import { baseURL } from "@/config/api";

import { getSession } from "next-auth/react";

export const apiClient = new Api({
  baseUrl: baseURL, // Base URL de l'API
  timeout: 10000, // Timeout de la requête
  headers: {
    "Content-Type": "application/json", // En-têtes par défaut
  },
  maxRetries: 3, // Nombre de tentatives de re tentative
  retryDelay: 1000, // Delais entre les tentatives
  enableAuth: true, // Authentification activée
  getSession: async () => {
    const session = await getSession();
    return { accessToken: (session as any)?.user?.accessToken ?? "" }

  },// Récupération du token
  signOut: async () => {
  }, // Déconnexion automatique si la requête échoue avec un code 401
  debug: true, // Debug activé en mode développement
});