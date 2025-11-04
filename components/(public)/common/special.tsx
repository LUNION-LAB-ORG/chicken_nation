"use client";
import { useState } from "react";
import Image from "next/image";
import Motion from "@/lib/motion";
import { Link } from "@/i18n/navigation";
import Title from "@/components/primitives/Title";
import { Pagination } from "@heroui/pagination";
import Section from "@/components/primitives/Section";

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
  {
    id: 4,
    title: "MEGA WINGS",
    image: "assets/images/illustrations/page-accueil/special1.png",
    price: "9 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 5,
    title: "COMBO FAMILY",
    image: "assets/images/illustrations/page-accueil/special2.png",
    price: "12 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 6,
    title: "CRISPY DEAL",
    image: "assets/images/illustrations/page-accueil/special3.png",
    price: "5 500 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 7,
    title: "BUCKET PROMO",
    image: "assets/images/illustrations/page-accueil/special1.png",
    price: "15 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 8,
    title: "TENDER BOX",
    image: "assets/images/illustrations/page-accueil/special2.png",
    price: "6 500 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 9,
    title: "SPICY WINGS",
    image: "assets/images/illustrations/page-accueil/special3.png",
    price: "7 500 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 10,
    title: "LUNCH BURGER XL",
    image: "assets/images/illustrations/page-accueil/special1.png",
    price: "8 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 11,
    title: "LES MECHANT MECHANT",
    image: "assets/images/illustrations/page-accueil/special2.png",
    price: "7 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 12,
    title: "CHICKEN DAY",
    image: "assets/images/illustrations/page-accueil/special3.png",
    price: "6 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 13,
    title: "MEGA WINGS",
    image: "assets/images/illustrations/page-accueil/special1.png",
    price: "9 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 14,
    title: "COMBO FAMILY",
    image: "assets/images/illustrations/page-accueil/special2.png",
    price: "12 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 15,
    title: "CRISPY DEAL",
    image: "assets/images/illustrations/page-accueil/special3.png",
    price: "5 500 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 16,
    title: "BUCKET PROMO",
    image: "assets/images/illustrations/page-accueil/special1.png",
    price: "15 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 17,
    title: "TENDER BOX",
    image: "assets/images/illustrations/page-accueil/special2.png",
    price: "6 500 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 18,
    title: "SPICY WINGS",
    image: "assets/images/illustrations/page-accueil/special3.png",
    price: "7 500 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 10,
    title: "LUNCH BURGER XL",
    image: "assets/images/illustrations/page-accueil/special1.png",
    price: "8 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 11,
    title: "LES MECHANT MECHANT",
    image: "assets/images/illustrations/page-accueil/special2.png",
    price: "7 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 12,
    title: "CHICKEN DAY",
    image: "assets/images/illustrations/page-accueil/special3.png",
    price: "6 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 13,
    title: "MEGA WINGS",
    image: "assets/images/illustrations/page-accueil/special1.png",
    price: "9 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 14,
    title: "COMBO FAMILY",
    image: "assets/images/illustrations/page-accueil/special2.png",
    price: "12 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 15,
    title: "CRISPY DEAL",
    image: "assets/images/illustrations/page-accueil/special3.png",
    price: "5 500 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 16,
    title: "BUCKET PROMO",
    image: "assets/images/illustrations/page-accueil/special1.png",
    price: "15 000 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 17,
    title: "TENDER BOX",
    image: "assets/images/illustrations/page-accueil/special2.png",
    price: "6 500 FCFA",
    link: "/restaurants/marcory/burger",
  },
  {
    id: 18,
    title: "SPICY WINGS",
    image: "assets/images/illustrations/page-accueil/special3.png",
    price: "7 500 FCFA",
    link: "/restaurants/marcory/burger",
  },
];
export default function Special() {
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage =
    typeof window !== "undefined" && window.innerWidth < 768
      ? 2
      : window.innerWidth < 1024
        ? 4
        : 6;
  const totalPages = Math.ceil(deals.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDeals = deals.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Section>
      <Motion variant="verticalSlideIn">
        <Title>SPECIAL DEAL</Title>
      </Motion>

      <div className="flex justify-center md:justify-end my-6">
        <Pagination
          className="text-primary-900"
          size="sm"
          showControls
          page={currentPage}
          total={totalPages}
          radius="full"
          onChange={setCurrentPage}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {currentDeals.map((deal) => (
          <Motion key={deal.id} className="w-full" variant="verticalSlideIn">
            <Link
              href={deal.link}
              className="relative block h-[240px] sm:h-[320px] md:h-[380px] lg:h-[400px] rounded-2xl overflow-hidden border border-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <Image
                src={`/${deal.image}`}
                alt={deal.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              <h2 className="absolute top-3 left-3 md:top-4 md:left-4 text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold font-title drop-shadow-lg">
                {deal.title}
              </h2>

              <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-secondary text-black text-xs sm:text-sm md:text-base lg:text-lg font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg">
                {deal.price}
              </div>
            </Link>
          </Motion>
        ))}
      </div>
    </Section>
  );
}
