"use client";

import { Button, Pagination } from "@heroui/react";
import { LayoutGrid, ShoppingCart, Tag } from "lucide-react";
import Image from "next/image";

export default function Header(){
    return(
        <div className="p-2 md:p-20">
        <div  className="flex flex-col md:flex-row gap-6 md:gap-3 items-center md:items-start justify-center md:justify-start  rounded-3xl p-6">
                    <div className="flex flex-col gap-3">
                    <Image
                     src="/assets/images/illustrations/restaurant-detail/card-detail.png"
                      alt="card-detail"
                      width={2000}
                      height={2000}
                      objectFit="contain"
                    />
                    <div className="hidden md:flex justify-start gap-4">
                    <Image
                     src="/assets/images/illustrations/restaurant-detail/card-detail.png"
                      alt="card-detail"
                      width={100}
                      height={100}
                      objectFit="contain"
                    />
                    <Image
                     src="/assets/images/illustrations/restaurant-detail/card-detail.png"
                      alt="card-detail"
                      width={100}
                      height={100}
                      objectFit="contain"
                    />
                    <Image
                     src="/assets/images/illustrations/restaurant-detail/card-detail.png"
                      alt="card-detail"
                      width={100}
                      height={100}
                      objectFit="contain"
                    />
                    <Image
                     src="/assets/images/illustrations/restaurant-detail/card-detail.png"
                      alt="card-detail"
                      width={100}
                      height={100}
                      objectFit="contain"
                    />
                    </div>
                    </div>
                    <div className="flex flex-col text-center md:text-start items-start justify-between gap-4">
                        <div className="text-xl font-semibold">Classic Burger</div>
                        <div className="text-start items-start text-primary">
                        ★★★★<span className="text-gray-400">★</span>
                        </div>
                        <div className="flex text-center items-center gap-8">
                              <div className="text-primary text-lg font-title">5500 FCFA</div>
                              <div className="line-through text-center text-sm text-gray-400">6500 FCFA</div>
                        </div>
                        <div className="text-start">Laissez-vous tenter par notre création signature, Le Gourmet, une symphonie de saveurs qui éveillera vos papilles. Ce burger d&apos;exception commence par un pain brioché artisanal, légèrement toasté, aux graines de sésame dorées</div>
                        <div className="flex items-center gap-8">
                            <div>
                            <Pagination showControls initialPage={1} total={1} />
                            </div>
                            <div className="text-gray-400 text-xl">♥</div>
                        </div>
                        <Button
                                color="primary"
                                className="flex items-center gap-2 px-4 py-2 self-start"
                              >
                                <ShoppingCart className="w-5 h-5" />
                                Ajouter au panier
                        </Button>
                        <div className="flex flex-col justify-start md:justify-between">
                          <div className="flex items-start md:items-center gap-2 px-4 py-2">
                          <Tag className="w-5 h-5 text-primary" />
                          Tags : <span>Fast Food; Grillade; hot</span>
                          </div>
                          <div className="flex items-start md:items-center gap-2 px-4 py-2">
                          <LayoutGrid className="w-5 h-5 text-primary" />
                          Catégories : <span>Burgers</span>
                          </div>
                        </div>
                    </div>
        </div>
        </div>
    );
}