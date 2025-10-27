import React from "react";
import { tv } from "tailwind-variants";

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
  spacing?: keyof typeof sectionStyle.variants.spacing;
  padding?: keyof typeof sectionStyle.variants.padding;
  size?: keyof typeof sectionStyle.variants.size;
  bg?: keyof typeof sectionStyle.variants.bg;
  children?: React.ReactNode;
}

export default function Section({
  spacing,
  padding,
  size,
  bg,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={sectionStyle({ spacing, padding, size, bg, className })}
      {...props}
    >
      {children}
    </section>
  );
}
