#!/usr/bin/env node
// Playwright UI upload — imports Trip JSON via the Travel site's Import button
// Usage: NODE_PATH=/Users/prashantbharadwaj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/playwright-upload.mjs trip.json
// Requires: playwright installed (npm i -D playwright)

import { chromium } from "playwright";
import { readFile } from "fs/promises";
import fs from "fs";

const file = process.argv[2];
const site = process.env.SITE_URL || "https://travel-7l1.pages.dev";
if (!file || !fs.existsSync(file)) {
  console.error("Usage: node scripts/playwright-upload.mjs <trip.json>");
  process.exit(1);
}
const json = await readFile(file, "utf-8");
const trip = JSON.parse(json);
const title = Array.isArray(trip) ? trip[0]?.title : trip.title;

console.log(`Playwright upload ${file} → ${site} ...`);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(site, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

// The site has an "Import" label with hidden file input
const input = page.locator('input[type="file"]');
await input.setInputFiles(file);
await page.waitForTimeout(2000);

// Verify trip appears (tab button with title)
const tab = page.locator(`button:has-text("${title}")`).first();
if (await tab.count() > 0) {
  console.log(`Verified trip tab found: ${title}`);
} else {
  console.log(`Warning: trip tab not found immediately, check screenshot`);
  await page.screenshot({ path: "/tmp/playwright-upload.png" });
  console.log("Screenshot at /tmp/playwright-upload.png");
}

await browser.close();
console.log(`Done. Check ${site}`);
