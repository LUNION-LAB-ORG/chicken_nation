import type { IPlatDetail } from "@/features/commande/types/commande.types";

import { supplementsParCategorie } from "@/features/commande/utils/fiche.utils";
import { fcfa, INSECABLE, joli, typo } from "@/lib/typo";

/** « Barbecue, Crème à l'ail ou Cheddar » (un seul choix) ; sinon séparés par des virgules. */
function enumeration(noms: string[], ou: boolean) {
  if (!ou || noms.length <= 1) return noms.join(", ");

  return `${noms.slice(0, -1).join(", ")} ou ${noms[noms.length - 1]}`;
}

/** « Cheddar (+500 FCFA) » ; un choix inclus garde son nom seul. */
const avecPrix = (nom: string, prix: number) =>
  prix > 0 ? `${joli(nom)} (+${fcfa(prix)})` : joli(nom);

/** Phrase de l'épicé, ou null quand le plat n'est jamais épicé. */
export function phraseEpice(niveau: IPlatDetail["spice_level"]) {
  if (niveau === "OPTIONAL") return "Épicé ou non, au choix à la commande.";
  if (niveau === "ALWAYS") return "Servi épicé.";

  return null;
}

/** Lignes « Sauce (1 au choix) : Barbecue, Crème à l'ail ou Cheddar (+500 FCFA) » des choix et des suppléments. */
export function lignesComposition(detail: IPlatDetail) {
  const choix = detail.groupes.map((g) => {
    const items = g.items.filter((i) => i.available);
    const regle =
      g.min_select > 0
        ? g.min_select === g.max_select
          ? `${g.min_select} au choix`
          : `${g.min_select} à ${g.max_select} au choix`
        : g.max_select > 1
          ? `jusqu'à ${g.max_select}, facultatif`
          : "facultatif";

    return {
      titre: `${typo(g.name.trim())} (${regle})`,
      texte: enumeration(
        items.map((i) => avecPrix(i.label, i.price_delta)),
        g.max_select === 1,
      ),
    };
  });
  const supplements = supplementsParCategorie(detail.supplements).map((c) => ({
    titre: `${c.libelle} en supplément`,
    texte: enumeration(
      c.supplements.map((s) => avecPrix(s.name, s.price)),
      false,
    ),
  }));

  return [...choix, ...supplements].filter((l) => l.texte);
}

/**
 * Composition et choix d'un plat, écrits dans le HTML de sa page (composant
 * serveur) : épicé ou non, choix d'un menu composable, suppléments par
 * catégorie avec leur prix. Uniquement des faits de l'API, rien d'inventé.
 * Rien à dire (plat simple, API muette) : aucun bloc.
 */
export function CompositionPlat({ detail }: { detail: IPlatDetail | null }) {
  if (!detail) return null;
  const epice = phraseEpice(detail.spice_level);
  const lignes = lignesComposition(detail);

  if (!epice && lignes.length === 0) return null;

  return (
    <section aria-labelledby="titre-composition" className="mt-6">
      <h2 className="text-lg leading-tight font-bold" id="titre-composition">
        Composition et choix
      </h2>
      {epice ? (
        <p className="mt-2 text-sm leading-[1.6] text-encre-doux">{epice}</p>
      ) : null}
      {lignes.length ? (
        <dl className="mt-2 grid gap-1.5 text-sm leading-[1.55]">
          {lignes.map((l) => (
            <div key={l.titre}>
              <dt className="inline font-semibold text-encre">
                {l.titre}
                {INSECABLE}:{" "}
              </dt>
              <dd className="inline text-encre-doux">{l.texte}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
