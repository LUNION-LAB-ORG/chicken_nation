import About from "@/components/(public)/home/about";
import Download from "@/components/(public)/common/download";
import Hero from "@/components/(public)/home/hero";
import OderFood from "@/components/(public)/home/oder-food";
import Service from "@/components/(public)/home/service";
import Special from "@/components/(public)/home/special/special";
import Testimonial from "@/components/(public)/home/testimonial";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Service />
      <Special />
      <OderFood />
      <Testimonial />
      <Download />
      {/* <Faq/> */}
    </>
  );
}
