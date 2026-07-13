"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Desktop, DeviceTablet, DeviceMobile, DeviceRotate, CornersOut, CornersIn } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * PreviewStage — the workspace preview brick (UX2).
 *
 * Renders the live site inside an IFRAME whose CSS width IS the chosen device
 * width, so the site's own viewport media queries (Tailwind `sm:`/`lg:`) fire
 * for real — a "Mobile" preview is the actual mobile layout, not a squeezed
 * desktop (U0: never claim a device mode we don't truly deliver). The iframe is
 * scaled with a transform to fill the available stage (no wasted space, no
 * horizontal overflow — the scaled width is always ≤ the stage width).
 *
 * Live: children are portaled into the iframe body, so editor edits reflect
 * instantly (no URL / no re-publish needed).
 *
 * Modes:
 *  - Desktop : fluid — the iframe width = the stage width (scale 1). Fills space.
 *  - Tablet/Mobile : canonical device width (orientation-aware), scaled to fit.
 *  - Fit width (default, non-desktop) : whole page at device width, stage scrolls.
 *  - Fit to Screen : whole device viewport visible at once (no scroll).
 */

type Device = "desktop" | "tablet" | "mobile";
type Orientation = "portrait" | "landscape";

// Canonical device viewports. Every mode renders the site at ITS width inside a
// real-viewport iframe (media queries fire for real, U0) and is scaled to fit —
// so a "Desktop" preview always shows the true desktop layout (never a squeezed
// intermediate width), and the scaled footprint never overflows the column.
const DEVICE_SIZE: Record<Device, { w: number; h: number }> = {
  desktop: { w: 1440, h: 900 },
  tablet: { w: 834, h: 1194 },
  mobile: { w: 390, h: 844 },
};

// UX5 — the frozen premium easing/duration (see docs/DESIGN_SYSTEM.md).
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const DUR = "180ms";

/* -------------------------------------------------------------------------- */
/*  Iframe with the parent's styles cloned in + children portaled into body   */
/* -------------------------------------------------------------------------- */

function StyledIframe({
  width,
  bodyRef,
  onReady,
  children,
}: {
  width: number;
  bodyRef: React.MutableRefObject<HTMLElement | null>;
  onReady: () => void;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLIFrameElement>(null);
  const [body, setBody] = React.useState<HTMLElement | null>(null);

  const wireUp = React.useCallback((doc: Document) => {
    // Clone the app's compiled styles (Tailwind + globals) into the iframe so
    // the portaled site is styled. The site's own <link>/<style> (fonts,
    // themeCss) render into the body via the portal.
    doc.head.querySelectorAll("[data-rf-cloned]").forEach((n) => n.remove());
    for (const node of Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))) {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-rf-cloned", "");
      doc.head.appendChild(clone);
    }
    doc.documentElement.style.background = "transparent";
    doc.body.style.margin = "0";
    doc.body.style.background = "transparent";
    if (!doc.querySelector('meta[name="viewport"]')) {
      const meta = doc.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1";
      doc.head.appendChild(meta);
    }
    bodyRef.current = doc.body;
    setBody(doc.body);
    onReady();
  }, [bodyRef, onReady]);

  // A srcless same-origin iframe's contentDocument is available synchronously;
  // its `onLoad` is unreliable (may never fire), so capture the body here with
  // a short rAF retry rather than depending on the load event.
  React.useEffect(() => {
    let raf = 0;
    let tries = 0;
    const attempt = () => {
      const doc = ref.current?.contentDocument;
      if (doc && doc.body) {
        wireUp(doc);
        return;
      }
      if (tries++ < 30) raf = requestAnimationFrame(attempt);
    };
    attempt();
    return () => cancelAnimationFrame(raf);
  }, [wireUp]);

  return (
    <iframe
      ref={ref}
      title="Site preview"
      style={{ width, height: "100%", border: 0, display: "block", colorScheme: "normal" }}
    >
      {body ? createPortal(children, body) : null}
    </iframe>
  );
}

/* -------------------------------------------------------------------------- */
/*  Toolbar controls                                                          */
/* -------------------------------------------------------------------------- */

function DeviceButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-fast ease-premium",
        active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  PreviewStage                                                              */
/* -------------------------------------------------------------------------- */

