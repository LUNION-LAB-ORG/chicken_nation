import Image from "next/image";
import Motion from "@/lib/motion";
import Section from "@/components/primitives/Section";

export default function Hero() {
  return (
    <Section className="relative w-full h-[calc(100vh-70px)] min-h-[600px] max-h-[900px] overflow-hidden">
      <Image
        src="/assets/images/backgrounds/BgNew.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      <div className="h-full relative z-10">
        <div className="flex flex-col items-center justify-center h-full max-w-6xl mx-auto px-4 md:px-8 lg:px-20">
          <div className="relative flex-1 flex flex-col justify-center items-center">
            {/* Title */}
            <Motion variant="verticalSlideIn">
              <h1 className="text-[#ff6200] font-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-center tracking-wider leading-tight">
                DELICICEUX
                <br />
                JUSQU&apos;A L&apos;OS
              </h1>
            </Motion>

            {/* Central Section */}
            <div className="relative w-full flex justify-center mt-4 md:mt-8">
              {/* Left decoration */}
              {/* <Motion
                variant="horizontalSlideIn"
                animationParams={{ delay: 0.8, offset: 50 }}
              >
                <div className="absolute left-0 sm:left-4 md:left-16 lg:left-8 bottom-8 md:bottom-12 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 rotate-90">
                  <Image
                    src="/assets/images/illustrations/page-accueil/poul3.png"
                    alt="Decoration gauche"
                    fill
                    className="object-contain"
                  />
                </div>
              </Motion> */}

              {/* Central Bucket */}
              <Motion variant="verticalSlideIn">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[390px] lg:h-[390px]">
                  <Image
                    src="/assets/images/illustrations/page-accueil/seau.png"
                    alt="Chicken Nation Bucket"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Motion>

              {/* Right decoration */}
              {/* <Motion
                variant="horizontalSlideIn"
                animationParams={{ delay: 0.8, offset: -100 }}
              >
                <div className="absolute right-0 sm:right-4 md:right-16 lg:right-8 bottom-8 md:bottom-12 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40">
                  <Image
                    src="/assets/images/illustrations/page-accueil/poul2.png"
                    alt="Decoration droite"
                    fill
                    className="object-contain"
                  />
                </div>
              </Motion> */}
            </div>
          </div>
        </div>
      </div>

      {/* Fast Delivery Badge */}
      <div className="absolute hidden xl:flex z-20 top-1/2 -translate-y-1/2 right-32 2xl:right-64 bg-white rounded-xl shadow-lg p-4 gap-3 items-center">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src="/assets/images/illustrations/page-accueil/horloge.png"
            alt="Clock"
            fill
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg whitespace-nowrap">
            Livraison rapide
          </span>
          <span className="text-sm text-gray-600">moins de 30 Minutes</span>
        </div>
      </div>
    </Section>
  );
}
