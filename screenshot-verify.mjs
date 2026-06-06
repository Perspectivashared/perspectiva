import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const OUT = "f:/categorizer-verify";
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ colorScheme: "dark", viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto("http://localhost:8081/categorizer", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Step 0 — should show 0%
await page.screenshot({ path: `${OUT}/step0.png`, fullPage: false });

// Accept and advance to step 1
await page.locator("text=I agree to participate").click();
await page.waitForTimeout(200);
await page.locator('button:has-text("Continue")').click();
await page.waitForTimeout(600);

// Step 1 — should show ~7%
await page.screenshot({ path: `${OUT}/step1.png`, fullPage: false });

// Advance to step 7
for (let i = 0; i < 6; i++) {
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(400);
}
// Step 7 — should show ~47%
await page.screenshot({ path: `${OUT}/step7.png`, fullPage: false });

// Log actual progress values from DOM
const vals = await page.evaluate(() => {
  const bars = [...document.querySelectorAll('[style*="width"]')];
  return bars.map(el => ({ style: el.getAttribute('style'), text: el.closest('[class]')?.textContent?.trim()?.slice(0, 50) }));
});
console.log("Width elements:", JSON.stringify(vals, null, 2));

await browser.close();
