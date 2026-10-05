import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import QueryProvider from "@/providers/query-provider";

/**
 * Fournisseurs du seul formulaire d'adhésion : ses textes traduits (et rien
 * d'autre n'est envoyé au navigateur) et la mutation d'envoi (TanStack Query).
 * Les erreurs d'envoi s'affichent dans le formulaire : plus de toasts HeroUI.
 */
export default async function AdhesionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{ "carte-nation": messages["carte-nation"] }}
    >
      <QueryProvider>{children}</QueryProvider>
    </NextIntlClientProvider>
  );
}
