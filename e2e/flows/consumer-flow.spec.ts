import { test, expect, type Page } from "@playwright/test";
import { mockAnalysis } from "../fixtures/analysis";

// Helper: navigate from welcome to the analyze form and submit it
async function fillAndSubmitForm(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Comenzar tu reclamo" }).click();

  // Fill required fields
  await page
    .getByPlaceholder('Ej: Smart TV Samsung 55" 4K')
    .fill("Internet de fibra óptica");
  await page
    .getByPlaceholder("Ej: MercadoLibre, Movistar, Samsung...")
    .fill("Telecom");
  await page
    .getByPlaceholder(
      "Describí qué pasó con el producto o servicio. Cuanto más detalle, mejor podremos analizar tu caso..."
    )
    .fill(
      "Llevo 3 meses con cortes de internet diarios y velocidad por debajo de lo contratado."
    );

  await page.getByRole("button", { name: "Analizar mi caso" }).click();
}

test.describe("Consumer flow", () => {
  test("formulario → analisis IA muestra empresa y probabilidad de éxito", async ({
    page,
  }) => {
    await fillAndSubmitForm(page);

    // Results step should show "Telecom" from mock analysis
    await expect(page.getByText("Telecom").first()).toBeVisible({
      timeout: 15_000,
    });

    // Probability is displayed as "75%" (0.75 * 100 rounded)
    await expect(page.getByText("75%").first()).toBeVisible({ timeout: 10_000 });
  });

  test("analisis → genera carta de reclamo con texto NOTA DE RECLAMO FORMAL", async ({
    page,
  }) => {
    await fillAndSubmitForm(page);

    // Wait for results and click to generate formal complaint
    await expect(
      page.getByRole("button", { name: "Generar mi reclamo formal" })
    ).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Generar mi reclamo formal" }).click();

    // Complaint generator renders the formal letter text in a <pre> block
    await expect(page.getByText("NOTA DE RECLAMO FORMAL")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Telecom").first()).toBeVisible();
  });

  test("usuario envía reclamo a empresa → mensaje de éxito", async ({
    page,
  }) => {
    await fillAndSubmitForm(page);

    await expect(
      page.getByRole("button", { name: "Generar mi reclamo formal" })
    ).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Generar mi reclamo formal" }).click();

    // Fill in the three fields required to reveal the "Enviar a la empresa" button
    await page.getByPlaceholder("Juan Pérez").fill("María González");
    await page.getByPlaceholder("juan@email.com").fill("maria@example.com");
    // Company email placeholder is dynamic: "atencion@telecom.com"
    await page
      .getByPlaceholder(/atencion@telecom/i)
      .fill("atencion@telecom.com.ar");

    // Send button becomes visible once all three inputs have values
    await expect(
      page.getByRole("button", { name: "Enviar a la empresa" })
    ).toBeVisible({ timeout: 5_000 });
    await page.getByRole("button", { name: "Enviar a la empresa" }).click();

    // MSW mock returns { success: true, message: "Reclamo enviado exitosamente." }
    await expect(
      page.getByText("Reclamo enviado exitosamente.")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("tras enviar reclamo, el paso avanza a tracking (Seguimiento del Caso)", async ({
    page,
  }) => {
    await fillAndSubmitForm(page);

    // results → complaint
    await expect(
      page.getByRole("button", { name: "Generar mi reclamo formal" })
    ).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Generar mi reclamo formal" }).click();

    // complaint → arbitration via the "Si la empresa no responde…" button
    await expect(
      page.getByRole("button", {
        name: /Si la empresa no responde, solicitar mediaci/i,
      })
    ).toBeVisible({ timeout: 10_000 });
    await page
      .getByRole("button", {
        name: /Si la empresa no responde, solicitar mediaci/i,
      })
      .click();

    // arbitration: select a radio and request evaluation
    await page.getByText("Sin respuesta").click();
    await page
      .getByRole("button", { name: "Solicitar Evaluación Imparcial" })
      .click();

    // Wait for the 2.5 s AI deliberation simulation, then proceed to tracking
    await expect(
      page.getByRole("button", { name: /Ver seguimiento de mi caso/i })
    ).toBeVisible({ timeout: 10_000 });
    await page
      .getByRole("button", { name: /Ver seguimiento de mi caso/i })
      .click();

    // Tracking step renders "Seguimiento del Caso"
    await expect(page.getByText("Seguimiento del Caso")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("usuario puede dejar feedback con rating → confirmación de envío", async ({
    page,
  }) => {
    await fillAndSubmitForm(page);

    // Wait for analysis results to appear
    await expect(page.getByText(mockAnalysis.empresa)).toBeVisible({ timeout: 15_000 });

    // results → tracking: "Ver mis opciones" skips complaint and goes straight to tracking
    await expect(
      page.getByRole("button", { name: "Ver mis opciones" })
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Ver mis opciones" }).click();

    // Tracking step: click "Finalizar y dar feedback"
    await expect(
      page.getByRole("button", { name: /Finalizar y dar feedback/i })
    ).toBeVisible({ timeout: 10_000 });
    await page
      .getByRole("button", { name: /Finalizar y dar feedback/i })
      .click();

    // Feedback step is now visible
    await expect(page.getByText("¿Te resultó útil la plataforma?")).toBeVisible({
      timeout: 10_000,
    });

    // Click the 4th star — motion.button renders as button inside a wrapper span/div
    // Use force:true to bypass animation state checks
    const starButtons = page.locator("div.flex.justify-center.gap-2").getByRole("button");
    await starButtons.nth(3).click({ force: true }); // 0-indexed → 4th star

    // Wait for button to become enabled after rating is set
    const submitBtn = page.getByRole("button", { name: "Enviar Feedback" });
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // After submission the thanks screen appears
    await expect(
      page.getByText("¡Gracias por tu feedback!")
    ).toBeVisible({ timeout: 10_000 });
  });
});
