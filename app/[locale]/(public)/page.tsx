import CarteNationBannerFlottant from "@/components/(public)/common/carte-nation/CarteNationBannerFlottant";
import CarteNationCTA from "@/components/(public)/common/carte-nation/CarteNationCTA";
import Download from "@/components/(public)/common/download";
import About from "@/components/(public)/home/about";
import Hero from "@/components/(public)/home/hero";
import OderFood from "@/components/(public)/home/oder-food";
import Service from "@/components/(public)/home/service";
import Special from "@/components/(public)/home/special";
import Testimonials from "@/components/(public)/home/testimonials";

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
      <Download />
      {/* <Faq/> */}
    </>
  );
}
