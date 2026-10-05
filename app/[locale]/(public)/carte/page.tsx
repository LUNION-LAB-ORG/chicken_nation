import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { pageMetadata } from "../../meta";

import { Ancre } from "@/components/site/Ancre";
import { Conteneur, Section } from "@/components/site/Section";
import { EnteteCarte } from "@/components/site/carte/EnteteCarte";
import { Pastilles } from "@/components/site/carte/Pastilles";
import { RetraitDemande } from "@/components/site/carte/RetraitDemande";
import { SectionCategorie } from "@/components/site/carte/SectionCategorie";
import { obtenirCartePublique } from "@/features/menus/apis/menu-public.api";
import { CLE_PROMOTIONS } from "@/features/menus/carte.categories";
import { platsDeLaCarte } from "@/features/menus/carte";
import { obtenirRestaurantsDuSite } from "@/features/restaurants/restaurant.api";
import { jsonLd } from "@/lib/seo/commun";
import { menuSchemaOrg } from "@/lib/seo/menu";
import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

// Statique, reconstruite au plus tous les quarts d'heure (carte lue dans l'API).
export const revalidate = 900;

export const metadata = pageMetadata({
  chemin: "/carte",
  titre: `Menu et prix${INSECABLE}: la carte`,
  description: `Poulet pané, ailes crispy, burgers, sandwichs, box et combos${INSECABLE}: toute la carte avec les prix en FCFA. Commandez en ligne, livraison ou retrait à Abidjan.`,
});

/** Carte vide (aucun plat actif) : la commande reste possible par téléphone et dans l'application. */
function CarteIndisponible() {
  return (
    <Section
      classeConteneur="max-w-2xl text-center"
      fond="surface"
      libelle="Carte indisponible"
    >
      <p className="text-encre-doux">
        La carte est momentanément indisponible. Commandez par téléphone au{" "}
        <a
          className="font-semibold whitespace-nowrap text-orange-texte underline underline-offset-[3px] hover:text-encre"
          href={telLien()}
        >
          {TELEPHONE}
        </a>{" "}
        ou dans{" "}
        <Ancre
          className="font-semibold text-orange-texte underline underline-offset-[3px] hover:text-encre"
          href="/fr/app-mobile"
        >
          l&apos;application Chicken Nation
        </Ancre>
        .
      </p>
    </Section>
  );
}

/**
 * La carte (plan, section 3.4) : en-tête photo, pastilles de catégorie
 * collantes, une section par catégorie dans l'ordre de la table du site,
 * JSON-LD `Menu`. Remplace `/fr/restaurants/nos-menus` (redirigée ici par
 * next.config.mjs). « Ajouter » ouvre la fiche plat sans quitter la page ;
 * chaque carte reste un lien vers la page du plat.
 */
export default async function PageCarte({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [carte, restaurants] = await Promise.all([
    obtenirCartePublique(),
    obtenirRestaurantsDuSite(),
  ]);
  const nombrePlats = platsDeLaCarte(carte).length;

  return (
    <>
      {carte.length > 0 ? (
        <script
          dangerouslySetInnerHTML={{ __html: jsonLd(menuSchemaOrg(carte)) }}
          type="application/ld+json"
        />
      ) : null}
      <EnteteCarte
        categories={carte}
        nombrePlats={nombrePlats}
        nombreRestaurants={restaurants.length}
      />
      {carte.length > 0 ? (
        <>
          <Pastilles
            categories={carte.map((c) => ({
              cle: c.cle,
              nom: c.nom,
              promo: c.cle === CLE_PROMOTIONS,
            }))}
          />
          <Conteneur className="pb-14">
            {/* ?retrait= se lit dans le navigateur : la page reste statique. */}
            <Suspense fallback={null}>
              <RetraitDemande
                restaurants={restaurants.map((r) => ({
                  id: r.id,
                  slug: r.slug,
                  nom: r.nomAffiche,
                  schedule: r.schedule,
                }))}
              />
            </Suspense>
            {carte.map((categorie) => (
              <SectionCategorie key={categorie.cle} categorie={categorie} />
            ))}
          </Conteneur>
        </>
      ) : (
        <CarteIndisponible />
      )}
    </>
  );
}
