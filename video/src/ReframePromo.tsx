import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

/*
 * ReframePromo — the flagship launch film. Seven cinematic scenes following the
 * Linear/Stripe/Framer product-video grammar: one message at a time, large
 * confident type, premium easing, mask reveals, parallax and depth. Pure
 * motion-graphics (no stock footage), brand-locked: near-black canvas, single
 * lime accent, Geist. Responsive via vmin units (renders 16:9 and 9:16).
 */

export const FPS = 30;

const BG = "#060607";
const ACCENT = "#9FDE3F";
const ACCENT_INK = "#10180a";
const WHITE = "#fafafa";
const MUTED = "#8b9097";
const SANS = "Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const EASE = Easing.bezier(0.16, 1, 0.3, 1); // premium ease-out
const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);

const useStage = () => {
  const { width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width, height) / 100; // 1u = 1vmin
  return { width, height, u, portrait: height > width, durationInFrames };
};

/** ease-out interpolate helper */
const io = (frame: number, range: [number, number], out: [number, number], easing = EASE) =>
  interpolate(frame, range, out, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/* -------------------------------------------------------------------------- */
/*  Ambience + chrome                                                         */
/* -------------------------------------------------------------------------- */

const Ambient: React.FC<{ hue?: string; intensity?: number }> = ({ hue = ACCENT, intensity = 1 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 60) * 3;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(46% 52% at ${22 + drift}% 16%, ${hue}26, transparent 70%), radial-gradient(40% 46% at ${82 - drift}% 30%, rgba(255,255,255,0.05), transparent 70%)`,
          opacity: intensity,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.045) 1.2px, transparent 1.2px)",
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(to bottom,#000,transparent 94%)",
          WebkitMaskImage: "linear-gradient(to bottom,#000,transparent 94%)",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(120% 120% at 50% 50%, transparent 56%, rgba(0,0,0,0.6) 100%)" }} />
);

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: 0.04,
        mixBlendMode: "overlay",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        transform: `translate(${(frame % 3) * 2}px, ${(frame % 2) * 3}px)`,
        pointerEvents: "none",
      }}
    />
  );
};

/** A word that mask-reveals upward, line by line. */
const RevealLine: React.FC<{ children: React.ReactNode; delay?: number; size: number; weight?: number; color?: string; track?: number }> = ({
  children,
  delay = 0,
  size,
  weight = 600,
  color = WHITE,
  track = -0.02,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.7 } });
  const y = interpolate(s, [0, 1], [size * 1.05, 0]);
  const clip = interpolate(s, [0, 1], [100, 0]);
  return (
    <div style={{ overflow: "hidden", lineHeight: 1.02 }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: weight,
          fontSize: size,
          color,
          letterSpacing: `${track}em`,
          transform: `translateY(${y}px)`,
          clipPath: `inset(0 0 ${clip}% 0)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number; color?: string }> = ({ children, delay = 0, color = ACCENT }) => {
  const frame = useCurrentFrame();
  const { u } = useStage();
  const o = io(frame, [delay, delay + 10], [0, 1]);
  const x = io(frame, [delay, delay + 14], [-u, 0]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: u * 1.1, opacity: o, transform: `translateX(${x}px)`, marginBottom: u * 1.6 }}>
      <span style={{ width: u * 3, height: 2, background: color, display: "inline-block" }} />
      <span style={{ fontFamily: MONO, fontSize: u * 1.5, letterSpacing: "0.32em", textTransform: "uppercase", color }}>{children}</span>
    </div>
  );
};

