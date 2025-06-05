"use client";

// import { Pagination } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import Motion from "@/lib/motion";

export default function Special() {
  const deals = [
    {
      id: 1,
      title: "LUNCH BURGER XL",
      image: "assets/images/illustrations/page-accueil/special1.png",
      price: "8 000 FCFA",
      link: "/restaurants/marcory/burger",
    },
    {
      id: 2,
      title: "LES MECHANT MECHANT",
      image: "assets/images/illustrations/page-accueil/special2.png",
      price: "7 000 FCFA",
      link: "/restaurants/marcory/burger",
    },
    {
      id: 3,
      title: "CHICKEN DAY",
      image: "assets/images/illustrations/page-accueil/special3.png",
      price: "6 000 FCFA",
      link: "/restaurants/marcory/burger",
    },
  ];

  return (
    <section className="w-full mx-auto px-4 py-16 md:p-20">
      <div className="relative">
      <Motion variant="verticalSlideIn">
        <div className="flex justify-start sm:justify-between md:justify-between sm:gap-2 md:gap-4">
          
          <h1 className="text-4xl font-title font-bold text-primary mb-8">
            SPECIAL DEAL
          </h1>
          

          {/* <Pagination
            className="text-primary-900"
            size="sm"
            showControls
            initialPage={1}
            total={deals.length}
            radius="full"
            onChange={(page) => {
              const container = document.getElementById("deals-container");
              if (container) {
                const scrollAmount = container.clientWidth * (page - 1);
                container.scrollTo({ left: scrollAmount, behavior: "smooth" });
              }
            }}
          /> */}
          
        </div>
        </Motion>

        {/* Deals Container avec scroll horizontal */}
        <Motion variant="verticalSlideIn">
        <div
          id="deals-container"
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide 
                     md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {deals.map((deal) => (
            <Link key={deal.id} href={deal.link} className="relative min-w-[80%] sm:min-w-[50%] md:min-w-0 h-[350px] rounded-2xl overflow-hidden border border-primary shadow-lg transition-opacity duration-300 hover:opacity-70 snap-start">
              <Image
                src={`/${deal.image}`}
                alt={deal.title}
                layout="fill"
                objectFit="cover"
                className="w-full h-full"
              />

              <h2 className="absolute top-4 left-4 text-white text-xl font-bold font-title">
                {deal.title}
              </h2>

              <div className="absolute bottom-4 left-4 bg-secondary text-black text-lg font-semibold px-4 py-2 rounded-full">
                {deal.price}
              </div>
            </Link>
          ))}
        </div>
        </Motion>
      </div>
    </section>
  );
}
