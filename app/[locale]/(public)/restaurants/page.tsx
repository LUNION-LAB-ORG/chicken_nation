import Special from "@/components/(public)/home/special";
import List from "@/components/(public)/restaurant/list";
import HeroSection from "@/components/(public)/common/hero-section";

export default function Restaurants() {
  return (
    <div>
      <HeroSection
        title="NOS RESTAURANTS"
        src="/assets/images/backgrounds/restaurant.png"
      />
      <List />
      <Special />
    </div>
  );
}
