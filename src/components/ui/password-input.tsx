"use client";

import * as React from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Input, type InputProps } from "./input";
import { cn } from "@/lib/utils";

/**
 * PasswordInput — the glass Input with a show/hide visibility toggle.
 *
 * Distilled from a sign-in page (21st.dev, intake #003): the toggle was the one
 * field mechanic our library lacked. Rebuilt on the existing Input (no fork),
 * Phosphor icons (not lucide), monochrome, keyboard/AT-friendly (real button,
 * aria-label + aria-pressed).
 *
 * Universal: login/signup/reset forms, future Settings (change password),
 * anywhere a secret is typed (API keys in integrations panels).
 */
export type PasswordInputProps = Omit<InputProps, "type">;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-11", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors duration-fast ease-premium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {visible ? <EyeSlash className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
