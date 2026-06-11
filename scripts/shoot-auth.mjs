import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3940";
const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
const page = await ctx.newPage();

// Login page
await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1000);
await page.screenshot({ path: "/tmp/auth-login.png" });
console.log("login shot");

// Create an account via the API (sets the session cookie in this context),
// publish two sites, then view My sites.
await page.request.post(BASE + "/api/auth/signup", {
  data: { email: "owner@studio.co", password: "supersecret9" },
});
for (const [name, tagline] of [
  ["Komorebi", "A table you will remember"],
  ["Crest Homes", "The place you pictured"],
]) {
  await page.request.post(BASE + "/api/publish-site", {
    data: {
      schema: {
        id: name, sourceUrl: "https://x.co", industry: "agency",
        brand: { name, tagline },
        theme: { primary: "#111", accent: "#9FDE3F", radius: "lg", font: "geist", mood: "minimal" },
        blocks: [{ id: "h", type: "hero", variant: "HeroPremium1", props: {} }, { id: "f", type: "footer", variant: "Footer1", props: {} }],
      },
    },
  });
}

await page.goto(BASE + "/dashboard/sites", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/auth-sites.png" });
console.log("sites shot");

await browser.close();
console.log("DONE");
