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
 * ReframeShowcase — a dynamic walkthrough of a REAL generated site.
 *
 * This is the result a user gets after running the SaaS on their URL: a full,
 * premium one-page architecture studio (the Framer-reference aesthetic), shown
 * as a guided "camera" scroll with reveal-on-scroll, parallax imagery, animated
 * counters and a running marquee. The client palette is brand-adaptive (warm
 * paper + ink + a clay accent), bookended by ReFrame's OLED brand cards.
 */

/* --- client (generated site) palette -------------------------------------- */
const PAPER = "#ece7df";
const PAPER2 = "#e2dccf";
const INK = "#16150f";
const INK_SOFT = "#5b564c";
const CLAY = "#b0492a"; // brand-adaptive accent
const HAIR = "rgba(22,21,15,0.14)";
const SERIF = "'Georgia', 'Times New Roman', ui-serif, serif";
const SANS =
  "Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/* --- ReFrame brand (bookends) ---------------------------------------------- */
const BG = "#08080a";
const ACCENT = "#9FDE3F";
const ACCENT_INK = "#10180a";
const WHITE = "#fafafa";

const VH = 1080;
const VW = 1920;

/* gradient "photographs" — architectural duotones */
const PHOTOS = [
  "linear-gradient(155deg,#3c413b 0%,#6d7268 55%,#9ba194 100%)",
  "linear-gradient(155deg,#243a52 0%,#5c7f9d 60%,#b3cad9 100%)",
  "linear-gradient(155deg,#574330 0%,#9b7a51 60%,#d9c4a1 100%)",
  "linear-gradient(155deg,#26262b 0%,#54545b 60%,#9a9aa1 100%)",
];

/* -------------------------------------------------------------------------- */
/*  Scroll-aware helpers                                                      */
/* -------------------------------------------------------------------------- */

