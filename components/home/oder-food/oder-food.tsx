import { Button } from "@nextui-org/react";
import Image from "next/image";

export default function OderFood() {
  return (
    <section className="relative w-full py-16">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/assets/images/backgrounds/special-menu.png"
          alt="Food background"
          layout="fill"
          objectFit="cover"
        />
      </div>

      <div className="absolute inset-0 w-full h-full bg-black/30"></div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="bg-white relative rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Image */}
          <div className="absolute left-0 top-0 w-24 h-24">
            <Image
              src="/assets/images/illustrations/page-accueil/chicken.png"
              alt="Chicken bucket"
              layout="fill"
              objectFit="contain"
            />
          </div>

          {/* Center Content */}
          <div className="flex-1 flex flex-col items-center gap-4">
            <h2 className="text-primary text-xl md:text-2xl font-semibold text-center md:text-left">
              Commandez votre déjeuner aujourd`&apos;`hui avec Chicken Nation
            </h2>

            {/* Form */}
            <div className="w-full relative max-w-md flex bg-primary-100 rounded-full">
              <input
                type="email"
                placeholder="Adresse e-mail"
                className="relative z-10 flex-1 px-6 py-3 w-full rounded-l-full text-primary-900 placeholder-primary-900 bg-orange-200 border-none"
              />
              <Button className="px-12 py-8 text-white bg-primary-800 rounded-full ">
                Réserver
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="absolute bottom-0 right-0 w-24 h-24">
            <Image
              src="/assets/images/illustrations/page-accueil/repas-items-1.png"
              alt="Meal"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
