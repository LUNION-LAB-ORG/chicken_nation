import Content from "./content";
import { pageMetadata } from "../../meta";

export const metadata = pageMetadata({
  chemin: "/deletion-of-account",
  titre: "Supprimer mon compte",
  description:
    "Comment supprimer votre compte CHICKEN NATION et les données personnelles qui y sont liées.",
});

export default async function Page() {
  return <Content />;
}
