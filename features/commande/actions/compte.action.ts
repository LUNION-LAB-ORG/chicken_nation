"use server";

import type { Resultat } from "../types/commande.types";
import type { ICompteClient } from "../utils/suivi.utils";

import { appelApi } from "../apis/api-client.server";
import { versCompte } from "../utils/suivi.utils";

import { obtenirClientAction } from "./connexion.action";

type Brut = Record<string, unknown>;

/**
 * Bloc « Mon compte » de Mes commandes : points utilisables, niveau de la
 * Carte de la Nation, cadeaux à utiliser et règles des points, lus sur l'API
 * comme dans l'application. Le client est relu ici avec le jeton, jamais reçu
 * du navigateur. Chaque partie peut manquer sans l'autre (null) ; la page
 * reste utilisable sans elles.
 */
export async function lireCompteAction(): Promise<Resultat<ICompteClient>> {
  const client = await obtenirClientAction();

  if (!client) return { ok: false, message: "Connectez-vous pour continuer." };
  const [reglages, compte, cadeaux] = await Promise.all([
    appelApi<Brut>("/fidelity/loyalty/config", { public: true }),
    appelApi<Brut>(
      `/fidelity/loyalty/customer/${encodeURIComponent(client.id)}`,
    ),
    appelApi<Brut[]>("/fidelity/rewards/redeemable-gifts"),
  ]);

  return {
    ok: true,
    data: versCompte(
      reglages.ok ? reglages.data : null,
      compte.ok ? compte.data : null,
      cadeaux.ok ? cadeaux.data : null,
    ),
  };
}