/** 0..1 as an element at page-position `absTop` rises through the viewport. */
const reveal = (absTop: number, scrollY: number, startAt = 0.92, endAt = 0.58) => {
  const screenY = absTop - scrollY;
  // interpolate needs an increasing inputRange; screenY shrinks as the element
  // rises, so map [endAt, startAt] -> [1, 0].
  return interpolate(screenY, [VH * endAt, VH * startAt], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const parallax = (absTop: number, scrollY: number, factor = 0.12) =>
  (scrollY - absTop) * factor;

const Photo: React.FC<{
  i: number;
  absTop: number;
  scrollY: number;
  style?: React.CSSProperties;
  factor?: number;
}> = ({ i, absTop, scrollY, style, factor = 0.08 }) => (
  <div style={{ overflow: "hidden", position: "relative", ...style }}>
    <div
      style={{
        position: "absolute",
        inset: "-12% 0",
        background: PHOTOS[i % PHOTOS.length],
        transform: `translateY(${parallax(absTop, scrollY, factor)}px) scale(1.06)`,
        filter: "saturate(0.85) contrast(1.05)",
      }}
    />
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 80% at 50% 20%, ${CLAY}1f, transparent 70%)` }} />
    <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 120px rgba(0,0,0,0.25)" }} />
  </div>
);

const Up: React.FC<{
  p: number; // reveal 0..1
  dy?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ p, dy = 46, children, style }) => (
  <div
    style={{
      opacity: p,
      transform: `translateY(${interpolate(p, [0, 1], [dy, 0])}px)`,
      ...style,
    }}
  >
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Generated site sections                                                   */
/* -------------------------------------------------------------------------- */

const TOPS = {
  hero: 0,
  marquee: 1080,
  manifesto: 1230,
  projects: 1850,
  stats: 3350,
  services: 3830,
  testimonial: 4690,
  cta: 5330,
};
const SITE_H = 6360;

const Hero: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const t = TOPS.hero;
  const words = ["Architecture", "for modern", "living."];
  return (
    <section style={{ position: "absolute", top: t, left: 0, width: VW, height: 1080, background: PAPER }}>
      <Photo i={1} absTop={t} scrollY={scrollY} factor={0.06} style={{ position: "absolute", right: 90, top: 150, width: 760, height: 820, borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 96, top: 220 }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: CLAY, textTransform: "uppercase" }}>Meridian · Architecture Studio</div>
        {words.map((w, i) => (
          <div
            key={w}
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 138,
              lineHeight: 0.98,
              letterSpacing: -3,
              color: i === 2 ? CLAY : INK,
              marginTop: i === 0 ? 22 : 0,
              fontStyle: i === 1 ? "italic" : "normal",
              transform: `translateY(${interpolate(scrollY, [0, 600], [0, -40 - i * 14])}px)`,
            }}
          >
            {w}
          </div>
        ))}
        <div style={{ fontFamily: SANS, fontSize: 26, lineHeight: 1.5, color: INK_SOFT, maxWidth: 520, marginTop: 34 }}>
          We design spaces that hold light, age gracefully, and feel inevitable.
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          <Pill label="View our work" filled />
          <Pill label="Book a call" />
        </div>
      </div>
      {/* scroll cue */}
      <div style={{ position: "absolute", left: 96, bottom: 60, fontFamily: MONO, fontSize: 16, letterSpacing: 3, color: INK_SOFT, opacity: interpolate(scrollY, [0, 200], [1, 0], { extrapolateRight: "clamp" }) }}>
        SCROLL ↓
      </div>
    </section>
  );
};

const Marquee: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const frame = useCurrentFrame();
  const items = ["Residential", "Commercial", "Interior", "Master Planning", "Urban", "Consulting"];
  const strip = [...items, ...items, ...items];
  const x = -((frame * 3) % 900);
  return (
    <div style={{ position: "absolute", top: TOPS.marquee, left: 0, width: VW, height: 150, background: INK, display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 56, transform: `translateX(${x}px)`, whiteSpace: "nowrap" }}>
        {strip.map((s, i) => (
          <span key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 56, color: i % 3 === 1 ? CLAY : PAPER }}>
            {s} <span style={{ color: CLAY }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const Manifesto: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const t = TOPS.manifesto;
  const p = reveal(t + 240, scrollY);
  return (
    <section style={{ position: "absolute", top: t, left: 0, width: VW, height: 620, background: PAPER, display: "flex", alignItems: "center" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 96px" }}>
        <Up p={p}>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: CLAY, textTransform: "uppercase" }}>(01) — Studio</div>
        </Up>
        <Up p={reveal(t + 300, scrollY)} dy={60} style={{ marginTop: 22 }}>
          <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1.18, letterSpacing: -1, color: INK }}>
            A practice built on restraint. We work in concrete, glass and timber to
            shape buildings that feel <span style={{ color: CLAY, fontStyle: "italic" }}>quiet, durable and human.</span>
          </div>
        </Up>
      </div>
    </section>
  );
};

const Projects: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const t = TOPS.projects;
  const cards = [
    { name: "Casa Lumen", place: "Lisbon", year: "2024", i: 0 },
    { name: "The Glasshouse", place: "Oslo", year: "2023", i: 1 },
    { name: "Atelier Nord", place: "Paris", year: "2023", i: 3 },
    { name: "Maison Pierre", place: "Lyon", year: "2022", i: 2 },
  ];
  return (
    <section style={{ position: "absolute", top: t, left: 0, width: VW, height: 1500, background: PAPER }}>
      <div style={{ padding: "70px 96px 0" }}>
        <Up p={reveal(t + 60, scrollY)} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ fontFamily: SERIF, fontSize: 92, letterSpacing: -2, color: INK }}>Selected Work</div>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: CLAY }}>(02) — PROJECTS</div>
        </Up>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 56 }}>
          {cards.map((c, idx) => {
            const cardTop = t + 220 + Math.floor(idx / 2) * 600;
            const p = reveal(cardTop, scrollY, 0.95, 0.62);
            return (
              <Up key={c.name} p={p} dy={70}>
                <Photo i={c.i} absTop={cardTop} scrollY={scrollY} factor={0.05} style={{ width: "100%", height: 470, borderRadius: 8 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 20 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 40, color: INK }}>{c.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 18, color: INK_SOFT }}>{c.place} · {c.year}</div>
                </div>
              </Up>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Stats: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const t = TOPS.stats;
  const p = reveal(t + 120, scrollY, 0.9, 0.5);
  const items = [
    { v: 120, suf: "+", label: "Projects delivered" },
    { v: 18, suf: "", label: "Years of practice" },
    { v: 9, suf: "", label: "Design awards" },
    { v: 4, suf: "", label: "Cities" },
  ];
  return (
    <section style={{ position: "absolute", top: t, left: 0, width: VW, height: 480, background: INK, display: "flex", alignItems: "center" }}>
      <div style={{ width: "100%", padding: "0 96px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 30 }}>
        {items.map((s, i) => (
          <div key={s.label} style={{ borderLeft: `1px solid rgba(255,255,255,0.16)`, paddingLeft: 28 }}>
            <div style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 1, color: PAPER, opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }) }}>
              {Math.round(p * s.v)}
              <span style={{ color: CLAY }}>{s.suf}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 22, color: "rgba(236,231,223,0.6)", marginTop: 14 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Services: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const t = TOPS.services;
  const rows = ["Architecture", "Interior Design", "Master Planning", "Consulting"];
  return (
    <section style={{ position: "absolute", top: t, left: 0, width: VW, height: 860, background: PAPER }}>
      <div style={{ padding: "70px 96px 0" }}>
        <Up p={reveal(t + 40, scrollY)}>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: CLAY }}>(03) — CAPABILITIES</div>
        </Up>
        <div style={{ marginTop: 30 }}>
          {rows.map((r, i) => {
            const rowTop = t + 180 + i * 150;
            const p = reveal(rowTop, scrollY, 0.96, 0.72);
            return (
              <div
                key={r}
                style={{
                  borderTop: `1px solid ${HAIR}`,
                  padding: "32px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [-30, 0])}px)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
                  <span style={{ fontFamily: MONO, fontSize: 22, color: CLAY }}>0{i + 1}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 76, letterSpacing: -2, color: INK }}>{r}</span>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 40, color: CLAY, opacity: p }}>↗</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Testimonial: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const t = TOPS.testimonial;
  const p = reveal(t + 180, scrollY, 0.92, 0.58);
  return (
    <section style={{ position: "absolute", top: t, left: 0, width: VW, height: 640, background: PAPER2, display: "flex", alignItems: "center" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 96px", textAlign: "center" }}>
        <Up p={p}>
          <div style={{ fontFamily: SERIF, fontSize: 70, lineHeight: 1.28, color: INK, fontStyle: "italic" }}>
            “They gave us a building that the city now treats as a landmark.”
          </div>
          <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: CLAY, marginTop: 40 }}>
            — Hélène Dubois, Client · Casa Lumen
          </div>
        </Up>
      </div>
    </section>
  );
};

const CtaFooter: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const t = TOPS.cta;
  const p = reveal(t + 140, scrollY, 0.95, 0.5);
  return (
    <section style={{ position: "absolute", top: t, left: 0, width: VW, height: 1030, background: INK, color: PAPER }}>
      <div style={{ padding: "130px 96px 0", textAlign: "center" }}>
        <Up p={p}>
          <div style={{ fontFamily: SERIF, fontSize: 120, letterSpacing: -3, lineHeight: 1.02 }}>
            Let’s build something
            <br />
            that <span style={{ color: CLAY, fontStyle: "italic" }}>lasts.</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 56 }}>
            <Pill label="Start a project" filled big />
          </div>
        </Up>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: VW, padding: "40px 96px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid rgba(255,255,255,0.12)` }}>
        <span style={{ fontFamily: SERIF, fontSize: 40 }}>Meridian</span>
        <span style={{ fontFamily: MONO, fontSize: 18, color: "rgba(236,231,223,0.6)" }}>© 2026 Meridian Studio — Lisbon · Paris · Oslo</span>
      </div>
    </section>
  );
};

