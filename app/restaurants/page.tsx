import Special from "@/components/home/special/special";
import Eat from "@/components/restaurant/eat/eat";
import Hero from "@/components/restaurant/hero/hero";


export default function Restaurants(){
    return(
        <div>
            <Hero/>
            <Eat/>
            <Special/>
        </div>
    );
}