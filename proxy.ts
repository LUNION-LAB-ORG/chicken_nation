import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "@/lib/auth";

export const publicRoutes = ["/", "/app-mobile", "/contact", "/faq", "/franchise", "/histoire", "/politique", "/restaurants", "/sign-up"];

// Middleware d'internationalisation
const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(req: NextRequest) {
  // Récupération du chemin de la requête avec le locale
  const { pathname } = req.nextUrl;

  // Vérification de la session
  const session = await auth();

  // Suppression du locale du chemin
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

  // Vérification si la page est publique
  const isPublicPage = publicRoutes.some(route => pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/'));

  // Si la page est publique, on retourne le middleware d'internationalisation
  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    // Si la page est protégée et qu'il n'y a pas de session, on redirige vers la page de connexion
    if (!session) {
      const locale = pathname.split("/")[1] || routing.defaultLocale;

      // Récupération de la callbackUrl
      let callbackUrl = pathname;
      if (req.nextUrl.search) {
        callbackUrl += req.nextUrl.search;
      }

      // Encodage de la callbackUrl
      const encodedCallbackUrl = encodeURIComponent(callbackUrl);

      // Création de l'URL de connexion
      const loginUrl = new URL(`${locale}/auth/login?callbackUrl=${encodedCallbackUrl}`, req.url);

      // Redirection vers la page de connexion
      return NextResponse.redirect(loginUrl);
    }

    // Si la page est protégée et qu'il y a une session, on retourne le middleware d'internationalisation
    return intlMiddleware(req);
  }
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|_vercel|api|trpc).*)",// → match tout sauf fichiers statiques, _next, vercel, api et trpc.
  ]
};