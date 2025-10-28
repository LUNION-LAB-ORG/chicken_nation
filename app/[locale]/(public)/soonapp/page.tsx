import Motion from "@/lib/motion";
import { Progress } from "@heroui/progress";
import Image from "next/image";
import Section from "@/components/primitives/Section";

export default function SoonApp() {
  return (
    <Section className="bg-primary-200 min-h-screen w-full flex items-center justify-center">
      <Motion variant="verticalSlideIn">
        <div className="bg-white rounded-xl shadow-xl p-4 md:p-12 flex flex-col md:flex-row justify-around items-center md:items-stretch gap-8 max-w-screen-md m-8">
          <div className="flex flex-col justify-between w-full">
            <div className="text-xl lg:text-5xl font-bold text-primary flex flex-col gap-2">
              Eh bien, tenez-vous prêts ! <br />
              <span className="text-xl md:text-[2.7rem] md:leading-[2.7rem]">
                L&apos;application de commande sera bientôt disponible
              </span>
            </div>

            <div className="text-base md:text-2xl mt-8">
              Nous vous réservons bien des surprises.
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <div className="text-primary font-medium">
                Niveau de développement
              </div>
              <Progress
                aria-label="Progression du développement"
                color="primary"
                size="md"
                className="max-w-md"
                value={98}
              />
            </div>
          </div>

          <div className="object-contain">
            <Image
              src="/assets/images/illustrations/page-introuvable/commande.png"
              alt="Aperçu de l'application mobile"
              height={200}
              width={250}
              priority
            />
          </div>
        </div>
      </Motion>
    </Section>
  );
}
