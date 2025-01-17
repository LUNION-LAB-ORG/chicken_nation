import Commitment from "@/components/franchise/commitment/commitment";
import Contact from "@/components/franchise/contact/contact";
import Hero from "@/components/franchise/hero/hero";
import Info from "@/components/franchise/info/info";


export default function Franchise(){
    return(
        <div>
            <Hero/>
            <Info/>
            <Commitment/>
            <Contact/>
        </div>
    );
}