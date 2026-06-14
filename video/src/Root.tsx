import { Composition } from "remotion";
import { ReframeDemo } from "./ReframeDemo";
import { ReframeShowcase } from "./ReframeShowcase";
import { ArchShowcase, TOTAL as ARCH_TOTAL } from "./ArchShowcase";

/**
 * Remotion compositions for ReFrame.
 *
 * `ReframeShowcase` — a dynamic walkthrough of a real generated site (the
 * result after running the SaaS on a URL): a premium architecture studio,
 * scrolled like a guided camera with reveal-on-scroll + parallax.
 * `ReframeDemo` — the shorter conceptual promo (paste -> analyze -> reveal).
 * Both are 1080p, 30fps.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ArchShowcase"
        component={ArchShowcase}
        durationInFrames={ARCH_TOTAL + 2}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ArchShowcaseVertical"
        component={ArchShowcase}
        durationInFrames={ARCH_TOTAL + 2}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ReframeShowcase"
        component={ReframeShowcase}
        durationInFrames={644}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ReframeDemo"
        component={ReframeDemo}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
