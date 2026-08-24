#!/usr/bin/env node
// Upload a Trip JSON to Travel website via API or D1 fallback
// Usage: node scripts/upload-trip.mjs data/vietnam.json
//        node scripts/upload-trip.mjs trip.json --api-url https://travel-api.workers.dev

import { readFile } from "fs/promises";
import { execSync } from "child_process";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/upload-trip.mjs <trip.json> [--api-url <url>]");
  process.exit(1);
}
const apiUrlIdx = process.argv.indexOf("--api-url");
const apiUrl = apiUrlIdx !== -1 ? process.argv[apiUrlIdx + 1] : process.env.API_URL || "https://travel-api.prashantkumarbharadwaj.workers.dev";
const apiSecret = process.env.API_SECRET || "";

const raw = await readFile(file, "utf-8");
const trip = JSON.parse(raw);
const trips = Array.isArray(trip) ? trip : [trip];

for (const t of trips) {
  console.log(`Uploading trip ${t.id} — ${t.title} (${t.days?.length ?? 0} days)...`);
  try {
    const res = await fetch(`${apiUrl}/api/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiSecret ? { "X-API-Secret": apiSecret } : {}),
      },
      body: JSON.stringify(t),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`  API OK:`, data);
      continue;
    }
    console.log(`  API ${res.status} ${res.statusText} — falling back to D1`);
  } catch (e) {
    console.log(`  API failed (${e.message}) — falling back to D1`);
  }

  // Fallback: wrangler d1 execute
  const dataStr = JSON.stringify(t).replace(/'/g, "''");
  const sql = `INSERT OR REPLACE INTO trips (id, title, country, start_date, end_date, data) VALUES ('${t.id}', '${t.title.replace(/'/g, "''")}', '${t.country.replace(/'/g, "''")}', '${t.startDate}', '${t.endDate}', '${dataStr}');`;
  try {
    execSync(`wrangler d1 execute travel-db --remote --command "${sql.replace(/"/g, '\\"')}"`, { stdio: "inherit" });
    console.log(`  D1 OK`);
  } catch (e) {
    console.error(`  D1 failed, save for manual import:`, e.message);
    console.log(`  Manual: open https://travel-7l1.pages.dev → Import JSON → ${file}`);
  }
}
console.log(`Done. Verify at https://travel-7l1.pages.dev`);
