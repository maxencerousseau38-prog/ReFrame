import { Composition } from "remotion";
import { ReframeDemo } from "./ReframeDemo";

/**
 * Remotion compositions for ReFrame.
 *
 * `ReframeDemo` — a ~24s promo: hook -> paste a link -> analyze -> the
 * before/after reveal -> publish -> logo. 1080p, 30fps.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ReframeDemo"
      component={ReframeDemo}
      durationInFrames={720}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
