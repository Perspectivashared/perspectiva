import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const OUT = "./screenshots/validation-test";
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ colorScheme: "dark", viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto("http://localhost:8080/categorizer", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

// Step 1: Try clicking Continue WITHOUT accepting — should be disabled
await page.screenshot({ path: `${OUT}/01-welcome-continue-disabled.png`, fullPage: false });

// Accept, go to Basic Info
await page.locator("text=I agree to participate").click();
await page.waitForTimeout(200);
await page.locator('button:has-text("Continue")').click();
await page.waitForTimeout(500);

// Step 2 Basic Info — click Continue without filling anything
await page.screenshot({ path: `${OUT}/02-basic-info-empty.png`, fullPage: false });
await page.locator('button:has-text("Continue")').click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/03-basic-info-errors.png`, fullPage: false });

// Now fill in the basic info and advance
await page.fill('input[placeholder="Jane Doe"]', "Test User");
await page.fill('input[placeholder="you@email.com"]', "test@test.com");
await page.locator('input[type="number"]').first().fill("25");
await page.fill('input[placeholder="Singapore"]', "Singapore");
// Fill city (second Singapore placeholder)
const cityInput = page.locator('input[placeholder="Singapore"]').nth(1);
await cityInput.fill("Singapore");
// Select primaryStatus
await page.locator('button:has-text("University student")').click();
await page.waitForTimeout(200);
await page.locator('button:has-text("Continue")').click();
await page.waitForTimeout(500);
// Should advance to Demographics step
await page.screenshot({ path: `${OUT}/04-demographics-step.png`, fullPage: false });

// Try to advance Demographics without filling gender
await page.locator('button:has-text("Continue")').click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/05-demographics-errors.png`, fullPage: false });

await browser.close();
console.log("Screenshots saved to", OUT);
