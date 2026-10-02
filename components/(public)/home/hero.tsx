import Image from "next/image";
import Motion from "@/lib/motion";
import Section from "@/components/primitives/Section";
import { Link } from "@/i18n/navigation";
import bgNew from "@/public/assets/images/backgrounds/BgNew.png";
export default function Hero() {
  return (
    <Section className="relative w-full h-[calc(100vh-70px)] min-h-[600px] max-h-[900px] overflow-hidden">
      <Image
        src={bgNew}
        alt=""
        fill
        placeholder="blur"
        priority
        className="object-cover"
      />

      <div className="h-full relative z-10">
        <div className="flex flex-col items-center justify-center h-full max-w-6xl mx-auto sm:px-8 lg:px-20">
          <div className="relative flex-1 flex flex-col justify-center items-center">
            {/* Title */}
            <Motion variant="verticalSlideIn">
              <h1 className="text-[#ff6200] font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-center tracking-wider leading-tight">
                DELICIEUX
                <br />
                {/* L'apostrophe manque à la police des titres : on la prend
                    dans une police normale plutôt que de laisser le navigateur choisir. */}
                JUSQU<span className="font-sans">&apos;</span>A L<span className="font-sans">&apos;</span>OS
              </h1>
            </Motion>

            {/* Central Section */}
            <div className="relative w-full flex justify-center mt-4 md:mt-8">
              {/* Central Bucket */}
              <Motion variant="verticalSlideIn">
                <div className="relative">
                  {/* Le seau suit la hauteur de l'écran : sans cela, les boutons
                      sortent du bandeau (hauteur bornée) sur un écran bas.
                      Marges calculées pour le titre sur 3 lignes (téléphone de
                      360 px) et pour un portable de 1366 x 768 (fenêtre de 650 px). */}
                  <Image
                    src="/assets/images/illustrations/page-accueil/seau.png"
                    alt="Seau de poulet CHICKEN NATION"
                    width={1286 / 4}
                    height={1536 / 4}
                    className="object-contain w-auto h-[calc(100vh-480px)] lg:h-[calc(100vh-580px)] min-h-[180px] lg:min-h-[100px] max-h-[384px]"
                    priority
                  />
                </div>
              </Motion>
            </div>

            {/* Commande en ligne d'abord, l'application ensuite.
                Composant serveur : des Link mis en forme, pas de Button as={Link}. */}
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/restaurants/nos-menus"
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/40"
              >
                Commander en ligne
              </Link>
              <Link
                href="/app-mobile"
                className="rounded-xl bg-white px-6 py-3 font-semibold text-primary shadow-lg"
              >
                Télécharger l&apos;application
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fast Delivery Badge */}
      <div className="absolute hidden xl:flex z-20 top-1/2 -translate-y-1/2 right-32 2xl:right-64 bg-white rounded-xl shadow-lg p-4 gap-3 items-center">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src="/assets/images/illustrations/page-accueil/horloge.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          {/* Même délai que la FAQ et les métadonnées. */}
          <span className="font-bold text-lg whitespace-nowrap">
            Livraison
          </span>
          <span className="text-sm text-gray-600">en 20 à 35 min</span>
        </div>
      </div>
    </Section>
  );
}
