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
 * ArchShowcase — fast-cut promo of a REAL generated site (ARCHFORM® identity,
 * derived from the user's Framer references). Shot-based with hard cuts, French
 * copy + burned-in subtitles, the user's template screenshots used as the
 * "references" and the sector montage. Responsive: the same component renders
 * 16:9 and 9:16 (sized in vmin units, layouts branch on portrait).
 *
 * Music: drop an mp3 at video/public/music.mp3 and flip HAS_MUSIC to true.
 */

const HAS_MUSIC = false;

/* ReFrame brand */
const BG = "#08080a";
const ACCENT = "#9FDE3F";
const ACCENT_INK = "#10180a";
const WHITE = "#fafafa";

/* generated-site (ARCHFORM) brand — clean grotesk, brand-adaptive */
const PAPER = "#f4f3ef";
const INK = "#111110";
const INK_SOFT = "#6a6962";
const CLAY = "#b5532e";
const HAIR = "rgba(17,17,16,0.12)";
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

/* concrete/glass duotone "photos" for the recreated shots */
const PHOTOS = [
  "linear-gradient(155deg,#3c413b,#6d7268 55%,#9ba194)",
  "linear-gradient(155deg,#2a2c30,#54555c 60%,#9a9aa1)",
  "linear-gradient(155deg,#574330,#9b7a51 60%,#d9c4a1)",
  "linear-gradient(155deg,#243a52,#5c7f9d 65%,#b3cad9)",
];

/* -------------------------------------------------------------------------- */
/*  Layout helpers                                                            */
/* -------------------------------------------------------------------------- */

const useStage = () => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100; // vmin unit
  return { width, height, u, portrait: height > width };
};

/** Snappy entrance for a shot: quick scale + fade over the first frames. */
const usePunch = (lead = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - lead, fps, config: { damping: 18, stiffness: 140, mass: 0.6 } });
  return s;
};

const Caption: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { u } = useStage();
  const frame = useCurrentFrame();
  const o = interpolate(frame, [2, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        bottom: u * 7,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: u * 3.1,
          color: WHITE,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: `${u * 1.3}px ${u * 2.6}px`,
          borderRadius: 999,
          maxWidth: "82%",
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** White flash that fades out — used to punctuate a hard cut. */
const Flash: React.FC<{ color?: string }> = ({ color = "#ffffff" }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 5], [0.6, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

/* -------------------------------------------------------------------------- */
/*  Shots                                                                     */
/* -------------------------------------------------------------------------- */

/** A) References — the user's templates flashing by. */
const RefMontage: React.FC = () => {
  const { u } = useStage();
  const frame = useCurrentFrame();
  const imgs = [T.archform, T.built, T.archinest, T.bellevoire, T.agenzo];
  const per = 11;
  const idx = Math.min(imgs.length - 1, Math.floor(frame / per));
  const local = frame % per;
  const scale = interpolate(local, [0, per], [1.04, 1.0]);
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: u * 8, fontFamily: SANS, fontSize: u * 2.6, letterSpacing: 5, textTransform: "uppercase", color: ACCENT }}>
        ✦ Reframed by AI
      </div>
      <div style={{ width: "78%", aspectRatio: "16 / 10", borderRadius: u * 1.6, overflow: "hidden", border: `1px solid rgba(255,255,255,0.12)`, boxShadow: "0 40px 120px -40px #000" }}>
        <Img src={staticFile(imgs[idx])} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})`, filter: "saturate(0.9)" }} />
      </div>
      <Caption>Tu choisis un template que tu adores.</Caption>
    </AbsoluteFill>
  );
};

/** B) Promise. */
const Promise2: React.FC = () => {
  const { u } = useStage();
  const s = usePunch();
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center", padding: u * 6 }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: u * 9, lineHeight: 1.02, letterSpacing: -2, color: WHITE, textAlign: "center", transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})` }}>
        ReFrame en fait <span style={{ color: ACCENT }}>ton vrai site.</span>
      </div>
      <Caption>Pas une maquette : un site en ligne, à toi.</Caption>
    </AbsoluteFill>
  );
};

