import { chromium } from "playwright";
import type { JurisprudenciaCaseExtended } from "../../../src/lib/types";

export async function scrapeMX_SCJN(
  maxPages = 3
): Promise<JurisprudenciaCaseExtended[]> {
  const results: JurisprudenciaCaseExtended[] = [];
  
  // Launch playwright
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  });
  
  try {
    const page = await context.newPage();
    console.log("[SCJN] Opening Buscador web...");
    await page.goto("https://bj.scjn.gob.mx/busqueda", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000); // Give WAF time to clear
    
    // Fill the search bar
    await page.fill("input[type='text'], input.search-input", "consumidor proteccion");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(8000); // Wait for results

    for (let p = 0; p < maxPages; p++) {
      console.log(`[SCJN] Scraping page ${p + 1}...`);
      
      const pageResults = await page.evaluate(() => {
        const arr: any[] = [];
        // The link we caught with AsuntoID
        const links = document.querySelectorAll("a[href*='AsuntoID=']");
        links.forEach(a => {
           let container = a.parentElement;
           // ascend to the boundary of this item card to grab the date and description
           for(let i=0; i<3; i++) {
               if(container && container.parentElement) container = container.parentElement;
           }
           arr.push({
               title: (a as HTMLElement).innerText.trim(),
               href: a.getAttribute('href') || '',
               text: (container as HTMLElement).innerText.trim()
           });
        });
        return arr;
      });

      if (pageResults.length === 0) {
        console.log(`[SCJN] No items found on page ${p + 1}, stopping`);
        break;
      }

      for (const res of pageResults) {
        // Build cases from the data
        const title = res.title || "SCJN Case";
        const content = res.text || "";
        const href = res.href.startsWith("http") ? res.href : `https://www2.scjn.gob.mx${res.href.replace('..','')}`;
        
        let fecha = new Date().toISOString().slice(0, 10);
        const matchFecha = content.match(/Fecha de resolución: (\d{2})\/(\d{2})\/(\d{4})/);
        if (matchFecha) {
           fecha = `${matchFecha[3]}-${matchFecha[2]}-${matchFecha[1]}`;
        }
        
        const tribunalMatch = content.match(/SALA/i) ? "SCJN SALA" : "SCJN";

        results.push({
          expediente_id: `SCJN-${title.slice(0, 60).replace(/\\s+/g, "-")}`,
          hechos: "",
          ratio_decidendi: "",
          probabilidad_exito: 0,
          duracion_dias: 0,
          pais: "MX",
          categoria: "otro",
          tribunal: tribunalMatch,
          fecha_resolucion: fecha,
          url_fuente: href,
          texto_crudo: content.slice(0, 2000),
          normalizado_por_ia: false,
        });
      }

      console.log(`[SCJN] Page ${p + 1} yielded ${pageResults.length} initial items`);
      
      // Click next page 'Ir a la página siguiente' or '›'
      if (p < maxPages - 1) {
         try {
             const nextBtnCount = await page.locator("text='›'").count();
             if (nextBtnCount === 0) break;
             await page.locator("text='›'").first().click();
             await page.waitForTimeout(4000);
         } catch(e) {
             break; // No next page or button not interactable
         }
      }
    }
    
  } catch (err) {
    console.warn(`[SCJN] Handled Error:`, err instanceof Error ? err.message : err);
  } finally {
    await browser.close();
  }

  console.log(`[SCJN] Total extracted: ${results.length}`);
  return results;
}
