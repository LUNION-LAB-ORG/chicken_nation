import Section from "@/components/primitives/Section";
import Motion from "@/lib/motion";
import { Button } from "@heroui/button";
import Image from "next/image";

export default function OderFood() {
  return (
    <Section
      padding="md"
      className="relative flex justify-center items-center w-full min-h-[400px]"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/backgrounds/BgNew.png"
          alt="Food background"
          fill
          className="object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
        <Motion variant="verticalSlideIn">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-12 flex flex-col items-center gap-6">
            {/* Title */}
            <h2 className="text-primary text-lg sm:text-xl md:text-2xl font-semibold text-center max-w-2xl">
              Commandez votre déjeuner aujourd&apos;hui avec Chicken Nation
            </h2>

            {/* Form */}
            <form className="w-full max-w-lg flex flex-col items-center sm:flex-row gap-3 sm:gap-2 sm:bg-primary-100 sm:rounded-full sm:p-1">
              <input
                type="email"
                placeholder="Adresse e-mail"
                required
                className="flex-1 px-6 py-3 rounded-full text-primary-900 placeholder-primary-600 bg-primary-100 sm:bg-transparent border-none outline-none focus:ring-2 focus:ring-primary-300"
              />
              <Button
                type="submit"
                className="px-8 py-3 bg-secondary text-secondary-foreground rounded-full font-semibold hover:bg-secondary/90 transition-colors"
              >
                Réserver
              </Button>
            </form>
          </div>
        </Motion>
      </div>
    </Section>
  );
}
