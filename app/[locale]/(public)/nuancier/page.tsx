import type { Metadata } from "next";
import type { ReactNode } from "react";

import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { DemosInteractives } from "./DemosInteractives";

import { Accordeon } from "@/components/site/Accordeon";
import {
  BadgePromo,
  Eclat,
  EtiquettePromo,
  Ruban,
  Surtitre,
  Tampon,
} from "@/components/site/Autocollants";
import { BadgesStores } from "@/components/site/BadgesStores";
import { BandeDefilante, ElementBande } from "@/components/site/BandeDefilante";
import { BordDechire } from "@/components/site/BordDechire";
import { Bouton, LienBouton } from "@/components/site/Bouton";
import { BoutonRond } from "@/components/site/BoutonRond";
import {
  ChampSelection,
  ChampTexte,
  ChampZoneTexte,
} from "@/components/site/Champs";
import { CaseACocher, ChoixRadio, GroupeChoix } from "@/components/site/Choix";
import { Niveau, Pastille, Statut, Tag } from "@/components/site/Etiquettes";
import { Icone, NOMS_ICONES } from "@/components/site/Icone";
import { Lien, LienFleche } from "@/components/site/Lien";
import { PhotoPlat } from "@/components/site/PhotoPlat";
import { QrAppli } from "@/components/site/QrAppli";
import { RangeeDefilante } from "@/components/site/RangeeDefilante";
import { Conteneur, Section } from "@/components/site/Section";
import { TitreAffiche } from "@/components/site/TitreAffiche";
import { fcfa, INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

// Page interne de vérification des composants du design : jamais servie en
// production, jamais indexée, absente du sitemap.
export const metadata: Metadata = {
  title: "Nuancier",
  robots: { index: false, follow: false },
};

const COULEURS = [
  "orange",
  "orange-appui",
  "orange-texte",
  "orange-pale",
  "jaune",
  "jaune-pale",
  "jaune-appli",
  "encre",
  "encre-forte",
  "encre-doux",
  "encre-clair",
  "papier",
  "surface",
  "creme",
  "trait",
  "trait-fort",
  "sur-encre-doux",
  "trait-sombre",
  "ok",
  "ok-fond",
  "rouge",
  "rouge-fond",
  "standard",
  "vip",
  "vvip",
  "fond-photo",
];

const OMBRES = [
  "shadow-1",
  "shadow-2",
  "shadow-photo",
  "shadow-bouton",
  "shadow-bouton-survol",
  "shadow-haut",
  "shadow-autocollant",
];

function Partie({
  id,
  titre,
  children,
}: {
  id: string;
  titre: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-5 border-t border-trait py-10"
    >
      <h2 className="text-xl font-bold" id={id}>
        {titre}
      </h2>
      {children}
    </section>
  );
}

export default async function Nuancier({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <div className="w-full">
      <Conteneur className="pt-28 pb-6 md:pt-32">
        <Surtitre>Page interne</Surtitre>
        <h1 className="mt-2 text-3xl font-extrabold">
          Nuancier du nouveau design
        </h1>
        <p className="mt-2 max-w-[40em] text-encre-doux">
          Chaque composant de components/site, à vérifier à 320, 375, 768 et 1
          {INSECABLE}280 px. Servie en développement seulement.
        </p>
      </Conteneur>

      <Conteneur>
        <Partie id="couleurs" titre="Couleurs, rayons, ombres">
          <ul className="grid list-none grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {COULEURS.map((c) => (
              <li key={c} className="grid gap-1 text-xs">
                <span
                  className="h-12 rounded-carte border border-trait"
                  style={{ background: `var(--color-${c})` }}
                />
                {c}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="grid size-20 place-items-center rounded-pilule border border-trait-fort">
              pilule
            </span>
            <span className="grid size-20 place-items-center rounded-carte border border-trait-fort">
              carte
            </span>
            <span className="grid size-20 place-items-center rounded-photo border border-trait-fort">
              photo
            </span>
            <span className="grid size-20 place-items-center rounded-panneau border border-trait-fort">
              panneau
            </span>
          </div>
          <div className="flex flex-wrap gap-6 text-xs">
            {OMBRES.map((o) => (
              <span
                key={o}
                className={`grid h-16 w-28 place-items-center rounded-carte bg-white ${o}`}
              >
                {o}
              </span>
            ))}
          </div>
        </Partie>

        <Partie id="typographie" titre="Typographie">
          <TitreAffiche niveau="p">Promotions du moment</TitreAffiche>
          <TitreAffiche niveau="p" taille="ecran">
            La carte
          </TitreAffiche>
          <TitreAffiche niveau="p" taille="compacte">
            Mes commandes
          </TitreAffiche>
          <TitreAffiche niveau="p" taille="appli">
            Nos 5 restaurants.
          </TitreAffiche>
          <TitreAffiche niveau="p" taille="panneau">
            Votre panier
          </TitreAffiche>
          <div className="grid gap-1">
            <p className="font-normal">
              Poppins 400 : livré chez vous dans le Grand Abidjan.
            </p>
            <p className="font-medium">
              Poppins 500 : livré chez vous dans le Grand Abidjan.
            </p>
            <p className="font-semibold">
              Poppins 600 : livré chez vous dans le Grand Abidjan.
            </p>
            <p className="font-bold">
              Poppins 700 : livré chez vous dans le Grand Abidjan.
            </p>
            <p className="font-extrabold">
              Poppins 800 : livré chez vous dans le Grand Abidjan.
            </p>
            <p className="text-encre-doux">
              Texte doux sur papier, et en lien orange foncé :{" "}
              <Lien href="/fr">accueil</Lien>
            </p>
          </div>
        </Partie>

        <Partie id="boutons" titre="Boutons et liens">
          <div className="flex flex-wrap items-center gap-3">
            <Bouton>Principal</Bouton>
            <Bouton variante="secondaire">Secondaire</Bouton>
            <Bouton variante="sombre">Sombre</Bouton>
            <Bouton disabled>Désactivé</Bouton>
            <Bouton icone="plus" taille="petit">
              Ajouter
            </Bouton>
            <LienBouton
              href="/fr"
              iconeFin="fleche"
              taille="grand"
              variante="sombre"
            >
              Voir la carte et commander
            </LienBouton>
          </div>
          {/* Largeur intérieure d'un panneau de la caisse : 250 px à 320 px de
              large, 350 px à 420 px, 598 px dès 720 px. Aucun bouton ne doit
              passer sur deux lignes ni déborder. */}
          <div
            className="flex w-full max-w-[250px] flex-col items-start gap-3 outline-1 outline-trait-fort outline-dashed min-[420px]:max-w-[350px] md:max-w-[598px]"
            data-test="panneau-320"
          >
            <Bouton
              icone="whatsapp"
              libelleCourt="Recevoir mon code"
              taille="grand"
            >
              Recevoir mon code sur WhatsApp
            </Bouton>
            <Bouton taille="grand">Payer {fcfa(124500)}</Bouton>
            <Bouton taille="grand">Valider la commande</Bouton>
            <Bouton taille="grand">Créer mon compte</Bouton>
            <Bouton bloc entre iconeFin="fleche" taille="grand">
              Passer commande
            </Bouton>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <BoutonRond icone="croix" libelle="Fermer" />
            <BoutonRond icone="croix" libelle="Fermer" variante="blanc" />
            <BoutonRond icone="menu" libelle="Menu" />
            <Lien href="/fr/restaurants">Horaires</Lien>
            <Lien icone="retour">Modifier le numéro</Lien>
            <Lien disabled>Renvoyer le code dans 30 s</Lien>
            <LienFleche href="/fr">Toute la carte</LienFleche>
            <Lien href={telLien()}>{TELEPHONE}</Lien>
          </div>
        </Partie>

        <Partie id="etiquettes" titre="Étiquettes">
          <div className="flex flex-wrap gap-2">
            <Pastille promo href="#promotions">
              Promotions
            </Pastille>
            <Pastille actif href="#box">
              Box
            </Pastille>
            <Pastille href="#burgers">Burgers</Pastille>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag genre="emporter">À emporter</Tag>
            <Tag genre="offert">Offert</Tag>
            <Tag>Épicé</Tag>
            <Statut etat="attente">En attente</Statut>
            <Statut etat="cours">En préparation</Statut>
            <Statut etat="fini">Livrée</Statut>
            <Niveau niveau="standard" />
            <Niveau niveau="vip" />
            <Niveau niveau="vvip" />
          </div>
        </Partie>

        <Partie id="autocollants" titre="Autocollants">
          <div className="relative flex flex-wrap items-center gap-10 rounded-panneau bg-orange p-8 [background-image:var(--motif-clair)] [background-size:72px_72px]">
            <Ruban>Délicieux jusqu’à l’os</Ruban>
            <Tampon fort={`100${INSECABLE}%`} texte="Halal" />
            <Eclat fort={`100${INSECABLE}%`} texte="Local" />
            <div className="w-full max-w-[460px]">
              <EtiquettePromo
                action={
                  <Bouton
                    aria-label="Choisir Box de la Nation"
                    icone="plus"
                    taille="petit"
                  >
                    Ajouter
                  </Bouton>
                }
                nom="Box de la Nation"
                prix={
                  <p className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
                    <strong className="rounded-md bg-jaune px-1.5 text-base">
                      {fcfa(5500)}
                    </strong>
                    <s className="text-[13px] text-encre-doux">
                      <span className="sr-only">Au lieu de </span>
                      {fcfa(6500)}
                    </s>
                  </p>
                }
                surtitre="Promotion du moment"
              />
            </div>
          </div>
        </Partie>

        <Partie id="photos" titre="Photos de plats">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <PhotoPlat
              etiquette
              alt="Seau de poulet"
              className="h-[190px]"
              sizes="(min-width: 720px) 25vw, 50vw"
              src="/assets/site/seau.webp"
            >
              <BadgePromo>Promo</BadgePromo>
            </PhotoPlat>
            <PhotoPlat
              alt="Seau couché, dessin"
              className="h-[190px]"
              fond="#FFFFFF"
              sizes="(min-width: 720px) 25vw, 50vw"
              src="/assets/site/seau-renverse-dessin.png"
            />
            <PhotoPlat
              etiquette
              alt="Cuisse de poulet, dessin"
              className="h-[190px]"
              sizes="(min-width: 720px) 25vw, 50vw"
              src="/assets/site/cuisse-poulet-dessin.png"
            />
            <PhotoPlat
              alt="Boîte de poulet, dessin"
              className="h-14 w-16"
              marge={3}
              sizes="64px"
              src="/assets/site/boite-poulet-dessin.png"
            />
          </div>
        </Partie>

        <Partie id="rangee" titre="Rangée défilante">
          <RangeeDefilante as="ul" genre="promos" libelle="Rangée de cartes">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <li
                key={n}
                className="grid h-40 place-items-center rounded-carte border-2 border-encre bg-orange font-bold shadow-autocollant"
              >
                Carte {n}
              </li>
            ))}
          </RangeeDefilante>
        </Partie>
      </Conteneur>

      <Section
        motif
        className="pb-[calc(max(100px,7.2vw)-4px)]"
        fond="jaune"
        titreId="nuancier-section-jaune"
      >
        <TitreAffiche id="nuancier-section-jaune">Section jaune</TitreAffiche>
        <p className="mt-2">
          Aplat jaune bord à bord, motif sombre, bord déchiré vers le papier.
        </p>
        <BordDechire />
      </Section>

      <BandeDefilante>
        <ElementBande horloge>Livré en 20 à 35 min</ElementBande>
        <ElementBande>Retrait au restaurant</ElementBande>
        <ElementBande>Paiement mobile ou carte</ElementBande>
        <ElementBande>Ouvert 7 j/7 dès 10 h</ElementBande>
        <ElementBande>Poulet 100{INSECABLE}% local et halal</ElementBande>
      </BandeDefilante>

      <Section
        className="pt-16 pb-[calc(max(100px,7.2vw)+6px)]"
        fond="orange-pale"
        titreId="nuancier-section-pale"
      >
        <TitreAffiche id="nuancier-section-pale">
          Section orange pale
        </TitreAffiche>
        <p className="mt-2">Bord retourné.</p>
        <BordDechire inverse />
      </Section>

      <Section motif fond="encre" titreId="nuancier-section-encre">
        <TitreAffiche className="text-jaune" id="nuancier-section-encre">
          Section sombre
        </TitreAffiche>
        <p className="mt-2 text-sur-encre-doux">
          Contour de focus jaune sur fond sombre.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Bouton>Bouton</Bouton>
          <LienFleche className="text-white" href="/fr">
            Lien
          </LienFleche>
        </div>
      </Section>

      <div className="relative mt-20 bg-encre pt-1.5 pb-6 text-white">
        <BordDechire aplati haut couleur="encre" />
        <Conteneur>
          <p className="font-affiche text-[clamp(36px,9vw,58px)] leading-none text-jaune">
            {TELEPHONE}
          </p>
          <p className="text-sm text-sur-encre-doux">
            Haut du pied de page : bord sombre aplati.
          </p>
        </Conteneur>
      </div>

      <Conteneur>
        <Partie id="formulaires" titre="Formulaires">
          <form className="grid max-w-[460px] gap-4">
            <ChampTexte
              aide="Numéro ivoirien à 10 chiffres, qui commence par 07, 05 ou 01."
              autoComplete="tel-national"
              id="nuancier-tel"
              inputMode="numeric"
              label="Votre numéro mobile"
              placeholder="Numéro à 10 chiffres"
              prefixe="+225"
              type="tel"
            />
            <ChampTexte
              autoComplete="given-name"
              erreur="Indiquez votre prénom."
              id="nuancier-prenom"
              label="Prénom"
            />
            <ChampZoneTexte id="nuancier-message" label="Message" />
            <ChampSelection
              defaultValue=""
              id="nuancier-resto"
              label="Restaurant"
            >
              <option disabled value="">
                Choisir
              </option>
              <option value="zone-4">Marcory Zone 4</option>
              <option value="angre">Angré</option>
            </ChampSelection>
            <GroupeChoix
              colonnes
              requis
              legende="Choix du menu"
              precision="Obligatoire"
            >
              <ChoixRadio
                defaultChecked
                inclus
                id="nuancier-m1"
                label="Seul"
                name="nuancier-menu"
                prix="Inclus"
              />
              <ChoixRadio
                detail="Frites et boisson"
                id="nuancier-m2"
                label="En menu"
                name="nuancier-menu"
                prix={`+ ${fcfa(1500)}`}
              />
              <ChoixRadio
                disabled
                id="nuancier-m3"
                label="Indisponible"
                name="nuancier-menu"
              />
            </GroupeChoix>
            <GroupeChoix
              erreur="Choisissez une sauce."
              idErreur="nuancier-sauce-erreur"
              legende="Sauces"
              precision="2 au choix"
            >
              <CaseACocher id="nuancier-s1" label="Mayonnaise" />
              <CaseACocher defaultChecked id="nuancier-s2" label="Ketchup" />
            </GroupeChoix>
            <GroupeChoix pilules legende="Épicé">
              <ChoixRadio
                defaultChecked
                pilule
                id="nuancier-e1"
                label="Non"
                name="nuancier-epice"
              />
              <ChoixRadio
                pilule
                id="nuancier-e2"
                label="Oui"
                name="nuancier-epice"
              />
            </GroupeChoix>
          </form>
        </Partie>

        <Partie id="interactifs" titre="Fenêtres, compteurs, code, message">
          <DemosInteractives />
        </Partie>

        <Partie id="volets" titre="Volets">
          <div className="grid max-w-[640px] gap-2.5">
            <Accordeon
              groupe="nuancier-faq"
              sousTitre="2 choisis"
              titre="Sauces"
            >
              <p className="text-sm">
                Un seul volet du groupe ouvert à la fois.
              </p>
            </Accordeon>
            <Accordeon ouvert groupe="nuancier-faq" titre="Boissons">
              <p className="text-sm">Ouvert au premier affichage.</p>
            </Accordeon>
          </div>
        </Partie>

        <Partie id="appli" titre="Application">
          <div className="flex flex-wrap items-center gap-5 rounded-panneau bg-jaune-appli p-5">
            <QrAppli className="hidden md:block" />
            <BadgesStores pile />
          </div>
          <BadgesStores petits />
        </Partie>

        <Partie id="icones" titre="Icônes">
          <ul className="grid list-none grid-cols-3 gap-3 text-xs sm:grid-cols-6 lg:grid-cols-9">
            {NOMS_ICONES.map((nom) => (
              <li key={nom} className="grid justify-items-center gap-1">
                <Icone className="size-6" nom={nom} />
                {nom}
              </li>
            ))}
          </ul>
        </Partie>
      </Conteneur>
    </div>
  );
}