const Pill: React.FC<{ label: string; filled?: boolean; big?: boolean }> = ({ label, filled, big }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: big ? 30 : 24,
      padding: big ? "20px 40px" : "15px 30px",
      borderRadius: 999,
      color: filled ? PAPER : INK,
      background: filled ? CLAY : "transparent",
      border: filled ? "none" : `1.5px solid ${INK}`,
    }}
  >
    {label} →
  </span>
);

/* -------------------------------------------------------------------------- */
/*  Fixed nav (rides above the scrolling page)                                */
/* -------------------------------------------------------------------------- */

const Nav: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const solid = interpolate(scrollY, [120, 320], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: VW, zIndex: 50 }}>
      {/* progress line */}
      <div style={{ height: 4, width: `${(scrollY / (SITE_H - VH)) * 100}%`, background: CLAY }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 64px",
          background: `rgba(236,231,223,${0.0 + solid * 0.92})`,
          backdropFilter: solid > 0.1 ? "blur(8px)" : "none",
          borderBottom: solid > 0.5 ? `1px solid ${HAIR}` : "1px solid transparent",
        }}
      >
        <span style={{ fontFamily: SERIF, fontSize: 34, color: INK, letterSpacing: -1 }}>Meridian</span>
        <div style={{ display: "flex", gap: 44, fontFamily: SANS, fontSize: 22, color: INK }}>
          {["Work", "Studio", "Process", "Journal"].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: PAPER, background: CLAY, borderRadius: 999, padding: "12px 24px" }}>Book a call</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  The site scene (camera scroll)                                            */
