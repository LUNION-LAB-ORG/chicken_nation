import Motion from "@/lib/motion";
import ProgressComponent from "./progress";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-primary-200 min-h-screen w-full flex items-center justify-center">
      <Motion variant="verticalSlideIn">
        <div className="bg-white rounded-xl shadow-xl p-4 md:p-12 flex flex-col md:flex-row justify-around items-center md:items-stretch gap-8 h-2/5 max-w-screen-md m-8">
          {/* <Motion variant="horizontalSlideIn" animationParams={{ delay: 0.4, offset: -50 }}> */}
          <div className="flex flex-col justify-between w-full md:w-2/3">
            <div className="text-xl lg:text-5xl font-bold text-primary flex flex-col gap-2">
              Eh bien, tenez-vous prêts! <br /> <br />
              <span className="text-xl md:text-[2.7rem] md:leading-[2.7rem] ">
                L&apos;application de commande sera bientôt disponible
              </span>
            </div>

            <div className="text-base md:text-2xl mt-8">
              Nous vous réservons bien de surprises.
            </div>
            <div className="flex flex-col gap-0">
              <div className="text-primary">Niveau de développement</div>
              <ProgressComponent />
            </div>
          </div>
          {/* </Motion> */}

          <div className="object-contain">
            {/* <Motion variant="horizontalSlideIn" animationParams={{ delay: 0.4, offset: 50 }}> */}
            <Image
              src="/assets/images/illustrations/page-introuvable/commande.png"
              alt="mobile"
              height={200}
              width={250}
              // objectFit="contain"
            />
            {/* </Motion> */}
          </div>
        </div>
      </Motion>
    </div>
  );
}
