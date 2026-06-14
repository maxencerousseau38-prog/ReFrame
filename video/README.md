# ReFrame — promo video (Remotion)

A ~24s, 1080p/30fps demo of ReFrame, built programmatically with
[Remotion](https://remotion.dev) (React → video). It mirrors the product brand
(OLED canvas, electric-lime accent, Geist) and runs the story:

**Hook → Paste a link → Analyzing → before/after reveal → Publish → Logo.**

This is a standalone project (its own `package.json`) so it never touches the
Next.js app build. It is intentionally excluded from the root `tsconfig.json`.

## Run it

```bash
cd video
npm install

# Live preview / scrub in the browser
npm run studio

# Render the MP4 (writes video/out/reframe-demo.mp4)
npm run render

# A single still (good for thumbnails)
npm run still
```

Rendering downloads a headless Chromium the first time, so the machine needs
network access and the usual Chrome system libraries.

## Edit the story

Everything lives in [`src/ReframeDemo.tsx`](src/ReframeDemo.tsx): brand tokens
at the top, one component per scene, and the timeline at the bottom (`next(dur)`
chains scenes with a small crossfade). Adjust scene durations there; keep the
`<Composition durationInFrames>` in `src/Root.tsx` ≥ the total.
