"use client";

import { Button } from '@nextui-org/react';
import React from 'react';
import { Play } from 'lucide-react';

export default function About() {
  return (
    <section className="relative w-full min-h-screen bg-white py-16">
      {/* Title */}
      <h2 className="text-center font-title text-primary text-5xl font-bold mb-16">
        À PROPOS
      </h2>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto">
        <div className="relative flex items-center justify-between">
          {/* Left Image - Fried Chicken */}
          <div className="w-1/4">
            <img
              src="assets/images/illustrations/page-accueil/chicken-2.png"
              alt="Boîte de poulet frit"
              className="object-contain w-full h-auto"
            />
          </div>

          {/* Center Content */}
          <div className="w-1/2 text-center flex flex-col items-center">
            <p className="text-xl mb-8 max-w-2xl">
              Née de la passion pour le poulet de qualité,{' '}
              <span className="text-red-500 font-bold">Chicken Nation</span>{' '}
              s'est établie comme une référence en matière de restauration rapide en Côte d'Ivoire.
            </p>

            {/* Video Preview Container */}
            <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-8">
              <img
                src="assets/images/backgrounds/background.png"
                alt="Aperçu de la vidéo"
                className="object-cover w-full h-full"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center">
                    <Play className="text-white" size={48}/>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button color="primary" className=" text-white px-8 py-3 rounded-full hover:bg-primary-600 transition-colors">
              Voir plus
            </Button>
          </div>

          {/* Right Image - Burger */}
          <div className="w-1/4">
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
