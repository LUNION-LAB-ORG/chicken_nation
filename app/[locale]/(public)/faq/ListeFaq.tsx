import {
  type BlocFaq,
  type LigneFaq,
  morceaux,
  type RubriqueFaq,
} from "./meta";

import { Accordeon } from "@/components/site/Accordeon";
import { Ancre } from "@/components/site/Ancre";
import { Pastille } from "@/components/site/Etiquettes";
import { LienFleche } from "@/components/site/Lien";

const classeLien =
  "font-semibold text-orange-texte underline decoration-[1.5px] underline-offset-[3px] hover:text-encre";

/** Une ligne de réponse : textes et liens, dans l'ordre. */
function Ligne({ ligne }: { ligne: LigneFaq }) {
  return morceaux(ligne).map((m, i) =>
    typeof m === "string" ? (
      m
    ) : (
      <Ancre
        key={i}
        className={
          m.href.startsWith("tel:")
            ? `${classeLien} whitespace-nowrap`
            : classeLien
        }
        href={m.href}
      >
        {m.texte}
      </Ancre>
    ),
  );
}

function Bloc({ bloc }: { bloc: BlocFaq }) {
  if (typeof bloc === "object" && "liste" in bloc) {
    return (
      <ul className="grid list-disc gap-1.5 pl-5 marker:text-orange-texte">
        {bloc.liste.map((ligne, i) => (
          <li key={i}>
            <Ligne ligne={ligne} />
          </li>
        ))}
      </ul>
    );
  }

  // Un lien seul sur sa ligne (« Demander ma Carte de la Nation ») : lien
  // fléché, cible de 44 px.
  const seul = morceaux(bloc);

  if (seul.length === 1 && typeof seul[0] !== "string")
    return (
      <p>
        <LienFleche className="whitespace-normal" href={seul[0].href}>
          {seul[0].texte}
        </LienFleche>
      </p>
    );

  return (
    <p>
      <Ligne ligne={bloc} />
    </p>
  );
}

/**
 * Questions fréquentes : accès direct aux rubriques, puis une rubrique (h2)
 * par thème et un volet natif par question. Le texte affiché est celui du
 * JSON-LD (même tableau, voir meta.ts). Composant serveur.
 */
export function ListeFaq({ rubriques }: { rubriques: RubriqueFaq[] }) {
  return (
    <>
      {/* Rubriques à la ligne à toutes les largeurs : dans une rangée qui
          défilait, une pastille à moitié cachée recevait le focus sans
          apparaître (le navigateur ne la faisait pas défiler). */}
      <nav aria-label="Rubriques de la FAQ">
        <ul className="flex flex-wrap gap-2">
          {rubriques.map((r) => (
            <li key={r.id}>
              <Pastille className="min-h-11" href={`#${r.id}`}>
                {r.titre}
              </Pastille>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8 grid gap-10 lg:mt-10">
        {rubriques.map((r) => (
          <section key={r.id} aria-labelledby={`${r.id}-titre`} id={r.id}>
            <h2
              className="mb-3.5 text-[clamp(20px,2.6vw,24px)] leading-tight font-extrabold text-balance"
              id={`${r.id}-titre`}
            >
              {r.titre}
            </h2>
            <div className="grid gap-2.5">
              {r.questions.map((q) => (
                <Accordeon
                  key={q.question}
                  classeCorps="grid gap-2.5 text-[15px] leading-[1.6]"
                  titre={q.question}
                >
                  {q.reponse.map((bloc, i) => (
                    <Bloc key={i} bloc={bloc} />
                  ))}
                </Accordeon>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
