"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Press feedback + entrance easing follow Emil Kowalski's spec:
// transition only transform (not `all`), strong ease-out, scale-on-active.
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-fast ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // primary CTA (V3): silver fill #F5F5F5, near-black label #090909, radius 16px
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        // The ONE signature CTA — the lime brand accent, used rarely (the single
        // most important action on a surface). Dark ink on lime, soft brand glow.
        brand:
          "bg-brand text-brand-foreground hover:bg-brand/90 shadow-[0_10px_34px_-12px_hsl(var(--brand)/0.5)]",
        light: "bg-white text-neutral-950 hover:bg-white/90 shadow-[0_8px_30px_-8px_rgba(255,255,255,0.25)]",
        outline:
          "border border-white/8 bg-transparent text-white hover:border-white/16 hover:bg-white/5",
        // secondary (V3): rgba(255,255,255,.05) fill + hairline rgba(255,255,255,.08)
        secondary: "border border-white/8 bg-white/5 text-white hover:bg-white/[0.08]",
        ghost: "text-zinc-300 hover:bg-white/8 hover:text-white",
        link: "text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10",
        // Compact icon button (used by the sidebar rail triggers).
        "icon-sm": "h-8 w-8 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. an <a> or a Radix trigger) instead of a
   *  <button>, keeping the button styling. The shadcn composition idiom. */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