export function PreviewStage({
  children,
  label,
  actions,
  initialDevice = "desktop",
  className,
}: {
  children: React.ReactNode;
  /** Left-side label (e.g. the site URL) shown with the traffic-light dots. */
  label?: string;
  /** Right-side page actions (dark toggle, publish…) slotted into the same bar. */
  actions?: React.ReactNode;
  initialDevice?: Device;
  className?: string;
}) {
  const [device, setDevice] = React.useState<Device>(initialDevice);
  const [orientation, setOrientation] = React.useState<Orientation>("portrait");
  const [fitScreen, setFitScreen] = React.useState(false);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const [stage, setStage] = React.useState({ w: 0, h: 0 });
  const iframeBodyRef = React.useRef<HTMLElement | null>(null);
  const [contentH, setContentH] = React.useState(0);

  // Measure the available stage area.
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStage({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setStage({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Track the site's natural height inside the iframe (for fit-width sizing).
  const observeContent = React.useCallback(() => {
    const body = iframeBodyRef.current;
    if (!body) return;
    const measure = () => setContentH(body.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(body);
    // Late layout (fonts/images) — re-measure a couple of times.
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1200);
    (body as unknown as { __rfCleanup?: () => void }).__rfCleanup = () => {
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  React.useEffect(() => () => {
    const c = iframeBodyRef.current as unknown as { __rfCleanup?: () => void } | null;
    c?.__rfCleanup?.();
  }, []);

  const isDesktop = device === "desktop";
  const base = DEVICE_SIZE[device];
  // Orientation only applies to handheld devices.
  const landscape = !isDesktop && orientation === "landscape";

  const padX = 24; // breathing room around the frame
  const availW = Math.max(stage.w - padX, 1);
  const availH = Math.max(stage.h - padX, 1);

  // Desktop is fluid-up: it renders at a REAL viewport of at least 1440 and
  // fills any wider stage (ultra-wide → immense preview), never upscaled. On a
  // narrower stage it stays 1440 and scales down (faithful, not squeezed).
  // Handhelds keep their canonical device viewport.
  const dW = isDesktop ? Math.max(base.w, Math.floor(availW)) : landscape ? base.h : base.w;
  const dH = isDesktop ? base.h : landscape ? base.w : base.h;

  // Every mode: render at canonical dW, scale to fit, never upscale (≤1).
  const scale = fitScreen ? Math.min(availW / dW, availH / dH) : Math.min(1, availW / dW);
  // Fit-to-screen shows the whole device viewport; otherwise the full page.
  const frameH = fitScreen ? dH : Math.max(contentH, dH);
  const sizerW = Math.round(dW * scale);
  const sizerH = Math.round(frameH * scale);

  const reduce = usePrefersReducedMotion();
  const motion = reduce ? "none" : `transform ${DUR} ${EASE}, width ${DUR} ${EASE}, height ${DUR} ${EASE}`;

  return (
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col overflow-hidden", className)}>
      {/* Unified bar: dots+label · device controls · page actions. min-w-0 +
          overflow-hidden so the bar never forces the preview column wider than
          its container (it clips gracefully instead of pushing page overflow). */}
      <div className="flex min-w-0 items-center gap-3 overflow-hidden border-b border-border bg-secondary/50 px-4 py-2.5">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <span className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        {label && (
          <div className="hidden min-w-0 flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-xs text-muted-foreground sm:block">
            {label}
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1 rounded-lg border border-border bg-background/40 p-0.5">
          <DeviceButton active={device === "desktop"} label="Desktop" onClick={() => setDevice("desktop")}>
            <Desktop weight={device === "desktop" ? "fill" : "bold"} className="h-4 w-4" />
          </DeviceButton>
          <DeviceButton active={device === "tablet"} label="Tablet" onClick={() => setDevice("tablet")}>
            <DeviceTablet weight={device === "tablet" ? "fill" : "bold"} className="h-4 w-4" />
          </DeviceButton>
          <DeviceButton active={device === "mobile"} label="Mobile" onClick={() => setDevice("mobile")}>
            <DeviceMobile weight={device === "mobile" ? "fill" : "bold"} className="h-4 w-4" />
          </DeviceButton>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!isDesktop && (
            <DeviceButton
              active={orientation === "landscape"}
              label={orientation === "portrait" ? "Rotate to landscape" : "Rotate to portrait"}
              onClick={() => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"))}
            >
              <DeviceRotate weight="bold" className="h-4 w-4" />
            </DeviceButton>
          )}
          <DeviceButton
            active={fitScreen}
            label={fitScreen ? "Fit width" : "Fit to screen"}
            onClick={() => setFitScreen((f) => !f)}
          >
            {fitScreen ? <CornersIn weight="bold" className="h-4 w-4" /> : <CornersOut weight="bold" className="h-4 w-4" />}
          </DeviceButton>
          <span className="hidden w-9 text-right text-[11px] tabular-nums text-muted-foreground md:inline">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {actions && <div className="flex shrink-0 items-center gap-2 pl-1">{actions}</div>}
      </div>

      {/* Stage: the scaled sizer occupies the real footprint so scrolling works;
          the frame is scaled inside it. Horizontal overflow is impossible —
          sizerW = dW·scale ≤ availW by construction. */}
      <div
        ref={stageRef}
        className="flex min-h-0 min-w-0 flex-1 justify-center overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_55%)] py-5"
      >
        <div style={{ width: sizerW, height: sizerH, transition: motion }} className="shrink-0">
          <div
            className={cn(
              "overflow-hidden bg-white ring-1 ring-black/10 shadow-float",
              isDesktop ? "rounded-xl" : "rounded-[1.75rem]"
            )}
            style={{
              width: dW,
              height: frameH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              transition: motion,
            }}
          >
            <StyledIframe width={dW} bodyRef={iframeBodyRef} onReady={observeContent}>
              {children}
            </StyledIframe>
          </div>
        </div>
      </div>
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}
