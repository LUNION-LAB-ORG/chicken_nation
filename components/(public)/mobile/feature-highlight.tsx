/* eslint-disable @next/next/no-img-element */
"use client";

import Section from "@/components/primitives/Section";
import { buttonVariants } from "@/components/ui/button";
import { easeOutCubic } from "@/lib/animation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    title: "Commande rapide",
    description:
      "Choisissez vos plats, personnalisez votre menu et passez commande en quelques secondes.",
    imageSrc: "/assets/images/devices/Device-2.png",
    direction: "rtl" as const,
  },
  {
    title: "Modes de réception flexibles",
    description:
      "Faites-vous livrer, mangez sur place ou commandez à emporter selon votre envie du moment.",
    imageSrc: "/assets/images/devices/Device-3.png",
    direction: "ltr" as const,
  },
  {
    title: "Paiement simplifié",
    description: "Payez en ligne ou à la réception, en toute sécurité.",
    imageSrc: "/assets/images/devices/Device-4.png",
    direction: "rtl" as const,
  },
  {
    title: "Suivi en temps réel",
    description:
      "Suivez votre commande pas à pas, de la cuisine jusqu'à votre porte.",
    imageSrc: "/assets/images/devices/Device-5.png",
    direction: "ltr" as const,
  },
  {
    title: "Envoi de message",
    description: "Envoyez un message direct au restaurant pour toute instruction ou précision concernant votre commande.",
    imageSrc: "/assets/images/devices/Device-6.png",
    direction: "rtl" as const,
  },
  {
    title: "Promotions & fidélité",
    description:
      "Profitez d'offres exclusives et cumulez des points à chaque commande.",
    imageSrc: "/assets/images/devices/Device-7.png",
    direction: "ltr" as const,
  },
];

interface FeatureProps {
  title: string;
  description: string;
  imageSrc: string;
  direction: "ltr" | "rtl";
  isActive: boolean;
}

function Feature({
  title,
  description,
  imageSrc,
  direction,
  isActive,
}: FeatureProps) {
  const isLTR = direction === "ltr";
  const textVariants = {
    hidden: { opacity: 0, x: isLTR ? -20 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isLTR ? -10 : 10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: easeOutCubic,
      },
    },
  };

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-between pb-10 transition-all duration-500 ease-out",
        isLTR ? "lg:flex-row" : "lg:flex-row-reverse"
      )}
    >
      <motion.div
        className={cn(
          "w-full lg:w-1/2 mb-10 lg:mb-0",
          isLTR ? "lg:pr-8" : "lg:pl-8"
        )}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        variants={textVariants}
      >
        <div className="flex flex-col gap-4 max-w-sm text-center lg:text-left mx-auto">
          <motion.h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold"
            variants={itemVariants}
          >
            {title}
          </motion.h2>
          <motion.p className="text-base md:text-2xl" variants={itemVariants}>
            {description}
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "text-white rounded-full group text-lg",
                "mx-auto lg:mx-0"
              )}
            >
              Téléchargez l'application
            </Link>
          </motion.div>
        </div>
      </motion.div>
      <div className="w-full lg:w-1/2">
        <img
          src={imageSrc}
          alt={title}
          className="w-full max-w-[300px] mx-auto"
        />
      </div>
    </motion.div>
  );
}

export function FeatureHighlight() {
  const [activeFeature, setActiveFeature] = useState(-1);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (container) {
        const { top, bottom } = container.getBoundingClientRect();
        const middleOfScreen = window.innerHeight / 2;
        const featureHeight = (bottom - top) / features.length;

        const activeIndex = Math.floor((middleOfScreen - top) / featureHeight);
        setActiveFeature(
          Math.max(-1, Math.min(features.length - 1, activeIndex))
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [features.length]);

  return (
    <Section
      id="feature-highlight"
      title="Des fonctionnalités savoureuses"
      subtitle="Tout ce qu'il faut pour vous régaler sans effort."
      className="container px-10 mx-auto max-w-[var(--max-container-width)]"
      ref={containerRef}
    >
      {features.map((feature, index) => (
        <Feature key={index} isActive={activeFeature === index} {...feature} />
      ))}
    </Section>
  );
}
