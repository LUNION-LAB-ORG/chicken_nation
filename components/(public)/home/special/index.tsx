import Section from "@/components/primitives/Section";
import Title from "@/components/primitives/Title";
import Motion from "@/lib/motion";

import { SpecialContent } from "./specialContent";
import { obtenirPromotionsActivesAction } from "@/features/promotion/promotion.action";

export default async function Special() {
  const { data: promotions } = await obtenirPromotionsActivesAction({
    page: 1,
    limit: 12,
  });

  if (!promotions || promotions?.data?.length === 0) return null;

  return (
    <Section >
      <Motion variant="verticalSlideIn">
        <Title>SPECIAL DEAL</Title>
      </Motion>
      <SpecialContent promos={promotions.data} />
    </Section>
  );
}
