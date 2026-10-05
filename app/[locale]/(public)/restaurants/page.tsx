import Special from "@/components/(public)/home/special";
import List from "@/components/(public)/restaurant/list";
import HeroSection from "@/components/(public)/common/hero-section";
import { pageMetadata } from "../../meta";
import { setRequestLocale } from "next-intl/server";

// Statique, reconstruite au plus toutes les heures (restaurants et promotions lus dans l'API).
export const revalidate = 3600;

export const metadata = pageMetadata({
  chemin: "/restaurants",
  titre: "Nos restaurants à Abidjan",
  description:
    "Nos restaurants à Marcory Zone 4, Angré, Sococé, Riviera Faya et Yopougon, ouverts tous les jours dès 10h. Commandez en ligne, en livraison ou à emporter.",
});

export default async function Restaurants({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <HeroSection
        title="NOS RESTAURANTS"
        src="/assets/images/backgrounds/restaurant.png"
      />
      <List />
      <Special />
    </div>
  );
}
