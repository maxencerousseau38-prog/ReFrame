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

/* -------------------------------------------------------------------------- */
/*  Brand tokens (mirror src/app/globals.css)                                 */
/* -------------------------------------------------------------------------- */

const BG = "#08080a"; // near-black OLED canvas
const PANEL = "#0f0f12";
const PANEL2 = "#161619";
const ACCENT = "#9FDE3F"; // electric lime
const ACCENT_INK = "#10180a";
const WHITE = "#fafafa";
const MUTED = "#9aa0a6";
const BORDER = "rgba(255,255,255,0.09)";
const FONT =
  "Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/* -------------------------------------------------------------------------- */
/*  Shared atmosphere                                                         */
/* -------------------------------------------------------------------------- */

const GridGlow: React.FC<{ drift?: boolean }> = ({ drift = true }) => {
  const frame = useCurrentFrame();
  const x = drift ? interpolate(frame, [0, 720], [0, -60]) : 0;
  return (
    <AbsoluteFill>
      {/* dotted grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.05) 1.4px, transparent 1.4px)",
          backgroundSize: "44px 44px",
          backgroundPosition: `${x}px 0px`,
          maskImage: "linear-gradient(to bottom, #000 0%, transparent 92%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 92%)",
          opacity: 0.5,
        }}
      />
      {/* lime aura */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(46% 50% at 20% 12%, rgba(159,222,63,0.16) 0%, transparent 70%), radial-gradient(40% 44% at 84% 26%, rgba(255,255,255,0.05) 0%, transparent 70%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Browser chrome: three dots + optional address pill. */
const Chrome: React.FC<{ dark?: boolean; url?: string; badge?: React.ReactNode }> = ({
  dark = true,
  url,
  badge,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 16px",
      borderBottom: `1px solid ${dark ? BORDER : "rgba(0,0,0,0.06)"}`,
    }}
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: dark ? "#3a3a3f" : "#cfcdc7",
        }}
      />
    ))}
    {url ? (
      <div
        style={{
          marginLeft: 14,
          flex: 1,
          maxWidth: 360,
          fontFamily: MONO,
          fontSize: 15,
          color: dark ? MUTED : "#8a8a8a",
          background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
          borderRadius: 999,
          padding: "5px 14px",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {url}
      </div>
    ) : null}
    {badge ? <div style={{ marginLeft: "auto" }}>{badge}</div> : null}
  </div>
);

/** Fade a scene in at the start and out at the end. */
const useSceneFade = (duration: number, inFrames = 14, outFrames = 14) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, inFrames, duration - outFrames, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 1 — Hook                                                            */
/* -------------------------------------------------------------------------- */

const DUR1 = 110;
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useSceneFade(DUR1);

  const lines = ["Your website,", "rebuilt by", "intelligence."];
  return (
    <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160, opacity }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 22,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: MUTED,
          opacity: interpolate(frame, [6, 24], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Website transformation engine
      </div>
      <div style={{ marginTop: 26 }}>
        {lines.map((line, i) => {
          const s = spring({ frame: frame - 10 - i * 9, fps, config: { damping: 200 } });
          return (
            <div
              key={line}
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 132,
                lineHeight: 0.96,
                letterSpacing: -4,
                color: i === 2 ? ACCENT : WHITE,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
                filter: `blur(${interpolate(s, [0, 1], [12, 0])}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 2 — Paste a link                                                    */
/* -------------------------------------------------------------------------- */

const DUR2 = 150;
const PasteLink: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useSceneFade(DUR2);

  const full = "le-marais-bistro.fr";
  const typed = full.slice(0, Math.max(0, Math.floor(interpolate(frame, [18, 70], [0, full.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))));
  const caret = Math.floor(frame / 8) % 2 === 0 && frame < 74;

  const press = spring({ frame: frame - 96, fps, config: { damping: 12, stiffness: 180 } });
  const pressScale = 1 - interpolate(press, [0, 0.4, 1], [0, 0.06, 0], { extrapolateRight: "clamp" });
  const enter = spring({ frame: frame - 4, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 30,
          color: MUTED,
          marginBottom: 34,
          opacity: interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Paste your link.
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          width: 980,
          padding: 14,
          borderRadius: 999,
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${BORDER}`,
          boxShadow: "0 30px 80px -40px rgba(0,0,0,0.9)",
          transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
        }}
      >
        {/* globe glyph */}
        <div
          style={{
            width: 26,
            height: 26,
            marginLeft: 16,
            borderRadius: 999,
            border: `2.5px solid ${MUTED}`,
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", inset: "0 8px", borderLeft: `2.5px solid ${MUTED}`, borderRight: `2.5px solid ${MUTED}`, borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: 10, left: 0, right: 0, height: 0, borderTop: `2.5px solid ${MUTED}` }} />
        </div>

        <div style={{ flex: 1, fontFamily: MONO, fontSize: 34, color: WHITE }}>
          {typed || <span style={{ color: "#5a5a5e" }}>yourwebsite.com</span>}
          {caret ? <span style={{ color: ACCENT }}>|</span> : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: ACCENT,
            color: ACCENT_INK,
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 28,
            padding: "18px 34px",
            borderRadius: 999,
            transform: `scale(${pressScale})`,
            boxShadow: press > 0 ? `0 0 60px ${ACCENT}66` : "none",
          }}
        >
          Transform my website <Arrow color={ACCENT_INK} />
        </div>
      </div>

      <div style={{ fontFamily: FONT, fontSize: 22, color: "#6b6b70", marginTop: 28 }}>
        No builder. No blank page.
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 3 — Analyzing                                                       */
/* -------------------------------------------------------------------------- */

const DUR3 = 120;
const Analyzing: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useSceneFade(DUR3);
  const rot = (frame * 7) % 360;

  const checks = ["Structure mapped", "Content extracted", "Brand & colors detected", "Images optimized"];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      {/* spinner ring */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 999,
          border: `5px solid rgba(255,255,255,0.08)`,
          borderTopColor: ACCENT,
          transform: `rotate(${rot}deg)`,
          marginBottom: 40,
        }}
      />
      <div style={{ fontFamily: FONT, fontSize: 46, fontWeight: 600, color: WHITE, marginBottom: 36 }}>
        Analyzing your site…
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {checks.map((c, i) => {
          const appear = interpolate(frame, [16 + i * 16, 30 + i * 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={c}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: appear,
                transform: `translateX(${interpolate(appear, [0, 1], [-20, 0])}px)`,
                fontFamily: FONT,
                fontSize: 30,
                color: MUTED,
              }}
            >
              <CheckDot fill={appear > 0.9} />
              {c}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 4 — The before/after reveal                                         */
/* -------------------------------------------------------------------------- */

const DUR4 = 190;
const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useSceneFade(DUR4);

  const after = spring({ frame: frame - 24, fps, config: { damping: 200 } });
  const badge = spring({ frame: frame - 64, fps, config: { damping: 11, stiffness: 160 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      <div style={{ position: "relative", width: 1180, height: 720 }}>
        {/* BEFORE — light, dated, set back */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 40,
            width: 560,
            transform: "rotate(2.5deg)",
            borderRadius: 16,
            overflow: "hidden",
            background: "#f3f1ec",
            boxShadow: "0 30px 70px -30px rgba(0,0,0,0.8)",
            opacity: interpolate(frame, [4, 24], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          <Chrome dark={false} />
          <div style={{ padding: 26, color: "#2b2a27", fontFamily: "Georgia, 'Times New Roman', serif" }}>
            <div style={{ fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: "#8a8a82" }}>Before</div>
            <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.05, marginTop: 8 }}>
              Traditional
              <br />
              Experience
            </div>
            <div style={{ marginTop: 18, height: 10, width: "100%", background: "#d8d6cf", borderRadius: 4 }} />
            <div style={{ marginTop: 8, height: 10, width: "64%", background: "#d8d6cf", borderRadius: 4 }} />
            <div style={{ marginTop: 20, height: 150, borderRadius: 8, background: "linear-gradient(135deg,#cbc9c1,#b6b4ac)", filter: "grayscale(1)" }} />
          </div>
          <Label text="BEFORE" color="#8a8a82" />
        </div>

        {/* AFTER — dark, lime, modern, prominent */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 150,
            width: 720,
            borderRadius: 22,
            overflow: "hidden",
            background: PANEL,
            border: `1px solid ${ACCENT}44`,
            boxShadow: "0 60px 140px -40px rgba(0,0,0,0.95)",
            transform: `translateY(${interpolate(after, [0, 1], [90, 0])}px)`,
            opacity: after,
          }}
        >
          <Chrome
            dark
            badge={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: ACCENT,
                  color: ACCENT_INK,
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: 16,
                  padding: "5px 14px",
                  borderRadius: 999,
                  transform: `scale(${interpolate(badge, [0, 1], [0.4, 1])})`,
                  opacity: badge,
                }}
              >
                ✦ Reframed by AI
              </div>
            }
          />
          <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 26, padding: 36 }}>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 16, letterSpacing: 4, textTransform: "uppercase", color: ACCENT }}>After</div>
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 56, lineHeight: 1.0, letterSpacing: -2, color: WHITE, marginTop: 12 }}>
                Elevated
                <br />
                Experience
              </div>
              <div style={{ fontFamily: FONT, fontSize: 22, lineHeight: 1.5, color: MUTED, marginTop: 18 }}>
                The same business, reframed into a site that converts.
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 26,
                  background: ACCENT,
                  color: ACCENT_INK,
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: 22,
                  padding: "12px 24px",
                  borderRadius: 999,
                }}
              >
                Explore more <Arrow color={ACCENT_INK} />
              </div>
            </div>
            <div
              style={{
                borderRadius: 14,
                minHeight: 230,
                background: "linear-gradient(160deg,#26331a,#11160c)",
                border: `1px solid ${BORDER}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 60% at 50% 30%, ${ACCENT}26, transparent 70%)` }} />
            </div>
          </div>
          <Label text="AFTER" color={ACCENT} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 5 — Publish + features                                              */
