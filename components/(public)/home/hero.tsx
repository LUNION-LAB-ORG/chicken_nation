import Image from "next/image";
import Motion from "@/lib/motion";
import Section from "@/components/primitives/Section";
import bgNew from "@/public/assets/images/backgrounds/BgNew.png";
export default function Hero() {
  return (
    <Section className="relative w-full h-[calc(100vh-70px)] min-h-[600px] max-h-[900px] overflow-hidden">
      <Image
        src={bgNew}
        alt="Background"
        fill
        placeholder="blur"
        priority
        className="object-cover"
      />

      <div className="h-full relative z-10">
        <div className="flex flex-col items-center justify-center h-full max-w-6xl mx-auto sm:px-8 lg:px-20">
          <div className="relative flex-1 flex flex-col justify-center items-center">
            {/* Title */}
            <Motion variant="verticalSlideIn">
              <h1 className="text-[#ff6200] font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-center tracking-wider leading-tight">
                DELICICEUX
                <br />
                JUSQU&apos;A L&apos;OS
              </h1>
            </Motion>

            {/* Central Section */}
            <div className="relative w-full flex justify-center mt-4 md:mt-8">
              {/* Central Bucket */}
              <Motion variant="verticalSlideIn">
                <div className="relative">
                  <Image
                    src="/assets/images/illustrations/page-accueil/seau.png"
                    alt="Chicken Nation Bucket"
                    width={1286 / 4}
                    height={1536 / 4}
                    className="object-contain"
                    priority
                  />
                </div>
              </Motion>
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
