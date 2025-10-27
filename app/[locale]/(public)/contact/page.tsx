import AddContact from "@/components/(public)/contact/addcontact";
import News from "@/components/(public)/contact/news";
import HeroSection from "@/components/(public)/common/hero-section";

export default function Contact() {
  return (
    <div>
      <HeroSection title="CONTACTS" src="/assets/images/backgrounds/background-contactez-nous.png" />
      <News />
      <AddContact />
    </div>
  );
}
