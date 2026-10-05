import type { IClient, ICommande, Resultat } from "../types/commande.types";
import type { ICompteClient } from "../utils/suivi.utils";
import type { ReactNode } from "react";

import { telephoneLisible } from "../utils/panier.utils";
import { aPayer } from "../utils/statut.utils";
import {
  dateCommande,
  estServie,
  lieuCommande,
  peutRecommander,
  pointsCredites,
  resumeCommande,
  texteReglesPoints,
} from "../utils/suivi.utils";

import { ActionsCommande, BoutonDeconnexion } from "./ActionsCommande";
import { PastilleStatut } from "./FriseSuivi";

import { LienBouton } from "@/components/site/Bouton";
import { Niveau } from "@/components/site/Etiquettes";
import { Lien } from "@/components/site/Lien";
import { fcfa, INSECABLE, nombre } from "@/lib/typo";

const PANNEAU =
  "grid min-w-0 gap-4 rounded-panneau border border-trait bg-white px-[18px] py-5 md:px-7 md:py-[26px]";

/**
 * Bloc « Mon compte » (maquette, JS 1469-1474) : nom et numéro du client,
 * niveau, points utilisables et leur valeur, cadeaux à utiliser, règles des
 * points tirées du back office, « Se déconnecter ». Une partie illisible sur
 * l'API est simplement omise.
 */
