import About from "@/components/history/about/about";
import Asset from "@/components/history/asset/asset";
import Hero from "@/components/history/hero/hero";
import Partener from "@/components/history/partener/partener";
import Pub from "@/components/history/pub/pub";
import Quality from "@/components/history/quality/quality";
import Skill from "@/components/history/skill/skill";
import Team from "@/components/history/team/team";
import OderFood from "@/components/home/oder-food/oder-food";


export default function History(){
    return(
        <div>
            <Hero/>
            <About/>
            <Pub/>
            <Quality/>
            <Partener/>
            <OderFood/>
            <Skill/>
            <Team/>
            <Asset/>
        </div>
    );
}