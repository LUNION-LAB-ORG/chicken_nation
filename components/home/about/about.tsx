"use client";

import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import Image from "next/image";

export default function About() {
  return (
    <section className="relative w-full bg-white overflow-hidden px-4 py-16 md:p-20 lg:p-32">
      {/* Title */}
      <h2 className="text-center font-title text-primary text-5xl font-bold mb-16">
        A PROPOS
      </h2>

      {/* Main content container */}
      <div className="relative w-full px-4">
        <div className="relative flex flex-col md:flex-row items-center justify-center">
          {/* Left Image - Fried Chicken */}
          <div className="hidden md:flex absolute -left-48 top-1/2 transform -translate-y-1/2 w-1/3">
          <Image
            src="/assets/images/illustrations/page-accueil/chicken-2.png"
            alt="Boîte de poulet frit"
            width={500} // Ajuste la largeur selon ton besoin
            height={300} // Ajuste la hauteur selon ton besoin
            className="object-contain w-full"
          />
          </div>

          {/* Center Content */}
          <div className="relative w-full text-center flex flex-col items-center z-10">
            <p className="text-lg md:text-sm mb-8 max-w-xl w-full md:w-auto">
              Née de la passion pour le poulet de qualité,{" "}
              <span className="text-red-500 font-bold">Chicken Nation</span>{" "}
              s&apos;est établie comme une référence en matière de restauration rapide en Côte d&apos;Ivoire.
            </p>

            {/* Video Dialog */}
            <div className="relative max-w-xs sm:max-w-sm md:max-w-md aspect-video rounded-2xl overflow-hidden mb-8 mx-auto">
              <HeroVideoDialog
                className="block dark:hidden"
                animationStyle="from-center"
                videoSrc="/assets/videos/video.mp4" // Vidéo locale
                thumbnailSrc="/assets/images/backgrounds/background.png" // Miniature avant lancement
                thumbnailAlt="Vidéo Chicken Nation - Web"
              />
              <HeroVideoDialog
                className="hidden dark:block"
                animationStyle="from-center"
                videoSrc="/assets/videos/video.mp4"
                thumbnailSrc="/assets/images/backgrounds/background.png"
                thumbnailAlt="Vidéo Chicken Nation - Web"
              />
            </div>

            {/* CTA Button */}
            <button className="bg-primary text-white px-8 py-3 rounded-full">
              Voir plus
            </button>
          </div>

          {/* Right Image - Burger */}
          <div className="hidden md:flex absolute -right-48 top-1/2 transform -translate-y-1/2 w-1/3">
          <Image
            src="/assets/images/illustrations/page-accueil/burger.png"
            alt="Burger au poulet"
            width={500} // Ajuste la largeur selon ton besoin
            height={300} // Ajuste la hauteur selon ton besoin
            className="object-contain w-full"
          />
          </div>
        </div>
      </div>
    </section>
  );
}
