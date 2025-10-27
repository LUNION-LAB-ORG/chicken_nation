import React from "react";
import { tv } from "tailwind-variants";

export const displayStyle = tv({
  base: "font-bold tracking-tight leading-tight",
  variants: {
    size: {
        sm: "text-6xl md:text-7xl lg:text-8xl",                  
        md: "text-7xl md:text-8xl lg:text-9xl",                  
        lg: "text-8xl md:text-9xl lg:text-[12rem]",              
        xl: "text-9xl md:text-[12rem] lg:text-[16rem]",          
        xxl: "text-[12rem] md:text-[16rem] lg:text-[20rem]",     
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    weight: {
      normal: "font-normal",
      semibold: "font-semibold",
      bold: "font-bold",
      black: "font-black",
    },
    gradient: {
      true: "bg-gradient-to-b from-gray-300 dark:from-gray-700 via-gray-50 dark:via-gray-900 to-transparent bg-clip-text text-transparent",
    },
    tone: {
      default: "text-gray-900 dark:text-white",
      muted: "text-gray-400 dark:text-gray-600",
      background: "text-gray-300 dark:text-gray-700 opacity-20 select-none",
    },
  },
  defaultVariants: {
    size: "md",
    align: "left",
    weight: "bold",
  },
});

interface DisplayProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: keyof typeof displayStyle.variants.size;
  align?: keyof typeof displayStyle.variants.align;
  weight?: keyof typeof displayStyle.variants.weight;
  gradient?: boolean;
  tone?: keyof typeof displayStyle.variants.tone;
  children?: React.ReactNode;
}

export default function Display({
  size,
  align,
  weight,
  gradient,
  tone,
  children,
  className,
  ...props
}: DisplayProps) {
  return (
    <h1
      className={displayStyle({ size, align, weight, gradient, tone, className })}
      {...props}
    >
      {children}
    </h1>
  );
}
