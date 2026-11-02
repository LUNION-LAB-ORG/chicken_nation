"use server";

import type { ResultatEnvoiAvis } from "../types/avis.types";

import { headers } from "next/headers";

import { premierMessage, schemaAvis } from "../schemas/avis.schema";
import { avisRefuseParLimite } from "../utils/limite-avis";
import { ERREURS_AVIS } from "../utils/textes-avis";

import { appelApi } from "@/features/commande/apis/api-client.server";
import { adresseIpVisiteur } from "@/features/commande/utils/adresse-ip.utils";

/**
 * Clé partagée avec l'API (`CLE_SERVEUR_SITE`, la même valeur dans le .env du
 * site et dans celui du serveur). L'API refuse tout envoi d'avis qui ne la
 * porte pas : un script qui l'appellerait en direct, en inventant une adresse
 * à chaque envoi, ne passe plus. Lue à chaque envoi, jamais envoyée au
 * navigateur (pas de préfixe NEXT_PUBLIC).
 */
const ENTETE_CLE_SITE = "X-Cle-Site";

function cleDuSite(): string | null {
  const cle = (process.env.CLE_SERVEUR_SITE ?? "").trim();

  return cle || null;
}

async function ipDuVisiteur(): Promise<string | null> {
  try {
    const h = await headers();

    return adresseIpVisiteur((nom) => h.get(nom));
  } catch {
    return null;
  }
}

/**
 * Envoi d'un avis de la page « Ton avis compte » (/fr/avis).
 *
 * Action serveur : Next refuse un appel venu d'une autre origine. Dans
 * l'ordre, comme le formulaire de contact :
 *  1. champ piège rempli (robot) : « envoyé », sans rien appeler ni compter ;
 *  2. données revérifiées (schéma zod, mêmes règles que le navigateur) ;
 *  3. limite en mémoire : 5 envois par IP, 60 au total, par 15 minutes ;
 *  4. POST /avis-prives par le serveur du site, sans jeton, avec la clé du
 *     site (X-Cle-Site) et l'adresse du visiteur en X-Forwarded-For
 *     (appelApi) : l'API garde ses barrières.
 * Clé absente du .env du site : rien ne part (l'API refuserait), l'erreur
 * est écrite au journal du serveur du site.
 * Erreurs : le message de l'API pour un refus (400) ou une limite (429),
 * sinon une phrase simple (API injoignable, réponse inattendue).
 */
export async function envoyerAvisAction(
  envoi: unknown,
): Promise<ResultatEnvoiAvis> {
  const piege = (envoi as { site_web?: unknown } | null)?.site_web;

  if (typeof piege === "string" && piege.trim()) return { ok: true };

  const verifie = schemaAvis.safeParse(envoi);

  if (!verifie.success)
    return { ok: false, message: premierMessage(verifie.error) };

  if (avisRefuseParLimite(await ipDuVisiteur()))
    return { ok: false, message: ERREURS_AVIS.tropDEnvois };

  const cle = cleDuSite();

  if (!cle) {
    // eslint-disable-next-line no-console -- journal du serveur : réglage manquant
    console.error(
      "CLE_SERVEUR_SITE absente du .env du site : les avis ne peuvent pas partir.",
    );

    return { ok: false, message: ERREURS_AVIS.panne };
  }

  const res = await appelApi<{ ok?: boolean }>("/avis-prives", {
    methode: "POST",
    corps: verifie.data,
    public: true,
    entetes: { [ENTETE_CLE_SITE]: cle },
  });

  if (res.ok) return { ok: true };
  if (res.statut === 400 || res.statut === 429)
    return { ok: false, message: res.message };

  return { ok: false, message: ERREURS_AVIS.panne };
}
