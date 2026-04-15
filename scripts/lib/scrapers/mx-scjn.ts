import { chromium, type Page } from "playwright";
import type { JurisprudenciaCaseExtended } from "../../../src/lib/types";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const SEARCH_URL = "https://bj.scjn.gob.mx/busqueda";
const SEARCH_QUERY = "consumidor proteccion LFPC PROFECO";
const MIN_TEXT_LEN = 400; // skip detail pages with less content than this

/** Strip SPA navigation chrome from the top of extracted text */
function cleanDetailText(raw: string): string {
  // Remove preamble up to and including the "Nota: Durante el proceso..." line
  const notaIdx = raw.indexOf("Nota: Durante el proceso de sistematización");
  if (notaIdx !== -1) {
    const afterNota = raw.indexOf("\n", notaIdx);
    if (afterNota !== -1) return raw.slice(afterNota).trim();
  }
  // Fallback: strip up to the first AMPARO/RECURSO/etc heading
  const match = raw.match(
    /(AMPARO|RECURSO|CONTROVERSIA|ACCIÓN DE INCONSTITUCIONALIDAD)/
  );
  if (match?.index && match.index > 50) {
    return raw.slice(match.index).trim();
  }
  return raw.trim();
}

/** Extract full judgment text from the current detail page */
async function extractDetailText(page: Page): Promise<string> {
  return page.evaluate(() => {
    // Ordered preference: specific bj.scjn.gob.mx DOM classes → generic fallback
    const selectors = [
      ".v-engroses__document--inner",
      ".v-engroses__document",
      ".v-engroses",
      ".documento-content",
      "app-detalle-expediente",
      "app-detalle-sentencia",
      "app-detalle",
      ".detalle-contenido",
      "article",
      "section",
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = (el as HTMLElement).innerText?.trim() ?? "";
        if (text.length > 400) return text;
      }
    }

    // Last resort: largest text block on the page (cap at 300K to avoid full DOM)
    const candidates = Array.from(document.querySelectorAll("div, section"));
    let best = "";
    for (const el of candidates) {
      const text = (el as HTMLElement).innerText?.trim() ?? "";
      if (text.length > best.length && text.length < 300_000) {
        best = text;
      }
    }
    return best;
  });
}

/** Dismiss any open Material autocomplete overlay */
async function dismissOverlay(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
  await sleep(400);
  // Click a neutral spot outside any dropdown
  try {
    await page.click("body", { position: { x: 10, y: 10 }, timeout: 1000 });
  } catch {
    // ignore — overlay may already be gone
  }
  await sleep(300);
}

/** Navigate to search page and wait for result links to appear */
async function goToSearch(page: Page, query: string): Promise<void> {
  await page.goto(SEARCH_URL, { waitUntil: "domcontentloaded" });
  await sleep(6000);

  const input = page.locator("input[placeholder='Buscar ...']");
  await input.fill(query);
  await sleep(800);
  await dismissOverlay(page);
  await input.press("Enter");
  await sleep(8000);
  await dismissOverlay(page);
}

/** Collect all result titles currently visible on the page */
async function collectResultTitles(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll("a[href='javascript:;']")
    );
    return links
      .map((a) => (a as HTMLElement).innerText.trim())
      .filter(
        (t) =>
          t.length > 5 &&
          /AMPARO|CONTROVERSIA|ACCIÓN|REVISIÓN|RECURSO|INCONSTITUCIONALIDAD/i.test(
            t
          )
      );
  });
}

/** Navigate to a specific search results page (1-indexed) */
async function goToSearchPage(page: Page, query: string, targetPage: number): Promise<void> {
  await goToSearch(page, query);
  for (let p = 1; p < targetPage; p++) {
    try {
      const nextBtn = page.locator("text='›'").first();
      if (!(await nextBtn.isVisible({ timeout: 2000 }))) break;
      await nextBtn.click({ timeout: 5000 });
      await sleep(6000);
      await dismissOverlay(page);
    } catch {
      break;
    }
  }
}

