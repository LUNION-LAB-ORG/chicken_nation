import AddContact from "@/components/contact/addcontact/addcontact";
import Hero from "@/components/contact/hero/hero";
import News from "@/components/contact/news/news";


export default function Contact(){
    return(
        <div>
            <Hero/>
            <News/>
            <AddContact/>
        </div>
    );
}