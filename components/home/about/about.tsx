"use client";

import { Button } from '@nextui-org/react';
import React from 'react';
import { Play } from 'lucide-react';

export default function About() {
  return (
    <section className="relative w-full min-h-screen bg-white py-16 overflow-hidden">
      {/* Title */}
      <h2 className="text-center font-title text-primary text-5xl font-bold mb-16">
        À PROPOS
      </h2>

      {/* Main Content Container */}
      <div className="relative w-full px-4">
        <div className="relative flex flex-col md:flex-row items-center justify-center">
          {/* Left Image - Fried Chicken */}
          <div className="hidden md:flex absolute -left-24 top-1/2 transform -translate-y-1/2 w-1/3">
            <img
              src="assets/images/illustrations/page-accueil/chicken-2.png"
              alt="Boîte de poulet frit"
              className="object-contain w-full h-auto"
            />
          </div>

          {/* Center Content */}
          <div className="relative w-full md:w-1/3 text-center flex flex-col items-center z-10">
            <p className="text-lg md:text-sm mb-8 max-w-xl w-full md:w-auto">
              Née de la passion pour le poulet de qualité,{' '}
              <span className="text-red-500 font-bold">Chicken Nation</span>{' '}
              s'est établie comme une référence en matière de restauration rapide en Côte d'Ivoire.
            </p>

            {/* Video Preview Container */}
            <div className="relative max-w-xs sm:max-w-sm md:max-w-md aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-8 mx-auto">
              <img
                src="assets/images/backgrounds/background.png"
                alt="Aperçu de la vidéo"
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
              className="text-white px-8 py-3 rounded-full w-3/4 md:w-1/2"
            >
              Voir plus
            </Button>
          </div>

          {/* Right Image - Burger */}
          <div className="hidden md:flex absolute -right-24 top-1/2 transform -translate-y-1/2 w-1/3">
            <img
              src="assets/images/illustrations/page-accueil/burger.png"
              alt="Burger au poulet"
              className="object-contain w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}