export function PanneauCompte({
  client,
  compte,
}: {
  client: IClient;
  compte: ICompteClient | null;
}) {
  const nom = [client.first_name, client.last_name].filter(Boolean).join(" ");
  const valeurPoint = compte?.reglages?.valeurPoint ?? 0;
  const regles = texteReglesPoints(compte?.reglages);

  return (
    <section aria-labelledby="t-compte" className={PANNEAU}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <h2 className="text-xl leading-tight font-bold" id="t-compte">
          Mon compte
        </h2>
        {compte?.niveau ? (
          <p className="flex items-center gap-1.5 text-[12.5px] text-encre-doux">
            Niveau <Niveau niveau={compte.niveau} />
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-carte bg-surface p-3.5">
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-full bg-orange text-[17px] font-extrabold text-encre"
        >
          {(client.first_name ?? "").charAt(0).toUpperCase()}
        </span>
        <p className="min-w-0 text-[13px] text-encre-doux">
          <strong className="block text-[15px] text-encre [overflow-wrap:anywhere]">
            {nom}
          </strong>
          {telephoneLisible(client.phone).replace(/ /g, INSECABLE)}
        </p>
      </div>
      {compte && (compte.solde !== null || compte.cadeaux !== null) ? (
        <dl className="grid grid-cols-2 gap-2.5">
          {compte.solde !== null ? (
            <div className="grid content-start gap-0.5 rounded-xl bg-surface p-3 text-[12.5px] text-encre-doux">
              <dt>Points</dt>
              <dd className="text-xl font-bold text-encre tabular-nums">
                {nombre(compte.solde)}
              </dd>
              {valeurPoint > 0 ? (
                <dd>soit {fcfa(compte.solde * valeurPoint)}</dd>
              ) : null}
            </div>
          ) : null}
          {compte.cadeaux !== null ? (
            <div className="grid content-start gap-0.5 rounded-xl bg-surface p-3 text-[12.5px] text-encre-doux">
              <dt>Cadeaux</dt>
              <dd className="text-xl font-bold text-encre tabular-nums">
                {nombre(compte.cadeaux.length)}
              </dd>
              <dd className="[overflow-wrap:anywhere]">
                {compte.cadeaux.length
                  ? compte.cadeaux.join(", ")
                  : "à gratter dans l'appli"}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {regles ? (
        <p className="text-[12.5px] leading-[1.45] text-encre-doux">{regles}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <BoutonDeconnexion />
      </div>
    </section>
  );
}

/**
 * Une commande de la liste (maquette, JS 1449-1458) : référence et date,
 * état, plats, lieu, total et points gagnés, puis les actions.
 */
export function CarteCommande({
  commande: c,
  pointsParFranc,
  actions,
}: {
  commande: ICommande;
  pointsParFranc: number | null;
  actions?: ReactNode;
}) {
  const lieu = lieuCommande(c);
  const points = pointsCredites(c, pointsParFranc);
  const resume = resumeCommande(c);

  return (
    <article
      aria-labelledby={`cmd-${c.id}`}
      className="grid gap-2.5 rounded-carte border border-trait bg-white px-[18px] py-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <h3 className="text-base font-bold" id={`cmd-${c.id}`}>
          <span className="whitespace-nowrap">{c.reference}</span>{" "}
          <small className="text-[13px] font-medium whitespace-nowrap text-encre-doux">
            · {dateCommande(c.created_at)}
          </small>
        </h3>
        <PastilleStatut commande={c} />
      </div>
      <p className="text-[13.5px] leading-normal text-encre-doux [overflow-wrap:anywhere]">
        {resume ? (
          <>
            {resume}
            <br />
          </>
        ) : null}
        {lieu.court} · {lieu.detail} ·{" "}
        <strong className="text-encre tabular-nums">{fcfa(c.amount)}</strong>
        {points >= 1
          ? ` · +${nombre(points)}${INSECABLE}point${points >= 2 ? "s" : ""}`
          : null}
      </p>
      {actions}
    </article>
  );
}

/** Actions d'une commande : payer ou modifier, suivre, recommander. */
function actionsDe(c: ICommande) {
  const lien = `/fr/commander/${c.id}`;
  const pourClient = { id: c.id, reference: c.reference, lignes: c.lignes };

  if (aPayer(c)) {
    return (
      <ActionsCommande
        action="modifier"
        avant={
          <LienBouton href={lien}>Payer {fcfa(Math.ceil(c.amount))}</LienBouton>
        }
        commande={pourClient}
      />
    );
  }
  if (peutRecommander(c)) {
    return (
      <ActionsCommande
        action="recommander"
        apres={<Lien href={lien}>Voir le détail</Lien>}
        commande={pourClient}
      />
    );
  }
  if (estServie(c) || c.status === "CANCELLED") {
    return (
      <div className="flex flex-wrap gap-2">
        <Lien href={lien}>Voir le détail</Lien>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <LienBouton href={lien}>Suivre la commande</LienBouton>
    </div>
  );
}

/**
 * Mes commandes, client connecté (maquette, JS 1466-1480) : « Mon compte »
 * à gauche dès 1 000 px, la liste des commandes à droite. Composant serveur ;
 * seuls les boutons qui agissent (modifier, recommander, se déconnecter)
 * sont des îlots du navigateur.
 */
export function MesCommandes({
  client,
  commandes,
  compte,
}: {
  client: IClient;
  commandes: Resultat<ICommande[]>;
  compte: Resultat<ICompteClient>;
}) {
  const donnees = compte.ok ? compte.data : null;
  const pointsParFranc = donnees?.reglages?.pointsParFranc ?? null;

  return (
    <div className="grid grid-cols-1 items-start gap-5 min-[1000px]:grid-cols-[340px_minmax(0,1fr)] min-[1000px]:gap-7">
      <PanneauCompte client={client} compte={donnees} />
      <section aria-labelledby="t-liste" className="grid min-w-0 gap-3">
        <h2 className="text-xl leading-tight font-bold" id="t-liste">
          Vos commandes
        </h2>
        {!commandes.ok ? (
          <p
            className="rounded-carte bg-rouge-fond px-3.5 py-3 text-sm text-rouge"
            role="alert"
          >
            {commandes.message}
          </p>
        ) : commandes.data.length === 0 ? (
          <div className={PANNEAU}>
            <p>Aucune commande pour le moment.</p>
            <div>
              <LienBouton href="/fr/carte" iconeFin="fleche">
                Voir la carte
              </LienBouton>
            </div>
          </div>
        ) : (
          <ul className="grid list-none gap-3">
            {commandes.data.map((c) => (
              <li key={c.id}>
                <CarteCommande
                  actions={actionsDe(c)}
                  commande={c}
                  pointsParFranc={pointsParFranc}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
