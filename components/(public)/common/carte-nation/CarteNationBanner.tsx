"use client";
import Link from "next/link";

export default function CarteNationBanner() {

  return (
    <>
      <div className="relative my-8 md:my-12">
        <div className="bg-gradient-to-r from-primary via-primary-600 to-primary rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
          <div className="relative overflow-hidden">
            {/* Animated stripes background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-6 md:py-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Content */}
                <div className="flex-1 text-center lg:text-left text-white">
                  <div className="flex items-center gap-3 justify-center lg:justify-start mb-3">
                    <span className="text-3xl md:text-4xl">🍗</span>
                    <span className="inline-flex items-center px-3 py-1 bg-secondary text-black text-xs md:text-sm font-bold rounded-full animate-pulse">
                      OFFRE LIMITÉE
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                    Carte de la <span className="text-secondary">Nation</span>
                  </h3>

                  <p className="text-base md:text-lg mb-4 text-white/95">
                    Bénéficie de{" "}
                    <span className="font-bold text-secondary text-xl">
                      -20%
                    </span>{" "}
                    sur tous les menus, toute l'année !
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm md:text-base">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-secondary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Seulement 3 000 cartes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-secondary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>100% gratuit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-secondary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Avantages exclusifs</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex-shrink-0">
                  <Link
                    href="https://forms.gle/781fkESdVT7Zd7TN9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-secondary text-primary hover:text-black font-bold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-[0_0_30px_rgba(255,204,0,0.5)] hover:scale-110"
                  >
                    <span>Demander ma carte</span>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>

                  <p className="text-center text-xs text-white/80 mt-3">
                    Inscription en 2 minutes ⚡
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(40px);
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-slide {
          animation: slide 20s linear infinite;
        }
      `}</style>
    </>
  );
}
