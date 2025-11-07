"use client";

import Image from "next/image";
import Motion from "@/lib/motion";
import Section from "@/components/primitives/Section";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Download() {
  return (
    <Section padding="none" className="bg-[#fcd424] relative overflow-hidden">
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col justify-center items-center md:items-start p-4">
          <Motion variant="verticalSlideIn">
            <h2 className="font-title text-2xl sm:text-3xl md:text-5xl text-center md:text-left font-semibold leading-tight">
              Pour commander appelez-nous au <br />
              <span className="text-primary">0747000034 / 0720353535 / 0700005556 </span>
            </h2>
          </Motion>

          <Motion variant="verticalSlideIn">
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start mt-8">
              <Link
                target="_blank"
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
                    alt="Download"
                    width={200}
                    height={200}
                    className="w-40"
                  />
                </motion.div>
              </Link>
              <Link
                target="_blank"
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
                    alt="Download"
                    width={200}
                    height={200}
                    className="w-40"
                  />
                </motion.div>
              </Link>
            </div>
          </Motion>
        </div>
        <div className="relative">
          <Image
            src="/assets/images/backgrounds/Section.png"
            alt="Download App"
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
