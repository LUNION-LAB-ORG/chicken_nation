"use client";

import Image from "next/image";

export default function Paiement() {
  const paymentData = [
    {
      icon: "assets/images/illustrations/page-accueil/card-1.png",
      description: "Cartes acceptées au restaurant pour tous paiements",
    },
    {
      icon: "assets/images/illustrations/page-accueil/card-2.png",
      description: "Cartes acceptées au restaurant pour tous paiements",
    },
    {
      icon: "assets/images/illustrations/page-accueil/card-3.png",
      description: "Cartes acceptées au restaurant pour tous paiements",
    },
  ];

  return (
    <div className="bg-secondary">
      {/* Image en haut */}
      <div className="hidden md:block w-full h-[60vh] md:h-[80vh] relative">
        <Image
          src="/assets/images/backgrounds/paiement2.png"
          alt="Food background"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </div>

      {/* Cartes en dessous */}
      <div className="px-4 py-8">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 max-w-6xl mx-auto">
          {paymentData.map((item, index) => (
            <div key={index} className="w-full md:w-1/3 max-w-sm">
              <div className=" p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-4">
                  <Image
                    src={`/${item.icon}`}
                    alt="Payment method"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <p className="text-sm text-primary-900">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