/** C) ARCHFORM hero. */
const ArchHero: React.FC = () => {
  const { u, portrait } = useStage();
  const frame = useCurrentFrame();
  const s = usePunch();
  const zoom = interpolate(frame, [0, 60], [1.0, 1.08]);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <SiteNav />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", padding: portrait ? `${u * 16}px ${u * 6}px ${u * 12}px` : `${u * 8}px ${u * 7}px 0`, gap: u * 4 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: MONO, fontSize: u * 1.9, letterSpacing: 4, color: CLAY }}>ARCHFORM® · ARCHITECTURE STUDIO</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: u * 11, lineHeight: 0.92, letterSpacing: -3, color: INK, marginTop: u * 2, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`, opacity: s }}>
            BUILT<br />DIFFERENT,<br />BUILT TO<br /><span style={{ color: CLAY }}>LAST.</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: u * 2.4, lineHeight: 1.5, color: INK_SOFT, maxWidth: u * 52, marginTop: u * 3 }}>
            We craft refined living spaces, integrating architecture and interiors to reflect your lifestyle.
          </div>
        </div>
        <div style={{ flex: portrait ? "none" : 1, width: portrait ? "100%" : undefined, height: portrait ? "34%" : "70%", borderRadius: u * 1.4, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: "-6%", background: PHOTOS[0], transform: `scale(${zoom})` }} />
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 120px rgba(0,0,0,0.3)" }} />
        </div>
      </div>
      <Caption>Ton site généré — pas une coquille vide.</Caption>
    </AbsoluteFill>
  );
};

const SiteNav: React.FC = () => {
  const { u, portrait } = useStage();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${u * 2.4}px ${u * 5}px`, zIndex: 10 }}>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: u * 3, letterSpacing: -1, color: INK }}>ARCHFORM®</span>
      {!portrait && (
        <div style={{ display: "flex", gap: u * 3, fontFamily: SANS, fontSize: u * 1.9, color: INK }}>
          {["Work", "Studio", "Services", "Contact"].map((l) => <span key={l}>{l}</span>)}
        </div>
      )}
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: u * 1.8, color: PAPER, background: INK, borderRadius: 999, padding: `${u}px ${u * 2}px` }}>Get in touch →</span>
    </div>
  );
};

/** D) Stats. */
const ArchStats: React.FC = () => {
  const { u, portrait } = useStage();
  const frame = useCurrentFrame();
  const p = interpolate(frame, [4, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const items = [
    { v: 190, suf: "+", label: "Projets livrés" },
    { v: 12, suf: "+ ans", label: "De pratique" },
    { v: 25, suf: "K ft²", label: "Construits" },
  ];
  return (
    <AbsoluteFill style={{ background: INK, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", gap: u * 5, padding: u * 6 }}>
        {items.map((it) => (
          <div key={it.label} style={{ textAlign: portrait ? "center" : "left" }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: u * 12, lineHeight: 1, color: PAPER, letterSpacing: -2 }}>
              {Math.round(p * it.v)}<span style={{ color: CLAY }}>{it.suf}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: u * 2.2, color: "rgba(244,243,239,0.6)", marginTop: u }}>{it.label}</div>
          </div>
        ))}
      </div>
      <Caption>Tes vrais chiffres, mis en avant.</Caption>
    </AbsoluteFill>
  );
};

/** E) Selected works. */
const ArchWorks: React.FC = () => {
  const { u, portrait } = useStage();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const cards = [
    { name: "Alderstone House", place: "Oslo", i: 0 },
    { name: "Casa Lumen", place: "Lisbon", i: 3 },
    { name: "The Glasshouse", place: "Paris", i: 1 },
  ];
  return (
    <AbsoluteFill style={{ background: PAPER, padding: `${u * 7}px ${u * 5}px` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: u * 7, letterSpacing: -2, color: INK }}>Selected Works</div>
        <div style={{ fontFamily: MONO, fontSize: u * 1.7, color: CLAY }}>(02)</div>
      </div>
      <div style={{ display: portrait ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: "1fr 1fr 1fr", gap: u * 2.4, marginTop: u * 4, flex: 1 }}>
        {cards.map((c, idx) => {
          const a = spring({ frame: frame - 4 - idx * 7, fps, config: { damping: 200 } });
          return (
            <div key={c.name} style={{ opacity: a, transform: `translateY(${interpolate(a, [0, 1], [50, 0])}px)`, flex: portrait ? 1 : undefined }}>
              <div style={{ width: "100%", height: portrait ? "100%" : u * 34, borderRadius: u, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", inset: "-6%", background: PHOTOS[c.i] }} />
                <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 90px rgba(0,0,0,0.28)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: u * 1.2 }}>
                <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: u * 2.4, color: INK }}>{c.name}</span>
                <span style={{ fontFamily: MONO, fontSize: u * 1.6, color: INK_SOFT }}>{c.place}</span>
              </div>
            </div>
          );
        })}
      </div>
      <Caption>Tes projets, mis en valeur.</Caption>
    </AbsoluteFill>
  );
};

/** F) Services. */
const ArchServices: React.FC = () => {
  const { u } = useStage();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const rows = ["Architecture", "Interior Design", "Master Planning", "Furniture Design"];
  return (
    <AbsoluteFill style={{ background: PAPER, justifyContent: "center", padding: `0 ${u * 6}px` }}>
      <div style={{ fontFamily: MONO, fontSize: u * 1.8, letterSpacing: 4, color: CLAY, marginBottom: u * 2 }}>(03) — CAPABILITIES</div>
      {rows.map((r, i) => {
        const a = spring({ frame: frame - 4 - i * 6, fps, config: { damping: 200 } });
        return (
          <div key={r} style={{ borderTop: `1px solid ${HAIR}`, padding: `${u * 2}px 0`, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: a, transform: `translateX(${interpolate(a, [0, 1], [-40, 0])}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: u * 2.5 }}>
              <span style={{ fontFamily: MONO, fontSize: u * 2, color: CLAY }}>0{i + 1}</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: u * 5.4, letterSpacing: -1.5, color: INK }}>{r}</span>
            </div>
            <span style={{ fontFamily: SANS, fontSize: u * 3, color: CLAY }}>↗</span>
          </div>
        );
      })}
      <Caption>Tes services, structurés.</Caption>
    </AbsoluteFill>
  );
};

