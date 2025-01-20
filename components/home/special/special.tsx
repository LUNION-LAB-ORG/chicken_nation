"use client";

import { Pagination } from "@nextui-org/react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@nextui-org/react";
import Image from 'next/image';

export default function Special() {
  const deals = [
    {
      id: 1,
      title: "LUNCH DU CHAMPION XL NORMAL",
      items: [
        { icon: "assets/images/illustrations/page-accueil/repas-items-details-1.png", name: "Frites" },
        { icon: "assets/images/illustrations/page-accueil/repas-items-details-2.png", name: "Sauce tomate" }
      ],
      image: "assets/images/illustrations/page-accueil/repas-items-1.png",
      price: "7 500 FCFA"
    },
    {
      id: 2,
      title: "DEMI POULET BRAISE + FRITE NORMAL",
      items: [
        { icon: "assets/images/illustrations/page-accueil/repas-items-details-1.png", name: "Frites" },
        { icon: "assets/images/illustrations/page-accueil/repas-items-details-2.png", name: "Sauce tomate" }
      ],
      image: "assets/images/illustrations/page-accueil/repas-items-2.png",
      price: "7 500 FCFA"
    },
    {
      id: 3,
      title: "LUNCH DU CHAMPION XL NORMAL",
      items: [
        { icon: "assets/images/illustrations/page-accueil/repas-items-details-1.png", name: "Frites" },
        { icon: "assets/images/illustrations/page-accueil/repas-items-details-2.png", name: "Sauce tomate" }
      ],
      image: "assets/images/illustrations/page-accueil/menu-1.png",
      price: "7 500 FCFA"
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto p-20">
      <div className="relative">
        <div className="flex justify-between">
          {/* Header */}
          <h1 className="text-4xl font-title font-bold text-primary mb-8">SPECIAL DEAL</h1>

          {/* Pagination */}
          <Pagination
            className="text-primary-900"
            showControls
            initialPage={1}
            total={3}
            radius="full"
            onChange={(page) => {
              const container = document.getElementById('deals-container');
              if (container) {
                const scrollAmount = container.clientWidth * (page - 1); // Calculer le défilement en fonction de la page
                container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
              }
            }}
          />
        </div>

        {/* Deals Container */}
        <div
          id="deals-container"
          className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory"
        >
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-[#FFF5EE] rounded-2xl p-6 shadow-lg transition-all duration-300 flex-shrink-0"
              style={{ width: "90%", maxWidth: "300px" }}
            >
              <h2 className="text-xl font-bold text-primary-800 mb-4">{deal.title}</h2>

              <div className="flex justify-between items-start mb-6">
                <div className="space-y-4">
                  {deal.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-8 h-8 relative">
                        <Image
                          src={`/${item.icon}`}
                          alt={item.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-primary-800">{item.name}</span>
                    </div>
                  ))}
                </div>

                <div className="w-40 h-40 relative">
                  <Image
                    src={`/${deal.image}`}
                    alt={deal.title}
                    width={160}
                    height={160}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">
                  Prix: <span className="text-primary">{deal.price}</span>
                </p>
                <Button isDisabled className="bg-transparent border-2 border-primary text-primary px-6 py-2 rounded-full hover:bg-[#FF6B00] hover:text-white transition-colors">
                  <ShoppingCart size={20} />
                  Commander
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
