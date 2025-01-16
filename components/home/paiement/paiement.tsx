'use client';
import { Image } from '@nextui-org/react';

export default function Paiement() {
  const paymentData = [
    {
      icon: "assets/images/illustrations/page-accueil/card-1.png",
      description: "Cartes acceptées au restaurant pour tous paiements"
    },
    {
      icon: "assets/images/illustrations/page-accueil/card-2.png",
      description: "Cartes acceptées au restaurant pour tous paiements"
    },
    {
      icon: "assets/images/illustrations/page-accueil/card-3.png",
      description: "Cartes acceptées au restaurant pour tous paiements"
    }
  ];

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="h-96 w-full">
        <img
          src="assets/images/backgrounds/special-menu.png"
          alt="Food background"
          className=
            "w-full h-full object-cover"
        />
      </div>
      <div className="bg-primary w-full h-40 absolute bottom-0"></div>      
                        <div className="absolute bottom-10 flex flex-col md:flex-row justify-center items-center gap-8">
                            {paymentData.map((item, index) => (
                            <div key={index} className="flex-1 min-w-[250px]">
                                <div className="p-6 flex flex-col items-center text-center">
                                <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                                    <Image
                                    src={item.icon}
                                    alt="Payment method"
                                    width={48}
                                    height={48}
                                    />
                                </div>
                                <p className="text-sm text-white">
                                    {item.description}
                                </p>
                                </div>
                            </div>
                            ))}
                        </div>
            
    </div>
  );
}