import { ShoppingCart } from "lucide-react";
import FilterMenu from "./tabs";
import Image from "next/image";
import Link from "next/link";


const Items = [
    { picture:"/assets/images/illustrations/restaurant-detail/card-items-1.png",
        title:"crispy tender",
         substile:"Laissez-vous tenter par notre création signature, Le Gourmet, une symphonie de saveurs qui éveillera vos papilles.",
          price:"8000"},
          { picture:"/assets/images/illustrations/restaurant-detail/card-items-2.png",
            title:"famille",
             substile:"Laissez-vous tenter par notre création signature, Le Gourmet, une symphonie de saveurs qui éveillera vos papilles.",
              price:"28000"},
              { picture:"/assets/images/illustrations/restaurant-detail/card-items-3.png",
                title:"poulet braisé 6p",
                 substile:" Laissez-vous tenter par notre création signature, Le Gourmet, une symphonie de saveurs qui éveillera vos papilles.",
                  price:"9000"},
                  { picture:"/assets/images/illustrations/restaurant-detail/card-items-4.png",
                    title:"PLAT POULET PANE",
                     substile:"Laissez-vous tenter par notre création signature, Le Gourmet, une symphonie de saveurs qui éveillera vos papilles.",
                      price:"7500"},
                      { picture:"/assets/images/illustrations/restaurant-detail/card-items-5.png",
                        title:"DUO",
                         substile:"Laissez-vous tenter par notre création signature, Le Gourmet, une symphonie de saveurs qui éveillera vos papilles.",
                          price:"13000"},
                          { picture:"/assets/images/illustrations/restaurant-detail/card-items-6.png",
                            title:"poulet braisé 3p",
                             substile:"Laissez-vous tenter par notre création signature, Le Gourmet, une symphonie de saveurs qui éveillera vos papilles.",
                              price:"5000"},
                              { picture:"/assets/images/illustrations/restaurant-detail/card-items-7.png",
                                title:"poulet braisé 9p",
                                substile:"Laissez-vous tenter par notre création signature, Le Gourmet, une symphonie de saveurs qui éveillera vos papilles.",
                                price:"12000"},
                                                                
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
                        <div className="text-xl font-semibold">{item.title}</div>
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