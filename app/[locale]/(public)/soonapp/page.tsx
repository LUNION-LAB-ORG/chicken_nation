import Image from "next/image";
import { Progress } from "@heroui/progress";
import Motion from "@/lib/motion";
import Section from "@/components/primitives/Section";

export default function SoonApp() {
  return (
    <Section className="relative flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-secondary via-white to-primary-200">
      <Motion variant="fadeIn">
        <div className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-3xl shadow-2xl p-6 md:p-12 flex flex-col md:flex-row items-center gap-10 max-w-6xl w-full">
          
          {/* Texte principal */}
          <div className="flex flex-col justify-center md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">
              L’attente touche à sa fin 🚀
            </h1>
            <p className="text-gray-700 text-lg md:text-2xl leading-relaxed">
              Notre nouvelle application de commande arrive bientôt.  
              Préparez-vous à découvrir une expérience fluide, rapide et intuitive.
            </p>

            {/* Progression */}
            <div className="space-y-2 pt-4">
              <span className="text-primary font-medium">
                Niveau de développement
              </span>
              <Progress
                aria-label="Progression du développement"
                color="primary"
                size="md"
                value={92}
                className="max-w-md mx-auto md:mx-0"
              />
            </div>
          </div>

          {/* Illustration */}
          <div className="relative md:w-1/2 flex justify-center">
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
            <Image
              src="/assets/images/illustrations/page-introuvable/commande.png"
              alt="Aperçu de l'application mobile"
              width={320}
              height={640}
              priority
              className="relative z-10 object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </Motion>
    </Section>
  );
}
