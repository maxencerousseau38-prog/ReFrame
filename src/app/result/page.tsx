"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagicWand, RocketLaunch, Check, ArrowSquareOut, CircleNotch, ArrowLeft, DownloadSimple, Sparkle } from "@phosphor-icons/react";
import { DashboardShell } from "@/components/dashboard/shell";
import { SiteRenderer } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  loadAnalysis,
  loadSchema,
  saveAnalysis,
  saveSchema,
  fetchProject,
  projectIdFromUrl,
} from "@/lib/store";
import type { SiteAnalysis, SiteSchema } from "@/lib/generation/types";

export default function ResultPage() {
  const router = useRouter();
  const [schema, setSchema] = React.useState<SiteSchema | null>(null);
  const [analysis, setAnalysis] = React.useState<SiteAnalysis | null>(null);
  const [view, setView] = React.useState<"after" | "before">("after");
  const [publishing, setPublishing] = React.useState(false);
  const [published, setPublished] = React.useState<string | null>(null);
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [needAuth, setNeedAuth] = React.useState(false);
  const [pubError, setPubError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fromSession = () => {
      const s = loadSchema();
      if (!s) {
        router.replace("/dashboard");
        return;
      }
      setSchema(s);
      setAnalysis(loadAnalysis());
    };

    const pid = projectIdFromUrl();
    if (pid) {
      setProjectId(pid);
      fetchProject(pid).then((r) => {
        if (r) {
          setSchema(r.schema);
          setAnalysis(r.analysis);
          // mirror into sessionStorage so the editor + reloads stay fast
          saveSchema(r.schema);
          if (r.analysis) saveAnalysis(r.analysis);
        } else {
          fromSession();
        }
      });
      return;
    }
    fromSession();
  }, [router]);

  async function downloadHtml() {
    if (!schema) return;
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    // Honor the real filename/extension: a multi-page or image-bundled export
    // is a .zip, a bare single page is .html.
    const slug = schema.brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "site";
    const disposition = res.headers.get("content-disposition") || "";
    const named = /filename="?([^"]+)"?/.exec(disposition)?.[1];
    const ext = (res.headers.get("content-type") || "").includes("zip") ? "zip" : "html";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = named || `${slug}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function publish() {
    if (!schema) return;
    setPublishing(true);
    setNeedAuth(false);
    setPubError(null);
    try {
      const res = await fetch("/api/publish-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Hard paywall: publishing is paid. Send free / over-limit users
        // straight to the plans page, and signed-out users to sign in,
        // instead of failing silently.
        if (data.code === "plan_required" || data.code === "plan_limit") {
          router.push("/#pricing");
        } else if (res.status === 401 || data.code === "auth") {
          setNeedAuth(true);
        } else {
          setPubError(data.error || "Could not publish. Please try again.");
        }
        return;
      }
      await new Promise((r) => setTimeout(r, 800));
      setPublished(data.url);
    } catch {
      setPubError("Could not publish. Please try again.");
    } finally {
      setPublishing(false);
    }
  }

  if (!schema) {
    return (
      <DashboardShell>
        <div className="flex h-screen items-center justify-center">
          <CircleNotch weight="bold" className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {/* Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/55 px-6 py-3 backdrop-blur-2xl backdrop-saturate-150">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm"><ArrowLeft weight="bold" className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="text-sm font-semibold">{schema.brand.name}</div>
            <div className="text-xs text-muted-foreground">{schema.sourceUrl}</div>
          </div>
        </div>

        <div className="inline-flex shrink-0 rounded-full border border-border bg-secondary p-0.5">
          {(["before", "after"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "relative rounded-full px-3 py-0.5 text-[13px] font-medium capitalize transition-colors",
                view === v ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {view === v && (
                <motion.span layoutId="result-pill" className="absolute inset-0 rounded-full bg-white/10 shadow-sm" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
              )}
              <span className="relative">{v}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadHtml}>
            <DownloadSimple weight="bold" className="h-4 w-4" /> Download
          </Button>
          <Link href={projectId ? `/editor?p=${projectId}` : "/editor"}>
            <Button variant="outline" size="sm"><MagicWand weight="bold" className="h-4 w-4" /> Edit with AI</Button>
          </Link>
          {published ? (
            <a href={published} target="_blank" rel="noreferrer">
              <Button size="sm"><Check weight="bold" className="h-4 w-4" /> Live</Button>
            </a>
          ) : (
            <Button size="sm" onClick={publish} disabled={publishing}>
              {publishing ? <CircleNotch weight="bold" className="h-4 w-4 animate-spin" /> : <RocketLaunch weight="bold" className="h-4 w-4" />}
              Publish
            </Button>
          )}
        </div>
      </div>

      {published && (
        <div className="flex items-center justify-center gap-2 border-b border-emerald-500/30 bg-emerald-500/10 px-6 py-2.5 text-sm text-emerald-300">
          <Check weight="bold" className="h-4 w-4" /> Published to
          <a href={published} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
            {published.replace("https://", "")}
          </a>
          <ArrowSquareOut weight="bold" className="h-3.5 w-3.5" />
        </div>
      )}

      {needAuth && (
        <div className="flex flex-wrap items-center justify-center gap-3 border-b border-accent/30 bg-accent/10 px-6 py-2.5 text-sm text-accent">
          Sign in to publish your site.
          <Link
            href="/login"
            className="rounded-full bg-accent px-3.5 py-1 text-xs font-medium text-accent-foreground transition hover:brightness-105"
          >
            Sign in
          </Link>
        </div>
      )}

      {pubError && (
        <div className="flex items-center justify-center gap-2 border-b border-red-500/30 bg-red-500/10 px-6 py-2.5 text-sm text-red-300">
          {pubError}
        </div>
      )}

      {/* Smart optimizations: surface what Smart mode changed and why. */}
      {schema.recommendations && schema.recommendations.length > 0 && (
        <div className="border-b border-border bg-secondary/30 px-6 py-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkle weight="fill" className="h-4 w-4 text-accent" />
              Smart made {schema.recommendations.length} optimization
              {schema.recommendations.length > 1 ? "s" : ""} for conversion
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {schema.recommendations.map((r, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 rounded-lg border border-border bg-background/50 px-3.5 py-2.5"
                >
                  <Check weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <div className="text-sm font-medium">{r.action}</div>
                    <div className="text-xs text-muted-foreground">{r.reason}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-border panel shadow-xl shadow-black/5">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <div className="ml-3 flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              {view === "after" ? `${schema.brand.name.toLowerCase().replace(/\s+/g, "")}.reframe.site` : schema.sourceUrl}
            </div>
            {view === "before" && (
              <a
                href={liveUrl(schema.sourceUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Open live <ArrowSquareOut weight="bold" className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {view === "after" ? (
              <SiteRenderer schema={schema} />
            ) : (
              <BeforeView analysis={analysis} url={schema.sourceUrl} />
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

/** Normalize a stored source URL into an absolute, linkable address. */
function liveUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * The "before" view: the client's actual current site. We embed it live in an
 * iframe when the site allows framing, and fall back to a real screenshot
 * (captured on demand) for sites that refuse it via X-Frame-Options / CSP. If
 * even the screenshot is unavailable, we show a representative preview built
 * from the analysis. The toolbar always offers an "Open live" link too.
 */
function BeforeView({ analysis, url }: { analysis: SiteAnalysis | null; url: string }) {
  const src = liveUrl(url);
  type Mode = "checking" | "iframe" | "shot" | "mockup";
  const [mode, setMode] = React.useState<Mode>("checking");
  const loadedRef = React.useRef(false);

  // Decide iframe vs screenshot from the site's real framing headers, which is
  // reliable (an iframe's onLoad fires even when the browser blocks the frame).
  React.useEffect(() => {
    let alive = true;
    loadedRef.current = false;
    setMode("checking");
    fetch(`/api/embeddable?url=${encodeURIComponent(src)}`)
      .then((r) => r.json())
      .then((d) => alive && setMode(d.embeddable ? "iframe" : "shot"))
      .catch(() => alive && setMode("iframe"));
    return () => {
      alive = false;
    };
  }, [src]);

  // Safety net: if an allowed iframe still never loads, try the screenshot.
  React.useEffect(() => {
    if (mode !== "iframe") return;
    const t = setTimeout(() => {
      if (!loadedRef.current) setMode("shot");
    }, 6000);
    return () => clearTimeout(t);
  }, [mode]);

  if (mode === "checking") {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-white/[0.02]">
        <CircleNotch weight="bold" className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (mode === "iframe") {
    return (
      <iframe
        src={src}
        title="Your current website"
        className="h-[70vh] w-full bg-white"
        referrerPolicy="no-referrer"
        onLoad={() => {
          loadedRef.current = true;
        }}
      />
    );
  }

  if (mode === "shot") {
    return <ShotView src={src} onFail={() => setMode("mockup")} />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border bg-secondary/40 px-4 py-2.5 text-xs text-muted-foreground">
        Couldn&apos;t embed your live site here.
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-2"
        >
          Open it in a new tab <ArrowSquareOut weight="bold" className="h-3.5 w-3.5" />
        </a>
      </div>
      <OldSitePreview analysis={analysis} url={url} />
    </div>
  );
}

/** Renders the on-demand screenshot, falling back via onFail if unavailable. */
function ShotView({ src, onFail }: { src: string; onFail: () => void }) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div className="relative min-h-[70vh] bg-white/[0.02]">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <CircleNotch weight="bold" className="h-5 w-5 animate-spin" />
          Capturing your current site…
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/screenshot?url=${encodeURIComponent(src)}`}
        alt="Your current website"
        className={cn("w-full", loaded ? "block" : "invisible")}
        onLoad={() => setLoaded(true)}
        onError={onFail}
      />
    </div>
  );
}

