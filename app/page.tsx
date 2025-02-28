import About from "@/components/home/about/about";
import Download from "@/components/home/download/download";
// import Faq from "@/components/home/faq/faq";
import Hero from "@/components/home/hero/hero";
import OderFood from "@/components/home/oder-food/oder-food";
import Paiement from "@/components/home/paiement/paiement";
import Service from "@/components/home/service/service";
import Special from "@/components/home/special/special";
import Testimonial from "@/components/home/testimonial/testimonial";



export default function Home() {
  return (
    <div>
      <Hero/>
      <About/>
      <Service/>
      <Special/>
      <Paiement/>
      <OderFood/>
      <Testimonial/>
      <Download/>
      {/* <Faq/> */}
    </div>
  );
}

