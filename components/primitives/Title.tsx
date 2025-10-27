import React, { JSX } from "react";
import { tv } from "tailwind-variants";

export const titleStyle = tv({
  base: "tracking-tight inline font-semibold font-title text-center tracking-wide",
  variants: {
    color: {
      primary: "from-primary to-primary-600",
      secondary: "from-secondary to-secondary-600",
      foreground: "from-foreground to-[#BBBBBB] dark:to-[#4B4B4B]",
      white: "text-white",
    },
    size: {
      xs: "text-2xl lg:text-3xl",
      sm: "text-3xl lg:text-4xl",
      md: "text-[2.3rem] lg:text-5xl",
      lg: "text-4xl lg:text-6xl",
    },
    fullWidth: {
      true: "w-full block",
    },
  },
  defaultVariants: {
    size: "lg",
    color: "primary",
  },
  compoundVariants: [
    {
      color: ["primary", "secondary", "foreground"],
      class: "bg-clip-text text-transparent bg-gradient-to-b",
    },
  ],
});

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  color?: keyof typeof titleStyle.variants.color;
  size?: keyof typeof titleStyle.variants.size;
  fullWidth?: boolean;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
}

export default function Title({
  color,
  size,
  fullWidth,
  children,
  className,
  level = 2,
  ...props
}: TitleProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return React.createElement(
    Tag,
    {
      className: titleStyle({ color, size, fullWidth, className }),
      ...props,
    },
    children
  );
}
