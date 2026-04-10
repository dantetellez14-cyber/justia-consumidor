import { test, expect } from "@playwright/test";
import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright";
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

    // Esperar que cargue la lista
    await expect(
      page.getByText(mockCases[0].empresa)
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(mockCases[1].empresa)).toBeVisible();
  });

  test("usuario autenticado puede ver detalle de un caso", async ({ page }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/mis-casos");

    // Hacer click en el primer caso
    await page.getByText(mockCases[0].empresa).first().click();

    // Ver detalle
    await expect(
      page.getByText(mockCases[0].core_grievance)
    ).toBeVisible({ timeout: 10_000 });
  });
});
