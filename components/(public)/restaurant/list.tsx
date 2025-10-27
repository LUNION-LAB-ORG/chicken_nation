"use client";

import { Button } from "@heroui/button";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Motion from "@/lib/motion";
import Section from "@/components/primitives/Section";
import Title from "@/components/primitives/Title";

const restaurants = [
  {
    id: 1,
    name: "Marcory Zone 4",
    hours: "10h30 - 23h30 & week-end 10h30 - 01h30",
    description:
      "Chicken Nation Zone 4 est un restaurant de type Fast-food spécialisé dans des recettes de poulet.",
    email: "chicken.marcory@gmail.com",
    image: "/assets/images/illustrations/restaurant/marcory-1.png",
    link: "/restaurants/marcory",
  },
  {
    id: 2,
    name: "Angré 8è Tranche",
    hours: "10h30 - 23h30 & week-end 10h30 - 01h30",
    description:
      "Chicken Nation Angré est un restaurant de type Fast-food spécialisé dans des recettes de poulet.",
    email: "chicken.djibi@gmail.com",
    image: "/assets/images/illustrations/restaurant/angre.png",
    link: "/restaurants/angre",
  },
];

export default function List() {
  return (
    <Section className="flex flex-col gap-8 md:gap-12">
      <Motion variant="verticalSlideIn">
        <Title size="md">NOS ADRESSES</Title>
      </Motion>
      {/* Restaurants grid */}
      <div className="grid md:grid-cols-2 gap-10">
        {restaurants.map((r) => (
          <Motion
            key={r.id}
            animationParams={{ delay: r.id * 0.1 }}
            variant="verticalSlideIn"
          >
            <div className="group relative rounded-2xl overflow-hidden shadow-md bg-gray-50 hover:shadow-lg transition-all duration-300">
              {/* Image de couverture */}
              <div className="relative h-64">
                <Image
                  src={r.image}
                  alt={r.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300 flex items-end justify-center pb-4">
                  <Link href={r.link}>
                    <Button
                      color="primary"
                      variant="shadow"
                      className="font-medium"
                    >
                      Réserver une table
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Infos */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-12 h-12">
                    <Image
                      src="/assets/images/logo.png"
                      alt="Chicken Nation logo"
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <h2 className="text-xl font-semibold">{r.name}</h2>
                </div>

                <p className="text-gray-600 text-sm mb-2">
                  Horaire : {r.hours}
                </p>
                <p className="text-gray-700 mb-4">{r.description}</p>
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>{r.email}</span>
                </div>
              </div>
            </div>
          </Motion>
        ))}
      </div>

      {/* Section future restaurants */}
      <div className="mt-20 text-center">
        <div className="bg-primary/10 rounded-2xl p-10 flex flex-col items-center justify-center">
          <Image
            src="/assets/images/illustrations/restaurant/card-items-4.png"
            alt="Prochaine ouverture 2025"
            width={240}
            height={240}
            className="mb-6"
          />
          <h2 className="text-2xl font-bold mb-2 text-primary">
            De nouvelles saveurs arrivent bientôt !
          </h2>
          <p className="text-gray-700">
            2 nouveaux restaurants ouvriront leurs portes à Abidjan en 2025 🍗
            <br />
            L'un à <span className="font-semibold">Sococé II Plateaux</span> et
            l'autre à <span className="font-semibold">Faya</span>.
          </p>
        </div>
      </div>
    </Section>
  );
}
