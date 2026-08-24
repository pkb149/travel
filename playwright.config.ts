import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  use: { baseURL: "https://travel-7l1.pages.dev", trace: "on-first-retry" },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 30000 },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
