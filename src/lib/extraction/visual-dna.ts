import type { HTMLElement } from "node-html-parser";
import type {
  PassContext,
  PassResult,
  VisualDNA,
  HeroDNA,
  TypographyDNA,
  LayoutDNA,
  ImageDNA,
  ComponentDNA,
  MotionDNAExtracted,
  BrandDNA,
  FramerDNA,
} from "./types";

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Pass 6 — Visual DNA Extraction
// ---------------------------------------------------------------------------

export async function runVisualDNAPass(ctx: PassContext): Promise<PassResult> {
  const { root, html, platform } = ctx;

  const allCss = root.querySelectorAll("style").map((s) => s.text).join("\n");
  const inlineStyles = root
    .querySelectorAll("[style]")
    .map((e) => e.getAttribute("style") || "");
  const allStyles = `${allCss}\n${inlineStyles.join("\n")}`;

  const hero = extractHeroDNA(root, ctx);
  const typography = extractTypographyDNA(root, allCss);
  const layout = extractLayoutDNA(root, allCss, ctx);
  const image = extractImageDNA(root, ctx);
  const component = extractComponentDNA(root, allStyles);
  const motion = extractMotionDNA(root, allCss, allStyles, ctx);
  const brand = extractBrandDNA(root, allCss, allStyles, {
    typography,
    layout,
    component,
    motion,
    image,
  });

  const visualDna: VisualDNA = {
    hero,
    typography,
    layout,
    image,
    component,
    motion,
    brand,
  };

  if (platform === "framer" && ctx.framerSections) {
    visualDna.framer = extractFramerDNA(root, ctx);
  }

  return {
    updates: {
      visualDna,
    },
  };
}

// ---------------------------------------------------------------------------
// Hero DNA
// ---------------------------------------------------------------------------

function extractHeroDNA(root: HTMLElement, ctx: PassContext): HeroDNA {
  const heroSection = findHeroSection(root, ctx);
  if (!heroSection) {
    return defaultHeroDNA();
  }

  const style = heroSection.getAttribute("style") || "";
  const viewportOccupation = parseViewportHeight(style);

  const images = heroSection.querySelectorAll("img");
  const heroImg = images.find((img) => {
    const w = parseInt(img.getAttribute("width") || "0");
    const src = img.getAttribute("src") || "";
    return w > 200 || /hero|banner|header|background/i.test(src);
  });

  const imagePosition = detectImagePosition(heroSection, heroImg);
  const imageRatio = heroImg ? detectImageRatio(heroImg) : null;

  const heading = heroSection.querySelector("h1") || heroSection.querySelector("h2");
  const headingText = heading ? clean(heading.text) : "";
  const textAlignment = detectTextAlignment(heading || heroSection);

  const hasOverlay = detectOverlay(heroSection);
  const ctaElements = heroSection.querySelectorAll(
    'a[class*="button"], a[class*="btn"], a[class*="cta"], button'
  );
  const ctaCount = Math.min(ctaElements.length, 3);

  const ctaPlacement = detectCtaPlacement(heroSection, heading, ctaElements);
  const hasLargeImage = !!heroImg || /background-image/i.test(style);
  const compositionType = inferCompositionType(
    imagePosition,
    viewportOccupation,
    hasLargeImage,
    headingText
  );

  const visualWeight = inferVisualWeight(hasLargeImage, headingText, images.length);

  return {
    viewportOccupation,
    imageRatio,
    imagePosition,
    textAlignment,
    headlineWordCount: headingText ? headingText.split(/\s+/).length : 0,
    hasOverlay,
    layering: hasOverlay || imagePosition === "behind" ? "overlapping" : "flat",
    compositionType,
    ctaCount,
    ctaPlacement,
    visualWeight,
  };
}

function defaultHeroDNA(): HeroDNA {
  return {
    viewportOccupation: 80,
    imageRatio: null,
    imagePosition: "none",
    textAlignment: "center",
    headlineWordCount: 0,
    hasOverlay: false,
    layering: "flat",
    compositionType: "minimal",
    ctaCount: 0,
    ctaPlacement: "below-headline",
    visualWeight: "text-heavy",
  };
}

function findHeroSection(root: HTMLElement, ctx: PassContext): HTMLElement | null {
  if (ctx.framerSections?.length) {
    const heroSection = ctx.framerSections.find((s) => s.type === "hero");
    if (heroSection) return heroSection.element;
  }

  const firstSection = root.querySelector("section");
  if (firstSection) return firstSection;

  const header = root.querySelector("header");
  if (header) return header;

  const main = root.querySelector("main");
  if (main) {
    const firstChild = main.childNodes.find(
      (n): n is HTMLElement => typeof (n as HTMLElement).querySelector === "function"
    );
    if (firstChild) return firstChild;
  }

  return null;
}

function parseViewportHeight(style: string): number {
  const vhMatch = style.match(/(?:min-)?height\s*:\s*([\d.]+)\s*vh/i);
  if (vhMatch) return Math.round(parseFloat(vhMatch[1]));

  const pxMatch = style.match(/(?:min-)?height\s*:\s*([\d.]+)\s*px/i);
  if (pxMatch) return Math.round((parseFloat(pxMatch[1]) / 900) * 100);

  return 80;
}