/* -------------------------------------------------------------------------- */

const DUR5 = 130;
const Publish: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useSceneFade(DUR5);

  const features = ["Multi-page", "SEO-ready", "Working contact form", "One-click publish"];
  const live = spring({ frame: frame - 60, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      {/* feature chips */}
      <div style={{ display: "flex", gap: 16, marginBottom: 56, flexWrap: "wrap", justifyContent: "center", maxWidth: 1200 }}>
        {features.map((f, i) => {
          const a = spring({ frame: frame - 6 - i * 8, fps, config: { damping: 200 } });
          return (
            <div
              key={f}
              style={{
                fontFamily: FONT,
                fontSize: 30,
                color: WHITE,
                background: PANEL2,
                border: `1px solid ${BORDER}`,
                borderRadius: 999,
                padding: "16px 30px",
                opacity: a,
                transform: `translateY(${interpolate(a, [0, 1], [26, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <CheckDot fill />
              {f}
            </div>
          );
        })}
      </div>

      {/* live URL bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "20px 30px",
          borderRadius: 18,
          background: PANEL,
          border: `1px solid ${ACCENT}44`,
          boxShadow: `0 0 ${interpolate(live, [0, 1], [0, 70])}px ${ACCENT}33`,
        }}
      >
        <div style={{ width: 14, height: 14, borderRadius: 999, background: ACCENT, opacity: 0.4 + 0.6 * live, boxShadow: `0 0 16px ${ACCENT}` }} />
        <div style={{ fontFamily: MONO, fontSize: 32, color: WHITE }}>reframe.site/le-marais-bistro</div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 24,
            color: ACCENT_INK,
            background: ACCENT,
            borderRadius: 999,
            padding: "8px 20px",
            opacity: live,
            transform: `scale(${interpolate(live, [0, 1], [0.6, 1])})`,
          }}
        >
          ● Live
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 6 — Logo + tagline                                                  */
/* -------------------------------------------------------------------------- */

const DUR6 = 90;
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useSceneFade(DUR6, 14, 10);
  const s = spring({ frame: frame - 4, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          transform: `scale(${interpolate(s, [0, 1], [0.86, 1])})`,
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 20,
            background: ACCENT,
            color: ACCENT_INK,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 70px ${ACCENT}55`,
          }}
        >
          R
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 84, letterSpacing: -2, color: WHITE }}>ReFrame</div>
      </div>

      <div
        style={{
          fontFamily: FONT,
          fontSize: 40,
          color: MUTED,
          marginTop: 40,
          opacity: interpolate(frame, [18, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Keep your structure. <span style={{ color: WHITE }}>Upgrade your design.</span>
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 28,
          color: ACCENT,
          marginTop: 48,
          opacity: interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        reframe.design
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Small primitives                                                          */
/* -------------------------------------------------------------------------- */

const Arrow: React.FC<{ color: string }> = ({ color }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckDot: React.FC<{ fill?: boolean }> = ({ fill }) => (
  <div
    style={{
      width: 30,
      height: 30,
      borderRadius: 999,
      background: fill ? ACCENT : "transparent",
      border: `2.5px solid ${fill ? ACCENT : "rgba(255,255,255,0.2)"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {fill ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M5 12.5l4.5 4.5L19 7" stroke={ACCENT_INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : null}
  </div>
);

const Label: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div
    style={{
      position: "absolute",
      bottom: 14,
      right: 16,
      fontFamily: MONO,
      fontSize: 14,
      letterSpacing: 3,
      color,
      opacity: 0.7,
    }}
  >
    {text}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Timeline                                                                  */
/* -------------------------------------------------------------------------- */

export const ReframeDemo: React.FC = () => {
  let at = 0;
  const next = (dur: number, overlap = 10) => {
    const from = at;
    at += dur - overlap;
    return { from, durationInFrames: dur };
  };

  const s1 = next(DUR1);
  const s2 = next(DUR2);
  const s3 = next(DUR3);
  const s4 = next(DUR4);
  const s5 = next(DUR5);
  const s6 = next(DUR6, 0);

  return (
    <AbsoluteFill style={{ background: BG }}>
      <GridGlow />
      <Sequence {...s1}>
        <Hook />
      </Sequence>
      <Sequence {...s2}>
        <PasteLink />
      </Sequence>
      <Sequence {...s3}>
        <Analyzing />
      </Sequence>
      <Sequence {...s4}>
        <Reveal />
      </Sequence>
      <Sequence {...s5}>
        <Publish />
      </Sequence>
      <Sequence {...s6}>
        <Outro />
      </Sequence>
      {/* vignette */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(120% 120% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
