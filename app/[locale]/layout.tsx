import "@/styles/globals.css";

import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { MesureSignaux } from "@/components/site/mesure/MesureSignaux";
import { classesPolices } from "@/config/fonts";
import { routing } from "@/i18n/routing";
import { SCRIPT_GA } from "@/lib/analytique";

// Une seule langue, connue à la construction : les pages qui ne lisent ni
// cookie ni paramètre d'adresse sont pré-construites (statiques ou revalidées).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Mise en page racine, réduite au strict nécessaire : plus aucun fournisseur
 * global (requêtes, session, notifications, sens de lecture, traductions).
 * Chacun est posé au plus près de la page qui s'en sert : seul le formulaire
 * d'adhésion reçoit des messages traduits (carte-nation/adhesion/layout.tsx).
 * Les composants du navigateur qui ont besoin de la langue la lisent dans
 * l'adresse (/fr) : aucun fournisseur next-intl n'est envoyé ailleurs.
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
    // Variables des polices sur <html> : les jetons --font-texte et
    // --font-affiche (styles/globals.css) y sont résolus.
    <html className={classesPolices} lang="fr">
      <body className="min-h-screen bg-papier font-texte text-encre antialiased">
        {children}
        <MesureSignaux />
        {/* Google Analytics chargé après la page, au repos (lib/analytique.ts). */}
        <script
          dangerouslySetInnerHTML={{ __html: SCRIPT_GA }}
          id="mesure-ga"
        />
      </body>
    </html>
  );
}
