import Dejeuner from "@/components/(public)/angre/dejeuner/dejeuner";
import Hero from "@/components/(public)/angre/hero/hero";
import Download from "@/components/(public)/common/download";


export default function Angre(){
    return(
        <div>
            <Hero/>
            <Dejeuner/>
            <Download/>
        </div>
    );
}