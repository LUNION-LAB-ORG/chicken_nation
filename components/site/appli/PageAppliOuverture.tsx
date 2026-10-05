"use client";

import { Suspense } from "react";
import Image from "next/image";

import { BadgesStores } from "../BadgesStores";

import { useDeepLinkRedirect } from "@/features/marketing/app-mobile/hooks/useDeepLinkRedirect";
import { INSECABLE, joli } from "@/lib/typo";

/** Premier état affiché, avant la lecture de l'adresse (rendu du serveur). */
const ETAT_INITIAL = "Préparation de la redirection…";

/** Étape en cours et élément visé : seule partie qui lit l'adresse. */
function EtatOuverture() {
  const { status, itemName } = useDeepLinkRedirect();

  return <Etat element={itemName} etat={status} />;
}

function Etat({
  etat,
  element,
}: {
  /** Étape en cours (« Recherche du plat… »), annoncée aux lecteurs d'écran. */
  etat: string;
  /** Nom du plat ou de la catégorie visés, une fois trouvés. */
  element?: string;
}) {
  return (
    <>
      {element ? (
        <p className="text-lg font-bold text-orange-texte">{joli(element)}</p>
      ) : null}
      <p
        aria-live="polite"
        className="font-medium text-encre-doux"
        role="status"
      >
        {etat}
      </p>
    </>
  );
}

/**
 * Page d'ouverture de l'application (`/fr/app-mobile/deep-link`), où mènent
 * les QR codes imprimés, les liens du backoffice et ceux envoyés aux clients.
 * Le crochet retrouve le plat ou la catégorie visés, ouvre l'application,
 * puis renvoie vers le store si elle n'est pas installée. Les badges restent
 * à portée de main si rien ne se passe. Le cadre (et son seul h1) est rendu
 * par le serveur ; l'état se complète dans le navigateur.
 */
export function PageAppliOuverture() {
  return (
    <div className="grid justify-items-center gap-6 text-center">
      {/* Seau du site qui pulse doucement dans un anneau qui tourne (immobile
          si l'utilisateur réduit les animations). */}
      <div className="relative grid size-40 place-items-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-4 border-trait border-t-orange border-r-orange motion-safe:animate-spin"
        />
        <span className="grid size-[124px] place-items-center rounded-full bg-white shadow-1">
          <Image
            alt=""
            className="h-[92px] w-auto motion-safe:animate-pulse"
            height={700}
            loading="eager"
            sizes="77px"
            src="/assets/site/seau.webp"
            width={586}
          />
        </span>
      </div>

      <div className="grid gap-2">
        <h1 className="text-[clamp(24px,6vw,34px)] leading-tight font-extrabold text-balance">
          Ouverture de l&apos;application
        </h1>
        <Suspense fallback={<Etat etat={ETAT_INITIAL} />}>
          <EtatOuverture />
        </Suspense>
      </div>

      <div className="grid max-w-[30em] justify-items-center gap-3 rounded-panneau bg-white p-5 shadow-1">
        <p className="text-sm">
          L&apos;application ne s&apos;ouvre pas{INSECABLE}? Vous serez redirigé
          vers son téléchargement dans un instant, ou installez-la ici
          {INSECABLE}:
        </p>
        <BadgesStores petits className="justify-center" />
      </div>
    </div>
  );
}
