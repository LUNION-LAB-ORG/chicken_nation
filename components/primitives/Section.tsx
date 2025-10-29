"use client";

import React, { forwardRef, useRef } from "react";
import { tv } from "tailwind-variants";
import { easeInOutCubic } from "@/lib/animation";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";

export const sectionStyle = tv({
  base: "w-full",
  variants: {
    spacing: {
      none: "my-0 py-0",
      sm: "my-4 py-4",
      md: "my-6 py-6 md:my-8 md:py-8",
      lg: "my-8 py-8 md:py-12 md:my-12",
      xl: "my-12 py-12 md:my-16 md:py-16",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      md: "p-6 md:p-12 lg:p-16",
      lg: "p-6 md:p-16 lg:p-20",
      xl: "p-6 md:p-20 lg:p-24",
    },
    size: {
      sm: "min-h-50",
      md: "min-h-100",
      lg: "min-h-150",
      xl: "min-h-200",
    },
    bg: {
      default: "bg-transparent",
      light: "bg-gray-50 dark:bg-gray-800",
      dark: "bg-gray-900 dark:bg-gray-700",
    },
  },
  defaultVariants: {
    spacing: "none",
    padding: "md",
    size: "md",
    bg: "default",
  },
});

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
  align?: "left" | "center" | "right";
  spacing?: keyof typeof sectionStyle.variants.spacing;
  padding?: keyof typeof sectionStyle.variants.padding;
  size?: keyof typeof sectionStyle.variants.size;
  bg?: keyof typeof sectionStyle.variants.bg;
  children?: React.ReactNode;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      id,
      title,
      subtitle,
      description,
      align,
      spacing,
      padding,
      size,
      bg,
      children,
      className,
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLElement>(null);
    const ref = forwardedRef || internalRef;

    const sectionId = title ? title.toLowerCase().replace(/\s+/g, "-") : id;
    const alignmentClass =
      align === "left"
        ? "text-left"
        : align === "right"
          ? "text-right"
          : "text-center";

    const { scrollYProgress } = useScroll({
      target: ref as React.RefObject<HTMLElement>,
      offset: ["start end", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.05, 0.1], [0, 0, 1], {
      ease: easeInOutCubic,
    });
    const y = useTransform(scrollYProgress, [0, 0.05, 0.1], [30, 30, 0], {
      ease: easeInOutCubic,
    });

    return (
      <section id={id || sectionId} ref={ref}>
        <div
          className={cn(
            sectionStyle({ spacing, padding, size, bg }),
            className
          )}
        >
          {(title || subtitle || description) && (
            <div className={cn(alignmentClass, "space-y-4 pb-10 mx-auto")}>
              {title && (
                <motion.h2
                  className="text-sm text-primary text-balance font-mono font-semibold tracking-wider uppercase"
                  style={{ opacity, y }}
                >
                  {title}
                </motion.h2>
              )}

              {subtitle && (
                <motion.h3
                  className={cn(
                    "mx-0 mt-4 max-w-lg text-3xl text-balance font-bold sm:max-w-none sm:text-4xl md:text-5xl lg:text-6xl leading-[1.2] tracking-tighter text-foreground",
                    align === "center"
                      ? "mx-auto"
                      : align === "right"
                        ? "ml-auto"
                        : ""
                  )}
                  style={{ opacity, y }}
                >
                  {subtitle}
                </motion.h3>
              )}
              {description && (
                <motion.p
                  className={cn(
                    "mt-6 text-lg leading-8 text-muted-foreground text-balance max-w-2xl",
                    align === "center"
                      ? "mx-auto"
                      : align === "right"
                        ? "ml-auto"
                        : ""
                  )}
                  style={{ opacity, y }}
                >
                  {description}
                </motion.p>
              )}
            </div>
          )}
          {children}
        </div>
      </section>
    );
  }
);

Section.displayName = "Section";

export default Section;
