"use client";

import Section from "@/components/primitives/Section";
import { easeOutCubic } from "@/lib/animation";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export function FeatureScroll() {
  const phone1Ref = useRef(null);
  const phone2Ref = useRef(null);
  const phone3Ref = useRef(null);

  const { scrollYProgress: scrollYProgress1 } = useScroll({
    target: phone1Ref,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: phone2Ref,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: scrollYProgress3 } = useScroll({
    target: phone3Ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress1, [0, 0.3], [150, 0], {
    ease: easeOutCubic,
  });
  const y2 = useTransform(scrollYProgress2, [0.1, 0.4], [200, 0], {
    ease: easeOutCubic,
  });
  const y3 = useTransform(scrollYProgress3, [0.2, 0.5], [250, 0], {
    ease: easeOutCubic,
  });

  return (
    <Section
      id="feature-scroll"
      title="Une expérience de commande unique"
      subtitle="Une application pensée pour les amoureux du bon poulet."
      className="container px-4 sm:px-10 mx-auto max-w-[var(--max-container-width)]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mx-auto select-none">
        <motion.div style={{ y: y1 }}>
          <Image
            ref={phone1Ref}
            src="/assets/images/devices/device-4.png"
            alt="iPhone 1"
            width={563}
            height={1000}
            className="relative w-full h-auto max-w-[250px] sm:max-w-[300px] mx-auto"
          />
        </motion.div>
        <motion.div style={{ y: y2 }}>
          <Image
            ref={phone2Ref}
            src="/assets/images/devices/device-13.png"
            alt="iPhone 2"
            width={563}
            height={1000}
            className="relative w-full h-auto max-w-[250px] sm:max-w-[300px] mx-auto"
          />
        </motion.div>

        <motion.div style={{ y: y3 }}>
          <Image
            ref={phone3Ref}
            src="/assets/images/devices/device-14.png"
            alt="iPhone 3"
            width={563}
            height={1000}
            className="relative w-full h-auto max-w-[250px] sm:max-w-[300px] mx-auto"
          />
        </motion.div>
      </div>
    </Section>
  );
}
