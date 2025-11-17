"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@heroui/button";

export default function CarteNationBannerFlottant() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary via-primary-600 to-primary shadow-lg animate-gradient"
          >
            <div className="relative">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] animate-slide" />
              </div>

              <div className="relative z-1 max-w-7xl mx-auto px-4 py-8 md:py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
                  {/* Left side - Message */}
                  <div className="flex  items-center gap-3 md:gap-4 text-white flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-2xl md:text-3xl animate-bounce">
                        🍗
                      </span>
                      <div className="hidden md:block h-8 w-px bg-white/30" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-1 bg-secondary text-black text-xs font-bold rounded-full flex-shrink-0">
                          NOUVEAU
                        </span>
                        <span className="font-bold text-sm md:text-base">
                          CARTE DE LA NATION
                        </span>
                        <span className="hidden md:inline text-white/80">
                          •
                        </span>
                        <span className="text-sm md:text-base">
                          <span className="font-bold text-secondary">-20%</span>{" "}
                          sur tous les menus étudiant
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-white/90 mt-1 hidden md:block">
                        Seulement{" "}
                        <span className="font-bold">3 000 cartes</span>{" "}
                        disponibles - Rejoins la Nation !
                      </p>
                    </div>
                  </div>

                  {/* Right side - CTA Button and Close */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href="https://forms.gle/97oafAEgxRdzAX3r9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 md:px-6 md:py-2.5 bg-white hover:bg-secondary text-primary hover:text-black font-bold text-xs md:text-sm rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
                    >
                      <span>Obtenir ma carte</span>
                      <svg
                        className="w-3.5 h-3.5 md:w-4 md:h-4"
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
                </div>
              </div>
              {/* Close Button */}
              <div className="absolute left-0 right-0 -bottom-4 flex items-center justify-center">
                <Button
                  onPress={() => setIsVisible(false)}
                  variant="solid"
                  color="secondary"
                  className="hover:scale-110"
                  size="sm"
                >
                  Fermer
                </Button>
              </div>
              {/* Decorative ribbon edges */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/10 to-transparent" />
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/10 to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
