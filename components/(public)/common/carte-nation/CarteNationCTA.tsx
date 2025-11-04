import Link from "next/link";

export default function CarteNationCTA() {
  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-primary/20 to-white">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Content */}
            <div className="p-8 md:p-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <span className="text-sm font-semibold text-primary">
                  Seulement 3 000 cartes disponibles
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Carte de la <span className="text-primary">Nation</span>
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                Rejoins la vraie team du goût et bénéficie de{" "}
                <span className="font-bold text-primary">
                  -20% sur tous les menus étudiants
                </span>{" "}
                toute l'année dans nos restaurants Chicken Nation.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Réduction de 20% sur tous les menus étudiants",
                  "Accès à des offres exclusives",
                  "Privilèges réservés aux membres",
                  "Rejoins une communauté de champions",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="https://forms.gle/781fkESdVT7Zd7TN9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-500 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Demander ma carte
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>

            {/* Right side - Visual/Card preview */}
            <div className="relative p-8 md:p-12 bg-gradient-to-br from-primary to-primary-500">
              <div className="relative">
                {/* Card mockup */}
                <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-primary">
                      CHICKEN NATION
                    </div>
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-2xl">🍗</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm font-semibold text-gray-600">
                      CARTE NATION
                    </div>
                    <div className="text-2xl font-bold text-primary">-20%</div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-secondary text-black font-bold px-4 py-2 rounded-full shadow-lg transform rotate-12">
                  Privilégié !
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 text-center">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="text-3xl font-bold text-primary mb-1">3 000</div>
            <div className="text-sm text-gray-600">Cartes disponibles</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="text-3xl font-bold text-primary mb-1">-20%</div>
            <div className="text-sm text-gray-600">
              Sur tous les menus étudiants
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md col-span-2 md:col-span-1">
            <div className="text-3xl font-bold text-primary mb-1">100%</div>
            <div className="text-sm text-gray-600">Exclusif & Gratuit</div>
          </div>
        </div>
      </div>
    </section>
  );
}
