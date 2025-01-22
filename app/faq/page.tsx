import Quiz from "@/components/faq/faq/faq";
import Hero from "@/components/faq/hero/hero";


export default function Faq(){
    return(
        <div>
            <Hero/>
            <div className="p-2 md:p-20">
            <Quiz/>
            </div>
        </div>
    );
}