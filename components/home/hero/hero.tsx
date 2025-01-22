import React from 'react';
import Image from 'next/image';
import { Button } from '@nextui-org/react';

export default function Hero() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Pattern */}
      <Image
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/images/backgrounds/background1.png"
        alt="title"
        layout="fill"
        objectFit="cover"
      />

      {/* Left Decorative Elements */}
      <div className="absolute -left-5 bottom-0 flex flex-col">
        <div className="relative w-16 h-16">
          <Image
            src="/assets/images/illustrations/page-accueil/percil.png"
            alt="Parsley decoration"
            layout="fill"
            objectFit="contain"
            className="rotate-45"
          />
        </div>
        <div className="relative w-80 h-80">
          <Image
            src="/assets/images/backgrounds/Ellipse-2.png"
            alt="Chili pepper"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </div>

      {/* Right Decorative Elements */}
      <div className="absolute right-0 top-0">
        <div className="relative w-full h-80">
          <Image
            src="/assets/images/backgrounds/Ellipse-1.png"
            alt="Ellipse decoration"
            layout="fill"
            objectFit="contain"
          />
        </div>
        <div className="relative w-40 h-40">
          <Image
            src="/assets/images/illustrations/page-accueil/piment.png"
            alt="Chili pepper"
            layout="fill"
            objectFit="contain"
            className="-rotate-45 ml-64"
          />
        </div>
      </div>

      {/* Bottom Right Wrap */}
      <div className="absolute bottom-0 right-0">
        <div className="relative w-48 h-48">
          <Image
            src="/assets/images/illustrations/page-accueil/borrito.png"
            alt="Wrap"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative flex flex-col items-center justify-center h-full max-w-6xl mx-auto px-4">
        {/* Title */}
        <h1 className="text-white font-title text-6xl font-bold mb-8 text-center tracking-wider absolute inset-0">
          CHAMPION
          <br />
          DANS POULET
        </h1>

        <div className="relative w-30 h-30 mr-24">
          <Image
            src="/assets/images/backgrounds/Ellipse-3.png"
            alt="Chili pepper"
            layout="fill"
            objectFit="contain"
          />
        </div>

        {/* Chicken Bucket Image */}
        <div className="relative w-80 h-80 bottom-36">
          <Image
            src="/assets/images/illustrations/page-accueil/chicken.png"
            alt="Chicken Nation Bucket"
            layout="fill"
            objectFit="contain"
          />

          {/* Hot Icon */}
          <div className="absolute -right-4 top-4 w-12 h-12">
            <Image
              src="/assets/images/illustrations/page-accueil/tomate.png"
              alt="Hot indicator"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>

        {/* Quick Delivery Badge */}
        <div className="absolute top-1/2 right-16 bg-white rounded-full p-4 flex items-center space-x-2">
          <div className="relative w-6 h-6">
            <Image
              src="/assets/images/illustrations/page-accueil/horloge.png"
              alt="Clock"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold">Livraison rapide</span>
            <span className="text-sm text-gray-600">moins de 30 Minutes</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button className="bg-white text-orange-500 px-2 py-6 rounded-3xl font-semibold hover:bg-orange-50 transition-colors">
          Réserver une table
        </Button>
      </div>
    </div>
  );
}
