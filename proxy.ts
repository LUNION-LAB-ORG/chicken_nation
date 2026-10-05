import createIntlMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Middleware d'internationalisation seul : le site n'a plus aucune page
 * protégée (le tableau de bord du personnel est supprimé). Une adresse sans
 * langue part vers /fr (307), une adresse inconnue sous /fr répond une vraie 404
 * (app/global-not-found.tsx). Une nouvelle page publique n'a rien à déclarer ici.
 *
 * Les redirections permanentes (/en, /ar, franchise, ancienne carte) sont dans
 * next.config.mjs, traitées avant ce fichier.
 */
export default createIntlMiddleware(routing);

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|_vercel|api|trpc).*)", // → match tout sauf fichiers statiques, _next, vercel, api et trpc.
  ],
};
