import About from "@/components/home/about/about";
import Hero from "@/components/home/hero/hero";
import Service from "@/components/home/service/service";
import Special from "@/components/home/special/special";



export default function Home() {
  return (
    <div>
      <Hero/>
      <About/>
      <Service/>
      <Special/>
    </div>
  );
}

