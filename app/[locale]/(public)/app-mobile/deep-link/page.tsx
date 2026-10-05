import type { Metadata } from "next";

import { PageAppliOuverture } from "@/components/site/appli/PageAppliOuverture";
import { Section } from "@/components/site/Section";

// noindex posé par la mise en page du dossier : page technique.
export const metadata: Metadata = {
  title: "Ouverture de l'application",
};

/**
 * Page de repli des liens vers l'application (QR codes imprimés, backoffice,
 * WhatsApp). Adresse inchangée : les QR codes et l'application en dépendent.
 */
export default function AppMobileDeepLink() {
  return (
    <Section
      motif
      className="flex flex-1 items-center"
      classeConteneur="max-w-xl py-4 lg:py-8"
      fond="surface"
      libelle="Ouverture de l'application"
    >
      <PageAppliOuverture />
    </Section>
  );
}
