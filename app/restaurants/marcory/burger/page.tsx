import Header from "@/components/burger/header/header";
import TabComponents from "@/components/burger/tabs/tabs";
import Special from "@/components/home/special/special";


export default function Burger(){
    return(
        <div>
            <Header/>
            <TabComponents/>
            <Special/>
        </div>
    );
}