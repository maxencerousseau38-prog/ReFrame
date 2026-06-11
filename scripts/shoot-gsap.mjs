import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3920";
const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
const page = await ctx.newPage();

await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(1200);

// Find the pinned section's document offset (the <section> wrapping TransformScroll
// is the one with a min-h child that pins; locate by its heading text).
const top = await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2")].find((e) =>
    e.textContent.includes("understands your site")
  );
  let el = h;
  while (el && el.tagName !== "SECTION") el = el.parentElement;
  const rect = el.getBoundingClientRect();
  return window.scrollY + rect.top;
});

const offsets = [0, 800, 1600, 2400, 3100];
for (let i = 0; i < offsets.length; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), top + offsets[i]);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `/tmp/gsap-${i}.png` });
  console.log("phase", i, "@scroll", top + offsets[i]);
}
await browser.close();
console.log("DONE");
