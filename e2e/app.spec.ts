import { test, expect } from "@playwright/test";
test("homepage shows dashboard with trip list", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Hello, Prashant!")).toBeVisible();
  await expect(page.getByText("Your trips")).toBeVisible();
  await expect(page.getByText("Vietnam Tour")).toBeVisible();
});
test("create trip flow", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "+ Add Destination" }).click();
  await page.getByPlaceholder("Bali 2027").fill("Playwright Test Trip");
  await page.getByPlaceholder("Indonesia").fill("Indonesia");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText("Playwright Test Trip")).toBeVisible();
});
test("trip detail shows WanderPlan itinerary", async ({ page }) => {
  await page.goto("/trip/vietnam-2026");
  await expect(page.getByText("Back to Itinerary")).toBeVisible();
  await expect(page.getByText("Itinerary").first()).toBeVisible();
});
