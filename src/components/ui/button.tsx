"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-white text-neutral-950 hover:bg-white/90 shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset]",
        outline:
          "border border-white/15 bg-white/5 text-white backdrop-blur hover:border-white/25 hover:bg-white/10",
        secondary: "bg-white/8 text-white hover:bg-white/12",
        ghost: "text-neutral-300 hover:bg-white/8 hover:text-white",
        link: "text-white underline-offset-4 hover:underline",
        gradient:
          "text-white shadow-lg shadow-violet-600/30 bg-[linear-gradient(110deg,#6366f1,#8b5cf6,#d946ef)] hover:shadow-xl hover:shadow-violet-600/40 hover:brightness-110",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
