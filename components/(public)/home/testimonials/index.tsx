import { obtenirMeilleursCommentairesAction } from "@/features/client/commentaire.action";
import { TestimonialsContent } from "./testimonials";

export default async function Testimonials() {
  const { data: testimonials } = await obtenirMeilleursCommentairesAction({
    page: 1,
    limit: 12,
  });

  if (!testimonials || testimonials?.data?.length === 0) return null;

  return <TestimonialsContent testimonials={testimonials.data} />;
}
