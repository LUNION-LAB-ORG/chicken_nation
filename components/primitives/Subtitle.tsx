import React from "react";
import { tv } from "tailwind-variants";

export const subtitleStyle = tv({
  base: "w-full md:w-1/2 my-2 text-default-600 block max-w-full font-semibold",
  variants: {
    size: {
      sm: "text-sm lg:text-lg",
      md: "text-base lg:text-xl",
      lg: "text-xl lg:text-2xl",
    },
    fullWidth: {
      true: "!w-full",
    },
  },
  defaultVariants: {
    fullWidth: true,
    size: "md",
  },
});

interface SubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  fullWidth?: boolean;
  size?: keyof typeof subtitleStyle.variants.size;
  children?: React.ReactNode;
}

export default function Subtitle({
  fullWidth,
  size,
  children,
  className,
  ...props
}: SubtitleProps) {
  return (
    <p className={subtitleStyle({ fullWidth, size, className })} {...props}>
      {children}
    </p>
  );
}
