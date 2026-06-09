"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/** Bascule clair/sombre avec animation d'icône. */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const toggle = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Changer de thème"
      className="text-muted-foreground hover:text-foreground"
    >
      {/* Évite le flash d'hydratation : icônes rendues seulement après montage. */}
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Sun className="size-[1.15rem]" />
        ) : (
          <Moon className="size-[1.15rem]" />
        )
      ) : (
        <div className="size-[1.15rem]" />
      )}
    </Button>
  );
}
