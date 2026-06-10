import React from "react";
import { Composition } from "remotion";
import { CarListing } from "./CarListing";
import { carListingSchema, defaultCarListing } from "./schema";

const FPS = 30;
const DURATION_SECONDS = 12;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Landscape 1080p — website / YouTube */}
      <Composition
        id="CarListing"
        component={CarListing}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={1920}
        height={1080}
        schema={carListingSchema}
        defaultProps={defaultCarListing}
      />

      {/* Vertical 9:16 — Reels / Stories / TikTok */}
      <Composition
        id="CarListingVertical"
        component={CarListing}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={1080}
        height={1920}
        schema={carListingSchema}
        defaultProps={defaultCarListing}
      />
    </>
  );
};
