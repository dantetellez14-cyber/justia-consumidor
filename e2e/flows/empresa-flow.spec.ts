import { test, expect } from "@playwright/test";

/**
 * E2E tests for the /empresa portal.
 *
 * MSW intercepts all API calls so these tests run without a real backend.
 * The default handler returns a registered company with 2 pending complaints.
 */

test.describe("Empresa portal — registered company", () => {
  test("dashboard carga con nombre de empresa y estadísticas", async ({
    page,
  }) => {
    await page.goto("/empresa");

    // Company name in the header/dashboard
    await expect(page.getByText("Telecom").first()).toBeVisible({
      timeout: 15_000,
    });

    // Stats panel shows total complaints
    await expect(page.getByText("3").first()).toBeVisible({ timeout: 10_000 });

    // Pending complaints badge
    await expect(page.getByText("2").first()).toBeVisible({ timeout: 10_000 });
  });

  test("lista de reclamos muestra los casos pendientes", async ({ page }) => {
    await page.goto("/empresa");

    // Both complaint products should appear in the list
    await expect(
      page.getByText("Internet de fibra óptica").first()
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText("Telefonía fija").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("click en reclamo abre el detalle con el core_grievance", async ({
    page,
  }) => {
    await page.goto("/empresa");

    // Wait for complaints to load
    await expect(
      page.getByText("Internet de fibra óptica").first()
    ).toBeVisible({ timeout: 15_000 });

    // Click the first complaint card/row to expand detail
    await page.getByText("Internet de fibra óptica").first().click();

    // The core grievance text should be visible in the detail view
    await expect(
      page.getByText("Cobro indebido por servicio no prestado").first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("empresa puede seleccionar tipo de respuesta 'Aceptar reclamo'", async ({
    page,
  }) => {
    await page.goto("/empresa");

    await expect(
      page.getByText("Internet de fibra óptica").first()
    ).toBeVisible({ timeout: 15_000 });

    // Open the first complaint detail
    await page.getByText("Internet de fibra óptica").first().click();

    // Select "Aceptar reclamo" response type
    await expect(
      page.getByText("Aceptar reclamo").first()
    ).toBeVisible({ timeout: 10_000 });
    await page.getByText("Aceptar reclamo").first().click();

    // A textarea for the response message should appear
    await expect(
      page.getByPlaceholder(/Escrib|mensaje|Redact/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test("empresa envía respuesta y ve confirmación de éxito", async ({
    page,
  }) => {
    await page.goto("/empresa");

    await expect(
      page.getByText("Internet de fibra óptica").first()
    ).toBeVisible({ timeout: 15_000 });

    // Open complaint detail
    await page.getByText("Internet de fibra óptica").first().click();

    // Select response type
    await expect(page.getByText("Aceptar reclamo").first()).toBeVisible({
      timeout: 10_000,
    });
    await page.getByText("Aceptar reclamo").first().click();

    // Fill in the response message
    const textarea = page.getByPlaceholder(/Escrib|mensaje|Redact/i).first();
    await textarea.fill(
      "Aceptamos el reclamo. Procederemos al reembolso en los próximos 5 días hábiles."
    );

    // Submit the response
    const sendBtn = page.getByRole("button", { name: /Enviar respuesta/i });
    await expect(sendBtn).toBeEnabled({ timeout: 5_000 });
    await sendBtn.click();

    // Success confirmation should appear
    await expect(
      page.getByText(/respuesta enviada|enviado|éxito/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Empresa portal — registro de nueva empresa", () => {
  test("formulario de registro es visible para empresa no registrada", async ({
    page,
  }) => {
    // Override the default mock to return unregistered state
    await page.route("**/api/empresa", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            registered: false,
            suggestion: {
              type: "has_complaints",
              empresaName: "Telecom",
              complaintCount: 3,
              email: "atencion@telecom.com.ar",
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/empresa");

    // Registration form or suggestion banner should be shown
    await expect(
      page.getByText(/registr|reclamos esperan|Telecom/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("empresa puede completar el registro con nombre y email", async ({
    page,
  }) => {
    // Start unregistered, then return registered after POST
    let registered = false;

    await page.route("**/api/empresa", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            registered
              ? {
                  registered: true,
                  account: {
                    id: "company-uuid-1",
                    nombre_empresa: "Telecom",
                    nombre_normalizado: "telecom",
                    email_contacto: "atencion@telecom.com.ar",
                    pais: "AR",
                    activa: true,
                    created_at: "2026-01-01T00:00:00.000Z",
                  },
                  role: "admin",
                  stats: {
                    total: 3,
                    pendientes: 2,
                    resueltos: 1,
                    tasa_resolucion: 33,
                    monto_total_reclamado: 35000,
                  },
                  complaints: [],
                }
              : {
                  registered: false,
                  suggestion: null,
                }
          ),
        });
      } else if (route.request().method() === "POST") {
        registered = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            registered: true,
            account: {
              id: "company-uuid-1",
              nombre_empresa: "Telecom",
              email_contacto: "atencion@telecom.com.ar",
              pais: "AR",
              activa: true,
            },
            role: "admin",
            stats: { total: 3, pendientes: 2, resueltos: 1, tasa_resolucion: 33, monto_total_reclamado: 35000 },
            complaints: [],
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/empresa");

    // Find the registration form
    const nombreInput = page.getByPlaceholder(/Nombre|empresa/i).first();
    await expect(nombreInput).toBeVisible({ timeout: 15_000 });
    await nombreInput.fill("Telecom");

    // Fill email field
    const emailInput = page.getByPlaceholder(/email|correo/i).first();
    if (await emailInput.isVisible()) {
      await emailInput.fill("atencion@telecom.com.ar");
    }

    // Submit registration
    const submitBtn = page.getByRole("button", {
      name: /Registrar|Crear cuenta|Continuar/i,
    });
    await expect(submitBtn).toBeVisible({ timeout: 5_000 });
    await submitBtn.click();

    // After registration, dashboard shows company name
    await expect(page.getByText("Telecom").first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
