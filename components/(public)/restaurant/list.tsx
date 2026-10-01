import Image from "next/image";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Motion from "@/lib/motion";
import Section from "@/components/primitives/Section";
import { obtenirRestaurantsPublics } from "@/features/restaurants/restaurant.api";
import {
  horairesLisibles,
  imageRestaurant,
  lienItineraire,
  nomCourt,
  restaurantsSchemaOrg,
  telephoneLisible,
} from "@/features/restaurants/restaurant.utils";

export default async function List() {
  const restaurants = await obtenirRestaurantsPublics();

  return (
    <Section className="flex flex-col gap-8 md:gap-12">
      {restaurants.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantsSchemaOrg(restaurants)) }}
        />
      )}

      {restaurants.length === 0 ? (
        <p className="text-center text-gray-700">
          La liste des restaurants est momentanément indisponible. Appelez-nous au{" "}
          <a href="tel:+2250720353535" className="font-semibold text-primary">
            07 20 35 35 35
          </a>
          .
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-10">
          {restaurants.map((r, index) => {
            const itineraire = lienItineraire(r);
            return (
              <Motion
                key={r.id}
                animationParams={{ delay: index * 0.1 }}
                variant="verticalSlideIn"
              >
                <article className="group relative rounded-2xl overflow-hidden shadow-md bg-gray-50 hover:shadow-lg transition-all duration-300">
                  <div className="relative h-64">
                    <Image
                      src={imageRestaurant(r)}
                      alt={`Restaurant CHICKEN NATION ${nomCourt(r.name)}`}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300 flex items-end justify-center pb-4">
                      <Link
                        href="/restaurants/nos-menus"
                        className="rounded-xl bg-primary px-5 py-2.5 font-medium text-white shadow-lg shadow-primary/40"
                      >
                        Voir le menu
                      </Link>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <Image
                          src="/assets/images/logo.png"
                          alt=""
                          fill
                          sizes="48px"
                          className="rounded-full"
                        />
                      </div>
                      <h2 className="text-xl font-semibold">{nomCourt(r.name)}</h2>
                    </div>

                    {r.address && (
                      <p className="flex gap-2 text-gray-700 text-sm">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                        <span>{r.address.replace(/,\s*Côte d['’]Ivoire$/i, "")}</span>
                      </p>
                    )}

                    {horairesLisibles(r.schedule).length > 0 && (
                      <div className="flex gap-2 text-gray-700 text-sm">
                        <Clock className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                        <ul>
                          {horairesLisibles(r.schedule).map((ligne) => (
                            <li key={ligne}>{ligne}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-1">
                      {r.phone && (
                        <a
                          href={`tel:+225${r.phone.replace(/\D/g, "").replace(/^225/, "")}`}
                          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
                        >
                          <Phone className="w-4 h-4" />
                          {telephoneLisible(r.phone)}
                        </a>
                      )}
                      {itineraire && (
                        <a
                          href={itineraire}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary"
                        >
                          <Navigation className="w-4 h-4" />
                          Itinéraire
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </Motion>
            );
          })}
        </div>
      )}

      {/* Section future restaurants */}
      <div className="text-center">
        <div className="bg-primary/10 rounded-2xl p-10 flex flex-col items-center justify-center">
          <Image
            src="/assets/images/illustrations/restaurant/card-items-4.png"
            alt=""
            width={240}
            height={240}
            className="mb-6"
          />
          <h2 className="text-2xl font-bold mb-2 text-primary">
            De nouvelles saveurs arrivent bientôt !
          </h2>
          <p className="text-gray-700">
            Un nouveau restaurant ouvrira ses portes à{" "}
            <span className="font-semibold">Abobo</span> en 2026 🍗
          </p>
        </div>
      </div>
    </Section>
  );
}
