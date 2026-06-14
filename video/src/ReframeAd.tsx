import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

/*
 * ReframeAd — the flagship "ultra premium" spot. Centerpiece: the site GENERATES
 * itself inside a browser (blueprint -> wireframe -> an AI scan beam sweeps down
 * and develops the real site: colors wash in, copy de-scrambles, images reveal),
 * then a fast premium gallery of all the user's templates. French + subtitles.
 * Responsive (vmin units) so one component renders 16:9 and 9:16.
 *
 * Music: drop video/public/music.mp3 and set HAS_MUSIC = true.
 */

const HAS_MUSIC = false;

const BG = "#070708";
const ACCENT = "#9FDE3F";
const ACCENT_INK = "#10180a";
const WHITE = "#fafafa";
const MUTED = "#9aa0a6";

const PAPER = "#f4f3ef";
const INK = "#121211";
const INK_SOFT = "#6a6962";
const CLAY = "#b5532e";
const SANS =
  "Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const T = {
  agenzo: "templates/agenzo.jpeg",
  built: "templates/built.jpeg",
  bellevoire: "templates/bellevoire.jpeg",
  archform: "templates/archform.jpeg",
  archinest: "templates/archinest.jpeg",
};

const useStage = () => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  return { width, height, u, portrait: height > width };
};

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@/\\0123456789";
const scramble = (target: string, p: number, frame: number) => {
  const resolved = Math.floor(target.length * p);
  return target
    .split("")
    .map((ch, i) => {
      if (i < resolved || ch === " ") return ch;
      return GLYPHS[(i * 7 + frame * 3) % GLYPHS.length];
    })
    .join("");
};

/* -------------------------------------------------------------------------- */
/*  Ambience                                                                  */
/* -------------------------------------------------------------------------- */

const Ambient: React.FC<{ on?: number }> = ({ on = 1 }) => (
  <AbsoluteFill style={{ opacity: on }}>
    <AbsoluteFill style={{ background: "radial-gradient(46% 50% at 22% 14%, rgba(159,222,63,0.16), transparent 70%), radial-gradient(40% 44% at 82% 26%, rgba(255,255,255,0.05), transparent 70%)" }} />
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1.3px, transparent 1.3px)", backgroundSize: "42px 42px", maskImage: "linear-gradient(to bottom,#000,transparent 92%)", WebkitMaskImage: "linear-gradient(to bottom,#000,transparent 92%)", opacity: 0.5 }} />
  </AbsoluteFill>
);

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(120% 120% at 50% 50%, transparent 58%, rgba(0,0,0,0.55) 100%)" }} />
);

const Caption: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { u } = useStage();
  const frame = useCurrentFrame();
  const o = interpolate(frame, [3, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: u * 6, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o, zIndex: 90 }}>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: u * 2.9, color: WHITE, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.12)", padding: `${u}px ${u * 2.4}px`, borderRadius: 999, maxWidth: "84%", textAlign: "center" }}>
        {children}
      </div>
    </div>
  );
};

