import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

import { Providers } from "@/providers/providers";
import Head from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--poppins",
  subsets: ["latin"],
  weight: ["500"],
});

const title = localFont({
  src: "../public/assets/fonts/balbeer/Balbeer-Rustic.ttf",
  variable: "--font-title",
});

export const metadata: Metadata = {
  title: "Chicken Nation",
  description:
    "Née de la passion pour le poulet de qualité, Chicken Nation s'est établie comme une référence en matière de restauration rapide en Côte d'Ivoire.",
    openGraph: {
      title: 'Bienvenue chez Chicken Nation',
      description: "Née de la passion pour le poulet de qualité, Chicken Nation s'est établie comme une référence en matière de restauration rapide en Côte d'Ivoire.",
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${title.variable} antialiased`}
      >
        <div className="font-poppins max-w-screen-2xl mx-auto ">
          <Head />
          <Providers>
            {children}
            </Providers>
          <Footer />
        </div>
      </body>
    </html>
  );
}
