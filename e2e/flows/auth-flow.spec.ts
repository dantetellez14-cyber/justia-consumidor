import { test, expect } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { mockCases } from "../fixtures/cases";

test.describe("Auth flow", () => {
  test("redirige a sign-in si no esta autenticado", async ({ page }) => {
    await page.goto("/mis-casos");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("usuario autenticado ve lista de casos en /mis-casos", async ({
    page,
  }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/mis-casos");

    // Wait for Clerk to load and SWR to fetch — CI can be slow
    await page.waitForLoadState("networkidle");

    // Check that the authenticated page is visible (not redirect)
    await expect(page.getByText("Mis Casos")).toBeVisible({ timeout: 25_000 });

    // Cases should appear from MSW mock
    await expect(
      page.getByText(mockCases[0].empresa)
    ).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(mockCases[1].empresa)).toBeVisible();
  });

  test("usuario autenticado puede ver detalle de un caso", async ({ page }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/mis-casos");

    // Wait for cases to load
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(mockCases[0].empresa)
    ).toBeVisible({ timeout: 25_000 });

    // Click the first case
    await page.getByText(mockCases[0].empresa).first().click();

    // See detail
    await expect(
      page.getByText(mockCases[0].core_grievance)
    ).toBeVisible({ timeout: 10_000 });
  });
});
