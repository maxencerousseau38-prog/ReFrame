"use client";

import { ArrowRight, Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassPillNav } from "@/components/ui/glass-pill-nav";
import { StatGroup } from "@/components/ui/stat-group";
import { HeroReframed } from "@/components/design-system";

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-white/8 py-10">
      <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  );
}

export function DesignSystemGallery() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-4">
          <h1 className="text-3xl font-semibold tracking-tight">ReFrame Design System</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            The official component library — monochrome, glass, timeless. Every entry renders
            on the frozen tokens. See <code className="text-foreground/80">design-system/README.md</code> for governance and scores.
          </p>
        </header>

        <Row title="Buttons">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="light">Light</Button>
          <Button size="lg">
            Large <ArrowRight weight="bold" className="h-4 w-4" />
          </Button>
        </Row>

        <Row title="Badges">
          <Badge>
            <Star weight="fill" className="h-3.5 w-3.5" /> Trusted
          </Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="accent">Accent</Badge>
        </Row>

        <Row title="GlassPillNav (new)">
          <GlassPillNav
            items={[
              { label: "Home", href: "#", active: true },
              { label: "Components", href: "#" },
              { label: "Templates", href: "#" },
              { label: "Docs", href: "#" },
            ]}
          />
        </Row>

        <Row title="StatGroup (new)">
          <div className="w-full max-w-2xl">
            <StatGroup
              items={[
                { value: "1M+", label: "Sites reframed" },
                { value: "50+", label: "Countries" },
                { value: "24/7", label: "Support" },
              ]}
            />
          </div>
        </Row>
      </div>

      {/* Full section template */}
      <div className="border-t border-white/8">
        <HeroReframed
          title="The website your customers trust."
          subtitle="Paste your link. ReFrame rebuilds your existing site into one that earns trust on sight — no builder, no blank page."
          primaryCta={{ label: "Transform my site" }}
          secondaryCta={{ label: "See examples" }}
          stats={[
            { value: "1M+", label: "Sites reframed" },
            { value: "50+", label: "Countries" },
            { value: "24/7", label: "Support" },
          ]}
        />
      </div>
    </main>
  );
}
