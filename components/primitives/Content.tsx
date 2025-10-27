import React from "react";
import { tv } from "tailwind-variants";

export const contentStyle = tv({
  base: "container max-w-screen-2xl flex-grow mx-auto px-4 sm:px-6 lg:px-8 py-8",
  variants: {
    fullWidth: {
      true: "w-full px-0",
    },
    padding: {
      sm: "py-4",
      md: "py-8",
      lg: "py-16",
    },
  },
  defaultVariants: {
    fullWidth: false,
    padding: "md",
  },
});

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  fullWidth?: boolean;
  padding?: keyof typeof contentStyle.variants.padding;
  children?: React.ReactNode;
}

export default function Content({
  fullWidth,
  padding,
  children,
  className,
  ...props
}: ContentProps) {
  return (
    <div className={contentStyle({ fullWidth, padding, className })} {...props}>
      {children}
    </div>
  );
}
