import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";
// Seuls messages traduits du site : le formulaire de la Carte de la Nation.
// Import statique : plus de lecture du disque à chaque requête.
import adhesion from "./messages/fr/(public)/carte-nation/adhesion.json";

export default getRequestConfig(async ({ requestLocale }) => {
  // Langue demandée (fixée par setRequestLocale dans les pages), sinon le français.
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: { "carte-nation": { adhesion } },
  };
});
