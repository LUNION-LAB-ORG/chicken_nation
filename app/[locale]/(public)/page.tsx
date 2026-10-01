import CarteNationBannerFlottant from "@/components/(public)/common/carte-nation/CarteNationBannerFlottant";
import CarteNationCTA from "@/components/(public)/common/carte-nation/CarteNationCTA";
import About from "@/components/(public)/home/about";
import Hero from "@/components/(public)/home/hero";
import OderFood from "@/components/(public)/home/oder-food";
import Service from "@/components/(public)/home/service";
import Special from "@/components/(public)/home/special";
import Testimonials from "@/components/(public)/home/testimonials";
import { pageMetadata } from "../meta";

export const metadata = pageMetadata({
  chemin: "/",
  description:
    "CHICKEN NATION, la référence du fast-food à Abidjan. Poulet 100% local élevé dans nos fermes. Croustillant, grillé ou épicé. Livraison en 20 à 35 min. Restaurants à Zone 4, Angré, Sococé et Faya.",
});

export default function Home() {
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
