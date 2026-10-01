import AddContact from "@/components/(public)/contact/addcontact";
import News from "@/components/(public)/contact/news";
import HeroSection from "@/components/(public)/common/hero-section";
import { pageMetadata } from "../../meta";

export const metadata = pageMetadata({
  chemin: "/contact",
  titre: "Nous contacter",
  description:
    "Une question, une suggestion ou une réclamation ? Écrivez à CHICKEN NATION ou appelez nos restaurants à Abidjan.",
});

export default function Contact() {
  return (
    <div>
      <HeroSection title="CONTACTS" src="/assets/images/backgrounds/background-contactez-nous.png" />
      <News />
      <AddContact />
    </div>
  );
}
