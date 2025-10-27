import Commitment from "@/components/(public)/franchise/commitment";
import Contact from "@/components/(public)/franchise/contact";
import HeroSection from "@/components/(public)/common/hero-section";
import Info from "@/components/(public)/franchise/info";

export default function Franchise() {
  return (
    <div>
      <HeroSection
        title="FRANCHISE"
        src="/assets/images/backgrounds/bg-franchise.png"
      />
      <Info />
      <Commitment />
      <Contact />
    </div>
  );
}
