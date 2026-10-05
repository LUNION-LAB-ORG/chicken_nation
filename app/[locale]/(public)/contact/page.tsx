import AddContact from "@/components/(public)/contact/addcontact";
import News from "@/components/(public)/contact/news";
import HeroSection from "@/components/(public)/common/hero-section";
import { pageMetadata } from "../../meta";
import { setRequestLocale } from "next-intl/server";

export const metadata = pageMetadata({
  chemin: "/contact",
  titre: "Nous contacter",
  description:
    "Une question, une suggestion ou une réclamation ? Écrivez à CHICKEN NATION ou appelez nos restaurants à Abidjan.",
});

export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <HeroSection title="CONTACTS" src="/assets/images/backgrounds/background-contactez-nous.png" />
      <News />
      <AddContact />
    </div>
  );
}
