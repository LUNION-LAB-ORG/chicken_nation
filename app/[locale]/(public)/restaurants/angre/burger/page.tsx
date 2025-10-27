import Header from "@/components/(public)/burger/header";
import TabComponents from "@/components/(public)/burger/tabs/tabs";
import Special from "@/components/(public)/home/special/special";


export default function Burger(){
    return(
        <div>
            <Header/>
            <TabComponents/>
            <Special/>
        </div>
    );
}