"use client";

import { useState } from "react";

import { Bouton } from "@/components/site/Bouton";
import { ChampCode } from "@/components/site/ChampCode";
import { Compteur } from "@/components/site/Compteur";
import { Feuille } from "@/components/site/Feuille";
import {
  Annonce,
  afficherMessage,
  MessageFlottant,
} from "@/components/site/MessageFlottant";
import { PhotoPlat } from "@/components/site/PhotoPlat";
import { TitreAffiche } from "@/components/site/TitreAffiche";
import { fcfa } from "@/lib/typo";

/** Parties du nuancier qui demandent un état : fenêtres, compteurs, code. */
export function DemosInteractives() {
  const [fenetre, setFenetre] = useState<"fiche" | "tiroir" | "centre" | null>(
    null,
  );
  const [quantite, setQuantite] = useState(1);
  const [quantiteLigne, setQuantiteLigne] = useState(2);
  const [ligneRetiree, setLigneRetiree] = useState(false);
  const [code, setCode] = useState("");
  const [codeValide, setCodeValide] = useState<string | null>(null);
  const fermer = () => setFenetre(null);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap gap-3">
        <Bouton variante="secondaire" onClick={() => setFenetre("fiche")}>
          Ouvrir la fiche
        </Bouton>
        <Bouton variante="secondaire" onClick={() => setFenetre("tiroir")}>
          Ouvrir le tiroir
        </Bouton>
        <Bouton variante="secondaire" onClick={() => setFenetre("centre")}>
          Ouvrir la petite fenêtre
        </Bouton>
        <Bouton
          variante="sombre"
          onClick={() =>
            afficherMessage("Ajouté au panier\u00a0: 1 × Box de la Nation")
          }
        >
          Afficher un message
        </Bouton>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <Compteur valeur={quantite} onChange={setQuantite} />
        <Compteur taille="grand" valeur={quantite} onChange={setQuantite} />
        {ligneRetiree ? (
          <Bouton
            taille="petit"
            variante="secondaire"
            onClick={() => setLigneRetiree(false)}
          >
            Remettre la ligne
          </Bouton>
        ) : (
          <Compteur
            nom="Box de la Nation"
            valeur={quantiteLigne}
            onChange={setQuantiteLigne}
            onRetirer={() => setLigneRetiree(true)}
          />
        )}
      </div>

      <div className="grid max-w-[460px] gap-3">
        <ChampCode
          erreur={
            code === "0000"
              ? "Code incorrect. Vérifiez le message reçu sur WhatsApp."
              : null
          }
          id="nuancier-code"
          valeur={code}
          onChange={(c) => {
            setCode(c);
            setCodeValide(null);
          }}
          onComplet={setCodeValide}
        />
        <p className="text-sm text-encre-doux">
          {codeValide
            ? `Code complet : ${codeValide}`
            : "Tapez ou collez 4 chiffres (0000 montre l'erreur)."}
        </p>
      </div>

      <Feuille
        forme="fiche"
        libelleFermer="Fermer la fiche"
        ouverte={fenetre === "fiche"}
        titreId="nuancier-fiche-titre"
        onFermer={fermer}
      >
        <div className="grid min-h-0 flex-1 content-start gap-[18px] overflow-y-auto overscroll-contain px-4 pb-5 md:p-[26px]">
          <div className="grid gap-4 min-[760px]:grid-cols-[auto_minmax(0,1fr)] min-[760px]:items-center min-[760px]:gap-7">
            <PhotoPlat
              etiquette
              etiquetteGauche
              alt="Seau Chicken Nation"
              className="-mx-4 h-[260px] rounded-none min-[760px]:mx-0 min-[760px]:h-[250px] min-[760px]:w-[240px] min-[760px]:rounded-carte"
              marge={14}
              sizes="(min-width: 760px) 240px, 100vw"
              src="/assets/site/seau.webp"
              tailleEtiquette={34}
            />
            <div className="grid gap-1.5 min-[760px]:pr-11">
              <h2
                className="text-[22px] leading-[1.15] font-extrabold md:text-[26px]"
                id="nuancier-fiche-titre"
              >
                Box de la Nation
              </h2>
              <p className="text-[14.5px] text-encre-doux">
                Poulet pané, frites et boisson au choix.
              </p>
              <p className="text-xl font-bold tabular-nums">{fcfa(6500)}</p>
            </div>
          </div>
          {Array.from({ length: 8 }, (_, i) => (
            <p key={i} className="text-sm text-encre-doux">
              Ligne de contenu {i + 1} pour vérifier le défilement dans la
              fenêtre.
            </p>
          ))}
        </div>
        <div className="flex flex-none items-center gap-2.5 border-t border-trait bg-white px-4 pt-3 pb-[calc(14px+env(safe-area-inset-bottom,0px))] shadow-haut md:gap-3 md:px-[26px]">
          <Compteur taille="grand" valeur={quantite} onChange={setQuantite} />
          <Bouton
            entre
            className="min-w-0 flex-1"
            taille="grand"
            onClick={() => afficherMessage("Ajouté au panier")}
          >
            <span>Ajouter</span>
            <span className="tabular-nums">{fcfa(6500 * quantite)}</span>
          </Bouton>
        </div>
      </Feuille>

      <Feuille
        forme="tiroir"
        ouverte={fenetre === "tiroir"}
        titreId="nuancier-tiroir-titre"
        onFermer={fermer}
      >
        <div className="relative bg-orange [background-image:var(--motif-clair)] [background-size:72px_72px] py-[18px] pr-[70px] pl-4 md:py-5 md:pl-5">
          <TitreAffiche
            id="nuancier-tiroir-titre"
            niveau="h2"
            tabIndex={-1}
            taille="panneau"
          >
            Votre panier
          </TitreAffiche>
          <p className="mt-1 text-[13px] font-medium">2 plats</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-5">
          <p className="text-sm">Contenu du panier.</p>
        </div>
        <div className="grid gap-3 border-t border-trait bg-white px-4 pt-3.5 pb-[calc(16px+env(safe-area-inset-bottom,0px))] shadow-haut md:px-5">
          <Bouton bloc entre iconeFin="fleche" taille="grand" onClick={fermer}>
            Passer commande
          </Bouton>
        </div>
      </Feuille>

      <Feuille
        forme="centre"
        libelleFermer="Fermer la fenêtre"
        ouverte={fenetre === "centre"}
        titreId="nuancier-centre-titre"
        onFermer={fermer}
      >
        <div className="grid gap-3.5 p-5 pr-16">
          <h2 className="text-[22px] font-extrabold" id="nuancier-centre-titre">
            Petite fenêtre
          </h2>
          <p className="text-sm text-encre-doux">
            Fermeture par Échap, par le bouton ou par un clic sur le fond.
          </p>
          <Bouton bloc onClick={fermer}>
            Compris
          </Bouton>
        </div>
      </Feuille>

      <MessageFlottant />
      <Annonce />
    </div>
  );
}
