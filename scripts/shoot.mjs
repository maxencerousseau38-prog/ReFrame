import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3920";
const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
const page = await ctx.newPage();

await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(1000);

// Scroll the whole page once to trigger every whileInView reveal, then settle.
const height = await page.evaluate(() => document.body.scrollHeight);
const vh = 900;
for (let y = 0; y < height; y += vh * 0.85) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(450);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);

// Capture viewport slices top-to-bottom (reveals now already played).
let i = 0;
for (let y = 0; y < height; y += vh) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `/tmp/slice-${String(i).padStart(2, "0")}.png` });
  console.log("slice", i, "@", y);
  i++;
}
await browser.close();
console.log("DONE", i, "slices");
