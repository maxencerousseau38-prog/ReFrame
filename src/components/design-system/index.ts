/**
 * ReFrame Design System — the official component library (source of truth).
 *
 * ONE import surface for composed, universal ReFrame building blocks. The
 * foundation primitives live in `@/components/ui` (shadcn/Radix on the frozen
 * D11 tokens); this layer re-exports them plus higher-order SECTIONS/TEMPLATES
 * so consumers never reach for ad-hoc markup.
 *
 * Governance + per-component analysis/scores: see ./README.md.
 * Rule: every component received from an external source is analysed,
 * decomposed, generalised and re-skinned to ReFrame's monochrome language
 * BEFORE it enters this library. Never copied verbatim. Never a duplicate.
 */

// Foundation primitives (re-exported for a single import surface)
export {
  Button,
  Badge,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  PasswordInput,
  Checkbox,
  LabeledDivider,
  Label,
  GlassPillNav,
  StatGroup,
  ScrollScaleReveal,
  BrowserFrame,
  Reveal,
  BlurReveal,
} from "@/components/ui";

// Sections / templates (composed on the primitives, monochrome)
export { HeroReframed, type HeroReframedProps } from "./sections/hero-reframed";
