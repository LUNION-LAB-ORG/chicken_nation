import type { NextRequest } from "next/server";

import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { redirectionPlat } from "./components/site/carte/redirection-plat";
import { routing } from "./i18n/routing";

const intl = createIntlMiddleware(routing);

/**
 * Middleware d'internationalisation, plus la redirection des anciennes
 * adresses de plats. Le site n'a plus aucune page protégée (le tableau de
 * bord du personnel est supprimé). Une adresse sans langue part vers /fr
 * (307), une adresse inconnue sous /fr répond une vraie 404
 * (app/global-not-found.tsx). Une nouvelle page publique n'a rien à déclarer ici.
 *
 * Les redirections permanentes (/en, /ar, franchise, ancienne carte) sont dans
 * next.config.mjs, traitées avant ce fichier.
 *
 * `/fr/carte/<ancienne adresse>` (plat renommé ou retiré) : 308 décidé ici,
 * hors de tout cache de page (components/site/carte/redirection-plat.ts).
 * Location relatif (Next le réécrit ainsi pour le même hôte), comme les
 * redirections de next.config.mjs. Les paramètres (utm…) sont gardés.
 */
export default async function proxy(req: NextRequest) {
  const chemin = await redirectionPlat(req.nextUrl.pathname);

  if (chemin) {
    const [sansAncre, ancre] = chemin.split("#");
    const url = req.nextUrl.clone();

    url.pathname = sansAncre;
    url.hash = ancre ? `#${ancre}` : "";

    // Next réécrit l'adresse en Location relatif (même hôte que la demande).
    return NextResponse.redirect(url, 308);
  }

  // Page d'un restaurant écrite avec des capitales (/fr/restaurants/Zone-4) :
  // une seule adresse, en minuscules.
  const restaurant = req.nextUrl.pathname.match(/^\/fr\/restaurants\/([^/]+)$/);

  if (restaurant && /[A-Z]/.test(restaurant[1])) {
    const url = req.nextUrl.clone();

    url.pathname = `/fr/restaurants/${restaurant[1].toLowerCase()}`;

    return NextResponse.redirect(url, 308);
  }

  return intl(req);
}

export const config = {
  matcher: [
    // → match tout sauf les fichiers statiques (extensions servies par le site :
    // public/, icônes, manifeste, robots, sitemap), _next, vercel, api et trpc,
    // et les fichiers des liens vers l'appli (/.well-known/…,
    // /apple-app-site-association) : Apple et Android les lisent tels quels,
    // sans suivre de redirection vers /fr. Une autre adresse avec un point
    // (/foo.php, robots qui sondent) passe par ici : /fr/foo.php, la vraie 404
    // française, au lieu de la page d'erreur anglaise par défaut de Next.
    "/((?!_next|_vercel|api|trpc|\\.well-known/|apple-app-site-association|.+\\.(?:png|jpe?g|webp|avif|gif|svg|ico|txt|xml|webmanifest|json|js|mjs|css|map|mp4|webm|woff2?|ttf|otf|pdf)$).*)",
  ],
};
