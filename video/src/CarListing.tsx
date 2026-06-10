import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CarListingProps } from "./schema";

const FONT =
  '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

const formatKm = (km: number) =>
  `${new Intl.NumberFormat("fr-FR").format(km)} km`;

/** A single photo that slowly zooms in (Ken Burns effect). */
const PhotoSlide: React.FC<{ src: string; durationInFrames: number }> = ({
  src,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1.08, 1.18], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ label: string; delay: number; accent: string }> = ({
  label,
  delay,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [20, 0])}px)`,
        background: "rgba(255,255,255,0.12)",
        border: `1px solid ${accent}`,
        color: "#fff",
        padding: "10px 22px",
        borderRadius: 999,
        fontSize: 30,
        fontWeight: 600,
        backdropFilter: "blur(6px)",
      }}
    >
      {label}
    </div>
  );
};

export const CarListing: React.FC<CarListingProps> = ({
  dealershipName,
  make,
  model,
  year,
  price,
  currency,
  mileageKm,
  fuel,
  transmission,
  highlights,
  photos,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const perPhoto = Math.floor(durationInFrames / photos.length);

  const titleIn = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const priceIn = spring({ frame: frame - 24, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020", fontFamily: FONT }}>
      {/* Background photo slideshow */}
      {photos.map((src, i) => (
        <Sequence
          key={src + i}
          from={i * perPhoto}
          durationInFrames={perPhoto + 12}
        >
          <PhotoSlide src={src} durationInFrames={perPhoto + 12} />
        </Sequence>
      ))}

      {/* Bottom gradient for legibility */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(5,8,18,0.95) 0%, rgba(5,8,18,0.4) 38%, rgba(5,8,18,0) 60%)",
        }}
      />

      {/* Dealership badge (top-left) */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 64,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: titleIn,
        }}
      >
        <div
          style={{
            width: 16,
            height: 44,
            borderRadius: 4,
            background: accentColor,
          }}
        />
        <span style={{ color: "#fff", fontSize: 34, fontWeight: 700 }}>
          {dealershipName}
        </span>
      </div>

      {/* Lower-third content */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 64px 72px",
        }}
      >
        <div
          style={{
            opacity: titleIn,
            transform: `translateX(${interpolate(titleIn, [0, 1], [-40, 0])}px)`,
          }}
        >
          <div style={{ color: accentColor, fontSize: 40, fontWeight: 700 }}>
            {year}
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.02,
              marginBottom: 16,
            }}
          >
            {make} {model}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          {[formatKm(mileageKm), fuel, transmission, ...highlights].map(
            (h, i) => (
              <Pill key={h + i} label={h} delay={16 + i * 4} accent={accentColor} />
            ),
          )}
        </div>

        <div
          style={{
            opacity: priceIn,
            transform: `scale(${interpolate(priceIn, [0, 1], [0.85, 1])})`,
            transformOrigin: "left center",
            alignSelf: "flex-start",
            background: accentColor,
            color: "#fff",
            padding: "16px 40px",
            borderRadius: 18,
            fontSize: 64,
            fontWeight: 800,
          }}
        >
          {formatPrice(price, currency)}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
