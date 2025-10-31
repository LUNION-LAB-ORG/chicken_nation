"use client";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import Section from "@/components/primitives/Section";
import { listPlats } from "@/features/restaurants/data/list-plats";

export default function ListPlats() {
  const categories = Array.from(
    new Set(listPlats.map((item) => item.category))
  );
  return (
    <Section className="flex w-full flex-col">
      <Tabs aria-label="Menu" size="lg" color="primary" variant="light">
        {categories.map((category) => (
          <Tab key={category} title={category}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listPlats
                .filter((item) => item.category === category)
                .map((item, index) => (
                  <Card key={index}>
                    <CardBody>
                      {/* Image du produit */}
                      <div className="flex flex-col gap-4 rounded-3xl p-2 items-center ">
                        <Image
                          src={item.picture}
                          alt={item.title}
                          width={150}
                          height={150}
                          className="object-contain rounded-3xl"
                        />
                        {/* Contenu de la carte */}
                        <div className="flex flex-col justify-between w-full text-center ">
                          <div>
                            <div className="text-xl font-title font-semibold">
                              {item.title}
                            </div>
                            <div className="text-gray-600">{item.substile}</div>
                          </div>

                          {/* Prix et icône panier */}
                          <div className="flex justify-between items-center mt-4">
                            <div className="text-primary text-lg font-title">
                              {item.price} FCFA
                            </div>
                            <Link href="/app-mobile">
                              <ShoppingCart
                                className="text-primary cursor-pointer rounded-lg border-2 border-primary p-2"
                                size={48}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
            </div>
          </Tab>
        ))}
      </Tabs>
    </Section>
  );
}
