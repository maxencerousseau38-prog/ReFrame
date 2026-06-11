import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3950";
const W = 1440, H = 900;
const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu"] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 });
const page = await ctx.newPage();

async function shot(name, full = false) {
  await page.waitForTimeout(900);
  await page.screenshot({ path: `/tmp/tour-${name}.png`, fullPage: full });
  console.log("shot", name);
}

// 1. Landing hero
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await shot("01-landing");

// 2. GSAP "Ship" state: scroll into the pinned section near its end.
const top = await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2")].find((e) => e.textContent.includes("understands your site"));
  let el = h; while (el && el.tagName !== "SECTION") el = el.parentElement;
  return window.scrollY + el.getBoundingClientRect().top;
});
await page.evaluate((y) => window.scrollTo(0, y + 3100), top);
await shot("02-engine-ship");
await page.evaluate(() => window.scrollTo(0, 0));

// 3. Login
await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
await shot("03-login");

// 4. Account + dashboard
await page.request.post(BASE + "/api/auth/signup", { data: { email: "studio@reframe.co", password: "supersecret9" } });
await page.goto(BASE + "/dashboard", { waitUntil: "domcontentloaded" });
await shot("04-dashboard");

// 5. Real generation: drive analyze->generate, store schema, view Result + Editor.
const gen = await page.request.post(BASE + "/api/generate-site", { data: { url: "https://example.com" } });
const { schema, analysis } = await gen.json();
await page.evaluate(({ s, a }) => {
  sessionStorage.setItem("sr:schema", JSON.stringify(s));
  sessionStorage.setItem("sr:analysis", JSON.stringify(a));
}, { s: schema, a: analysis });

await page.goto(BASE + "/result", { waitUntil: "domcontentloaded" });
await shot("05-result", true);

await page.goto(BASE + "/editor", { waitUntil: "domcontentloaded" });
await shot("06-editor");

// 6. Publish a couple owned sites, then My sites
for (const [name, tagline, industry] of [
  ["Komorebi", "A table you will remember", "restaurant"],
  ["Crest Homes", "The place you pictured", "realestate"],
  ["Field Studio", "Work that earns attention", "agency"],
]) {
  await page.request.post(BASE + "/api/publish-site", {
    data: { schema: { ...schema, id: name, industry, brand: { name, tagline } } },
  });
}
await page.goto(BASE + "/dashboard/sites", { waitUntil: "domcontentloaded" });
await shot("07-my-sites");

// 7. A live published site
await page.goto(BASE + "/s/komorebi", { waitUntil: "domcontentloaded" });
await shot("08-published", true);

// 8. Legal
await page.goto(BASE + "/terms", { waitUntil: "domcontentloaded" });
await shot("09-terms");

await browser.close();
console.log("DONE");