const Flash: React.FC<{ color?: string; peak?: number }> = ({ color = "#fff", peak = 0.7 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 6], [peak, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none", zIndex: 80 }} />;
};

/* -------------------------------------------------------------------------- */
/*  Browser frame + the generated site content (shared wire/real renderer)    */
/* -------------------------------------------------------------------------- */

const BrowserFrame: React.FC<{ children: React.ReactNode; tilt?: number; ring?: number }> = ({ children, tilt = 0, ring = 0 }) => {
  const { u } = useStage();
  return (
    <div style={{ perspective: 2200 }}>
      <div
        style={{
          width: u * 150,
          maxWidth: "92vw",
          borderRadius: u * 1.8,
          overflow: "hidden",
          background: PAPER,
          transform: `rotateX(${tilt}deg)`,
          boxShadow: `0 ${u * 6}px ${u * 14}px -${u * 4}px rgba(0,0,0,0.85), 0 0 ${ring * u * 10}px ${ACCENT}55`,
          border: `1px solid rgba(255,255,255,0.1)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: u * 0.9, padding: `${u * 1.2}px ${u * 1.8}px`, background: "#e7e6e1", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: u * 1.1, height: u * 1.1, borderRadius: 999, background: "#c7c5bd" }} />)}
          <div style={{ marginLeft: u * 1.5, fontFamily: MONO, fontSize: u * 1.4, color: "#8a897f", background: "#f1f0ec", borderRadius: 999, padding: `${u * 0.4}px ${u * 1.4}px` }}>archform.reframe.site</div>
        </div>
        <div style={{ position: "relative", height: u * 78, overflow: "hidden", background: PAPER }}>{children}</div>
      </div>
    </div>
  );
};

/** Site layout rendered either as gray wireframe or the real designed site. */
const SiteContent: React.FC<{ mode: "wire" | "real"; frame: number; gen: number }> = ({ mode, frame, gen }) => {
  const { u } = useStage();
  const wire = mode === "wire";
  const box = (style: React.CSSProperties) => (
    <div style={{ background: wire ? "rgba(17,17,16,0.10)" : "transparent", borderRadius: u * 0.6, ...style }} />
  );
  const shimmer = wire
    ? { backgroundImage: "linear-gradient(100deg, rgba(17,17,16,0.06) 30%, rgba(17,17,16,0.14) 50%, rgba(17,17,16,0.06) 70%)", backgroundSize: "200% 100%", backgroundPosition: `${-frame * 4}% 0` }
    : {};

  return (
    <div style={{ position: "absolute", inset: 0, padding: u * 3 }}>
      {/* nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {wire ? box({ width: u * 18, height: u * 3, ...shimmer }) : <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: u * 3, color: INK, letterSpacing: -1 }}>ARCHFORM®</span>}
        <div style={{ display: "flex", gap: u * 2 }}>
          {[0, 1, 2, 3].map((i) => (wire ? <div key={i} style={{ width: u * 5, height: u * 1.6, borderRadius: 999, background: "rgba(17,17,16,0.12)", ...shimmer }} /> : <span key={i} style={{ fontFamily: SANS, fontSize: u * 1.7, color: INK }}>{["Work", "Studio", "Services", "Contact"][i]}</span>))}
        </div>
      </div>
      {/* hero */}
      <div style={{ display: "flex", gap: u * 3, marginTop: u * 4 }}>
        <div style={{ flex: 1 }}>
          {wire ? (
            <>
              {box({ width: "90%", height: u * 7, marginBottom: u * 1.4, ...shimmer })}
              {box({ width: "70%", height: u * 7, marginBottom: u * 1.4, ...shimmer })}
              {box({ width: "80%", height: u * 7, ...shimmer })}
              {box({ width: "60%", height: u * 2.4, marginTop: u * 2.4, ...shimmer })}
            </>
          ) : (
            <>
              <div style={{ fontFamily: MONO, fontSize: u * 1.5, letterSpacing: 3, color: CLAY }}>ARCHITECTURE STUDIO</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: u * 7.4, lineHeight: 0.94, letterSpacing: -2, color: INK, marginTop: u }}>
                {scramble("BUILT TO", Math.min(1, gen * 1.4), frame)}<br />
                <span style={{ color: CLAY }}>{scramble("LAST.", Math.min(1, gen * 1.2), frame)}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: u * 1.9, color: INK_SOFT, marginTop: u * 2, maxWidth: u * 44 }}>
                We craft refined living spaces that age gracefully.
              </div>
            </>
          )}
        </div>
        <div style={{ flex: 1, height: u * 30, borderRadius: u, overflow: "hidden", position: "relative", background: wire ? "rgba(17,17,16,0.12)" : "transparent", ...(wire ? shimmer : {}) }}>
          {!wire && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(155deg,#3c413b,#6d7268 55%,#9ba194)" }} />}
          {!wire && <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 90px rgba(0,0,0,0.3)" }} />}
        </div>
      </div>
      {/* cards */}
      <div style={{ display: "flex", gap: u * 2, marginTop: u * 3 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, height: u * 18, borderRadius: u * 0.8, overflow: "hidden", position: "relative", background: wire ? "rgba(17,17,16,0.12)" : "transparent", ...(wire ? shimmer : {}) }}>
            {!wire && <div style={{ position: "absolute", inset: 0, background: ["linear-gradient(155deg,#243a52,#5c7f9d)", "linear-gradient(155deg,#574330,#9b7a51)", "linear-gradient(155deg,#2a2c30,#54555c)"][i] }} />}
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scenes                                                                    */
/* -------------------------------------------------------------------------- */

/** A) Cold open — paste + ignite. */
const ColdOpen: React.FC = () => {
  const { u } = useStage();
  const frame = useCurrentFrame();
  const full = "le-marais-bistro.fr";
  const typed = full.slice(0, Math.floor(interpolate(frame, [8, 40], [0, full.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const press = spring({ frame: frame - 44, fps: 30, config: { damping: 12, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center" }}>
      <Ambient />
      <div style={{ fontFamily: SANS, fontSize: u * 2.6, letterSpacing: 5, textTransform: "uppercase", color: ACCENT, marginBottom: u * 3 }}>✦ Reframed by AI</div>
      <div style={{ display: "flex", alignItems: "center", gap: u, width: u * 92, maxWidth: "88vw", padding: u, borderRadius: 999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ flex: 1, fontFamily: MONO, fontSize: u * 3, color: WHITE, paddingLeft: u * 2 }}>
          {typed || <span style={{ color: "#5a5a5e" }}>yourwebsite.com</span>}
          {frame < 44 && Math.floor(frame / 8) % 2 === 0 ? <span style={{ color: ACCENT }}>|</span> : null}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: u * 2.4, color: ACCENT_INK, background: ACCENT, borderRadius: 999, padding: `${u * 1.4}px ${u * 3}px`, transform: `scale(${1 - 0.06 * interpolate(press, [0, 0.5, 1], [0, 1, 0], { extrapolateRight: "clamp" })})`, boxShadow: press > 0.02 ? `0 0 ${u * 5}px ${ACCENT}88` : "none" }}>
          Transformer →
        </div>
      </div>
      <Caption>Tu colles ton lien. ReFrame s’occupe du reste.</Caption>
    </AbsoluteFill>
  );
};

/** B) Generation centerpiece. */
const Generate: React.FC = () => {
  const { u } = useStage();
  const frame = useCurrentFrame();
  const beam = interpolate(frame, [30, 132], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const gen = beam / 100;
  const boxesIn = interpolate(frame, [4, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tilt = interpolate(frame, [0, 40], [9, 0], { extrapolateRight: "clamp" });
  const done = interpolate(frame, [128, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badge = spring({ frame: frame - 140, fps: 30, config: { damping: 12, stiffness: 160 } });

  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center" }}>
      <Ambient />
      <div style={{ position: "absolute", top: u * 7, fontFamily: MONO, fontSize: u * 2, letterSpacing: 3, color: ACCENT, opacity: 1 - done }}>
        ⟶ Génération du site…
      </div>
      <div style={{ opacity: boxesIn }}>
        <BrowserFrame tilt={tilt} ring={Math.max(done, interpolate(frame, [30, 60], [0, 0.4], { extrapolateRight: "clamp" }) * (1 - done) + 0.4)}>
          {/* wireframe layer (revealed BELOW the beam) */}
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(${beam}% 0px 0px 0px)` }}>
            <SiteContent mode="wire" frame={frame} gen={gen} />
          </div>
          {/* real layer (revealed ABOVE the beam) */}
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px 0px ${100 - beam}% 0px)` }}>
            <SiteContent mode="real" frame={frame} gen={gen} />
          </div>
          {/* blueprint grid that fades as the site develops */}
          <AbsoluteFill style={{ backgroundImage: `linear-gradient(${CLAY}22 1px, transparent 1px), linear-gradient(90deg, ${CLAY}22 1px, transparent 1px)`, backgroundSize: `${u * 4}px ${u * 4}px`, opacity: (1 - gen) * 0.6, pointerEvents: "none" }} />
          {/* the scan beam */}
          {beam > 0.5 && beam < 99.5 && (
            <div style={{ position: "absolute", top: `${beam}%`, left: 0, right: 0, height: u * 0.5, background: ACCENT, boxShadow: `0 0 ${u * 4}px ${u}px ${ACCENT}, 0 ${u * 3}px ${u * 5}px ${ACCENT}66`, zIndex: 5 }} />
          )}
        </BrowserFrame>
      </div>

      {/* generated badge */}
      <div style={{ position: "absolute", bottom: u * 16, display: "flex", alignItems: "center", gap: u, fontFamily: SANS, fontWeight: 700, fontSize: u * 2.6, color: ACCENT_INK, background: ACCENT, borderRadius: 999, padding: `${u}px ${u * 2.6}px`, opacity: badge, transform: `scale(${interpolate(badge, [0, 1], [0.6, 1])})` }}>
        ✦ Site généré en quelques secondes
      </div>
      <Caption>Regarde-le se construire, bloc par bloc.</Caption>
    </AbsoluteFill>
  );
};

/** C) Gallery of all templates. */
const Gallery: React.FC = () => {
  const { u } = useStage();
  const frame = useCurrentFrame();
  const items = [
    { img: T.archform, word: "Architecture", tint: CLAY },
    { img: T.bellevoire, word: "Hôtellerie", tint: "#3b6ea5" },
    { img: T.agenzo, word: "Agence", tint: "#7c5cff" },
    { img: T.archinest, word: "Studio créatif", tint: "#1f9d76" },
    { img: T.built, word: "Immobilier", tint: "#c2683a" },
  ];
  const per = 26;
  const idx = Math.min(items.length - 1, Math.floor(frame / per));
  const local = frame % per;
  const it = items[idx];
  const inP = interpolate(local, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const drift = interpolate(local, [0, per], [0, -u * 3]);
  const zoom = interpolate(local, [0, per], [1.06, 1.12]);
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center" }}>
      <Ambient on={0.5} />
      <div style={{ perspective: 2000 }}>
        <div style={{ width: u * 138, maxWidth: "90vw", borderRadius: u * 1.6, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", boxShadow: `0 ${u * 5}px ${u * 12}px -${u * 3}px #000, 0 0 ${u * 6}px ${it.tint}55`, transform: `translateY(${drift}px) rotateX(${interpolate(inP, [0, 1], [8, 0])}deg)`, opacity: inP }}>
          <div style={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden" }}>
            <Img src={staticFile(it.img)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: "saturate(0.92) contrast(1.04)" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${BG}cc, transparent 55%)` }} />
            <div style={{ position: "absolute", left: u * 3, bottom: u * 2.4, fontFamily: SANS, fontWeight: 800, fontSize: u * 5, letterSpacing: -1.5, color: WHITE }}>{it.word}</div>
            <div style={{ position: "absolute", right: u * 3, top: u * 2.4, fontFamily: MONO, fontSize: u * 1.5, color: WHITE, background: it.tint, borderRadius: 999, padding: `${u * 0.5}px ${u * 1.4}px` }}>✦ ReFrame</div>
          </div>
        </div>
      </div>
      <Caption>Un template, n’importe quel métier — adapté à ta marque.</Caption>
    </AbsoluteFill>
  );
};

/** D) Value chips. */
const Value: React.FC = () => {
  const { u } = useStage();
  const frame = useCurrentFrame();
  const chips = ["Multi-pages", "SEO intégré", "Formulaire qui marche", "Hébergé & en ligne"];
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center" }}>
      <Ambient on={0.6} />
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: u * 1.6, maxWidth: "80%" }}>
        {chips.map((c, i) => {
          const a = spring({ frame: frame - 4 - i * 7, fps: 30, config: { damping: 200 } });
          return (
            <div key={c} style={{ fontFamily: SANS, fontWeight: 600, fontSize: u * 3, color: WHITE, background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 999, padding: `${u * 1.4}px ${u * 3}px`, opacity: a, transform: `translateY(${interpolate(a, [0, 1], [30, 0])}px)`, display: "flex", alignItems: "center", gap: u }}>
              <span style={{ color: ACCENT }}>✓</span> {c}
            </div>
          );
        })}
      </div>
      <Caption>Tout ce qu’un vrai site doit avoir — inclus.</Caption>
    </AbsoluteFill>
  );
};

/** E) Outro. */
const Outro: React.FC = () => {
  const { u } = useStage();
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - 2, fps: 30, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center" }}>
      <Ambient />
      <div style={{ display: "flex", alignItems: "center", gap: u * 1.8, transform: `scale(${interpolate(s, [0, 1], [0.86, 1])})` }}>
        <div style={{ width: u * 8, height: u * 8, borderRadius: u * 1.8, background: ACCENT, color: ACCENT_INK, fontFamily: SANS, fontWeight: 700, fontSize: u * 5.4, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${u * 7}px ${ACCENT}66` }}>R</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: u * 8, letterSpacing: -2, color: WHITE }}>ReFrame</div>
      </div>
      <div style={{ fontFamily: SANS, fontSize: u * 3.4, color: MUTED, marginTop: u * 4, textAlign: "center", opacity: interpolate(frame, [16, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Garde ta structure. <span style={{ color: WHITE }}>Sublime ton design.</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: u * 2.6, color: ACCENT, marginTop: u * 4, opacity: interpolate(frame, [28, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>reframe.design</div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Timeline                                                                  */
/* -------------------------------------------------------------------------- */

type Cut = { c: React.FC; dur: number; flash?: string };
const SHOTS: Cut[] = [
  { c: ColdOpen, dur: 60 },
  { c: Generate, dur: 168, flash: "#fff" },
  { c: Gallery, dur: 132, flash: ACCENT },
  { c: Value, dur: 52 },
  { c: Outro, dur: 76 },
];

export const AD_TOTAL = SHOTS.reduce((n, s) => n + s.dur, 0);

export const ReframeAd: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {SHOTS.map((shot, i) => {
        const from = at;
        at += shot.dur;
        const Comp = shot.c;
        return (
          <Sequence key={i} from={from} durationInFrames={shot.dur + 2}>
            <Comp />
            {shot.flash ? <Flash color={shot.flash} /> : null}
          </Sequence>
        );
      })}
      <Vignette />
      {HAS_MUSIC ? <Audio src={staticFile("music.mp3")} volume={0.7} /> : null}
    </AbsoluteFill>
  );
};
