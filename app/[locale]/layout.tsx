import "@/styles/globals.css";
import { ToastProvider } from "@heroui/toast";
import { Metadata, Viewport } from "next";

import { ThemeProviders } from "@/providers/theme.provider";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { fontSans, fontTitle } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import AuthProvider from "@/providers/auth.provider";
import QueryProvider from "@/providers/query-provider";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import DirectionProvider from "@/providers/direction-provider";
import MountedProvider from "@/providers/mounted.provider";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLangDir } from "rtl-detect";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Bienvenue chez Chicken Nation",
    description:
      "Née de la passion pour le poulet de qualité, Chicken Nation s'est établie comme une référence en matière de restauration rapide en Côte d'Ivoire.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return notFound();
  }
  const messages = await getMessages();
  const direction = getLangDir(locale);

  return (
    <html lang="en" dir={direction} suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.className,
          fontTitle.variable
        )}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <QueryProvider>
            <ThemeProviders
              themeProps={{ attribute: "class", defaultTheme: "dark" }}
            >
              <ToastProvider
                placement="top-center"
                toastProps={{ shouldShowTimeoutProgress: true }}
              />
              <NuqsAdapter>
                <AuthProvider>
                  <MountedProvider>
                    <DirectionProvider direction={direction}>
                      {children}
                    </DirectionProvider>
                  </MountedProvider>
                </AuthProvider>
              </NuqsAdapter>
            </ThemeProviders>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
