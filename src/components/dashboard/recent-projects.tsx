"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

interface Summary {
  id: string;
  brandName: string;
  sourceUrl: string;
  industry: string;
  updatedAt: string;
}

/**
 * Recent saved projects for the signed-in user. Renders nothing for anonymous
 * users (the API returns 401) or when there are none, so it's safe to drop into
 * the dashboard unconditionally.
 */
export function RecentProjects() {
  const [items, setItems] = React.useState<Summary[] | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setItems(d?.projects ?? []))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-14">
      <h2 className="text-sm font-medium text-muted-foreground">Recent projects</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/result?p=${p.id}`}
            className="group rounded-2xl border border-border bg-white/[0.02] p-5 transition-colors hover:border-white/20"
          >
            <div className="flex items-center justify-between">
              <span className="truncate font-medium">{p.brandName}</span>
              <ArrowRight
                weight="bold"
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </div>
            <div className="mt-1 truncate text-xs text-muted-foreground">
              {p.sourceUrl.replace(/^https?:\/\//, "")}
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              {new Date(p.updatedAt).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
