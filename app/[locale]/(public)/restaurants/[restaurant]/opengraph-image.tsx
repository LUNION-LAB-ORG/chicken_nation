import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { obtenirRestaurantsDuSite } from "@/features/restaurants/restaurant.api";
import { trouverRestaurant } from "@/features/restaurants/restaurants.site";
import { TELEPHONE } from "@/lib/typo";

/*
 * Image de partage d'un restaurant (WhatsApp, Facebook, Google) : texte seul
 * aux couleurs de la marque, logo, nom et adresse, sans photo (moins de
 * 100 ko). Pré-construite pour chaque restaurant, revalidée comme la page.
 *
 * Polices : Balbeer Rustic pour « CHICKEN NATION » seulement (texte fixe,
 * la police n'a pas d'accents) ; Geist, la police par défaut de next/og,
 * pour le nom et l'adresse venus de l'API (accents compris).
 */

export const alt = "CHICKEN NATION, restaurant à Abidjan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export async function generateStaticParams() {
  const restaurants = await obtenirRestaurantsDuSite();

  return restaurants.map((r) => ({ restaurant: r.slug }));
}

const COULEURS = {
  encre: "#2A1608",
  orange: "#FD8127",
  jaune: "#FFC600",
  surEncre: "#E8D6C2",
};

// Fichiers du dépôt lus une fois. En cas d'absence (fichier non copié dans
// le conteneur), l'image se fait sans eux plutôt que d'échouer.
// Chemins écrits en entier dans chaque appel : la construction ne copie dans
// le conteneur que ces trois fichiers. Un chemin passé en variable lui ferait
// copier tout le projet, dossier public compris.
const fichiers = Promise.all([
  readFile(
    path.join(process.cwd(), "styles", "polices", "Balbeer-Rustic.ttf"),
  ).catch(() => null),
  readFile(
    path.join(
      process.cwd(),
      "node_modules",
      "next",
      "dist",
      "compiled",
      "@vercel",
      "og",
      "Geist-Regular.ttf",
    ),
  ).catch(() => null),
  readFile(
    path.join(process.cwd(), "public", "assets", "site", "logo-blanc.png"),
  ).catch(() => null),
]);

export default async function Image({
  params,
}: {
  params: Promise<{ restaurant: string }>;
}) {
  const { restaurant: slug } = await params;
  const r = trouverRestaurant(await obtenirRestaurantsDuSite(), slug);

  if (!r) return new Response(null, { status: 404 });

  const [balbeer, geist, logo] = await fichiers;
  const polices =
    balbeer && geist
      ? [
          { name: "Balbeer", data: balbeer, weight: 400 as const },
          { name: "Geist", data: geist, weight: 400 as const },
        ]
      : undefined;
  const marque = polices ? "Balbeer" : undefined;
  const lieu = [r.adresseCourte, r.commune ?? "Abidjan"]
    .filter(Boolean)
    .join(", ");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: COULEURS.encre,
          color: "#fff",
          fontFamily: polices ? "Geist" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            padding: "56px 72px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {logo ? (
              <img
                alt=""
                height={162}
                src={`data:image/png;base64,${logo.toString("base64")}`}
                width={110}
              />
            ) : null}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontFamily: marque,
                  fontSize: 92,
                  lineHeight: 1,
                  color: COULEURS.jaune,
                }}
              >
                CHICKEN NATION
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 30,
                  color: COULEURS.surEncre,
                }}
              >
                Restaurant à Abidjan
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 48,
              fontSize: r.nomAffiche.length > 18 ? 80 : 96,
              lineHeight: 1.05,
            }}
          >
            {r.nomAffiche}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 34,
              lineHeight: 1.3,
              color: COULEURS.surEncre,
            }}
          >
            {lieu}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 104,
            padding: "0 72px",
            background: COULEURS.orange,
            color: COULEURS.encre,
            fontSize: 34,
          }}
        >
          <div style={{ display: "flex" }}>
            Commande en ligne, retrait sur place
          </div>
          <div style={{ display: "flex" }}>{TELEPHONE}</div>
        </div>
      </div>
    ),
    { ...size, fonts: polices },
  );
}
