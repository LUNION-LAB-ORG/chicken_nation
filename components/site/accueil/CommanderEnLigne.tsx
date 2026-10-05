import Image from "../Image";
import { BordDechire } from "../BordDechire";
import { LienBouton } from "../Bouton";
import { Conteneur, Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import styles from "./CommanderEnLigne.module.css";

import { INSECABLE } from "@/lib/typo";

// Icônes dessinées du site actuel (retouche 10).
const ETAPES = [
  {
    icone: { src: "/assets/site/icone-panier.png", largeur: 300, hauteur: 231 },
    titre: "Composez votre menu",
    texte: `Taille, sauces, épicé ou non, boissons et suppléments${INSECABLE}: comme dans l'application.`,
  },
  {
    icone: { src: "/assets/site/icone-cloche.png", largeur: 300, hauteur: 295 },
    titre: "Connectez-vous par WhatsApp",
    texte: `Vous recevez un code à 4${INSECABLE}chiffres sur WhatsApp. C'est le même compte que dans l'application, avec vos points et vos cadeaux.`,
  },
  {
    icone: { src: "/assets/site/icone-trajet.png", largeur: 200, hauteur: 300 },
    titre: "Payez et suivez",
    texte:
      "Wave, Orange Money, MTN MoMo, Moov Money ou carte avec KKiaPay. Vous suivez ensuite la commande jusqu'à votre porte.",
  },
] as const;

/**
 * « Commander en ligne » (maquette, HTML 150-185, CSS 556-583) : trois
 * étapes, numéros en police d'affiche, boîte dessinée dès 1 024 px, bord
 * déchiré retourné. Texte fixe.
 */
export function CommanderEnLigne() {
  return (
    <Section
      className={styles.bloc}
      conteneur={false}
      espacement="aucun"
      fond="orange-pale"
      id="commander-en-ligne"
      titreId="commander-en-ligne-titre"
    >
      <Conteneur className={styles.grille}>
        <div className={styles.intro}>
          <TitreAffiche id="commander-en-ligne-titre">
            Commander en ligne
          </TitreAffiche>
          <p>
            Trois étapes, sans mot de passe. En livraison ou à retirer au
            restaurant.
          </p>
          <div className="mt-2">
            <LienBouton href="/fr/carte" taille="grand">
              Commencer ma commande
            </LienBouton>
          </div>
        </div>
        <ol className={styles.etapes}>
          {ETAPES.map((etape, i) => (
            <li key={etape.titre} className={styles.etape}>
              <Image
                alt=""
                className={styles.icone}
                height={etape.icone.hauteur}
                // 60 px sur téléphone (fichier de 128 px et non de 256 px).
                sizes="(min-width: 720px) 76px, 60px"
                src={etape.icone.src}
                width={etape.icone.largeur}
              />
              <div className="min-w-0">
                <h3>
                  <span aria-hidden="true" className={styles.numero}>
                    {i + 1}
                  </span>
                  {etape.titre}
                </h3>
                <p>{etape.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </Conteneur>
      {/* Posée en bas à gauche de la section, sous le bord déchiré. */}
      <Image
        alt=""
        className={styles.boite}
        height={560}
        sizes="(min-width: 1240px) 250px, 220px"
        src="/assets/site/boite-poulet-dessin.png"
        width={560}
      />
      <BordDechire inverse couleur="papier" />
    </Section>
  );
}
