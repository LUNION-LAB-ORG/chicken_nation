import "@/styles/globals.css";
import { ToastProvider } from "@heroui/toast";
import { Metadata } from "next";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { getMetadata, Lang } from "@/app/[locale]/meta";
import { fontSans, fontTitle } from "@/config/fonts";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import AuthProvider from "@/providers/auth.provider";
import DirectionProvider from "@/providers/direction-provider";
import QueryProvider from "@/providers/query-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLangDir } from "rtl-detect";

// Generate metadata for each locale
export async function generateMetadata({
  params,
}: {
  params: { lang: Lang };
}): Promise<Metadata> {
  return getMetadata(params.lang);
}

// Define default layout
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
    <html lang="fr" dir={direction} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.className,
          fontTitle.variable
        )}
      >
        {/* <GoogleTagManager gtmId="G-W7K9L1RZ8E" /> */}
        <GoogleAnalytics gaId="G-W7K9L1RZ8E" />

        <NextIntlClientProvider messages={messages} locale={locale}>
          <QueryProvider>
            {/* <ThemeProviders
              themeProps={{ attribute: "class", defaultTheme: "light" }}
            > */}
            <ToastProvider
              placement="top-center"
              toastProps={{ shouldShowTimeoutProgress: true }}
            />
            <NuqsAdapter>
              <AuthProvider>
                {/* <MountedProvider> */}
                <DirectionProvider direction={direction}>
                  {children}
                </DirectionProvider>
                {/* </MountedProvider> */}
              </AuthProvider>
            </NuqsAdapter>
            {/* </ThemeProviders> */}
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
