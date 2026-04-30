import { test, expect } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { mockCases } from "../fixtures/cases";

// TODO(auth-tests): los tests autenticados estan en quarentena hasta que se
// configure un test user en el dashboard de Clerk + clerk.signIn() en cada
// test. setupClerkTestingToken solo bypasea bot detection, NO establece
// sesion. Pasos para reactivar:
//   1. Crear un test user en Clerk dashboard (Test mode) con email/password
//      conocidos (ej. test+e2e@justia.local).
//   2. Agregar TEST_USER_EMAIL y TEST_USER_PASSWORD a GitHub Secrets.
//      Inyectarlos al env del job e2e en .github/workflows/e2e.yml.
//   3. En cada test que requiera auth, llamar:
//        await clerk.signIn({ page, signInParams: { strategy: 'password',
//          identifier: process.env.TEST_USER_EMAIL!,
//          password: process.env.TEST_USER_PASSWORD! } });
//      antes del primer page.goto que requiera sesion.

test.describe("Auth flow", () => {
  test("redirige a sign-in si no esta autenticado", async ({ page }) => {
    await page.goto("/mis-casos");
    await expect(page).toHaveURL(/sign-in/);
  });

  test.fixme("usuario autenticado ve lista de casos en /mis-casos", async ({
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

  test.fixme("usuario autenticado puede ver detalle de un caso", async ({ page }) => {
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