/* A reusable stylized website mock (built from divs for full motion control). */
const SiteMock: React.FC<{ variant: "dated" | "premium"; w: number; h: number }> = ({ variant, w, h }) => {
  const r = Math.min(w, h) * 0.03;
  if (variant === "dated") {
    return (
      <div style={{ width: w, height: h, borderRadius: r, overflow: "hidden", background: "#eceae4", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)", border: "1px solid #d8d5cc" }}>
        <div style={{ height: h * 0.12, background: "#cdc8bd", display: "flex", alignItems: "center", padding: `0 ${w * 0.04}px`, gap: w * 0.03 }}>
          <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: h * 0.05, color: "#534534" }}>Maison&nbsp;Dupont</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: w * 0.025 }}>
            {["Home", "About", "Services", "Contact"].map((t) => (
              <span key={t} style={{ fontFamily: "Times New Roman, serif", fontSize: h * 0.03, color: "#7a756a", textDecoration: "underline" }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: w * 0.05 }}>
          <div style={{ fontFamily: "Times New Roman, serif", fontSize: h * 0.06, color: "#444", marginBottom: h * 0.02 }}>Welcome to our website</div>
          {[0.9, 0.95, 0.8, 0.88, 0.6].map((wd, i) => (
            <div key={i} style={{ height: h * 0.022, width: `${wd * 100}%`, background: "#c9c4b8", marginBottom: h * 0.016, borderRadius: 2 }} />
          ))}
          <div style={{ display: "flex", gap: w * 0.03, marginTop: h * 0.03 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: 1, height: h * 0.22, background: "#d6d2c7", border: "1px solid #c2bdb1" }} />
            ))}
          </div>
          <div style={{ marginTop: h * 0.03, width: w * 0.22, height: h * 0.06, background: "#9a948a", color: "#fff", fontFamily: "Times New Roman, serif", fontSize: h * 0.028, display: "flex", alignItems: "center", justifyContent: "center" }}>Click here</div>
        </div>
      </div>
    );
  }
  // premium
  return (
    <div style={{ width: w, height: h, borderRadius: r, overflow: "hidden", background: "#0c0d0e", boxShadow: `0 40px 120px -30px ${ACCENT}55, inset 0 0 0 1px rgba(255,255,255,0.08)` }}>
      <div style={{ height: h * 0.1, display: "flex", alignItems: "center", padding: `0 ${w * 0.045}px`, gap: w * 0.03, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, color: WHITE, fontSize: h * 0.04, letterSpacing: "-0.02em" }}>Maison Dupont</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: w * 0.028, alignItems: "center" }}>
          {["Atelier", "Collections", "Contact"].map((t) => (
            <span key={t} style={{ fontFamily: SANS, fontSize: h * 0.028, color: MUTED }}>{t}</span>
          ))}
          <span style={{ background: ACCENT, color: ACCENT_INK, fontFamily: SANS, fontWeight: 600, fontSize: h * 0.026, padding: `${h * 0.014}px ${w * 0.02}px`, borderRadius: 999 }}>Book</span>
        </div>
      </div>
      <div style={{ display: "flex", height: h * 0.9 }}>
        <div style={{ flex: 1.1, padding: w * 0.05, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: h * 0.024, letterSpacing: "0.3em", color: ACCENT, textTransform: "uppercase", marginBottom: h * 0.03 }}>Atelier · Paris</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: h * 0.085, color: WHITE, lineHeight: 1.04, letterSpacing: "-0.03em" }}>Craft that<br />lasts a lifetime</div>
          <div style={{ fontFamily: SANS, fontSize: h * 0.03, color: MUTED, marginTop: h * 0.03, maxWidth: "80%" }}>Hand-built furniture, made to be lived in.</div>
          <div style={{ display: "flex", gap: w * 0.02, marginTop: h * 0.05 }}>
            <div style={{ background: ACCENT, color: ACCENT_INK, fontFamily: SANS, fontWeight: 600, fontSize: h * 0.03, padding: `${h * 0.022}px ${w * 0.03}px`, borderRadius: 999 }}>Get started</div>
            <div style={{ color: WHITE, fontFamily: SANS, fontSize: h * 0.03, padding: `${h * 0.022}px ${w * 0.01}px` }}>Our story →</div>
          </div>
        </div>
        <div style={{ flex: 1, margin: w * 0.035, borderRadius: r, background: `linear-gradient(135deg, ${ACCENT}40, transparent 60%), #16181a`, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 1 — Problem                                                         */
/* -------------------------------------------------------------------------- */

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width, height } = useStage();
  const mockW = width * 0.42;
  const mockH = mockW * 0.62;
  // slow cinematic push-in + slight desaturation lifting then settling
  const scale = io(frame, [0, 110], [1.08, 1.0], EASE_IO);
  const mockO = io(frame, [4, 26], [0, 1]);
  const sat = io(frame, [0, 90], [0.25, 0.55]);
  const fadeOut = io(frame, [96, 116], [1, 0]);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Ambient hue="#ff5a3c" intensity={0.7} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${scale})` }}>
        <div style={{ filter: `grayscale(${1 - sat}) brightness(0.92)`, opacity: mockO, transform: `rotate(-1.5deg)` }}>
          <SiteMock variant="dated" w={mockW} h={mockH} />
        </div>
      </AbsoluteFill>
      {/* red flags floating */}
      {["Outdated", "Slow", "Low trust"].map((t, i) => {
        const d = 30 + i * 10;
        const o = io(frame, [d, d + 12], [0, 1]) * io(frame, [92, 108], [1, 0]);
        const fy = Math.sin((frame + i * 20) / 30) * u * 0.6;
        return (
          <div key={t} style={{ position: "absolute", left: `${18 + i * 26}%`, top: `${22 + (i % 2) * 50}%`, opacity: o, transform: `translateY(${fy}px)`, fontFamily: SANS, fontSize: u * 1.9, fontWeight: 600, color: "#ff7a5c", border: "1px solid #ff7a5c55", background: "rgba(255,90,60,0.1)", padding: `${u * 0.5}px ${u * 1.2}px`, borderRadius: 999, backdropFilter: "blur(4px)" }}>
            {t}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: u * 12, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <RevealLine delay={40} size={u * 6.4} weight={600}>Your website is</RevealLine>
        <RevealLine delay={48} size={u * 6.4} weight={600} color={"#ff7a5c"}>costing you customers.</RevealLine>
      </div>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 2 — Discovery (paste URL)                                           */
/* -------------------------------------------------------------------------- */

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width } = useStage();
  const url = "maisondupont.com";
  const typed = Math.floor(io(frame, [22, 60], [0, url.length]));
  const caret = frame % 16 < 8;
  const barW = width * 0.5;
  const barIn = spring({ frame: frame - 6, fps: FPS, config: { damping: 200 } });
  const fadeOut = io(frame, [92, 104], [1, 0]);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Ambient />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ transform: `scale(${interpolate(barIn, [0, 1], [0.9, 1])})`, opacity: barIn }}>
          <div style={{ display: "flex", alignItems: "center", gap: u * 1.6, width: barW, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: u * 2, padding: `${u * 1.8}px ${u * 2.4}px`, boxShadow: "0 30px 80px -30px rgba(0,0,0,0.7)" }}>
            <div style={{ width: u * 2.2, height: u * 2.2, borderRadius: 999, border: `2px solid ${MUTED}`, position: "relative" }}>
              <div style={{ position: "absolute", width: u * 1.1, height: 2, background: MUTED, bottom: -u * 0.1, right: -u * 0.5, transform: "rotate(45deg)" }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: u * 2.8, color: WHITE }}>
              {url.slice(0, typed)}
              <span style={{ opacity: caret && typed < url.length ? 1 : caret ? 0.6 : 0, color: ACCENT }}>|</span>
            </div>
            <div style={{ marginLeft: "auto", transform: `scale(${frame > 62 ? 0.97 : 1})`, background: ACCENT, color: ACCENT_INK, fontFamily: SANS, fontWeight: 700, fontSize: u * 2.4, padding: `${u}px ${u * 2.2}px`, borderRadius: u * 1.4 }}>Analyze →</div>
          </div>
        </div>
        <div style={{ marginTop: u * 7, textAlign: "center" }}>
          <RevealLine delay={70} size={u * 6.6} weight={600}>Paste your URL.</RevealLine>
        </div>
      </AbsoluteFill>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 3 — AI Analysis (scan + extraction chips)                           */
/* -------------------------------------------------------------------------- */

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width, height } = useStage();
  const mockW = width * 0.4;
  const mockH = mockW * 0.62;
  const scanY = io(frame, [10, 70], [0, mockH], Easing.linear);
  const chips = [
    { t: "Logo detected", d: 26 },
    { t: "Brand colors", d: 38 },
    { t: "12 images", d: 50 },
    { t: "Content + structure", d: 62 },
  ];
  const fadeOut = io(frame, [104, 116], [1, 0]);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Ambient />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: u * 5, flexDirection: "row" }}>
        <div style={{ position: "relative", filter: "grayscale(0.3) brightness(0.95)" }}>
          <SiteMock variant="dated" w={mockW} h={mockH} />
          {/* scan beam */}
          <div style={{ position: "absolute", left: 0, right: 0, top: scanY, height: u * 0.6, background: ACCENT, boxShadow: `0 0 ${u * 4}px ${u}px ${ACCENT}aa` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: scanY, background: `linear-gradient(${ACCENT}14, transparent)` }} />
          {/* detection markers */}
          {[{ x: 0.08, y: 0.06, w: 0.3, h: 0.06, on: 26 }, { x: 0.05, y: 0.55, w: 0.26, h: 0.2, on: 50 }].map((m, i) => {
            const o = io(frame, [m.on, m.on + 8], [0, 1]);
            return <div key={i} style={{ position: "absolute", left: mockW * m.x, top: mockH * m.y, width: mockW * m.w, height: mockH * m.h, border: `2px solid ${ACCENT}`, borderRadius: u * 0.6, opacity: o, boxShadow: `0 0 ${u * 2}px ${ACCENT}66` }} />;
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: u * 1.6, minWidth: width * 0.24 }}>
          {chips.map((c) => {
            const s = spring({ frame: frame - c.d, fps: FPS, config: { damping: 200, mass: 0.6 } });
            return (
              <div key={c.t} style={{ transform: `translateX(${interpolate(s, [0, 1], [u * 2, 0])}px)`, opacity: s, display: "flex", alignItems: "center", gap: u * 1.2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: u * 1.4, padding: `${u * 1.2}px ${u * 1.8}px` }}>
                <div style={{ width: u * 2, height: u * 2, borderRadius: 999, background: ACCENT, color: ACCENT_INK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: u * 1.4, fontWeight: 800 }}>✓</div>
                <span style={{ fontFamily: SANS, fontSize: u * 2.3, color: WHITE, fontWeight: 500 }}>{c.t}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: u * 7, textAlign: "center" }}>
        <RevealLine delay={78} size={u * 5} weight={600}>ReFrame understands your business.</RevealLine>
      </div>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 4 — Transformation (before -> after wipe)  [hero]                   */
/* -------------------------------------------------------------------------- */

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width, height } = useStage();
  const mockW = width * 0.62;
  const mockH = mockW * 0.6;
  // wipe from left: premium overlays the dated one
  const wipe = io(frame, [34, 92], [0, 100], EASE_IO);
  const beamX = (wipe / 100) * mockW;
  const settle = spring({ frame: frame - 10, fps: FPS, config: { damping: 200 } });
  const scale = interpolate(settle, [0, 1], [0.92, 1]);
  const fadeOut = io(frame, [168, 180], [1, 0]);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Ambient intensity={1.1} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: mockW, height: mockH, transform: `scale(${scale})` }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <SiteMock variant="dated" w={mockW} h={mockH} />
          </div>
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
            <SiteMock variant="premium" w={mockW} h={mockH} />
          </div>
          {/* sweep beam */}
          {wipe > 0.5 && wipe < 99.5 && (
            <div style={{ position: "absolute", top: -u * 2, bottom: -u * 2, left: beamX - u * 0.3, width: u * 0.6, background: ACCENT, boxShadow: `0 0 ${u * 5}px ${u * 1.5}px ${ACCENT}` }} />
          )}
        </div>
      </AbsoluteFill>
      {/* labels */}
      <div style={{ position: "absolute", top: u * 8, left: u * 8, fontFamily: MONO, fontSize: u * 1.8, letterSpacing: "0.3em", color: MUTED, opacity: io(frame, [120, 140], [1, 0.25]) }}>BEFORE</div>
      <div style={{ position: "absolute", top: u * 8, right: u * 8, fontFamily: MONO, fontSize: u * 1.8, letterSpacing: "0.3em", color: ACCENT, opacity: io(frame, [70, 90], [0, 1]) }}>AFTER</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: u * 6, textAlign: "center" }}>
        <RevealLine delay={104} size={u * 6.2} weight={600}>Same business.</RevealLine>
        <RevealLine delay={112} size={u * 6.2} weight={600} color={ACCENT}>Better website.</RevealLine>
      </div>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 5 — AI Editing                                                      */
/* -------------------------------------------------------------------------- */

const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width, height } = useStage();
  const prompts = ["Make it darker", "Add an FAQ", "Improve the hero"];
  // cycle a prompt every ~36 frames, type it, then "apply"
  const cycle = 40;
  const idx = Math.min(prompts.length - 1, Math.floor(frame / cycle));
  const local = frame - idx * cycle;
  const text = prompts[idx];
  const typed = Math.floor(io(local, [4, 22], [0, text.length]));
  const applied = local > 26;
  const mockW = width * 0.34;
  const mockH = mockW * 0.62;
  const dark = idx >= 0 && applied; // darkens after first apply
  const fadeOut = io(frame, [146, 158], [1, 0]);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Ambient />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: u * 5, flexDirection: "row" }}>
        {/* chat column */}
        <div style={{ display: "flex", flexDirection: "column", gap: u * 1.4, width: width * 0.3 }}>
          {prompts.slice(0, idx + 1).map((p, i) => {
            const isCur = i === idx;
            const show = isCur ? p.slice(0, typed) : p;
            return (
              <div key={i} style={{ alignSelf: "flex-end", maxWidth: "90%", background: i % 2 ? "rgba(255,255,255,0.05)" : ACCENT, color: i % 2 ? WHITE : ACCENT_INK, fontFamily: SANS, fontWeight: 600, fontSize: u * 2.4, padding: `${u * 1.1}px ${u * 1.8}px`, borderRadius: u * 1.6, borderBottomRightRadius: u * 0.4 }}>
                {show}
                {isCur && typed < p.length && <span style={{ opacity: frame % 14 < 7 ? 1 : 0 }}>|</span>}
              </div>
            );
          })}
          {applied && (
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: u * 0.8, fontFamily: SANS, fontSize: u * 1.9, color: MUTED, opacity: io(local, [26, 32], [0, 1]) }}>
              <span style={{ width: u * 1.5, height: u * 1.5, borderRadius: 999, background: ACCENT }} /> Applied instantly
            </div>
          )}
        </div>
        {/* live preview reacting */}
        <div style={{ filter: dark ? "none" : "none", transform: `scale(${interpolate(spring({ frame: local - 26, fps: FPS, config: { damping: 200 } }), [0, 1], applied ? [0.98, 1] : [1, 1])})` }}>
          <SiteMock variant="premium" w={mockW} h={mockH} />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: u * 7, textAlign: "center" }}>
        <RevealLine delay={120} size={u * 6} weight={600}>Edit with AI.</RevealLine>
      </div>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 6 — Publish                                                         */
/* -------------------------------------------------------------------------- */

const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width } = useStage();
  const burst = io(frame, [26, 70], [0, 1], EASE);
  const ringO = io(frame, [26, 70], [0.6, 0]);
  const live = io(frame, [40, 54], [0, 1]);
  const domainType = Math.floor(io(frame, [44, 70], [0, "maisondupont.com".length]));
  const fadeOut = io(frame, [92, 104], [1, 0]);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Ambient intensity={1.1} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: u * 4 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* expanding ring */}
          <div style={{ position: "absolute", width: u * 18 + burst * u * 40, height: u * 18 + burst * u * 40, borderRadius: 999, border: `2px solid ${ACCENT}`, opacity: ringO }} />
          <div style={{ transform: `scale(${frame > 18 && frame < 30 ? 0.95 : 1})`, background: ACCENT, color: ACCENT_INK, fontFamily: SANS, fontWeight: 700, fontSize: u * 3.2, padding: `${u * 1.8}px ${u * 4}px`, borderRadius: 999, boxShadow: `0 20px 60px -16px ${ACCENT}` }}>
            {live > 0.5 ? "● Live" : "Publish"}
          </div>
        </div>
        {/* domain connect */}
        <div style={{ display: "flex", alignItems: "center", gap: u * 1.4, opacity: io(frame, [40, 50], [0, 1]), fontFamily: MONO, fontSize: u * 2.4, color: WHITE, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: u * 1.4, padding: `${u}px ${u * 2}px` }}>
          <span style={{ color: ACCENT }}>https://</span>{"maisondupont.com".slice(0, domainType)}
          <span style={{ color: ACCENT, marginLeft: u, opacity: live }}>✓ connected</span>
        </div>
        <div style={{ marginTop: u * 3, textAlign: "center" }}>
          <RevealLine delay={62} size={u * 6.6} weight={600}>Live in minutes.</RevealLine>
        </div>
      </AbsoluteFill>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 7 — Final showcase (devices) + logo                                 */
/* -------------------------------------------------------------------------- */

const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width, height } = useStage();
  const deskW = width * 0.5;
  const deskH = deskW * 0.6;
  const tabW = width * 0.17;
  const phoneW = width * 0.1;
  const camp = io(frame, [0, 140], [1.06, 1], EASE_IO); // slow camera push
  const rise = (d: number) => spring({ frame: frame - d, fps: FPS, config: { damping: 200, mass: 0.8 } });
  const logoIn = rise(70);
  const fadeOut = io(frame, [150, 165], [1, 0]);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Ambient intensity={1.2} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${camp})` }}>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: -phoneW * 0.4 as unknown as number }}>
          {/* desktop */}
          <div style={{ transform: `translateY(${interpolate(rise(8), [0, 1], [u * 6, 0])}px)`, opacity: rise(8), zIndex: 2 }}>
            <SiteMock variant="premium" w={deskW} h={deskH} />
          </div>
          {/* tablet */}
          <div style={{ marginLeft: -tabW * 0.5, transform: `translateY(${interpolate(rise(18), [0, 1], [u * 6, 0])}px)`, opacity: rise(18), zIndex: 3 }}>
            <div style={{ width: tabW, height: tabW * 1.3, borderRadius: u * 1.4, overflow: "hidden", background: "#0c0d0e", boxShadow: `0 30px 80px -20px ${ACCENT}55, inset 0 0 0 1px rgba(255,255,255,0.1)` }}>
              <SiteMock variant="premium" w={tabW} h={tabW * 1.3} />
            </div>
          </div>
          {/* phone */}
          <div style={{ marginLeft: -phoneW * 0.4, transform: `translateY(${interpolate(rise(28), [0, 1], [u * 6, 0])}px)`, opacity: rise(28), zIndex: 4 }}>
            <div style={{ width: phoneW, height: phoneW * 2.05, borderRadius: u * 1.8, overflow: "hidden", background: "#0c0d0e", boxShadow: `0 30px 80px -20px ${ACCENT}77, inset 0 0 0 1px rgba(255,255,255,0.12)` }}>
              <SiteMock variant="premium" w={phoneW} h={phoneW * 2.05} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {/* headline + logo lockup */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: u * 8, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <RevealLine delay={40} size={u * 5.4} weight={600}>Your business deserves</RevealLine>
        <RevealLine delay={48} size={u * 5.4} weight={600} color={ACCENT}>a better website.</RevealLine>
        <div style={{ marginTop: u * 4, display: "flex", alignItems: "center", gap: u * 1.4, opacity: logoIn, transform: `translateY(${interpolate(logoIn, [0, 1], [u * 2, 0])}px)` }}>
          <span style={{ width: u * 3, height: u * 3, borderRadius: u * 0.8, background: ACCENT, display: "inline-flex", alignItems: "center", justifyContent: "center", color: ACCENT_INK, fontFamily: SANS, fontWeight: 800, fontSize: u * 2 }}>R</span>
          <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: u * 3, color: WHITE, letterSpacing: "-0.02em" }}>ReFrame</span>
          <span style={{ fontFamily: SANS, fontSize: u * 2, color: MUTED, marginLeft: u }}>reframe.design</span>
        </div>
      </div>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Timeline                                                                  */
/* -------------------------------------------------------------------------- */

const S = [
  { c: Scene1, d: 116 },
  { c: Scene2, d: 104 },
  { c: Scene3, d: 116 },
  { c: Scene4, d: 180 },
  { c: Scene5, d: 158 },
  { c: Scene6, d: 104 },
  { c: Scene7, d: 165 },
];
const OVERLAP = 8; // cross-fade overlap

export const PROMO_TOTAL = S.reduce((a, s) => a + s.d - OVERLAP, OVERLAP);

export const ReframePromo: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {S.map((s, i) => {
        const from = at;
        at += s.d - OVERLAP;
        const Comp = s.c;
        return (
          <Sequence key={i} from={from} durationInFrames={s.d}>
            <Comp />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
