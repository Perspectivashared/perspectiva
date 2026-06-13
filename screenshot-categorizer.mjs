import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const OUT = "f:/insight-forge-frontend/screenshots/categorizer-screenshots-v3";
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const STEPS = [
  "00-welcome",
  "01-basic-info",
  "02-demographics",
  "03-profession",
  "04-income",
  "05-spending",
  "06-digital-life",
  "07-payments",
  "08-interests",
  "09-community",
  "10-surveys",
  "11-technology",
  "12-values",
  "13-goals",
  "14-feedback",
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

await page.goto("http://localhost:8081/categorizer", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

// Step 0 — accept terms first
await page.locator("text=I agree to participate").click();
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/${STEPS[0]}.png`, fullPage: false });
console.log(`✓ ${STEPS[0]}`);

for (let i = 1; i < STEPS.length; i++) {
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(600); // wait for scroll reset + render
  await page.screenshot({ path: `${OUT}/${STEPS[i]}.png`, fullPage: false });
  console.log(`✓ ${STEPS[i]}`);
}

await browser.close();
console.log(`\nAll screenshots saved to ${OUT}`);
