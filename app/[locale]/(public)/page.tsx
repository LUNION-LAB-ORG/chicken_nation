import CarteNationBannerFlottant from "@/components/(public)/common/carte-nation/CarteNationBannerFlottant";
import CarteNationCTA from "@/components/(public)/common/carte-nation/CarteNationCTA";
import About from "@/components/(public)/home/about";
import Hero from "@/components/(public)/home/hero";
import OderFood from "@/components/(public)/home/oder-food";
import Service from "@/components/(public)/home/service";
import Special from "@/components/(public)/home/special";
import Testimonials from "@/components/(public)/home/testimonials";
import { DESCRIPTION_ACCUEIL, pageMetadata } from "../meta";
import { setRequestLocale } from "next-intl/server";

// Statique, reconstruite au plus tous les quarts d'heure (promotions et avis lus dans l'API).
export const revalidate = 900;

// Le titre de l'accueil est TITRE_ACCUEIL (meta.ts), repris par pageMetadata.
export const metadata = pageMetadata({
  chemin: "/",
  description: DESCRIPTION_ACCUEIL,
});

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <CarteNationBannerFlottant />
      <About />
      <Service />
      <Special />
      <CarteNationCTA />
      <OderFood />
      <Testimonials />
      {/* <Faq/> */}
    </>
  );
}
