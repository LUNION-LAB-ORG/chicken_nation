import Section from "@/components/primitives/Section";
import { Link } from "@/i18n/navigation";
import Motion from "@/lib/motion";
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
          alt=""
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
              Commandez votre repas en ligne, en livraison ou à emporter
            </h2>

            {/* L'ancien formulaire (e-mail + « Réserver ») n'envoyait rien :
                deux vraies actions à la place. */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/restaurants/nos-menus"
                className="px-8 py-3 bg-secondary text-secondary-foreground rounded-full font-semibold hover:bg-secondary/90 transition-colors"
              >
                Commander en ligne
              </Link>
              {/* Seul le numéro reste d'un bloc : le bouton entier en une ligne
                  débordait de la carte sur un téléphone de 360 px. */}
              <a
                href="tel:+2252721712130"
                className="px-6 sm:px-8 py-3 bg-primary-100 text-primary-900 rounded-full font-semibold text-center hover:bg-primary-200 transition-colors"
              >
                Appeler le <span className="whitespace-nowrap">27 21 71 21 30</span>
              </a>
            </div>
          </div>
        </Motion>
      </div>
    </Section>
  );
}