/* -------------------------------------------------------------------------- */

const SITE_FROM = 34;
const SITE_DUR = 540;

const SiteWalkthrough: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame; // local to this sequence
  const scrollY = interpolate(
    f,
    [0, 44, 64, 150, 175, 250, 290, 360, 388, 440, 478, 520, SITE_DUR],
    [0, 0, 120, 1180, 1180, 1820, 2900, 3300, 3300, 3800, 4640, 5280, 5280],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );
  const introWipe = interpolate(f, [0, 18], [100, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: VW, height: SITE_H, transform: `translateY(${-scrollY}px)` }}>
        <Hero scrollY={scrollY} />
        <Marquee scrollY={scrollY} />
        <Manifesto scrollY={scrollY} />
        <Projects scrollY={scrollY} />
        <Stats scrollY={scrollY} />
        <Services scrollY={scrollY} />
        <Testimonial scrollY={scrollY} />
        <CtaFooter scrollY={scrollY} />
      </div>
      <Nav scrollY={scrollY} />

      {/* watermark */}
      <div style={{ position: "absolute", right: 40, bottom: 34, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: INK_SOFT, opacity: 0.6, zIndex: 60 }}>
        ✦ Generated by ReFrame
      </div>

      {/* intro wipe panel */}
      <div style={{ position: "absolute", inset: 0, background: BG, transform: `translateY(${-introWipe}%)`, zIndex: 80 }} />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  ReFrame brand bookends                                                    */
/* -------------------------------------------------------------------------- */

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  const out = interpolate(frame, [26, 40], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center", opacity: out }}>
      <div style={{ fontFamily: SANS, fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: ACCENT, transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})` }}>
        ✦ Reframed by AI
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 92, color: WHITE, marginTop: 18, opacity: s }}>
        Your URL, reborn.
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 2, fps, config: { damping: 200 } });
  const inFade = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center", opacity: inFade }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, transform: `scale(${interpolate(s, [0, 1], [0.86, 1])})` }}>
        <div style={{ width: 84, height: 84, borderRadius: 20, background: ACCENT, color: ACCENT_INK, fontFamily: SANS, fontWeight: 700, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 70px ${ACCENT}55` }}>R</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 84, letterSpacing: -2, color: WHITE }}>ReFrame</div>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 38, color: "#9aa0a6", marginTop: 38, opacity: interpolate(frame, [16, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Generated, not templated. <span style={{ color: WHITE }}>From your existing site.</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 28, color: ACCENT, marginTop: 44, opacity: interpolate(frame, [28, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>reframe.design</div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Timeline                                                                  */
/* -------------------------------------------------------------------------- */

export const ReframeShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence from={0} durationInFrames={SITE_FROM + 8}>
        <Intro />
      </Sequence>
      <Sequence from={SITE_FROM} durationInFrames={SITE_DUR}>
        <SiteWalkthrough />
      </Sequence>
      <Sequence from={SITE_FROM + SITE_DUR - 8} durationInFrames={70}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