function detectImagePosition(
  section: HTMLElement,
  img: HTMLElement | undefined
): HeroDNA["imagePosition"] {
  if (!img) {
    if (/background-image/i.test(section.getAttribute("style") || "")) {
      return "behind";
    }
    return "none";
  }

  const imgStyle = img.getAttribute("style") || "";
  const parentStyle = (img.parentNode as HTMLElement)?.getAttribute?.("style") || "";

  if (
    /position\s*:\s*absolute/i.test(imgStyle) ||
    /position\s*:\s*absolute/i.test(parentStyle) ||
    /z-index\s*:\s*-/i.test(imgStyle) ||
    /object-fit\s*:\s*cover/i.test(imgStyle)
  ) {
    return "behind";
  }

  const sectionStyle = section.getAttribute("style") || "";
  if (/flex-direction\s*:\s*row-reverse/i.test(sectionStyle)) return "left";
  if (/flex-direction\s*:\s*row/i.test(sectionStyle)) return "right";
  if (/flex-direction\s*:\s*column/i.test(sectionStyle)) return "below";

  return "right";
}

function detectImageRatio(img: HTMLElement): HeroDNA["imageRatio"] {
  const w = parseInt(img.getAttribute("width") || "0");
  const h = parseInt(img.getAttribute("height") || "0");
  if (!w || !h) return null;

  const ratio = w / h;
  if (ratio < 0.8) return "portrait";
  if (ratio > 1.2) return "landscape";
  return "square";
}

function detectTextAlignment(el: HTMLElement): HeroDNA["textAlignment"] {
  const style = el.getAttribute("style") || "";
  if (/text-align\s*:\s*center/i.test(style)) return "center";
  if (/text-align\s*:\s*right/i.test(style)) return "right";
  if (/text-align\s*:\s*left/i.test(style)) return "left";

  const parentStyle = (el.parentNode as HTMLElement)?.getAttribute?.("style") || "";
  if (/text-align\s*:\s*center/i.test(parentStyle)) return "center";
  if (/justify-content\s*:\s*center/i.test(parentStyle)) return "center";

  return "left";
}

