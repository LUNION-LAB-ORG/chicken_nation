"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@/i18n/navigation";
import Section from "@/components/primitives/Section";
import type { ICategorieCarte } from "@/features/menus/apis/menu-public.api";
import FichePlat from "@/features/commande/components/FichePlat";
import { BarrePanier } from "@/features/commande/components/BarrePanier";
import { fcfa } from "@/features/commande/utils/panier.utils";


export default function ListPlats({ categories }: { categories: ICategorieCarte[] }) {
  const [platOuvert, setPlatOuvert] = useState<string | null>(null);
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
                              <div className="whitespace-nowrap text-sm text-gray-500 line-through">
                                {fcfa(plat.prixAvantPromo)}
                              </div>
                            )}
                            <div className="whitespace-nowrap text-primary text-lg font-bold">{fcfa(plat.prix)}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPlatOuvert(plat.id)}
                            aria-label={`Ajouter ${plat.nom} au panier`}
                            className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
                          >
                            <Plus size={18} /> Ajouter
                          </button>
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
      <FichePlat platId={platOuvert} onClose={() => setPlatOuvert(null)} />
      <BarrePanier />
    </Section>
  );
}
