import Section from "@/components/primitives/Section";
import Title from "@/components/primitives/Title";
import Motion from "@/lib/motion";
import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <Section className="overflow-hidden relative">
      {/* Title */}
      <Motion
        variant="verticalSlideIn"
        className="flex flex-col gap-4 items-center"
      >
        <Title>A PROPOS</Title>
        <p className="text-base md:text-lg mb-8 max-w-xl text-center">
          Née de la passion pour le poulet de qualité,{" "}
          <span className="text-red-500 font-bold">Chicken Nation</span>{" "}
          s&apos;est établie comme une référence en matière de restauration
          rapide en Côte d&apos;Ivoire.
        </p>
      </Motion>

      {/* Main content container */}
      <div className="relative w-full">
        <div className="relative flex items-center justify-center">
          {/* Left Image - Fried Chicken */}
          <div className="hidden lg:block absolute left-0 xl:-left-32 top-1/2 -translate-y-1/2 scale-x-[-1] z-0">
            <Image
              src="/assets/images/illustrations/page-accueil/seauR.png"
              alt="Boîte de poulet frit"
              width={2054 / 5}
              height={1404 / 5}
              className="object-contain w-full"
            />
          </div>

          {/* Center Content */}
          <Motion
            variant="verticalSlideIn"
            className="relative z-10 flex flex-col items-center"
          >
            {/* Video Dialog */}
            <div className="relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-video rounded-2xl overflow-hidden mb-8">
              <video
                className="w-full h-full"
                src="/assets/videos/video.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            </div>

            {/* CTA Button */}
            <Link
              href="/histoire"
              className="bg-primary text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Voir plus
            </Link>
          </Motion>

          {/* Right Image - Burger */}
          <div className="hidden lg:block absolute right-0 xl:-right-32 top-1/2 -translate-y-1/2 z-0">
            <Image
              src="/assets/images/illustrations/page-accueil/burger.png"
              alt="Burger au poulet"
              width={1502 / 5}
              height={1902 / 5}
              className="object-contain w-full"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
