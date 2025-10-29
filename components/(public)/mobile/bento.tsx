/* eslint-disable @next/next/no-img-element */
"use client";

import Section from "@/components/primitives/Section";
import { easeInOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const items = [
  {
    name: "Commander vos plats préférés",
    description: "Un seul réflexe pour toutes vos envies : Chicken Nation.",
    icon: "Utensils",
    imageSrc: "/assets/images/devices/Device-1.png",
    imageAlt: "AI scheduling illustration",
    fullWidth: true,
  },
  {
    name: "Découvrir nos menus et nouveautés",
    description:
      "Explorez nos plats du moment et laissez-vous tenter par nos recettes exclusives.",
    icon: "Search",
    imageSrc: "/assets/images/devices/Device-2.png",
    imageAlt: "Time blocking illustration",
    fullWidth: false,
  },
  {
    name: "Gagner des récompenses",
    description:
      "Chaque commande vous rapproche de nouvelles réductions et surprises.",
    icon: "Star",
    imageSrc: "/assets/images/devices/Device-3.png",
    imageAlt: "Smart reminders illustration",
    fullWidth: false,
  },
  {
    name: "Partager l'expérience",
    description:
      "Invitez vos amis à rejoindre la Nation et partagez vos moments gourmands.",
    icon: "Share2",
    imageSrc: "/assets/images/devices/Device-4.png",
    imageAlt: "Team collaboration illustration",
    fullWidth: true,
  },
];

export function BentoGrid() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacities = [
    useTransform(scrollYProgress, [0, 0.1, 0.3], [0, 0, 1], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 0, 1], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.3, 0.5], [0, 0, 1], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.4, 0.6], [0, 0, 1], {
      ease: easeInOutCubic,
    }),
  ];

  const yTransforms = [
    useTransform(scrollYProgress, [0, 0.1, 0.3], [100, 100, 0], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.2, 0.4], [100, 100, 0], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.3, 0.5], [100, 100, 0], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.4, 0.6], [100, 100, 0], {
      ease: easeInOutCubic,
    }),
  ];

  return (
    <Section
      id="bento"
      title="Tout ce que vous pouvez faire avec Chicken Nation"
      subtitle="Un plaisir à chaque clic"
      className="mx-auto max-w-screen-md px-10"
      ref={ref}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={index}
            style={{ opacity: opacities[index], y: yTransforms[index] }}
            className={cn(
              "bg-secondary p-4 sm:p-6 !pb-0 rounded-3xl grid grid-rows-1",
              item.fullWidth && "md:col-span-2"
            )}
          >
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
                {item.name}
              </h2>
              <p className="text-sm sm:text-base text-foreground mb-4">
                {item.description}
              </p>
            </div>
            <div
              className={cn(
                "flex justify-center",
                item.fullWidth && "sm:space-x-4"
              )}
            >
              <img
                src={item.imageSrc}
                alt={item.imageAlt}
                className="w-full h-64 sm:h-96 rounded-xl object-cover object-top"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
