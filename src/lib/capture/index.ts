/**
 * V2 CAPTURE — public API.
 *
 *   import { captureSite } from "@/lib/capture";
 *
 * The caller must run assertSafeTarget(url) first (V5 convention).
 * Spec: docs/V2_CHANTIER1_CAPTURE_SPEC.md
 */

export { captureSite } from "./capture";
export { collectStylesheets } from "./fetch-css";
export { renderCapture } from "./render";
export { CAPTURE_VIEWPORTS } from "./types";
export type {
  CaptureOptions,
  CaptureQuality,
  CaptureTier,
  CaptureViewport,
  CapturedStylesheet,
  ComputedNodeStyle,
  CssAnimationRecord,
  DOMRectLike,
  FontFaceRecord,
  RawBlockGeometry,
  RenderedSite,
  ViewportCapture,
} from "./types";
