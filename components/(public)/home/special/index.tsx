import Section from "@/components/primitives/Section";
import Title from "@/components/primitives/Title";
import Motion from "@/lib/motion";

import { SpecialContent } from "./specialContent";
import { obtenirPromotionsActivesAction } from "@/features/promotion/promotion.action";

export default async function Special() {
  const { data: promotions } = await obtenirPromotionsActivesAction({
    limit: 12,
  });

  if (!promotions || promotions?.data?.length === 0) return null;

  return (
    <Section >
      <Motion variant="verticalSlideIn">
        <Title>OFFRES DU MOMENT</Title>
      </Motion>
      <SpecialContent promos={promotions.data} />
    </Section>
  );
}
