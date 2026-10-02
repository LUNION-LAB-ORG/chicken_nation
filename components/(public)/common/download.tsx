"use client";

import Image from "next/image";
import Motion from "@/lib/motion";
import Section from "@/components/primitives/Section";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { QRCode } from "@/components/kibo-ui/qr-code";

export default function Download() {
  return (
    <Section padding="none" className="bg-[#fcd424] relative overflow-hidden">
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col justify-center items-center lg:items-start p-4">
          <Motion variant="verticalSlideIn" className="flex flex-col items-center lg:items-start">
            {/* La police des titres n'a ni accent, ni trait d'union, ni « / » :
                le titre reste court, le numéro passe en police normale. */}
            <h2 className="font-title text-2xl sm:text-4xl lg:text-5xl text-center lg:text-left font-semibold leading-tight">
              Commandez en ligne
            </h2>
            <p className="mt-2 text-lg sm:text-2xl font-semibold text-center lg:text-left">
              ou appelez-nous au{" "}
              <a href="tel:+2252721712130" className="text-primary whitespace-nowrap">
                27 21 71 21 30
              </a>
            </p>
          </Motion>
          <Motion variant="verticalSlideIn">
            <Link
              href="/restaurants/nos-menus"
              className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/40"
            >
              Commander en ligne
            </Link>
          </Motion>
          <div className="flex justify-center mt-8 gap-4">
            <Motion variant="verticalSlideIn">
              <QRCode className="size-32" data="https://chicken-nation.com/fr/app-mobile/deep-link" />
            </Motion>
            <Motion variant="verticalSlideIn">
              <div className="flex flex-col gap-4 items-center justify-center lg:justify-start">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://play.google.com/store/apps/details?id=com.chickennation.app"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="flex-shrink-0"
                  >
                    <Image
                      src="/download-playstore-fr-FR.png"
                      alt="Disponible sur Google Play"
                      width={200}
                      height={200}
                      className="w-40"
                    />
                  </motion.div>
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://apps.apple.com/ci/app/chicken-nation/id6745905607"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="flex-shrink-0"
                  >
                    <Image
                      src="/download-apple-fr-FR.svg"
                      alt="Télécharger dans l'App Store"
                      width={200}
                      height={200}
                      className="w-40"
                    />
                  </motion.div>
                </a>
              </div>
            </Motion>
          </div>
        </div>
        <div className="relative">
          <Image
            src="/assets/images/backgrounds/Section.png"
            alt="Application mobile CHICKEN NATION"
            width={1869}
            height={1278}
            className="object-cover"
            priority
          />
        </div>
      </div>
    </Section>
  );
}
