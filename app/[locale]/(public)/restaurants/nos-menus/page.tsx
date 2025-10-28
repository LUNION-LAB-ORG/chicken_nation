import Download from "@/components/(public)/common/download";
import HeroSection from "@/components/(public)/common/hero-section";
import ListPlats from "@/components/(public)/restaurant/list-plats";

export default function Marcory() {
  return (
    <>
      <HeroSection
        title="NOS MENUS"
        src="/assets/images/backgrounds/restaurant-detail.png"
      />
      <ListPlats />
      <Download />
    </>
  );
}
