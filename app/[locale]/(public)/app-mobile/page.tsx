import Download from "@/components/(public)/common/download";
import { Benefits } from "@/components/(public)/mobile/benefits";
import { BentoGrid } from "@/components/(public)/mobile/bento";
import { FeatureHighlight } from "@/components/(public)/mobile/feature-highlight";
import { FeatureScroll } from "@/components/(public)/mobile/feature-scroll";
import { Features } from "@/components/(public)/mobile/features";
import { Hero } from "@/components/(public)/mobile/hero";
import Testimonials from "@/components/(public)/home/testimonials";

export default function AppMobile() {
  return (
    <>
      <Hero />
      <FeatureScroll />
      <FeatureHighlight />
      <BentoGrid />
      <Benefits />
      <Features />
      <Download />
      <Testimonials />
    </>
  );
}