/** A representative "before" preview built from the analysis. */
function OldSitePreview({ analysis, url }: { analysis: SiteAnalysis | null; url: string }) {
  return (
    <div className="bg-[#f4f4ef] p-10 font-serif text-[#333]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between border-b-2 border-[#999] pb-3">
          <span className="text-lg font-bold text-[#1d4a8a]">{(analysis?.brandName || "Website").toUpperCase()}</span>
          <div className="flex gap-3 text-xs text-[#1d4a8a] underline">
            <span>Home</span><span>About</span><span>Services</span><span>Contact</span>
          </div>
        </div>
        <div className="mb-4 h-40 w-full bg-[#d4d4c8]" />
        <h3 className="mb-2 text-xl font-bold">Welcome to {analysis?.brandName || "our website"}</h3>
        <p className="text-sm leading-relaxed text-[#555]">
          {analysis?.extractedContent.description ||
            "This is the original website. It works, but it looks dated, loads slowly and doesn't convert visitors."}
        </p>
        <p className="mt-3 text-xs text-[#888]">{url}</p>
        <div className="mt-4 inline-block border border-[#1d4a8a] bg-[#e6e6e6] px-4 py-1 text-xs text-[#1d4a8a]">
          Click here
        </div>
      </div>
    </div>
  );
}
