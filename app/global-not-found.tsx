import "@/styles/globals.css";

import type { Metadata } from "next";

import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import PublicLayout from "./[locale]/(public)/layout";
import PageIntrouvable from "./[locale]/(public)/not-found";

import { classesPolices } from "@/config/fonts";
import { routing } from "@/i18n/routing";

// Next ajoute lui-même `noindex` à toute réponse 404.
export const metadata: Metadata = {
  title: "Page introuvable | CHICKEN NATION",
};

/**
 * 404 de toute adresse qui ne correspond à aucune page (/fr/xyz, ancien
 * tableau de bord...). Next la sert directement, sans passer par la mise en
 * page racine : elle redonne donc le document, la langue, les polices et la
 * mise en page publique (en-tête, pied de page), avec le contenu de
 * [locale]/(public)/not-found.tsx.
 *
 * Pourquoi pas une page « attrape-tout » qui appelle notFound() : React ne
 * rend pas les limites d'erreur côté serveur. Next renvoyait alors un HTML
 * vide (<html id="__next_error__">, sans langue) complété dans le navigateur.
 * Ici la page est entière dès le serveur, avec le code 404.
 *
 * Les classes de <html> et du <body> doivent rester celles de
 * app/[locale]/layout.tsx.
 */
export default function GlobalNotFound() {
  setRequestLocale(routing.defaultLocale);

  return (
    <html className={classesPolices} lang="fr">
      <body className="min-h-screen bg-papier font-texte text-encre antialiased">
        <NextIntlClientProvider locale={routing.defaultLocale} messages={null}>
          <PublicLayout>
            <PageIntrouvable />
          </PublicLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
