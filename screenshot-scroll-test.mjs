import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const OUT = "f:/scroll-test";
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ colorScheme: "dark", viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto("http://localhost:8081/categorizer", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

// Accept + navigate to Spending step (step 6, index 5 → need 5 Continues)
await page.locator("text=I agree to participate").click();
await page.waitForTimeout(200);
for (let i = 0; i < 5; i++) {
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(500);
}

await page.screenshot({ path: `${OUT}/01-spending-start.png`, fullPage: false });

// Measure scrollable div
const info = await page.evaluate(() => {
  // Find the main scrollable div (not sidebar) — it has ref attached
  const allScrollable = [...document.querySelectorAll(".overflow-y-auto")];
  const results = allScrollable.map(el => ({
    tag: el.tagName,
    classes: el.className.slice(0, 80),
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    scrollTop: el.scrollTop,
    canScroll: el.scrollHeight > el.clientHeight,
  }));
  return results;
});
console.log("Scrollable elements:", JSON.stringify(info, null, 2));

// Hover over content area and use mouse wheel to scroll
await page.mouse.move(800, 500);
await page.mouse.wheel(0, 600);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/02-spending-after-wheel-1.png`, fullPage: false });

await page.mouse.wheel(0, 600);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/03-spending-after-wheel-2.png`, fullPage: false });

await page.mouse.wheel(0, 600);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/04-spending-after-wheel-3.png`, fullPage: false });

// Also check what the scrollTop is now
const scrollInfo = await page.evaluate(() => {
  const allScrollable = [...document.querySelectorAll(".overflow-y-auto")];
  return allScrollable.map(el => ({
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
  }));
});
console.log("After scrolling:", JSON.stringify(scrollInfo, null, 2));

await browser.close();
console.log("Done. Screenshots in", OUT);
