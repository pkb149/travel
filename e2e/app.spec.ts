import { test, expect } from "@playwright/test";
test("homepage loads and shows Travel platform", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Travel").first()).toBeVisible();
  await expect(page.getByText("Vietnam Tour").first()).toBeVisible();
});
test("create trip flow", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "+ New trip" }).click();
  await page.getByPlaceholder("Bali 2027").fill("Playwright Test Trip");
  await page.getByPlaceholder("Indonesia").fill("Indonesia");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText("Playwright Test Trip")).toBeVisible();
});
