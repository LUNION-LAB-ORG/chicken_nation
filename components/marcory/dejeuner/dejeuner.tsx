import { ShoppingCart } from "lucide-react";
import FilterMenu from "./tabs";
import Image from "next/image";
import Link from "next/link";


const Items = [
    // PLATS
    {
        picture: "/assets/images/illustrations/restaurant-detail/card-items-1.png",
        title: "crispy tender",
        substile: "6 tenders, 1 frites, 1 coleslaw, 1 crème à l'ail, 1 sauce cheddar.",
        price: "7500",
        category: "Plats"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/card-items-1.png",
        title: "ailes crispy",
        substile: "8 ailes crispy, 1 frites, 1 coleslaw, 1 crème à l'ail, 1 sauce cheddar.",
        price: "7500",
        category: "Plats"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/card-items-1.png",
        title: "poulet pane",
        substile: "4 morceaux, 1 frites, 1 coleslaw, 1 crème à l'ail, 1 sauce cheddar.",
        price: "7500",
        category: "Plats"
    },
    
    // BURGERS & SANDWICHES
    {
        picture: "/assets/images/illustrations/restaurant-detail/card-items-2.png",
        title: "le patron",
        substile: "Blanc de poulet pané épicé, salade, tomate, cheddar, cornichon, sauce BBQ, mayo.",
        price: "4000",
        category: "Burgers & Sandwiches",
        menuPrice: "6000"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/card-items-3.png",
        title: "le nation ou spicy nation",
        substile: "Pain tortilla, crispy tender épicé ou non, salade, tomate, garlic mayo.",
        price: "3000",
        category: "Burgers & Sandwiches",
        menuPrice: "5000"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/card-items-4.png",
        title: "chicken burger",
        substile: "Steak de poulet, salade, tomate, cheddar, cornichon, garlic mayo.",
        price: "4000",
        category: "Burgers & Sandwiches",
        menuPrice: "6000"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/card-items-5.png",
        title: "le mechant mechant",
        substile: "Blanc de poulet pané épicé double, cornichon, salade, tomate, double cheddar, sauce BBQ, mayo.",
        price: "5000",
        category: "Burgers & Sandwiches",
        menuPrice: "7000"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/card-items-6.png",
        title: "sandwich mechant mechant",
        substile: "Pain tortilla, double crispy tender épicé ou non, salade, tomate, garlic mayo.",
        price: "3000",
        category: "Burgers & Sandwiches",
        menuPrice: "5000"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/card-items-7.png",
        title: "sandwich crispy",
        substile: "Pain tortilla, crispy tender, salade, tomate, garlic mayo.",
        price: "3000",
        category: "Burgers & Sandwiches",
        menuPrice: "5000"
    },
    
    // CRISPY TENDERS & AILES CRISPY
    {
        picture: "/assets/images/illustrations/restaurant-detail/crispy-tenders.png",
        title: "crispy tenders (6)",
        substile: "6 tenders crispy épicé ou non + frites",
        price: "6000",
        category: "Crispy Tenders"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/crispy-tenders.png",
        title: "crispy tenders (12)",
        substile: "12 tenders crispy épicé ou non + frites",
        price: "10000",
        category: "Crispy Tenders"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/ailes-crispy.png",
        title: "ailes crispy (6)",
        substile: "6 ailes crispy épicé ou non + frites",
        price: "5500",
        category: "Ailes Crispy"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/ailes-crispy.png",
        title: "ailes crispy (12)",
        substile: "12 ailes crispy épicé ou non + frites",
        price: "8500",
        category: "Ailes Crispy"
    },
    
    // POULETS GRILLÉS - INDIVIDUEL
    {
        picture: "/assets/images/illustrations/restaurant-detail/individuel.png",
        title: "fitini",
        substile: "1 pcs de poulet grillé épicé ou non + frites",
        price: "2500",
        category: "Poulets Grillés Individuel"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/individuel.png",
        title: "skinny",
        substile: "2 pcs de poulet grillé épicé ou non + frites",
        price: "4000",
        category: "Poulets Grillés Individuel"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/individuel.png",
        title: "soutrali",
        substile: "3 pcs de poulet grillé épicé ou non + frites",
        price: "5000",
        category: "Poulets Grillés Individuel"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/individuel.png",
        title: "apoutchou",
        substile: "4 pcs de poulet grillé épicé ou non + frites",
        price: "6000",
        category: "Poulets Grillés Individuel"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/individuel.png",
        title: "agbolor",
        substile: "5 pcs de poulet grillé épicé ou non + frites",
        price: "7000",
        category: "Poulets Grillés Individuel"
    },
    
    // POULETS GRILLÉS - FAMILIAUX
    {
        picture: "/assets/images/illustrations/restaurant-detail/familiaux.png",
        title: "gbonni",
        substile: "10 pcs de poulet grillé épicé ou non + frites",
        price: "11000",
        category: "Poulets Grillés Familiaux"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/familiaux.png",
        title: "doutchou patcha",
        substile: "15 pcs de poulet grillé épicé ou non + frites",
        price: "15000",
        category: "Poulets Grillés Familiaux"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/familiaux.png",
        title: "babatché",
        substile: "20 pcs de poulet grillé épicé ou non + frites",
        price: "20000",
        category: "Poulets Grillés Familiaux"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/familiaux.png",
        title: "ailes crispy diamanan",
        substile: "24 pcs d'ailes crispy épicé ou non + frites",
        price: "13000",
        category: "Poulets Grillés Familiaux"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/familiaux.png",
        title: "tenders crispy diba",
        substile: "24 pcs de tenders crispy épicé ou non + frites",
        price: "15000",
        category: "Poulets Grillés Familiaux"
    },
    
    // LUNCHS
    {
        picture: "/assets/images/illustrations/restaurant-detail/lunch-burger.png",
        title: "lunch burger",
        substile: "1 burger, 1 morceau, 1 frites, 1 boisson",
        price: "5500",
        category: "Lunchs"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/lunch-burger.png",
        title: "lunch burger xl",
        substile: "1 burger, 3 morceaux, 1 frites, 1 boisson",
        price: "8000",
        category: "Lunchs"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/lunch-sandwich.png",
        title: "lunch sandwich",
        substile: "1 sandwich, 1 morceau poulet, 1 frites, 1 boisson",
        price: "5500",
        category: "Lunchs"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/lunch-sandwich.png",
        title: "lunch sandwich xl",
        substile: "1 sandwich, 3 morceaux, 1 frites, 1 boisson",
        price: "8000",
        category: "Lunchs"
    },
    
    // SUPPLÉMENTS
    {
        picture: "/assets/images/illustrations/restaurant-detail/supplements/pce-poulet.png",
        title: "1 pce poulet (épicé ou non)",
        substile: "Morceau de poulet supplémentaire épicé ou non",
        price: "1500",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/supplements/cheddar-fries.png",
        title: "cheddar fries",
        substile: "Frites avec sauce cheddar",
        price: "2000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/supplements/ailes-crispy.png",
        title: "ailes crispy (4 pcs)",
        substile: "4 pcs ailes crispy épicé ou non",
        price: "3000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/supplements/tenders.png",
        title: "tenders (4 lamelle)",
        substile: "4 pcs tenders",
        price: "3000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/supplements/coleslaw.png",
        title: "coleslaw",
        substile: "Portion de salade coleslaw",
        price: "1000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/supplements/frites.png",
        title: "frites (4 pcs)",
        substile: "Portion de frites standard",
        price: "1500",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/supplements/frites-8.png",
        title: "frites (8 pcs)",
        substile: "Grande portion de frites",
        price: "3000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/supplements/frites-16.png",
        title: "frites (16 pcs)",
        substile: "Très grande portion de frites",
        price: "6000",
        category: "Suppléments"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/supplements/frite-boisson.png",
        title: "frite + boisson",
        substile: "Une portion de frites avec une boisson au choix",
        price: "2000",
        category: "Suppléments"
    },
    
    // BOISSONS
    {
        picture: "/assets/images/illustrations/restaurant-detail/boissons/eau.png",
        title: "eau minérale",
        substile: "Bouteille d'eau minérale",
        price: "1000",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/boissons/eau-glacee.png",
        title: "eau glacée",
        substile: "Eau glacée",
        price: "500",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/boissons/coca-can.png",
        title: "coca-cola (canette)",
        substile: "Coca-Cola en canette",
        price: "1000",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/boissons/coca-bottle.png",
        title: "coca-cola (bouteille)",
        substile: "Coca-Cola en bouteille",
        price: "1500",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/boissons/fanta.png",
        title: "fanta",
        substile: "Fanta en canette",
        price: "1500",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/boissons/youki.png",
        title: "youki",
        substile: "Youki en canette",
        price: "1000",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/boissons/sprite.png",
        title: "sprite",
        substile: "Sprite en canette",
        price: "1000",
        category: "Boissons"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/boissons/coca-grand.png",
        title: "coca-cola (grand)",
        substile: "Grande bouteille de Coca-Cola",
        price: "2000",
        category: "Boissons"
    },
    
    // GRANDES SAUCES
    {
        picture: "/assets/images/illustrations/restaurant-detail/sauces/hot-and-spicy.png",
        title: "hot and spicy",
        substile: "Sauce épicée et relevée",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/sauces/buffalo.png",
        title: "buffalo",
        substile: "Sauce Buffalo",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/sauces/cheddar.png",
        title: "cheddar",
        substile: "Sauce au fromage cheddar",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/sauces/creme-ail.png",
        title: "crème à l'ail",
        substile: "Sauce à base de crème et d'ail",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/sauces/barbecue.png",
        title: "barbecue",
        substile: "Sauce barbecue",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/sauces/mayonnaise.png",
        title: "mayonnaise",
        substile: "Sauce mayonnaise",
        price: "1000",
        category: "Grandes Sauces"
    },
    {
        picture: "/assets/images/illustrations/restaurant-detail/sauces/ketchup.png",
        title: "ketchup",
        substile: "Sauce ketchup",
        price: "1000",
        category: "Grandes Sauces"
    }
]


export default function Dejeuner(){
    return(
        <div>
            <div className="flex flex-col justify-center text-center items-center gap-8 p-8">
            <FilterMenu/>
            <div className="font-title text-2xl text-primary">
                DEJEUNERS
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {Items.map((item)=>(
                    <div key={item.picture} className="flex flex-col md:flex-row gap-3 border items-center md:items-start justify-center md:justify-start border-black rounded-3xl p-6">
                    <Image
                     src={item.picture}
                      alt={item.title}
                      width={200}
                      height={200}
                      objectFit="contain"
                    />
                    <div className="flex flex-col text-center md:text-start justify-between gap-4">
                        <div className="text-xl font-title font-semibold">{item.title}</div>
                        <div>{item.substile}</div>
                        <div className="flex justify-between items-center">
                            <div className="text-primary text-lg font-title">{item.price} FCFA</div>
                            <div>
                            <Link href="/restaurants/marcory/soonapp">
                                <ShoppingCart
                                className="text-primary cursor-pointer rounded-lg border-2 border-primary p-2"
                                size={48}
                                />
                            </Link>
                            </div>
                        </div>
                    </div>
                </div>
                ))}
            
            </div>
            </div>
        </div>
    );
}