"use client";

import Section from "@/components/primitives/Section";

/**
 * Témoignages — REFONTE éditoriale épurée.
 *
 * Les avis affichés sont CHOISIS au backoffice (curation « Visible sur le
 * site ») : ici on ne fait que les présenter, sans pagination ni tri local.
 *
 * Parti pris design : presque monochrome (blanc, encre, gris chauds) avec UN
 * seul accent — l'orange des étoiles. Avatars à INITIALES (jamais de photo),
 * guillemet géant en filigrane, cartes au cordeau. Mobile : carrousel à
 * défilement magnétique ; desktop : grille aérée avec léger décalage.
 */
export function TestimonialsContent({
  testimonials,
}: {
  testimonials: ICommentaire[];
}) {
  return (
    <Section
      title="Témoignages"
      subtitle="Ce qu'en dit la Nation"
      className="container px-6 sm:px-10 mx-auto"
    >
      {/* Mobile : carrousel snap. md+ : grille (le snap disparaît). */}
      <div
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-3"
      >
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.id ?? index}
            testimonial={testimonial}
            index={index}
          />
        ))}
      </div>
    </Section>
  );
}

/** « Awa Koné » → « AK » ; secours « CN ». */
function initiales(prenom?: string, nom?: string): string {
  const lettres = `${(prenom ?? "").trim().charAt(0)}${(nom ?? "").trim().charAt(0)}`;
  return lettres.toUpperCase() || "CN";
}

/** « Awa Koné » → « Awa K. » (prénom + initiale du nom, sobre et discret). */
function nomAffiche(prenom?: string, nom?: string): string {
  const p = (prenom ?? "").trim();
  const n = (nom ?? "").trim();
  if (p && n) return `${p} ${n.charAt(0).toUpperCase()}.`;
  return p || n || "Client Chicken Nation";
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: ICommentaire;
  index: number;
}) {
  const note = Math.max(0, Math.min(5, Math.round(testimonial.rating)));

  return (
    <figure
      className={`relative flex w-[82%] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)] sm:w-[70%] md:w-auto md:shrink ${
        // Décalage éditorial : la colonne centrale descend d'un cran (lg).
        index % 3 === 1 ? "lg:translate-y-6" : ""
      }`}
    >
      {/* Guillemet géant en filigrane */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-3 right-4 select-none font-title text-8xl leading-none text-neutral-100"
      >
        &ldquo;
      </span>

      {/* Étoiles — l'unique touche de couleur */}
      <div className="relative flex items-center gap-1" aria-label={`Note : ${note} sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={`h-4 w-4 ${i < note ? "fill-[#ff6200]" : "fill-neutral-200"}`}
          >
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
          </svg>
        ))}
      </div>

      {/* Message */}
      <blockquote className="relative mt-4 flex-1 text-[15px] leading-relaxed text-neutral-600">
        {testimonial.message}
      </blockquote>

      {/* Auteur : avatar à initiales — jamais de photo */}
      <figcaption className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 font-title text-sm tracking-wider text-white">
          {initiales(testimonial.customer?.first_name, testimonial.customer?.last_name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {nomAffiche(testimonial.customer?.first_name, testimonial.customer?.last_name)}
          </p>
          <p className="text-xs text-neutral-400">Client Chicken Nation</p>
        </div>
      </figcaption>
    </figure>
  );
}
