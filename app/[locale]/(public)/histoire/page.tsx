import About from "@/components/(public)/history/about";
import Asset from "@/components/(public)/history/asset";
import Partener from "@/components/(public)/history/partener";
import Quality from "@/components/(public)/history/quality";
import Skill from "@/components/(public)/history/skill";
import Team from "@/components/(public)/history/team";
import OderFood from "@/components/(public)/home/oder-food";
import HeroSection from "@/components/(public)/common/hero-section";

export default function History() {
  return (
    <>
      <HeroSection
        title="HISTOIRE"
        src="/assets/videos/video.mp4"
        type="video"
      />
      <About />
      <Quality />
      <Partener />
      <OderFood />
      <Skill />
      <Team />
      <Asset />
    </>
  );
}
