import type { Metadata } from "next";

import { setRequestLocale } from "next-intl/server";

import QueryProvider from "@/providers/query-provider";

// Page technique d'ouverture de l'application : rien à indexer.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// La page est un composant client : la langue est fixée ici. QueryProvider sert
// aux mutations qui retrouvent le plat ou la catégorie et notent le clic.
export default async function DeepLinkLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <QueryProvider>{children}</QueryProvider>;
}
