import { Button } from "@heroui/react";
import Image from "next/image";

export default function OderFood() {
  return (
    <section className="relative min-h-[60vh] flex justify-center items-center w-full py-16">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/assets/images/backgrounds/special-menu.png"
          alt="Food background"
          layout="fill"
          objectFit="cover"
        />
      </div>

      <div className="absolute inset-0 w-full h-full bg-black/50"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-screen-lg  mx-auto px-4">
        <div className="bg-transparent md:bg-white relative rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Image */}
          <div className="hidden md:block absolute left-0 top-0 w-24 h-24">
            <Image
              src="/assets/images/illustrations/page-accueil/chicken.png"
              alt="Chicken bucket"
              layout="fill"
              objectFit="contain"
            />
          </div>

          {/* Center Content */}
          <div className="flex-1 flex flex-col items-center gap-10 md:gap-4">
            <h2 className="text-white md:text-primary text-xl md:text-2xl font-normal md:font-semibold text-center md:text-left">
              Commandez votre déjeuner aujourd&apos;hui avec Chicken Nation
            </h2>

            {/* Form */}
            <div className="w-full relative max-w-md flex flex-col gap-4 md:gap-0 md:flex-row bg-transparent md:bg-primary-100 rounded-none md:rounded-full">
              <input
                type="email"
                placeholder="Adresse e-mail"
                className="relative z-10 flex-1 px-6 py-3 w-full rounded-full md:rounded-l-full text-primary-900 placeholder-primary-900 bg-orange-200 border-none"
              />
              <Button className="px-12 py-8 bg-secondary text-secondary-foreground rounded-full ">
                Réserver
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden md:block absolute bottom-0 right-0 w-24 h-24">
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
