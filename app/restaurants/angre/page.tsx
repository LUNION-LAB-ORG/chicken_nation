import Dejeuner from "@/components/angre/dejeuner/dejeuner";
import Hero from "@/components/angre/hero/hero";
import Download from "@/components/home/download/download";


export default function Angre(){
    return(
        <div>
            <Hero/>
            <Dejeuner/>
            <Download/>
        </div>
    );
}