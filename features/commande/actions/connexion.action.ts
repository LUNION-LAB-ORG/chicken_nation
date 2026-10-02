"use server";

import { appelApi, effacerJetonClient, lireJetonClient, poserJetonClient } from "../apis/api-client.server";
import type { IClient, Resultat } from "../types/commande.types";
import { normaliserMobileCI } from "../utils/panier.utils";

function versClient(brut: Record<string, unknown>): IClient {
  return {
    id: String(brut.id),
    phone: String(brut.phone ?? ""),
    first_name: (brut.first_name as string) || null,
    last_name: (brut.last_name as string) || null,
    email: (brut.email as string) || null,
  };
}

/** Envoie le code de connexion sur WhatsApp (SMS si WhatsApp échoue). */
export async function demanderCodeAction(saisie: string): Promise<Resultat<{ telephone: string }>> {
  const telephone = normaliserMobileCI(saisie);
  if (!telephone) return { ok: false, message: "Saisissez un numéro mobile ivoirien à 10 chiffres (07, 05 ou 01)." };
  const res = await appelApi("/auth/customer/login", { methode: "POST", corps: { phone: telephone }, public: true });
  return res.ok ? { ok: true, data: { telephone } } : res;
}

/** Vérifie le code ; en cas de succès, la session est posée dans le cookie. */
export async function verifierCodeAction(telephone: string, code: string): Promise<Resultat<IClient>> {
  if (!/^\d{4}$/.test(code)) return { ok: false, message: "Le code compte 4 chiffres." };
  const res = await appelApi<Record<string, unknown> & { token?: string }>("/auth/customer/verify-otp", {
    methode: "POST",
    corps: { phone: telephone, otp: code },
    public: true,
  });
  if (!res.ok) {
    // « Code OTP invalide » : jargon du serveur, pas du client.
    return /otp/i.test(res.message) && /invalide|expir/i.test(res.message)
      ? { ok: false, message: "Code incorrect ou expiré. Vérifiez le message WhatsApp ou demandez un nouveau code." }
      : res;
  }
  if (!res.data.token) return { ok: false, message: "Connexion impossible. Réessayez." };
  await poserJetonClient(res.data.token);
  return { ok: true, data: versClient(res.data) };
}

export async function obtenirClientAction(): Promise<IClient | null> {
  if (!(await lireJetonClient())) return null;
  const res = await appelApi<Record<string, unknown>>("/customer/detail");
  return res.ok ? versClient(res.data) : null;
}

/** Prénom et nom d'un nouveau client (le serveur crée le compte au premier code). */
export async function completerProfilAction(prenom: string, nom: string): Promise<Resultat<IClient>> {
  const p = prenom.trim();
  const n = nom.trim();
  if (!p || !n) return { ok: false, message: "Indiquez votre prénom et votre nom." };
  if (p.length > 60 || n.length > 60) return { ok: false, message: "Prénom ou nom trop long." };
  const formulaire = new FormData();
  formulaire.append("first_name", p);
  formulaire.append("last_name", n);
  const res = await appelApi<Record<string, unknown>>("/customer", { methode: "PATCH", corps: formulaire });
  if (!res.ok) return res;
  const client = await obtenirClientAction();
  return client ? { ok: true, data: client } : { ok: false, message: "Profil enregistré, mais illisible. Rechargez la page." };
}

export async function deconnexionAction() {
  await effacerJetonClient();
}
