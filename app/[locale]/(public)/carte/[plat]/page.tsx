import type { Metadata } from "next";

import { existsSync } from "node:fs";
import path from "node:path";

import { permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { cache } from "react";

import { pageMetadata } from "../../../meta";

import { destinationPlat } from "@/components/site/carte/adresse-plat";
import { FicheProvisoire } from "@/components/site/carte/FicheProvisoire";
import { PagePlat } from "@/components/site/carte/PagePlat";
import {
  descriptionPlat,
  titrePlat,
} from "@/components/site/carte/textes-plat";
import { obtenirCartePublique } from "@/features/menus/apis/menu-public.api";
import { platsDeLaCarte } from "@/features/menus/carte";
import { cheminPlat } from "@/features/menus/plats.slug";
import { CHEMIN_CARTE, jsonLd } from "@/lib/seo/commun";
import { filArianeSchemaOrg } from "@/lib/seo/fil-ariane";

// Même cadence que la carte : un prix ou un nom changés au backoffice
// arrivent sur la page sans redéploiement.
export const revalidate = 900;
// Un plat ajouté après la construction est rendu à sa première visite.
export const dynamicParams = true;

type Parametres = Promise<{ locale: string; plat: string }>;

/** Une page par plat de la carte (49 en production), construite à l'avance. */
export async function generateStaticParams() {
  const plats = platsDeLaCarte(await obtenirCartePublique());

  return plats.map((p) => ({ plat: p.slug }));
}

/** Plat demandé par l'adresse, lu une fois pour les métadonnées et la page. */
const lirePlatDemande = cache(async (slug: string) => {
  const carte = await obtenirCartePublique();

  return { carte, destination: destinationPlat(slug, carte) };
});

/**
 * Image de partage du plat (JPEG 1 200 × 630 fabriqué par
 * `scripts/images-partage-plats.mjs`, lot L12) si elle existe, sinon l'image
 * générale du site. Jamais la photo brute de l'API (près de 1 Mo).
 */
function imagePartage(id: string, nom: string) {
  const fichier = `/assets/partage/plats/${id}.jpg`;

  return existsSync(path.join(process.cwd(), "public", fichier))
    ? { url: fichier, width: 1200, height: 630, alt: nom }
    : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Parametres;
}): Promise<Metadata> {
  const { plat: slug } = await params;
  const { destination } = await lirePlatDemande(slug);

  // Adresse périmée ou inconnue : la page redirige.
  if (destination.type !== "page") return {};
  const plat = destination.plat;

  return pageMetadata({
    chemin: `/carte/${plat.slug}`,
    titre: titrePlat(plat),
    description: descriptionPlat(plat),
    image: imagePartage(plat.id, plat.nom),
  });
}

/**
 * Page d'un plat, `/fr/carte/<nom-du-plat>-<6 premiers caractères de l'id>`.
 * Le plat est retrouvé par le suffixe : un nom modifié au backoffice
 * redirige (308) vers la nouvelle adresse, un plat retiré vers la carte
 * (détail dans adresse-plat.ts).
 */
export default async function PagePlatRoute({
  params,
}: {
  params: Parametres;
}) {
  const { locale, plat: slug } = await params;

  setRequestLocale(locale);

  const { carte, destination } = await lirePlatDemande(slug);

  if (destination.type === "redirection") permanentRedirect(destination.chemin);
  const plat = destination.plat;
  const categorie = carte.find((c) => c.cle === plat.categorie.cle) ?? null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            filArianeSchemaOrg([
              { nom: "La carte", chemin: CHEMIN_CARTE },
              {
                nom: plat.categorie.nom,
                chemin: `${CHEMIN_CARTE}#${plat.categorie.cle}`,
              },
              { nom: plat.nom, chemin: cheminPlat(plat) },
            ]),
          ),
        }}
        type="application/ld+json"
      />
      <PagePlat categorie={categorie} plat={plat} />
      <FicheProvisoire />
    </>
  );
}
