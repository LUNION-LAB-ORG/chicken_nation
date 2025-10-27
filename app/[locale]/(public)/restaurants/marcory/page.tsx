import Dejeuner from "@/components/(public)/marcory/dejeuner/dejeuner";
import Hero from "@/components/(public)/marcory/hero";
import Download from "@/components/(public)/common/download";


export default function Marcory(){
    return(
        <div>
            <Hero/>
            <Dejeuner/>
            <Download/>
        </div>
    );
}