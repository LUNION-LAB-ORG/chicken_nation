"use client";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@/i18n/navigation";
import Section from "@/components/primitives/Section";
import type { ICategorieCarte } from "@/features/menus/apis/menu-public.api";

const fcfa = (montant: number) => `${montant.toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA`;

export default function ListPlats({ categories }: { categories: ICategorieCarte[] }) {
  if (categories.length === 0) {
    return (
      <Section className="text-center text-gray-700">
        La carte est momentanément indisponible. Retrouvez tous nos plats dans{" "}
        <Link href="/app-mobile" className="font-semibold text-primary">
          l&apos;application CHICKEN NATION
        </Link>
        .
      </Section>
    );
  }

  return (
    <Section className="flex w-full flex-col">
      <Tabs aria-label="Catégories du menu" size="lg" color="primary" variant="light">
        {categories.map((categorie) => (
          <Tab key={categorie.nom} title={categorie.nom}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categorie.plats.map((plat) => (
                <Card key={plat.id}>
                  <CardBody>
                    <div className="flex h-full flex-col gap-4 rounded-3xl p-2 items-center">
                      <div className="relative h-40 w-full">
                        <Image
                          src={plat.image}
                          alt={plat.nom}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-contain rounded-3xl"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between w-full text-center">
                        <div>
                          <h3 className="text-lg font-bold uppercase">{plat.nom}</h3>
                          {plat.description && (
                            <p className="text-sm text-gray-600">{plat.description}</p>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="text-left">
                            {plat.prixAvantPromo && (
                              <div className="text-sm text-gray-500 line-through">
                                {fcfa(plat.prixAvantPromo)}
                              </div>
                            )}
                            <div className="text-primary text-lg font-bold">{fcfa(plat.prix)}</div>
                          </div>
                          <Link href="/app-mobile" aria-label={`Commander ${plat.nom} sur l'application`}>
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
