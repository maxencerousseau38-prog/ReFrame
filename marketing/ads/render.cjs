const { chromium } = require("playwright");
const path = require("path");

const CREATIVES = [
  { file: "creative-square.html", out: "ad-square-1080.png", w: 1080, h: 1080 },
  { file: "creative-story.html", out: "ad-story-1080x1920.png", w: 1080, h: 1920 },
  { file: "creative-landscape.html", out: "ad-landscape-1200x628.png", w: 1200, h: 628 },
];

(async () => {
  const browser = await chromium.launch();
  for (const c of CREATIVES) {
    const page = await browser.newPage({
      viewport: { width: c.w, height: c.h },
      deviceScaleFactor: 2,
    });
    const url = "file://" + path.resolve("marketing/ads", c.file);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    await page.screenshot({ path: "out/" + c.out });
    await page.close();
  }
  await browser.close();
  console.log("done");
})();
