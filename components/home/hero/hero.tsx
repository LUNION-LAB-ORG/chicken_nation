import React from 'react';
import { Button } from '@nextui-org/react';

export default function Hero() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Pattern */}
      <img
        className="absolute inset-0"
        src="assets/images/backgrounds/background1.png"
        alt="title"
        />

      
      {/* Orange Wave Bottom
      <div className="absolute bottom-0 w-full">
        <div className="w-full h-32 bg-white rounded-t-[100%]" />
      </div> */}

      {/* Left Decorative Elements */}
      <div className="absolute -left-5 bottom-0 flex flex-col">
        <img 
          src="assets/images/illustrations/page-accueil/percil.png" 
          alt="Parsley decoration" 
          className="w-16 h-16 rotate-45 "
        />
        <img 
          src="assets/images/backgrounds/Ellipse-2.png" 
          alt="Chili pepper" 
          className="w-80 h-80"
        />
      </div>

      {/* Right Decorative Elements */}
      <div className="absolute right-0 top-0">
        <img 
          src="assets/images/backgrounds/Ellipse-1.png" 
          alt="Chili pepper" 
          className="w-full h-80"
        />
        <img 
          src="assets/images/illustrations/page-accueil/piment.png" 
          alt="Chili pepper" 
          className="w-40 h-40 -rotate-45 ml-64"
        />
      </div>

      {/* Bottom Right Wrap */}
      <div className="absolute bottom-0 right-0">
        <img 
          src="assets/images/illustrations/page-accueil/borrito.png" 
          alt="Wrap" 
          className="w-48 h-48"
        />
      </div>

      {/* Main Content Container */}
      <div className="relative flex flex-col items-center justify-center h-full max-w-6xl mx-auto px-4">
        {/* Title */}
        <h1 className="text-white font-title text-6xl font-bold mb-8 text-center tracking-wider absolute inset-0">
          CHAMPION
          <br />
          DANS POULET
        </h1>

        <img 
          src="assets/images/backgrounds/Ellipse-3.png" 
          alt="Chili pepper" 
          className="w-30 h-30 mr-24"
        />

        {/* Chicken Bucket Image */}
        <div className="relative w-80 h-80 bottom-36">
          <img 
            src="assets/images/illustrations/page-accueil/chicken.png" 
            alt="Chicken Nation Bucket" 
            className="w-full h-full object-contain"
          />
          
          {/* Hot Icon */}
          <img 
            src="assets/images/illustrations/page-accueil/tomate.png" 
            alt="Hot indicator" 
            className="absolute -right-4 top-4 w-12 h-12"
          />
        </div>

        {/* Quick Delivery Badge */}
        <div className="absolute top-1/2 right-16 bg-white rounded-full p-4 flex items-center space-x-2">
          <img 
            src="assets/images/illustrations/page-accueil/horloge.png" 
            alt="Clock" 
            className="w-6 h-6"
          />
          <div className="flex flex-col">
            <span className="font-bold">Livraison rapide</span>
            <span className="text-sm text-gray-600">moins de 30 Minutes</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button className=" bg-white text-orange-500 px-2 py-6 rounded-3xl font-semibold hover:bg-orange-50 transition-colors">
          Réserver une table
        </Button>
      </div>
    </div>
  );
};

