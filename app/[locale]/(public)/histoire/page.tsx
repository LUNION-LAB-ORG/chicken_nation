import About from "@/components/(public)/history/about";
import Asset from "@/components/(public)/history/asset";
import Partener from "@/components/(public)/history/partener";
import Quality from "@/components/(public)/history/quality";
import Skill from "@/components/(public)/history/skill";
import Team from "@/components/(public)/history/team";
import OderFood from "@/components/(public)/home/oder-food";
import HeroSection from "@/components/(public)/common/hero-section";
import { pageMetadata } from "../../meta";
import { setRequestLocale } from "next-intl/server";

export const metadata = pageMetadata({
  chemin: "/histoire",
  titre: "Notre histoire",
  description:
    "L'histoire de CHICKEN NATION : un poulet 100% local, élevé dans nos propres fermes en Côte d'Ivoire et servi croustillant ou grillé à Abidjan.",
});

export default async function History({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

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
