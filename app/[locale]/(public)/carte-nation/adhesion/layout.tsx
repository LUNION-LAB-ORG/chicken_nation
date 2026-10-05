import { ToastProvider } from "@heroui/toast";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import QueryProvider from "@/providers/query-provider";

/**
 * Fournisseurs du seul formulaire d'adhésion : ses textes traduits (et rien
 * d'autre n'est envoyé au navigateur), la mutation d'envoi (TanStack Query) et
 * les messages d'erreur HeroUI, provisoires jusqu'au nouveau design (lot L10).
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
      <QueryProvider>
        <ToastProvider
          placement="top-center"
          toastProps={{ shouldShowTimeoutProgress: true }}
        />
        {children}
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
