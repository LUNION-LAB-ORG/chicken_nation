import Dejeuner from "@/components/marcory/dejeuner/dejeuner";
import Hero from "@/components/marcory/hero/hero";
import Download from "@/components/home/download/download";


export default function Marcory(){
    return(
        <div>
            <Hero/>
            <Dejeuner/>
            <Download/>
        </div>
    );
}