"use client";

import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import Motion from "@/lib/motion";
import Image from "next/image";

export default function Pub() {
  return (
    <Motion variant="verticalSlideIn">
    <div className="relative w-full h-[200px] md:h-screen overflow-hidden rounded-2xl">
      {/* Background Pattern */}
      <Image
        className="absolute object-contain md:object-cover w-full"
        src="/assets/images/illustrations/histoire/couverture.png"
        alt="title"
        fill
        priority
        sizes="100vw"
      />

      {/* Overlay */}
      <div className="bg-black/30 w-full h-full absolute inset-0"></div>

      {/* Video Dialog */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
        <HeroVideoDialog
          className="relative w-full h-auto"
          // animationStyle="from-center"
          videoSrc="/assets/videos/PRESENTATION ANGRE.mp4"
          thumbnailSrc="/assets/images/illustrations/histoire/couverture.png"
          thumbnailAlt="Découvrez Notre Histoire"
        />
      </div>
    </div>
    </Motion>
  );
}