export async function scrapeMX_SCJN(
  maxCases = 20
): Promise<JurisprudenciaCaseExtended[]> {
  const results: JurisprudenciaCaseExtended[] = [];
  const seenIds = new Set<string>();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  });

  try {
    const page = await context.newPage();
    console.log("[SCJN] Loading Buscador Jurídico...");
    await goToSearch(page, SEARCH_QUERY);

    // Collect all titles with the page they appear on
    const allTitles: Array<{ title: string; searchPage: number }> = [];
    let pageNum = 0;

    while (allTitles.length < maxCases) {
      pageNum++;
      const titles = await collectResultTitles(page);
      if (titles.length === 0) {
        console.log(`[SCJN] No results on page ${pageNum}, stopping.`);
        break;
      }
      console.log(`[SCJN] Page ${pageNum}: found ${titles.length} case titles`);
      for (const t of titles) {
        if (!allTitles.some((x) => x.title === t)) {
          allTitles.push({ title: t, searchPage: pageNum });
        }
      }

      if (allTitles.length >= maxCases) break;

      // Try to go to next page
      try {
        const nextBtn = page.locator("text='›'").first();
        const visible = await nextBtn.isVisible({ timeout: 2000 });
        if (!visible) break;
        await nextBtn.click({ timeout: 5000 });
        await sleep(6000);
        await dismissOverlay(page);
      } catch {
        break;
      }
    }

    const titlesToProcess = allTitles.slice(0, maxCases);
    console.log(`[SCJN] Will visit ${titlesToProcess.length} case detail pages`);

    // Visit each case: navigate to the correct search page, JS-click, extract
    for (let i = 0; i < titlesToProcess.length; i++) {
      const { title, searchPage } = titlesToProcess[i];
      const expediente_id = `SCJN-${title.replace(/\s+/g, " ").trim().slice(0, 80)}`;

      if (seenIds.has(expediente_id)) continue;

      console.log(`[SCJN] Case ${i + 1}/${titlesToProcess.length}: ${title.slice(0, 60)}`);

      // Navigate to the search page where this title appears
      await goToSearchPage(page, SEARCH_QUERY, searchPage);

      // JS-click the link matching this title (bypasses overlay)
      const clicked = await page.evaluate((targetTitle: string) => {
        const links = Array.from(
          document.querySelectorAll("a[href='javascript:;']")
        );
        for (const link of links) {
          if ((link as HTMLElement).innerText.trim() === targetTitle) {
            (link as HTMLElement).click();
            return true;
          }
        }
        return false;
      }, title);

      if (!clicked) {
        console.log(`[SCJN]   Could not find link for "${title.slice(0, 40)}", skipping`);
        continue;
      }

      // Wait for the SPA to render the detail view
      await sleep(7000);

      // Try clicking the "Contenido" tab — some cases need it to load text
      try {
        const contenidoTab = page.locator("text='Contenido'").first();
        if (await contenidoTab.isVisible({ timeout: 2000 })) {
          await contenidoTab.click({ timeout: 3000 });
          await sleep(3000);
        }
      } catch {
        // tab not present or already active — continue
      }

      const rawText = await extractDetailText(page);
      const cleaned = cleanDetailText(rawText);
      const texto_crudo = cleaned.slice(0, 5000);

      if (texto_crudo.length < MIN_TEXT_LEN) {
        console.log(`[SCJN]   Insufficient text (${texto_crudo.length} chars), skipping`);
        continue;
      }

      // Parse date from text — try both DD/MM/YYYY and "DD de MES de YYYY"
      let fecha_resolucion = new Date().toISOString().slice(0, 10);
      const numericDate = texto_crudo.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (numericDate) {
        fecha_resolucion = `${numericDate[3]}-${numericDate[2]}-${numericDate[1]}`;
      } else {
        const MESES: Record<string, string> = {
          enero: "01", febrero: "02", marzo: "03", abril: "04",
          mayo: "05", junio: "06", julio: "07", agosto: "08",
          septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
        };
        const spanishDate = texto_crudo.match(
          /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i
        );
        if (spanishDate) {
          const day = spanishDate[1].padStart(2, "0");
          const month = MESES[spanishDate[2].toLowerCase()] ?? "01";
          fecha_resolucion = `${spanishDate[3]}-${month}-${day}`;
        }
      }

      const tribunal = /SEGUNDA SALA|PRIMERA SALA/i.test(texto_crudo)
        ? "SCJN"
        : /PLENO/i.test(texto_crudo)
        ? "SCJN PLENO"
        : "SCJN";

      seenIds.add(expediente_id);
      results.push({
        expediente_id,
        hechos: "",
        ratio_decidendi: "",
        probabilidad_exito: 0,
        duracion_dias: 0,
        pais: "MX",
        categoria: "otro",
        tribunal,
        fecha_resolucion,
        url_fuente: SEARCH_URL,
        texto_crudo,
        normalizado_por_ia: false,
      });

      console.log(`[SCJN]   ✓ ${texto_crudo.length} chars extracted`);
    }
  } catch (err) {
    console.warn(
      "[SCJN] Fatal error:",
      err instanceof Error ? err.message : err
    );
  } finally {
    await browser.close();
  }

  console.log(`[SCJN] Total cases with full text: ${results.length}`);
  return results;
}
