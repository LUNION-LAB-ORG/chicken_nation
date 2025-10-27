import React from "react";
import { tv } from "tailwind-variants";

export const mainStyle = tv({
  base: "relative flex flex-col min-h-screen w-full overflow-hidden",
  variants: {
    fullWidth: {
      true: "w-full px-0",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      md: "p-8",
      lg: "p-16",
    },
  },
  defaultVariants: {
    fullWidth: true,
    padding: "none",
  },
});

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fullWidth?: boolean;
  padding?: keyof typeof mainStyle.variants.padding;
  children?: React.ReactNode;
}

export default function Main({
  fullWidth,
  padding,
  children,
  className,
  ...props
}: MainProps) {
  return (
    <main className={mainStyle({ fullWidth, padding, className })} {...props}>
      {children}
    </main>
  );
}