function detectOverlay(section: HTMLElement): boolean {
  const allEls = section.querySelectorAll("[style]");
  for (const el of allEls) {
    const style = el.getAttribute("style") || "";
    if (
      /linear-gradient/i.test(style) &&
      /rgba?\s*\(\s*0\s*,\s*0\s*,\s*0/i.test(style)
    ) {
      return true;
    }
    if (/rgba?\s*\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[2-9]/i.test(style)) {
      return true;
    }
  }
  return false;
}

function detectCtaPlacement(
  _section: HTMLElement,
  _heading: HTMLElement | null,
  _ctas: HTMLElement[]
): HeroDNA["ctaPlacement"] {
  return "below-headline";
}

function inferCompositionType(
  imagePosition: HeroDNA["imagePosition"],
  viewportOccupation: number,
  hasImage: boolean,
  headlineText: string
): HeroDNA["compositionType"] {
  if (imagePosition === "behind" && viewportOccupation >= 95) return "fullbleed";
  if (imagePosition === "behind" && viewportOccupation < 95) return "cinematic";
  if (imagePosition === "right" || imagePosition === "left") return "split";
  if (!hasImage && headlineText.split(/\s+/).length <= 6) return "editorial";
  return "minimal";
}

function inferVisualWeight(
  hasImage: boolean,
  headlineText: string,
  imageCount: number
): HeroDNA["visualWeight"] {
  if (!hasImage) return "text-heavy";
  if (imageCount >= 2 || headlineText.length < 30) return "image-heavy";
  return "balanced";
}

// ---------------------------------------------------------------------------
// Typography DNA
// ---------------------------------------------------------------------------

function extractTypographyDNA(root: HTMLElement, allCss: string): TypographyDNA {
  const fonts = extractAllFonts(root, allCss);
  const headingFont = fonts.heading;
  const bodyFont = fonts.body;
  const accentFont = fonts.accent;

  const editorialScale = measureEditorialScale(root, allCss);
  const headingWeight = detectHeadingWeight(allCss);
  const uppercaseUsage = detectUppercaseUsage(root, allCss);
  const trackingTight = detectTightTracking(allCss);
  const fontHierarchyDepth = countFontFamilies(allCss, root);
  const textDensity = measureTextDensity(root);

  return {
    headingFont,
    bodyFont,
    accentFont,
    editorialScale,
    headingWeight,
    uppercaseUsage,
    trackingTight,
    fontHierarchyDepth,
    textDensity,
  };
}

function extractAllFonts(
  root: HTMLElement,
  allCss: string
): { heading: string | null; body: string | null; accent: string | null } {
  const fontFaces: string[] = [];
  const re = /@font-face\s*\{[^}]*font-family\s*:\s*['"]?([^;'"}\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(allCss))) {
    const name = m[1].trim().replace(/['"]/g, "");
    if (name && !fontFaces.includes(name) && !/placeholder/i.test(name)) {
      fontFaces.push(name);
    }
  }

  // Framer-specific: parse --framer-font-family variables
  const framerFontRe = /--framer-font-family[^:]*:\s*['"]?([^;'"}\n,]+)/gi;
  while ((m = framerFontRe.exec(allCss))) {
    const name = m[1].trim().replace(/['"]/g, "");
    if (name && !fontFaces.includes(name) && !/placeholder/i.test(name)) {
      fontFaces.push(name);
    }
  }

  // Google Fonts
  for (const link of root.querySelectorAll('link[href*="fonts.googleapis.com"]')) {
    const href = link.getAttribute("href") || "";
    const familyRe = /family=([^&:;]+)/g;
    let fm: RegExpExecArray | null;
    while ((fm = familyRe.exec(href))) {
      const name = decodeURIComponent(fm[1].replace(/\+/g, " ")).trim();
      if (name && !fontFaces.includes(name)) fontFaces.push(name);
    }
  }

  // Classify: heading font has "Display" in name, or is used on h1/h2
  let heading: string | null = null;
  let body: string | null = null;
  let accent: string | null = null;

  for (const font of fontFaces) {
    if (!heading && /display|heading/i.test(font)) {
      heading = font;
    } else if (!heading) {
      heading = font;
    } else if (!body && font !== heading) {
      body = font;
    } else if (!accent && font !== heading && font !== body) {
      accent = font;
    }
  }

  // Try CSS selector-based detection if @font-face didn't help
  if (!heading) {
    const headingRe = /h[1-3][^{]*\{[^}]*font-family\s*:\s*([^;}"]+)/gi;
    const hm = headingRe.exec(allCss);
    if (hm) heading = hm[1].split(",")[0].trim().replace(/['"]/g, "");
  }
  if (!body) {
    const bodyRe = /(?:body|html|\.body)[^{]*\{[^}]*font-family\s*:\s*([^;}"]+)/gi;
    const bm = bodyRe.exec(allCss);
    if (bm) {
      const parsed = bm[1].split(",")[0].trim().replace(/['"]/g, "");
      if (parsed !== heading) body = parsed;
    }
  }

  return { heading, body, accent };
}

function measureEditorialScale(
  _root: HTMLElement,
  allCss: string
): TypographyDNA["editorialScale"] {
  const sizes: number[] = [];
  const sizeRe = /font-size\s*:\s*([\d.]+)\s*(px|rem|em)/gi;
  let m: RegExpExecArray | null;
  while ((m = sizeRe.exec(allCss))) {
    let val = parseFloat(m[1]);
    if (m[2] === "rem" || m[2] === "em") val *= 16;
    sizes.push(val);
  }

  if (sizes.length < 2) return "modern";

  const maxSize = Math.max(...sizes);
  const minSize = Math.min(...sizes.filter((s) => s >= 12));
  if (minSize === 0) return "modern";

  const ratio = maxSize / minSize;
  if (ratio > 4) return "bold";
  if (ratio > 3) return "editorial";
  if (ratio > 2.5) return "modern";
  return "compact";
}

function detectHeadingWeight(allCss: string): number | null {
  const re = /h[1-3][^{]*\{[^}]*font-weight\s*:\s*(\d+)/gi;
  const m = re.exec(allCss);
  if (m) return parseInt(m[1], 10);

  const varRe = /--heading-weight\s*:\s*(\d+)/i;
  const vm = varRe.exec(allCss);
  if (vm) return parseInt(vm[1], 10);

  return null;
}

function detectUppercaseUsage(
  root: HTMLElement,
  allCss: string
): TypographyDNA["uppercaseUsage"] {
  const uppercaseRe = /text-transform\s*:\s*uppercase/gi;
  const matches = allCss.match(uppercaseRe) || [];
  const count = matches.length;

  if (count === 0) {
    const inlineUpper = root
      .querySelectorAll("[style*='text-transform']")
      .filter((el) =>
        /text-transform\s*:\s*uppercase/i.test(el.getAttribute("style") || "")
      );
    if (inlineUpper.length === 0) return "none";
    const inNav = inlineUpper.every((el) => {
      let p = el.parentNode as HTMLElement | null;
      while (p) {
        if (p.tagName?.toLowerCase() === "nav" || p.tagName?.toLowerCase() === "header")
          return true;
        p = p.parentNode as HTMLElement | null;
      }
      return false;
    });
    return inNav ? "nav-only" : "headings";
  }

  const navUpperRe = /nav[^{]*\{[^}]*text-transform\s*:\s*uppercase/gi;
  const navCount = (allCss.match(navUpperRe) || []).length;
  if (navCount === count) return "nav-only";

  const headingUpperRe = /h[1-6][^{]*\{[^}]*text-transform\s*:\s*uppercase/gi;
  const headingCount = (allCss.match(headingUpperRe) || []).length;
  if (headingCount > 0 && count <= headingCount + 2) return "headings";

  if (count > 5) return "extensive";
  return "headings";
}

function detectTightTracking(allCss: string): boolean {
  const re = /letter-spacing\s*:\s*(-[\d.]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(allCss))) {
    if (parseFloat(m[1]) < 0) return true;
  }
  return false;
}

function countFontFamilies(allCss: string, root: HTMLElement): number {
  const families = new Set<string>();
  const re = /@font-face\s*\{[^}]*font-family\s*:\s*['"]?([^;'"}\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(allCss))) {
    const name = m[1].trim().replace(/['"]/g, "").toLowerCase();
    if (name && !/placeholder/i.test(name)) families.add(name);
  }

  for (const link of root.querySelectorAll('link[href*="fonts.googleapis.com"]')) {
    const href = link.getAttribute("href") || "";
    const familyRe = /family=([^&:;]+)/g;
    let fm: RegExpExecArray | null;
    while ((fm = familyRe.exec(href))) {
      families.add(decodeURIComponent(fm[1].replace(/\+/g, " ")).trim().toLowerCase());
    }
  }

  return Math.min(families.size, 4);
}

function measureTextDensity(root: HTMLElement): TypographyDNA["textDensity"] {
  const paragraphs = root.querySelectorAll("p");
  const totalChars = paragraphs.reduce(
    (sum, p) => sum + clean(p.text).length,
    0
  );
  const sections = root.querySelectorAll("section");
  const sectionCount = Math.max(sections.length, 1);
  const avgChars = totalChars / sectionCount;

  if (avgChars < 100) return "sparse";
  if (avgChars > 400) return "dense";
  return "moderate";
}

// ---------------------------------------------------------------------------
// Layout DNA
// ---------------------------------------------------------------------------

function extractLayoutDNA(
  root: HTMLElement,
  allCss: string,
  ctx: PassContext
): LayoutDNA {
  const containerWidth = detectContainerWidth(root, allCss);
  const sections = root.querySelectorAll("section");
  const sectionCount = ctx.framerSections?.length || sections.length;

  const columnCount = detectDominantColumnCount(root);
  const asymmetry = detectAsymmetry(root, allCss);
  const spacingScale = measureSpacingScale(root, allCss);
  const verticalSpacing = measureVerticalSpacing(root, allCss);
  const alignmentPhilosophy = detectAlignment(root, allCss);
  const overlapPatterns = detectOverlapPatterns(root, allCss);

  const sectionRhythm = ctx.framerSections
    ? ctx.framerSections.map((s) => s.type)
    : (ctx.result.sections?.order || []).map((s) => s.type);

  return {
    containerWidth,
    columnCount,
    asymmetry,
    sectionCount,
    spacingScale,
    verticalSpacing,
    alignmentPhilosophy,
    overlapPatterns,
    sectionRhythm,
  };
}

function detectContainerWidth(root: HTMLElement, allCss: string): number | null {
  // Check data-framer-name="container" elements
  const containers = root.querySelectorAll('[data-framer-name*="container" i]');
  for (const c of containers) {
    const style = c.getAttribute("style") || "";
    const mw = style.match(/max-width\s*:\s*([\d.]+)\s*px/i);
    if (mw) return Math.round(parseFloat(mw[1]));
  }

  // Check CSS for common container max-width
  const containerRe =
    /\.container[^{]*\{[^}]*max-width\s*:\s*([\d.]+)\s*px/gi;
  const m = containerRe.exec(allCss);
  if (m) return Math.round(parseFloat(m[1]));

  // Check inline styles on wrapper divs
  const wrappers = root.querySelectorAll("[style*='max-width']");
  const widths: number[] = [];
  for (const w of wrappers) {
    const style = w.getAttribute("style") || "";
    const mw = style.match(/max-width\s*:\s*([\d.]+)\s*px/i);
    if (mw) widths.push(Math.round(parseFloat(mw[1])));
  }

  if (widths.length > 0) {
    // Return the most common max-width (mode)
    const counts = new Map<number, number>();
    for (const w of widths) {
      counts.set(w, (counts.get(w) || 0) + 1);
    }
    let best = widths[0];
    let bestCount = 0;
    counts.forEach((c, w) => {
      if (c > bestCount && w >= 900 && w <= 1600) {
        best = w;
        bestCount = c;
      }
    });
    return best;
  }

  return null;
}

function detectDominantColumnCount(root: HTMLElement): number {
  const gridCounts: number[] = [];

  for (const el of root.querySelectorAll("[style*='grid-template-columns']")) {
    const style = el.getAttribute("style") || "";
    const m = style.match(/grid-template-columns\s*:\s*([^;]+)/i);
    if (m) {
      const cols = m[1]
        .trim()
        .split(/\s+/)
        .filter((t) => t !== "/" && t !== "auto" && !t.startsWith("/"));
      gridCounts.push(cols.length);
    }
  }

  if (gridCounts.length > 0) {
    // Return mode
    const counts = new Map<number, number>();
    for (const c of gridCounts) counts.set(c, (counts.get(c) || 0) + 1);
    let best = gridCounts[0];
    let bestCount = 0;
    counts.forEach((c, v) => {
      if (c > bestCount) {
        best = v;
        bestCount = c;
      }
    });
    return best;
  }

  return 1;
}

function detectAsymmetry(_root: HTMLElement, allCss: string): boolean {
  if (/grid-template-columns\s*:[^;]*(?:1fr\s+2fr|2fr\s+1fr|3fr\s+2fr|2fr\s+3fr)/i.test(allCss)) {
    return true;
  }
  return false;
}

function measureSpacingScale(
  root: HTMLElement,
  _allCss: string
): LayoutDNA["spacingScale"] {
  const paddings: number[] = [];
  for (const section of root.querySelectorAll("section")) {
    const style = section.getAttribute("style") || "";
    const pMatch = style.match(/padding(?:-top|-bottom)?\s*:\s*([\d.]+)\s*px/gi);
    if (pMatch) {
      for (const p of pMatch) {
        const val = parseFloat(p.match(/([\d.]+)/)?.[1] || "0");
        if (val > 0) paddings.push(val);
      }
    }
  }

  if (paddings.length === 0) return "standard";

  const avg = paddings.reduce((a, b) => a + b, 0) / paddings.length;
  if (avg < 48) return "tight";
  if (avg <= 80) return "standard";
  if (avg <= 120) return "generous";
  return "editorial";
}

function measureVerticalSpacing(
  root: HTMLElement,
  _allCss: string
): number | null {
  const gaps: number[] = [];
  for (const section of root.querySelectorAll("section")) {
    const style = section.getAttribute("style") || "";
    const gMatch = style.match(/(?:gap|padding-top|padding-bottom|margin-top|margin-bottom)\s*:\s*([\d.]+)\s*px/gi);
    if (gMatch) {
      for (const g of gMatch) {
        const val = parseFloat(g.match(/([\d.]+)/)?.[1] || "0");
        if (val >= 16) gaps.push(val);
      }
    }
  }

  if (gaps.length === 0) return null;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

function detectAlignment(
  root: HTMLElement,
  _allCss: string
): LayoutDNA["alignmentPhilosophy"] {
  let centered = 0;
  let leftAligned = 0;

  for (const section of root.querySelectorAll("section")) {
    const style = section.getAttribute("style") || "";
    if (/text-align\s*:\s*center/i.test(style) || /align-items\s*:\s*center/i.test(style)) {
      centered++;
    } else if (/text-align\s*:\s*left/i.test(style) || /align-items\s*:\s*(?:flex-start|start)/i.test(style)) {
      leftAligned++;
    }
  }

  if (centered > leftAligned * 2) return "centered";
  if (leftAligned > centered * 2) return "left-aligned";
  return "mixed";
}

function detectOverlapPatterns(_root: HTMLElement, allCss: string): boolean {
  return (
    /margin-top\s*:\s*-/i.test(allCss) ||
    /transform\s*:[^;]*translateY\s*\(\s*-/i.test(allCss) ||
    /position\s*:\s*relative[^}]*top\s*:\s*-/i.test(allCss)
  );
}

// ---------------------------------------------------------------------------
// Image DNA
// ---------------------------------------------------------------------------

function extractImageDNA(root: HTMLElement, ctx: PassContext): ImageDNA {
  const images = root.querySelectorAll("img");
  const imageCount = images.length;

  const ratios: ("landscape" | "portrait" | "square")[] = [];
  for (const img of images) {
    const w = parseInt(img.getAttribute("width") || "0");
    const h = parseInt(img.getAttribute("height") || "0");
    if (w > 0 && h > 0) {
      const ratio = w / h;
      if (ratio < 0.8) ratios.push("portrait");
      else if (ratio > 1.2) ratios.push("landscape");
      else ratios.push("square");
    }
  }

  const dominantAspectRatio = getDominantRatio(ratios);

  const fullscreenUsage = images.some((img) => {
    const style = img.getAttribute("style") || "";
    return /width\s*:\s*100%/i.test(style) || /width\s*:\s*100vw/i.test(style);
  });

  const galleryRhythm = detectGalleryRhythm(root);
  const backgroundTreatment = detectBackgroundTreatment(root);
  const heroImagePresent = !!(ctx.result.images?.hero);

  const portfolioSection = root
    .querySelectorAll("section")
    .find((s) => {
      const h = s.querySelector("h2");
      return h && /portfolio|project|work|case/i.test(clean(h.text));
    });
  const portfolioStyle = portfolioSection
    ? detectPortfolioStyle(portfolioSection)
    : null;

  return {
    dominantAspectRatio,
    fullscreenUsage,
    galleryRhythm,
    backgroundTreatment,
    imageCount,
    heroImagePresent,
    portfolioStyle,
  };
}

function getDominantRatio(
  ratios: ("landscape" | "portrait" | "square")[]
): ImageDNA["dominantAspectRatio"] {
  if (ratios.length === 0) return "mixed";
  const counts = { landscape: 0, portrait: 0, square: 0 };
  for (const r of ratios) counts[r]++;
  const max = Math.max(counts.landscape, counts.portrait, counts.square);
  if (max === counts.landscape && max > ratios.length / 2) return "landscape";
  if (max === counts.portrait && max > ratios.length / 2) return "portrait";
  if (max === counts.square && max > ratios.length / 2) return "square";
  return "mixed";
}

function detectGalleryRhythm(root: HTMLElement): ImageDNA["galleryRhythm"] {
  const galleries = root.querySelectorAll(
    "[style*='grid-template-columns'], [class*='gallery'], [class*='grid']"
  );
  if (galleries.length === 0) return "single";

  for (const g of galleries) {
    const style = g.getAttribute("style") || "";
    const cls = g.getAttribute("class") || "";

    if (/masonry/i.test(cls)) return "masonry";
    if (/overflow-x\s*:\s*(?:auto|scroll)/i.test(style)) return "strip";
    if (/grid-template-columns/i.test(style)) return "grid";
  }

  return "grid";
}

function detectBackgroundTreatment(root: HTMLElement): ImageDNA["backgroundTreatment"] {
  const allStyles = root
    .querySelectorAll("[style]")
    .map((e) => e.getAttribute("style") || "")
    .join("\n");

  if (/linear-gradient.*rgba/i.test(allStyles)) return "overlay";
  if (/filter\s*:\s*blur/i.test(allStyles)) return "blur";
  if (/filter\s*:.*grayscale.*sepia|mix-blend-mode/i.test(allStyles)) return "duotone";
  return "none";
}

function detectPortfolioStyle(section: HTMLElement): ImageDNA["portfolioStyle"] {
  const cards = section.querySelectorAll(
    "article, [class*='card'], [class*='project']"
  );
  if (cards.length > 0) return "cards";

  const fullWidthImgs = section
    .querySelectorAll("img")
    .filter((img) => {
      const style = img.getAttribute("style") || "";
      return /width\s*:\s*100%/i.test(style);
    });
  if (fullWidthImgs.length > 0) return "fullbleed";

  return "editorial";
}

// ---------------------------------------------------------------------------
// Component DNA
// ---------------------------------------------------------------------------

function extractComponentDNA(
  root: HTMLElement,
  allStyles: string
): ComponentDNA {
  const cardRadius = detectCardRadius(root, allStyles);
  const cardBorder = detectCardBorder(allStyles);
  const cardShadow = detectCardShadow(allStyles);
  const ctaStyle = detectCtaStyle(root);
  const ctaCount = root.querySelectorAll(
    'a[class*="button"], a[class*="btn"], a[class*="cta"], button'
  ).length;
  const dividerUsage = root.querySelectorAll("hr").length > 0 ||
    /border-bottom\s*:\s*1px/i.test(allStyles);
  const badgeLanguage = detectBadgeLanguage(root);

  return {
    cardRadius,
    cardBorder,
    cardShadow,
    iconStyle: null,
    ctaStyle,
    ctaCount,
    badgeLanguage,
    dividerUsage,
  };
}

function detectCardRadius(
  root: HTMLElement,
  allStyles: string
): number | null {
  const radii: number[] = [];
  const re = /border-radius\s*:\s*([\d.]+)\s*px/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(allStyles))) {
    const val = parseFloat(m[1]);
    if (val > 0 && val < 100) radii.push(val);
  }

  if (radii.length === 0) return null;

  // Return mode
  const counts = new Map<number, number>();
  for (const r of radii) {
    const rounded = Math.round(r);
    counts.set(rounded, (counts.get(rounded) || 0) + 1);
  }
  let best = radii[0];
  let bestCount = 0;
  counts.forEach((c, v) => {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  });
  return best;
}

function detectCardBorder(allStyles: string): ComponentDNA["cardBorder"] {
  if (/border\s*:\s*1px\s+solid/i.test(allStyles)) {
    if (/rgba?\s*\([^)]*0\.[0-2]/i.test(allStyles)) return "hairline";
    return "solid";
  }
  return "none";
}

function detectCardShadow(allStyles: string): ComponentDNA["cardShadow"] {
  const shadowRe = /box-shadow\s*:\s*([^;]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = shadowRe.exec(allStyles))) {
    const shadow = m[1];
    if (/none/i.test(shadow)) continue;

    const blurMatch = shadow.match(
      /\d+px\s+\d+px\s+([\d.]+)px/
    );
    if (blurMatch) {
      const blur = parseFloat(blurMatch[1]);
      if (blur > 16) return "dramatic";
      if (blur > 4) return "elevated";
      return "subtle";
    }
  }
  return "none";
}

function detectCtaStyle(root: HTMLElement): ComponentDNA["ctaStyle"] {
  const buttons = root.querySelectorAll(
    'a[class*="button"], a[class*="btn"], a[class*="cta"], button'
  );

  for (const btn of buttons) {
    const style = btn.getAttribute("style") || "";
    const radiusMatch = style.match(/border-radius\s*:\s*([\d.]+)/i);
    if (radiusMatch) {
      const radius = parseFloat(radiusMatch[1]);
      if (radius >= 999) return "pill";
      if (radius <= 2) return "sharp";
    }

    if (
      /background\s*:\s*(?:transparent|none)/i.test(style) &&
      /border/i.test(style)
    ) {
      return "ghost";
    }

    if (
      !/background/i.test(style) &&
      (btn.text.includes("→") || btn.text.includes("›"))
    ) {
      return "text-arrow";
    }
  }

  return "pill";
}

function detectBadgeLanguage(root: HTMLElement): ComponentDNA["badgeLanguage"] {
  const badges = root.querySelectorAll(
    '[class*="badge"], [class*="tag"], [class*="chip"]'
  );
  for (const badge of badges) {
    const style = badge.getAttribute("style") || "";
    const radiusMatch = style.match(/border-radius\s*:\s*([\d.]+)/i);
    if (radiusMatch) {
      const r = parseFloat(radiusMatch[1]);
      if (r >= 999) return "pill";
      return "rounded";
    }
  }
  return "none";
}

// ---------------------------------------------------------------------------
// Motion DNA
// ---------------------------------------------------------------------------

function extractMotionDNA(
  root: HTMLElement,
  allCss: string,
  allStyles: string,
  ctx: PassContext
): MotionDNAExtracted {
  const motionLevel = ctx.result.motion?.level ?? 0;

  const entranceAnimations: string[] = [];
  const keyframeRe = /@keyframes\s+([\w-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = keyframeRe.exec(allCss))) {
    const name = m[1].toLowerCase();
    if (/fade/i.test(name)) entranceAnimations.push("fade");
    else if (/slide/i.test(name)) entranceAnimations.push("slide-up");
    else if (/blur/i.test(name)) entranceAnimations.push("blur-fade");
    else if (/reveal|appear|enter/i.test(name)) entranceAnimations.push("reveal");
    else if (/stagger/i.test(name)) entranceAnimations.push("stagger");
  }

  // Framer appear IDs indicate entrance animations
  const framerReveals = root.querySelectorAll("[data-framer-appear-id]").length;
  if (framerReveals > 0 && !entranceAnimations.includes("fade")) {
    entranceAnimations.push("fade");
  }

  const scrollAnimations =
    /scroll-snap|scroll-behavior|IntersectionObserver/i.test(allStyles) ||
    root.querySelectorAll("[data-framer-appear-id]").length > 3;

  const parallaxDetected =
    /transform\s*:[^;}]*translate3d/i.test(allStyles) ||
    /perspective\s*:/i.test(allStyles) ||
    root.querySelectorAll('[class*="parallax"]').length > 0;

  const hoverBehavior: string[] = [];
  const hoverRe = /:hover\s*\{([^}]+)\}/gi;
  while ((m = hoverRe.exec(allCss))) {
    const body = m[1];
    if (/scale/i.test(body)) hoverBehavior.push("scale");
    if (/opacity/i.test(body)) hoverBehavior.push("opacity");
    if (/translate/i.test(body)) hoverBehavior.push("translate");
    if (/color/i.test(body)) hoverBehavior.push("color");
    if (/box-shadow/i.test(body)) hoverBehavior.push("shadow");
  }

  const staggerDetected =
    /stagger/i.test(allStyles) || /animation-delay/i.test(allStyles);

  // Median transition duration
  const durations: number[] = [];
  const transRe = /transition[^:]*:\s*[^;]*?([\d.]+)\s*m?s/gi;
  while ((m = transRe.exec(allStyles))) {
    let val = parseFloat(m[1]);
    if (!m[0].includes("ms")) val *= 1000;
    if (val > 0 && val < 5000) durations.push(val);
  }
  const transitionDuration =
    durations.length > 0
      ? durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)]
      : null;

  const interactionPhilosophy = inferInteractionPhilosophy(
    motionLevel,
    parallaxDetected,
    hoverBehavior.length
  );

  return {
    animationIntensity: motionLevel as 0 | 1 | 2 | 3,
    entranceAnimations: Array.from(new Set(entranceAnimations)),
    scrollAnimations,
    parallaxDetected,
    hoverBehavior: Array.from(new Set(hoverBehavior)),
    interactionPhilosophy,
    staggerDetected,
    transitionDuration,
  };
}

function inferInteractionPhilosophy(
  level: number,
  parallax: boolean,
  hoverCount: number
): MotionDNAExtracted["interactionPhilosophy"] {
  if (level >= 3 || parallax) return "cinematic";
  if (level >= 2 || hoverCount >= 3) return "playful";
  return "restrained";
}

// ---------------------------------------------------------------------------
// Brand DNA
// ---------------------------------------------------------------------------

function extractBrandDNA(
  root: HTMLElement,
  allCss: string,
  allStyles: string,
  deps: {
    typography: TypographyDNA;
    layout: LayoutDNA;
    component: ComponentDNA;
    motion: MotionDNAExtracted;
    image: ImageDNA;
  }
): BrandDNA {
  const { typography, layout, component, motion, image } = deps;

  // Surface / ink / accent colors
  const { surfaceColor, inkColor, accentColor, isDark } = extractBrandColors(
    root,
    allCss,
    allStyles
  );

  const isSerif = typography.headingFont
    ? /serif|playfair|merriweather|garamond|georgia|cormorant|lora|baskerville/i.test(
        typography.headingFont
      )
    : false;
  const isSansSerif = !isSerif;

  // Luxury score
  let luxuryScore = 0;
  if (layout.spacingScale === "generous" || layout.spacingScale === "editorial")
    luxuryScore += 25;
  if (isSerif || /display/i.test(typography.headingFont || "")) luxuryScore += 15;
  if (isDark) luxuryScore += 10;
  if (component.cardShadow === "none" && component.cardBorder === "none")
    luxuryScore += 15;
  if (layout.sectionCount <= 8 && layout.spacingScale !== "tight") luxuryScore += 20;
  if (
    typography.editorialScale === "editorial" ||
    typography.editorialScale === "bold"
  )
    luxuryScore += 15;

  // Modernity score
  let modernityScore = 0;
  if (isSansSerif) modernityScore += 20;
  if (typography.trackingTight) modernityScore += 10;
  if (
    component.cardShadow === "none" ||
    component.cardShadow === "subtle"
  )
    modernityScore += 15;
  if (motion.animationIntensity >= 2) modernityScore += 15;
  if (layout.columnCount >= 2) modernityScore += 20;
  if (component.ctaStyle === "pill") modernityScore += 10;
  if (isDark) modernityScore += 10;

  // Editorial score
  let editorialScore = 0;
  if (
    typography.editorialScale === "editorial" ||
    typography.editorialScale === "bold"
  )
    editorialScore += 20;
  if (layout.spacingScale === "generous" || layout.spacingScale === "editorial")
    editorialScore += 15;
  if (component.cardShadow === "none" && component.cardBorder === "none")
    editorialScore += 20;
  if (typography.uppercaseUsage === "headings" || typography.uppercaseUsage === "extensive")
    editorialScore += 10;
  if (layout.asymmetry) editorialScore += 15;
  if (image.dominantAspectRatio !== "square") editorialScore += 10;

  // Minimalism score
  let minimalismScore = 0;
  if (typography.textDensity === "sparse") minimalismScore += 15;
  if (component.cardShadow === "none") minimalismScore += 10;
  if (layout.columnCount <= 2) minimalismScore += 15;
  if (motion.interactionPhilosophy === "restrained") minimalismScore += 10;
  if (layout.spacingScale === "generous" || layout.spacingScale === "editorial")
    minimalismScore += 20;
  if (component.dividerUsage === false) minimalismScore += 10;
  if (image.imageCount <= 6) minimalismScore += 20;

  luxuryScore = Math.min(luxuryScore, 100);
  modernityScore = Math.min(modernityScore, 100);
  editorialScore = Math.min(editorialScore, 100);
  minimalismScore = Math.min(minimalismScore, 100);

  const premiumScore = Math.min(
    Math.round((luxuryScore + modernityScore + editorialScore + minimalismScore) / 4),
    100
  );

  const visualDensity: BrandDNA["visualDensity"] =
    typography.textDensity === "dense" || image.imageCount > 15
      ? "dense"
      : typography.textDensity === "sparse" && image.imageCount < 5
        ? "sparse"
        : "moderate";

  const emotionalDirection: BrandDNA["emotionalDirection"] = isSerif
    ? "warm"
    : isSansSerif && isDark
      ? "cool"
      : "neutral";

  const personality: string[] = [];
  if (luxuryScore >= 60) personality.push("luxury");
  if (modernityScore >= 60) personality.push("modern");
  if (editorialScore >= 60) personality.push("editorial");
  if (minimalismScore >= 60) personality.push("minimal");
  if (personality.length === 0) personality.push("standard");

  return {
    luxuryScore,
    modernityScore,
    editorialScore,
    minimalismScore,
    visualDensity,
    premiumScore,
    emotionalDirection,
    personality,
    surfaceColor,
    inkColor,
    accentColor,
    isDark,
  };
}

function extractBrandColors(
  root: HTMLElement,
  allCss: string,
  _allStyles: string
): {
  surfaceColor: string | null;
  inkColor: string | null;
  accentColor: string | null;
  isDark: boolean;
} {
  let surfaceColor: string | null = null;
  let inkColor: string | null = null;
  let accentColor: string | null = null;

  // Framer token format: var(--token-UUID, #fallback)
  const tokenRe = /var\s*\(\s*--token-[^,]+,\s*(#[0-9a-fA-F]{3,8})\s*\)/g;
  const tokenColors: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(allCss))) {
    tokenColors.push(m[1].toLowerCase());
  }

  // Body/html background
  for (const sel of ["body", "html"]) {
    const el = root.querySelector(sel);
    if (!el) continue;
    const style = el.getAttribute("style") || "";
    const bgMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
    if (bgMatch) {
      const color = extractHexColor(bgMatch[1].trim());
      if (color) {
        surfaceColor = color;
        break;
      }
    }
  }

  // Section-level background for surface
  if (!surfaceColor) {
    const sections = root.querySelectorAll("section");
    for (const section of sections) {
      const style = section.getAttribute("style") || "";
      const bgMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
      if (bgMatch) {
        const color = extractHexColor(bgMatch[1].trim());
        if (color) {
          surfaceColor = color;
          break;
        }
      }
    }
  }

  // Framer token colors as fallbacks
  if (!surfaceColor && tokenColors.length > 0) {
    surfaceColor = tokenColors[0];
  }

  // Ink color from text
  const headings = root.querySelectorAll("h1, h2, h3");
  for (const h of headings) {
    const style = h.getAttribute("style") || "";
    const colorMatch = style.match(/(?:^|;\s*)color\s*:\s*([^;]+)/i);
    if (colorMatch) {
      const color = extractHexColor(colorMatch[1].trim());
      if (color) {
        inkColor = color;
        break;
      }
    }
  }

  // Accent from links/buttons
  const links = root.querySelectorAll(
    'a[class*="button"], a[class*="btn"], a[class*="cta"]'
  );
  for (const link of links) {
    const style = link.getAttribute("style") || "";
    const bgMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
    if (bgMatch) {
      const color = extractHexColor(bgMatch[1].trim());
      if (color && color !== surfaceColor && color !== inkColor) {
        accentColor = color;
        break;
      }
    }
  }

  // Use existing extraction if available
  if (!accentColor) {
    accentColor = tokenColors.find(
      (c) => c !== surfaceColor && c !== inkColor
    ) || null;
  }

  const isDark = surfaceColor ? isColorDark(surfaceColor) : false;

  return { surfaceColor, inkColor, accentColor, isDark };
}

function extractHexColor(value: string): string | null {
  // Direct hex
  const hexMatch = value.match(/#([0-9a-fA-F]{3,8})\b/);
  if (hexMatch) return `#${hexMatch[1].toLowerCase()}`;

  // Framer var() with fallback
  const varMatch = value.match(/var\s*\([^,]+,\s*(#[0-9a-fA-F]{3,8})\s*\)/);
  if (varMatch) return varMatch[1].toLowerCase();

  // rgb/rgba
  const rgbMatch = value.match(
    /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  return null;
}

function isColorDark(hex: string): boolean {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16) || 0;
  const g = parseInt(cleaned.substring(2, 4), 16) || 0;
  const b = parseInt(cleaned.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.4;
}

// ---------------------------------------------------------------------------
// Framer DNA
// ---------------------------------------------------------------------------

function extractFramerDNA(root: HTMLElement, ctx: PassContext): FramerDNA {
  const framerSections = ctx.framerSections || [];

  const sectionIdentities = framerSections.map((s) => ({
    name: s.name,
    type: s.type,
  }));

  const componentNames: string[] = [];
  const seen = new Set<string>();
  for (const el of root.querySelectorAll("[data-framer-name]")) {
    const name = el.getAttribute("data-framer-name") || "";
    if (name && !seen.has(name)) {
      seen.add(name);
      componentNames.push(name);
    }
  }

  const responsiveVariants = root.querySelectorAll(
    '[data-framer-name*="Tablet"], [data-framer-name*="Phone"], [data-framer-name*="Desktop"]'
  ).length;

  const richTextContainers = root.querySelectorAll(
    '[data-framer-name="RichTextContainer"], [data-framer-name*="RichText"]'
  ).length;

  const namedSections = sectionIdentities.map((s) => s.name);

  const layoutHints: { section: string; columns: number }[] = [];
  for (const section of framerSections) {
    const gridEls = (section.element as unknown as HTMLElement).querySelectorAll(
      "[style*='grid-template-columns']"
    );
    for (const g of gridEls) {
      const style = g.getAttribute("style") || "";
      const gm = style.match(/grid-template-columns\s*:\s*([^;]+)/i);
      if (gm) {
        const cols = gm[1]
          .trim()
          .split(/\s+/)
          .filter((t) => t !== "/" && t !== "auto").length;
        if (cols > 1) {
          layoutHints.push({ section: section.name, columns: cols });
          break;
        }
      }
    }
  }

  return {
    sectionIdentities,
    componentNames,
    responsiveVariants,
    richTextContainers,
    namedSections,
    layoutHints,
  };
}
