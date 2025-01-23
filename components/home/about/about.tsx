"use client";

import { Button } from '@nextui-org/react';
import React from 'react';
import { Play } from 'lucide-react';
import Image from 'next/image';

export default function About() {
  return (
    <section className="relative w-full bg-white  overflow-hidden px-4 py-16 md:p-20 lg:p-32">
      {/* Title */}
      <h2 className=" text-center font-title text-primary text-5xl font-bold mb-16">
        À PROPOS
      </h2>


      {/* Main content container bottom */}
      <div className="relative w-full px-4">
        <div className="relative flex flex-col md:flex-row items-center justify-center">
          {/* Left Image - Fried Chicken */}
          <div className="hidden md:flex absolute -left-48 top-1/2 transform -translate-y-1/2 w-1/3">
            <div className="relative w-full h-auto">
              <Image
                src="/assets/images/illustrations/page-accueil/chicken-2.png"
                alt="Boîte de poulet frit"
                width={500}
                height={500}
                className="object-contain"
              />
            </div>
          </div>

          {/* Center Content */}
          <div className="relative w-full  text-center flex flex-col items-center z-10">
            <p className="text-lg md:text-sm mb-8 max-w-xl w-full md:w-auto">
              Née de la passion pour le poulet de qualité,{' '}
              <span className="text-red-500 font-bold">Chicken Nation</span>{' '}
              s`&apos;`est établie comme une référence en matière de restauration rapide en Côte d`&apos;`Ivoire.
            </p>

            {/* Video Preview Container */}
            <div className="relative max-w-xs sm:max-w-sm md:max-w-md aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-8 mx-auto">
              <Image
                src="/assets/images/backgrounds/background.png"
                alt="Aperçu de la vidéo"
                width={1280}
                height={720}
                className="object-cover w-full h-full"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <Play className="text-white" size={48} />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              color="primary"
              className="text-white px-8 py-3 rounded-full"
            >
              Voir plus
            </Button>
          </div>

          {/* Right Image - Burger */}
          <div className="hidden md:flex absolute -right-48 top-1/2 transform -translate-y-1/2 w-1/3">
            <div className="relative w-full h-auto">
              <Image
                src="/assets/images/illustrations/page-accueil/burger.png"
                alt="Burger au poulet"
                width={500}
                height={500}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Main Content Container */}
      {/* <div className="absolute inset-x-0 -top-6 w-full h-32 z-10">
      <Image
              className="hidden md:block object-bottom"
              src="/assets/images/backgrounds/background-special.png"
              alt="title"
              layout="fill"
              objectFit="cover"
            />
      </div> */}
      <div className="absolute -top-8 right-0 size-48">
      <Image
              className="hidden md:block"
              src="/assets/images/illustrations/page-accueil/borrito.png"
              alt="title"
              layout="fill"
              objectFit="cover"
            />
      </div>
    </section>
  );
}