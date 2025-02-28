"use client";

import { ShoppingCart } from "lucide-react";
// import FilterMenu from "./tabs";
import Image from "next/image";
import Link from "next/link";
import { Tabs, Tab, Card, CardBody } from "@heroui/react";


const Items = [
    // PLATS
    {
        picture: "/assets/images/illustrations/restaurant-menu/plat/crispy-tender.png",
        title: "crispy tender",
        substile: "6 tenders, 1 frites, 1 coleslaw, 1 crème à l'ail, 1 sauce cheddar.",
        price: "7500",
        category: "Plats"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/plat/ailes -crispy-8.png",
        title: "ailes crispy",
        substile: "8 ailes crispy, 1 frites, 1 coleslaw, 1 crème à l'ail, 1 sauce cheddar.",
        price: "7500",
        category: "Plats"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/plat/PLAT-POULET-PANE.png",
        title: "poulet pane",
        substile: "4 morceaux, 1 frites, 1 coleslaw, 1 crème à l'ail, 1 sauce cheddar.",
        price: "7500",
        category: "Plats"
    },
    
    // BURGERS & SANDWICHES
    {
        picture: "/assets/images/illustrations/restaurant-menu/sandwich-burger/le-patron.png",
        title: "le patron",
        substile: "Blanc de poulet pané épicé, salade, tomate, cheddar, cornichon, sauce BBQ, mayo.",
        price: "4000",
        category: "Burgers & Sandwiches",
        menuPrice: "6000"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sandwich-burger/nation.png",
        title: "le nation ou spicy nation",
        substile: "Pain tortilla, crispy tender épicé ou non, salade, tomate, garlic mayo.",
        price: "3000",
        category: "Burgers & Sandwiches",
        menuPrice: "5000"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sandwich-burger/chicken-burger.png",
        title: "chicken burger",
        substile: "Steak de poulet, salade, tomate, cheddar, cornichon, garlic mayo.",
        price: "4000",
        category: "Burgers & Sandwiches",
        menuPrice: "6000"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sandwich-burger/le-mechant-mechant.png",
        title: "le mechant mechant",
        substile: "Blanc de poulet pané épicé double, cornichon, salade, tomate, double cheddar, sauce BBQ, mayo.",
        price: "5000",
        category: "Burgers & Sandwiches",
        menuPrice: "7000"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sandwich-burger/sandwich-mechant-mechant.png",
        title: "sandwich mechant mechant",
        substile: "Pain tortilla, double crispy tender épicé ou non, salade, tomate, garlic mayo.",
        price: "3000",
        category: "Burgers & Sandwiches",
        menuPrice: "5000"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sandwich-burger/sandwiche-crispy.png",
        title: "sandwich crispy",
        substile: "Pain tortilla, crispy tender, salade, tomate, garlic mayo.",
        price: "3000",
        category: "Burgers & Sandwiches",
        menuPrice: "5000"
    },
    
    // CRISPY TENDERS & AILES CRISPY
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/6-tenders.png",
        title: "crispy tenders (6)",
        substile: "6 tenders crispy épicé ou non + frites",
        price: "6000",
        category: "Crispy Tenders"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/12-tenders.png",
        title: "crispy tenders (12)",
        substile: "12 tenders crispy épicé ou non + frites",
        price: "10000",
        category: "Crispy Tenders"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/6-AILS-CRISPY-FRITE.png",
        title: "ailes crispy (6)",
        substile: "6 ailes crispy épicé ou non + frites",
        price: "5500",
        category: "Ailes Crispy"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/12-ailes-crispy.png",
        title: "ailes crispy (12)",
        substile: "12 ailes crispy épicé ou non + frites",
        price: "8500",
        category: "Ailes Crispy"
    },
    
    // POULETS GRILLÉS - INDIVIDUEL
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/individuel/fitini.png",
        title: "fitini",
        substile: "1 pcs de poulet grillé épicé ou non + frites",
        price: "2500",
        category: "Poulets Grillés Individuel"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/individuel/skinny.png",
        title: "skinny",
        substile: "2 pcs de poulet grillé épicé ou non + frites",
        price: "4000",
        category: "Poulets Grillés Individuel"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/individuel/soutrali.png",
        title: "soutrali",
        substile: "3 pcs de poulet grillé épicé ou non + frites",
        price: "5000",
        category: "Poulets Grillés Individuel"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/individuel/apoutchou.png",
        title: "apoutchou",
        substile: "4 pcs de poulet grillé épicé ou non + frites",
        price: "6000",
        category: "Poulets Grillés Individuel"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/individuel/agbolor.png",
        title: "agbolor",
        substile: "5 pcs de poulet grillé épicé ou non + frites",
        price: "7000",
        category: "Poulets Grillés Individuel"
    },
    
    // POULETS GRILLÉS - FAMILIAUX
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/les-familiaux/gbonhi.png",
        title: "gbonni",
        substile: "10 pcs de poulet grillé épicé ou non + frites",
        price: "11000",
        category: "Poulets Grillés Familiaux"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/les-familiaux/Poutchou-patcha.png",
        title: "doutchou patcha",
        substile: "15 pcs de poulet grillé épicé ou non + frites",
        price: "15000",
        category: "Poulets Grillés Familiaux"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/les-familiaux/babatche.png",
        title: "babatche",
        substile: "20 pcs de poulet grillé épicé ou non + frites",
        price: "20000",
        category: "Poulets Grillés Familiaux"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/les-familiaux/djamanan.png",
        title: "ailes crispy diamanan",
        substile: "24 pcs d'ailes crispy épicé ou non + frites",
        price: "13000",
        category: "Poulets Grillés Familiaux"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/poulet-grille/les-familiaux/digba.png",
        title: "tenders crispy diba",
        substile: "24 pcs de tenders crispy épicé ou non + frites",
        price: "15000",
        category: "Poulets Grillés Familiaux"
    },
    
    // LUNCHS
    {
        picture: "/assets/images/illustrations/restaurant-menu/lunch/lunch-burger.png",
        title: "lunch burger",
        substile: "1 burger, 1 morceau, 1 frites, 1 boisson",
        price: "5500",
        category: "Lunchs"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/lunch/lunch-burger-xl.png",
        title: "lunch burger xl",
        substile: "1 burger, 3 morceaux, 1 frites, 1 boisson",
        price: "8000",
        category: "Lunchs"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/lunch/lunch-sandwich.png",
        title: "lunch sandwich",
        substile: "1 sandwich, 1 morceau poulet, 1 frites, 1 boisson",
        price: "5500",
        category: "Lunchs"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/lunch/lunch-sandwich-xl.png",
        title: "lunch sandwich xl",
        substile: "1 sandwich, 3 morceaux, 1 frites, 1 boisson",
        price: "8000",
        category: "Lunchs"
    },
    
    // SUPPLÉMENTS
    {
        picture: "/assets/images/illustrations/restaurant-menu/suplements/1-pcs-poulet.png",
        title: "1 pce poulet (epice ou non)",
        substile: "Morceau de poulet supplémentaire épicé ou non",
        price: "1500",
        category: "Suppléments"
    },
    // {
    //     picture: "/assets/images/illustrations/restaurant-menu/suplements/1-pcs-poulet.png",
    //     title: "cheddar fries",
    //     substile: "Frites avec sauce cheddar",
    //     price: "2000",
    //     category: "Suppléments"
    // },
    {
        picture: "/assets/images/illustrations/restaurant-menu/suplements/4-ail-crispy.png",
        title: "ailes crispy (4 pcs)",
        substile: "4 pcs ailes crispy épicé ou non",
        price: "3000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/suplements/TENDERS-QUATRE.png",
        title: "tenders (4 lamelle)",
        substile: "4 pcs tenders",
        price: "3000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/suplements/coleslaw.png",
        title: "coleslaw",
        substile: "Portion de salade coleslaw",
        price: "1000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/suplements/frite.png",
        title: "frites",
        substile: "Portion de frites standard",
        price: "1500",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/suplements/8-ailes-crispy.png",
        title: "ailes crispy (8 pcs)",
        substile: "8 pcs ailes crispy épicé ou non",
        price: "5000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/suplements/8-tenders.png",
        title: "tenders (8 lamelle)",
        substile: "8 pcs tenders",
        price: "6000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/suplements/combo.png",
        title: "frite + boisson",
        substile: "Une portion de frites avec une boisson au choix",
        price: "2000",
        category: "Suppléments"
    },
    
    // BOISSONS
    {
        picture: "/assets/images/illustrations/restaurant-menu/boisson/celeste-grand.png",
        title: "eau minerale",
        substile: "Bouteille d'eau minérale",
        price: "1000",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/boisson/celest-petit.png",
        title: "eau glacee",
        substile: "Eau glacée",
        price: "500",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/boisson/coca.png",
        title: "coca-cola (canette)",
        substile: "Coca-Cola en canette",
        price: "1000",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/boisson/coca-grand.png",
        title: "coca-cola (bouteille)",
        substile: "Coca-Cola en bouteille",
        price: "2000",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/boisson/FANTA.png",
        title: "fanta",
        substile: "Fanta en canette",
        price: "1000",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/boisson/orangina.png",
        title: "orangina",
        substile: "Orangina en canette",
        price: "1500",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/boisson/SPRITE.png",
        title: "sprite",
        substile: "Sprite en canette",
        price: "1000",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/boisson/codys.png",
        title: "codys",
        substile: "Cody's energy en cannette",
        price: "1500",
        category: "Boissons"
    },
    
    // GRANDES SAUCES
    {
        picture: "/assets/images/illustrations/restaurant-menu/sauces/hot-and-spicy.png",
        title: "hot and spicy",
        substile: "Sauce épicée et relevée",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sauces/bufalo.png",
        title: "buffalo",
        substile: "Sauce Buffalo",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sauces/cheddar.png",
        title: "cheddar",
        substile: "Sauce au fromage cheddar",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sauces/creme-a-l-ail.png",
        title: "creme a l'ail",
        substile: "Sauce à base de crème et d'ail",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sauces/barbecue.png",
        title: "barbecue",
        substile: "Sauce barbecue",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sauces/mayo.png",
        title: "mayonnaise",
        substile: "Sauce mayonnaise",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-menu/sauces/ketchup.png",
        title: "ketchup",
        substile: "Sauce ketchup",
        price: "1000",
        category: "Grandes Sauces"
    }
]


const categories = [...new Set(Items.map(item => item.category))];


export default function Dejeuner(){
    return(
        <div className="flex w-full flex-col py-16 px-6">
        <Tabs aria-label="Menu" size="lg" color="primary" variant="light">
          {categories.map(category => (
            <Tab key={category} title={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Items.filter(item => item.category === category).map((item, index) => (
                  <Card key={index}>
                    <CardBody>
                    {/* Image du produit */}
                <div className="flex flex-col gap-6  rounded-3xl p-6 items-center ">
                    <Image
                        src={item.picture}
                        alt={item.title}
                        width={200}
                        height={200}
                        className="object-cover md:object-contain rounded-3xl"
                    />
                    {/* Contenu de la carte */}
                    <div className="flex flex-col justify-between h-full w-full text-center ">
                        <div>
                        <div className="text-xl font-title font-semibold">{item.title}</div>
                        <div className="text-gray-600">{item.substile}</div>
                        </div>

                        {/* Prix et icône panier */}
                        <div className="flex justify-between items-center mt-4">
                        <div className="text-primary text-lg font-title">{item.price} FCFA</div>
                        <Link href="/restaurants/marcory/soonapp">
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
      </div>
    );
}