import Motion from "@/lib/motion";
import Image from "next/image";


export default function Team() {
  return (
    <div className="flex flex-col gap-4 p-6 m-4">
      <Motion variant="verticalSlideIn">
      <div className="font-title text-3xl text-center text-primary my-8">
        NOTRE EQUIPE
      </div>
      </Motion>
      <div className="flex flex-col-reverse md:flex-row justify-between gap-4">
      <Motion variant="horizontalSlideIn" animationParams={{ delay: 0.4, offset: -50 }}>
        <div className="relative w-80 h-80">
          <Image
            src="/assets/images/illustrations/histoire/team.png"
            alt="histoire-4"
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
        </Motion>
        <Motion variant="horizontalSlideIn" animationParams={{ delay: 0.4, offset: 50 }}>
        <div className="flex flex-col justify-around gap-8">
          <div className="flex flex-col gap-8">
            <div className="text-primary text-lg font-semibold">
              Une Famille Passionnée
            </div>
            <div>
            Derrière chaque burger et chaque plat, se cache une famille
              <br /> qui travaille main dans la main pour vous 
              procurer <br /> satisfaction à chaque visite.
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="text-primary text-lg font-semibold">
              Formation Continue
            </div>
            <div>
              Nous investissons dans la formation régulière de notre personnel{" "}
              <br /> pour maintenir un niveau d&apos;excellence constant. Chaque
              membre de <br /> notre équipe est un expert dans son domaine.
            </div>
          </div>
        </div>
        </Motion>
      </div>
    </div>
  );
}