/** G) Contact with working actions. */
const ArchContact: React.FC = () => {
  const { u, portrait } = useStage();
  const s = usePunch();
  const actions = ["📞 Appeler", "📅 Réserver", "📍 Itinéraire"];
  return (
    <AbsoluteFill style={{ background: INK, color: PAPER, alignItems: "center", justifyContent: "center", padding: u * 6 }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: u * 8, letterSpacing: -2, textAlign: "center", transform: `scale(${interpolate(s, [0, 1], [0.92, 1])})` }}>
        Get in touch.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: u * 1.6, marginTop: u * 4 }}>
        {actions.map((a, i) => {
          const sp = useStagger(i);
          return (
            <div key={a} style={{ fontFamily: SANS, fontWeight: 600, fontSize: u * 2.4, color: i === 0 ? ACCENT_INK : PAPER, background: i === 0 ? ACCENT : "transparent", border: i === 0 ? "none" : `1.5px solid rgba(255,255,255,0.3)`, borderRadius: 999, padding: `${u * 1.4}px ${u * 3}px`, opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [24, 0])}px)` }}>
              {a}
            </div>
          );
        })}
      </div>
      <Caption>Formulaire qui marche · Appeler · Réserver.</Caption>
    </AbsoluteFill>
  );
};

const useStagger = (i: number) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  return spring({ frame: frame - 8 - i * 6, fps, config: { damping: 200 } });
};

/** H) Publish -> live. */
const ArchPublish: React.FC = () => {
  const { u } = useStage();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const live = spring({ frame: frame - 12, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: u * 1.6, padding: `${u * 2}px ${u * 3}px`, borderRadius: u * 1.4, background: "#0f0f12", border: `1px solid ${ACCENT}44`, boxShadow: `0 0 ${interpolate(live, [0, 1], [0, 70])}px ${ACCENT}33`, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ width: u * 1.4, height: u * 1.4, borderRadius: 999, background: ACCENT, opacity: 0.4 + 0.6 * live, boxShadow: `0 0 16px ${ACCENT}` }} />
        <div style={{ fontFamily: MONO, fontSize: u * 2.6, color: WHITE }}>archform.reframe.site</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: u * 2, color: ACCENT_INK, background: ACCENT, borderRadius: 999, padding: `${u * 0.7}px ${u * 1.8}px`, opacity: live, transform: `scale(${interpolate(live, [0, 1], [0.6, 1])})` }}>● En ligne</div>
      </div>
      <Caption>Publié en un clic, hébergé pour toi.</Caption>
    </AbsoluteFill>
  );
};

/** I) Sector montage — brand-adaptive. */
const SectorMontage: React.FC = () => {
  const { u } = useStage();
  const frame = useCurrentFrame();
  const sectors = [
    { word: "Hôtel", img: T.bellevoire, color: "#3b6ea5" },
    { word: "Agence", img: T.agenzo, color: "#7c5cff" },
    { word: "Architecte", img: T.archinest, color: CLAY },
  ];
  const per = 18;
  const idx = Math.min(sectors.length - 1, Math.floor(frame / per));
  const local = frame % per;
  const sec = sectors[idx];
  const kf = interpolate(local, [0, 4, per - 3, per], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Img src={staticFile(sec.img)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.28 * kf, filter: "saturate(0.7)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(60% 60% at 50% 50%, ${sec.color}33, transparent 70%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: u * 12, letterSpacing: -3, color: WHITE, transform: `translateY(${interpolate(kf, [0, 1], [30, 0])}px)`, opacity: kf }}>
          {sec.word}
        </div>
      </AbsoluteFill>
      <Caption>Resto, hôtel, agence, artisan — il s’adapte à ta marque.</Caption>
    </AbsoluteFill>
  );
};

/** J) Outro. */
const ArchOutro: React.FC = () => {
  const { u } = useStage();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - 2, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: u * 1.8, transform: `scale(${interpolate(s, [0, 1], [0.86, 1])})` }}>
        <div style={{ width: u * 8, height: u * 8, borderRadius: u * 1.8, background: ACCENT, color: ACCENT_INK, fontFamily: SANS, fontWeight: 700, fontSize: u * 5.4, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${u * 7}px ${ACCENT}55` }}>R</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: u * 8, letterSpacing: -2, color: WHITE }}>ReFrame</div>
      </div>
      <div style={{ fontFamily: SANS, fontSize: u * 3.4, color: "#9aa0a6", marginTop: u * 4, textAlign: "center", opacity: interpolate(frame, [16, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Colle ton lien. <span style={{ color: WHITE }}>Obtiens un vrai site.</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: u * 2.6, color: ACCENT, marginTop: u * 4, opacity: interpolate(frame, [28, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>reframe.design</div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Timeline                                                                  */
/* -------------------------------------------------------------------------- */

type Cut = { c: React.FC; dur: number; flash?: boolean };
const SHOTS: Cut[] = [
  { c: RefMontage, dur: 56 },
  { c: Promise2, dur: 44, flash: true },
  { c: ArchHero, dur: 62, flash: true },
  { c: ArchStats, dur: 46 },
  { c: ArchWorks, dur: 64 },
  { c: ArchServices, dur: 50 },
  { c: ArchContact, dur: 52 },
  { c: ArchPublish, dur: 44, flash: true },
  { c: SectorMontage, dur: 56, flash: true },
  { c: ArchOutro, dur: 72 },
];

export const TOTAL = SHOTS.reduce((n, s) => n + s.dur, 0);

export const ArchShowcase: React.FC = () => {
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
            {shot.flash ? <Flash color={i === 8 ? ACCENT : "#ffffff"} /> : null}
          </Sequence>
        );
      })}
      {HAS_MUSIC ? <Audio src={staticFile("music.mp3")} volume={0.7} /> : null}
    </AbsoluteFill>
  );
};
