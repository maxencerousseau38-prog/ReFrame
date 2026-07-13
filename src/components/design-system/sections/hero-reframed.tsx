"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GithubLogo, Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassPillNav } from "@/components/ui/glass-pill-nav";
import { StatGroup, type Stat } from "@/components/ui/stat-group";
import { cn } from "@/lib/utils";

/**
 * HeroReframed — the 3D-beams hero (21st.dev), fully reinterpreted into
 * ReFrame's language. What we REMOVED and why lives in the library README;
 * in short: no three.js beams (heavy dep + forbidden particle/gaming effect),
 * no shimmer sweep, no white glow shadow, no gradient-clip text. What remains
 * is composed entirely from frozen-token primitives: GlassPillNav, Badge,
 * Button, StatGroup — monochrome, with a whisper of ambient depth and a dotted
 * grid instead of a shader. Entrance motion is fade + translateY only.
 *
 * A universal marketing/section TEMPLATE: landing hero, template preview, or a
 * dashboard empty-state splash.
 */
export interface HeroReframedProps {
  brand?: React.ReactNode;
  nav?: { label: string; href?: string; active?: boolean }[];
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  primaryCta?: { label: string; href?: string };
  secondaryCta?: { label: string; href?: string };
  stats?: Stat[];
  className?: string;
}

export function HeroReframed({
  brand = "ReFrame",
  nav = [
    { label: "Home", href: "#", active: true },
    { label: "Components", href: "#" },
    { label: "Templates", href: "#" },
    { label: "Docs", href: "#" },
  ],
  badge = "Trusted by industry leaders",
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  stats,
  className,
}: HeroReframedProps) {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] as const },
        };

  return (
    <section
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-background text-foreground",
        className
      )}
    >
      {/* Monochrome depth: dotted grid + faint white ambient — never a shader. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid bg-fade-b opacity-[0.5]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 ambient opacity-70" />

      {/* Nav */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <span className="text-[15px] font-semibold tracking-tight">{brand}</span>
        <div className="hidden md:block">
          <GlassPillNav aria-label="Primary" items={nav} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="#">
              <GithubLogo weight="bold" className="h-4 w-4" /> GitHub
            </a>
          </Button>
          <Button size="sm" asChild>
            <a href="#">
              Get started <ArrowRight weight="bold" className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-6 lg:px-8">
        <div className="mx-auto max-w-3xl py-16 text-center">
          {badge && (
            <motion.div {...rise(0)} className="mb-7 flex justify-center">
              <Badge>
                <Star weight="fill" className="h-3.5 w-3.5" />
                {badge}
              </Badge>
            </motion.div>
          )}

          <motion.h1
            {...rise(0.06)}
            className="text-balance text-4xl font-semibold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.25rem]"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              {...rise(0.12)}
              className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground"
            >
              {subtitle}
            </motion.p>
          )}

          {(primaryCta || secondaryCta) && (
            <motion.div
              {...rise(0.18)}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {primaryCta && (
                <Button size="lg" asChild>
                  <a href={primaryCta.href ?? "#"}>
                    {primaryCta.label} <ArrowRight weight="bold" className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {secondaryCta && (
                <Button size="lg" variant="secondary" asChild>
                  <a href={secondaryCta.href ?? "#"}>{secondaryCta.label}</a>
                </Button>
              )}
            </motion.div>
          )}

          {stats && stats.length > 0 && (
            <motion.div {...rise(0.24)} className="mx-auto mt-14 max-w-2xl">
              <StatGroup items={stats} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
