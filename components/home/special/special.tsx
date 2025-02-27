"use client";

import { Pagination } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";

export default function Special() {
  const deals = [
    {
      id: 1,
      title: "LUNCH BURGER XL",
      image: "assets/images/illustrations/page-accueil/special1.png",
      price: "8 000 FCFA",
      link: "#",
    },
    {
      id: 2,
      title: "LES MECHANT MECHANT",
      image: "assets/images/illustrations/page-accueil/special2.png",
      price: "7 000 FCFA",
      link: "#",
    },
    {
      id: 3,
      title: "CHICKEN DAY",
      image: "assets/images/illustrations/page-accueil/special3.png",
      price: "6 000 FCFA",
      link: "#",
    },
  ];

  return (
    <section className="w-full mx-auto px-4 py-16 md:p-20">
      <div className="relative">
        <div className="flex justify-start sm:justify-between md:justify-between sm:gap-2 md:gap-4">
          {/* Header */}
          <h1 className="text-4xl font-title font-bold text-primary mb-8">
            SPECIAL DEAL
          </h1>

          {/* Pagination */}
          <Pagination
            className="text-primary-900"
            size="sm"
            showControls
            initialPage={1}
            total={3}
            radius="full"
            onChange={(page) => {
              const container = document.getElementById("deals-container");
              if (container) {
                const scrollAmount = container.clientWidth * (page - 1);
                container.scrollTo({ left: scrollAmount, behavior: "smooth" });
              }
            }}
          />
        </div>

        {/* Deals Container */}
        <div
          id="deals-container"
          className="flex md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory"
        >
          {deals.map((deal) => (
            <Link key={deal.id} href={deal.link} className="relative w-full h-[350px] rounded-2xl overflow-hidden border border-primary shadow-lg transition-opacity duration-300 hover:opacity-70">
              {/* Image de fond */}
              <Image
                src={`/${deal.image}`}
                alt={deal.title}
                layout="fill"
                objectFit="cover"
                className="w-full h-full"
              />

              {/* Overlay avec opacité */}
              {/* <div className="absolute inset-0 bg-black opacity-40"></div> */}

              {/* Titre en haut */}
              <h2 className="absolute top-4 left-4 text-white text-xl font-bold font-title">
                {deal.title}
              </h2>

              {/* Prix en bas à droite dans un cercle */}
              <div className="absolute bottom-4 left-4 bg-secondary text-black text-lg font-semibold px-4 py-2 rounded-full">
                {deal.price}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
