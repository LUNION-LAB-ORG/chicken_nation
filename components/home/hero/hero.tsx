"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@heroui/react";
 import Motion from "@/lib/motion";

export default function Hero() {
  return (
    <div className="relative w-full h-[calc(100vh-70px)] overflow-hidden">
      {/* Section : Image de fond en pleine largeur et hauteur */}
      <Image
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/assets/images/backgrounds/BgNew.png"
        alt="title"
        layout="fill"
        objectFit="cover"
      />

      {/* Section principale contenant le contenu */}
      <div className="max-w-screen-2xl mx-auto h-full relative">
        {/* Conteneur centré verticalement et horizontalement */}
        <div className="relative z-[2] flex flex-col items-center justify-between sm:justify-center h-full max-w-6xl mx-auto p-4 md:p-20 xl:p-32">
          {/* Titre principal et illustrations */}
          <div className="relative flex-1 flex flex-col justify-center items-center">
            <div className="relative top-0 md:top-8 lg:top-12">
              {/* Titre principal */}
               <Motion>
                <h1 className="relative z-[0] text-[#ff6200] font-title text-5xl sm:text-7xl md:text-8xl font-bold text-center tracking-wider">
                  DELICICEUX
                  <br />
                  JUSQU&apos;A L&apos;OS
                </h1>
              </Motion> 

              {/* Illustration : tomate à côté du titre */}
              {/* <div className="absolute hidden xl:block z-[1] size-12 md:size-20 top-[20px] -right-8">
                <Image
                  src="/assets/images/illustrations/page-accueil/tomate.png"
                  alt="Hot indicator"
                  layout="fill"
                  objectFit="contain"
                />
              </div> */}
            </div>

            {/* Section centrale avec illustration du poulet */}
            <div className="relative w-full flex justify-center">
              {/* Illustration : persil (gauche) */}
              {/* <div className="absolute left-0 md:left-20 lg:left-2 rotate-90 size-20 xl:size-40 bottom-12">
                <Image
                  src="/assets/images/illustrations/page-accueil/percil.png"
                  alt="Ellipse decoration"
                  layout="fill"
                  objectFit="contain"
                />
              </div> */}

              {/* Illustration : poulet central */}
               <div className="relative -top-0 size-64 md:size-96 xl:size-[390px] mx-auto">
                <Image
                  src="/assets/images/illustrations/page-accueil/seau.png"
                  alt="Chicken Nation Bucket"
                  layout="fill"
                  objectFit="contain"
                />
              </div> 

              {/* Illustration : piment (droite) */}
              {/* <div className="absolute right-4 md:right-32 lg:right-4 size-20 xl:size-40 bottom-12">
                <Image
                  src="/assets/images/illustrations/page-accueil/piment-vert.png"
                  alt="Ellipse decoration"
                  layout="fill"
                  objectFit="contain"
                />
              </div> */}
            </div>
          </div>

          {/* Bouton principal */}
          {/* <div className="absolute  pb-4">
            <Button color="primary" className="bg-white text-primary">
              Réserver une table
            </Button>
          </div> */}
        </div>
      </div>

      {/* Étiquette "Livraison rapide" (droite, mi-hauteur) */}
      <div className="absolute hidden xl:flex z-[2] top-1/2 right-48 2xl:right-69 bg-white rounded-xl p-4 items-center space-x-2">
        <div className="relative w-12 h-12">
          <Image
            src="/assets/images/illustrations/page-accueil/horloge.png"
            alt="Clock"
            layout="fill"
            objectFit="contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg">Livraison rapide</span>
          <span className="text-base text-gray-600">moins de 30 Minutes</span>
        </div>
      </div>

      {/* Cercle décoratif (fond, à droite) */}
      {/* <div className="absolute -top-1/3 mt-12 xl:-top-1/2 -right-1/2 z-[1] size-[150%] md:size-full">
        <Image
          src="/assets/images/backgrounds/Ellipse-3.png"
          alt="Chili pepper"
          layout="fill"
          objectFit="contain"
        />
      </div> */}

      {/* Persil décoratif (haut, à gauche) */}
      {/* <div className="absolute hidden xl:block top-32 -left-16 z-[2] size-52">
        <Image
          src="/assets/images/illustrations/page-accueil/percil.png"
          alt="Parsley decoration"
          layout="fill"
          objectFit="contain"
        />
      </div> */}

      {/* Cercle décoratif (bas, à gauche) */}
      {/* <div className="absolute hidden xl:block z-[2] -left-5 -bottom-8">
        <div className="relative w-80 h-80">
          <Image
            src="/assets/images/backgrounds/Ellipse-2.png"
            alt="Chili pepper"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </div> */}

      {/* Illustration piment (droite, milieu) */}
      {/* <div className="absolute hidden xl:block z-[2] -right-12 top-[calc(50%-100px)]">
        <div className="relative size-52">
          <Image
            src="/assets/images/illustrations/page-accueil/piment.png"
            alt="Ellipse decoration"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </div> */}
    </div>
  );
}
