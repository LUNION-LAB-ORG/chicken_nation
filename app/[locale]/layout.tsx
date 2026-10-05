import "@/styles/globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import { fontSans, fontTitle } from "@/config/fonts";

// Une seule langue, connue à la construction : les pages qui ne lisent ni
// cookie ni paramètre d'adresse sont pré-construites (statiques ou revalidées).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Mise en page racine, réduite au strict nécessaire : plus aucun fournisseur
 * global (requêtes, session, notifications, sens de lecture). Chacun est posé
 * au plus près de la page qui s'en sert.
 */
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang="fr">
      <body
        className={cn(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.className,
          fontTitle.variable,
        )}
      >
        <GoogleAnalytics gaId="G-W7K9L1RZ8E" />

        {/* Aucun message envoyé au navigateur (`null` coupe l'héritage) : seul
            le formulaire d'adhésion en a besoin et reçoit les siens
            (carte-nation/adhesion/layout.tsx). */}
        <NextIntlClientProvider locale={locale} messages={null}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
