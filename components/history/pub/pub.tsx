"use client";

import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import Motion from "@/lib/motion";
import Image from "next/image";

export default function Pub() {
  return (

    <section className="relative w-full bg-white overflow-hidden px-4 py-6 lg:py-16 md:p-20 lg:p-32">
    {/* Main content container */}
    <Motion variant="verticalSlideIn">
    <div className="relative w-full px-4">
      <div className="relative flex flex-col md:flex-row items-center justify-center">
          <Motion variant="verticalSlideIn" className="w-full">
          <div className="bg-green-900 relative mmax-w-xs ssm:max-w-sm ww-full aspect-video rounded-2xl overflow-hidden mb-8 mx-auto">
            <HeroVideoDialog
              className="block"
              animationStyle="from-center"
              videoSrc="/assets/videos/video.mp4" // Vidéo locale
              thumbnailSrc="/assets/images/backgrounds/movieCN.png" // Miniature avant lancement
              thumbnailAlt="Vidéo Chicken Nation - Web"
            />
            <HeroVideoDialog
              className="hidden dark:block"
              animationStyle="from-center"
              videoSrc="/assets/videos/video.mp4"
              thumbnailSrc="/assets/images/backgrounds/movieCN.png"
              thumbnailAlt="Vidéo Chicken Nation - Web"
            />
          </div>
          </Motion>

      </div>
    </div>
    </Motion>
  </section>
    // ancien code 

    // <Motion variant="verticalSlideIn">
    // <div className="relative w-full h-[200px] md:h-screen overflow-hidden rounded-2xl">
    //   {/* Background Pattern */}
    //   <Image
    //     className="absolute object-contain md:object-cover w-full"
    //     src="/assets/images/illustrations/histoire/couverture.png"
    //     alt="title"
    //     fill
    //     priority
    //     sizes="100vw"
    //   />

    //   {/* Overlay */}
    //   <div className="bg-black/30 w-full h-full absolute inset-0"></div>

    //   {/* Video Dialog */}
    //   <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
    //     <HeroVideoDialog
    //       className="relative w-full h-auto"
    //       // animationStyle="from-center"
    //       videoSrc="/assets/videos/PRESENTATION ANGRE.mp4"
    //       thumbnailSrc="/assets/images/illustrations/histoire/couverture.png"
    //       thumbnailAlt="Découvrez Notre Histoire"
    //     />
    //   </div>
    // </div>
    // </Motion>
  );
}
