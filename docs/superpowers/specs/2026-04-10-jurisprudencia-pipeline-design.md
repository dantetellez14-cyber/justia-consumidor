# Jurisprudencia Pipeline Design

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the Pinecone jurisprudencia index from 10 sample cases to 100+ real cases scraped from public legal sources (AR + MX), with a weekly automated pipeline that opens a PR for review before merging new cases.

**Architecture:** fetch+cheerio scrapes 10 public AR/MX legal portals without a headless browser. Gemini normalizes raw legal text into our schema. `data/jurisprudencia.json` is the auditable source of truth in the repo. GitHub Actions runs the full pipeline weekly and opens a PR only when new cases are found.

**Tech Stack:** Node.js/TypeScript, tsx, cheerio, `@google/generative-ai` (already in project), `@pinecone-database/pinecone` (already in project), GitHub Actions, `gh` CLI for PR creation.

---

## 1. Architecture Overview

```
data/jurisprudencia.json                  ← source of truth (committed to repo)
       ↑
scripts/scrape-jurisprudencia.ts          ← fetch + cheerio, 10 public sources
       ↓
scripts/normalize-jurisprudencia.ts       ← Gemini fills hechos/ratio/fields
       ↓
scripts/seed-pinecone.ts (incremental)    ← diff JSON vs Pinecone, upsert deltas only
       ↑
.github/workflows/jurisprudencia-cron.yml ← weekly cron, opens PR with new cases
```

**Public sources to scrape (10 total):**

🇦🇷 **Argentina:**
| Source | URL | Content |
|--------|-----|---------|
| **SAIJ** | `saij.gob.ar/busqueda/jurisprudencia` | 900k+ docs, filtrado por "relación de consumo" / "ley 24240". HTML paginado. |
| **DESCAjus** | `descajus.jusbaires.gob.ar` | Tribunal de Consumo CABA (desde 2021). Sentencias completas en PDF accesibles directamente. |
| **JURISTECA** | `juristeca.jusbaires.gob.ar` | Jurisprudencia curada GCBA, sección "Defensa del Consumidor". HTML libre. |
| **Justicia.ar / PJN** | `justicia.ar` | Cámara Nacional Comercial + Civil. Buscador de sentencias con filtros. |
| **Boletín Oficial** | `boletinoficial.gob.ar` | Disposiciones de sanción a empresas bajo Ley 24.240. JSON endpoints documentados, muy scrapeable. |
| **CSJN Suplemento** | `sj.csjn.gov.ar` | Fallos de la Corte Suprema curados por tema (banca, telecomunicaciones, garantías, etc.). |

🇲🇽 **México:**
| Source | URL | Content |
|--------|-----|---------|
| **SJF2** | `sjf2.scjn.gob.mx` | Tesis jurisprudenciales vinculantes — la fuente MX más estructurada. Permalink por ID numérico. |
| **Buscador SCJN** | `bj.scjn.gob.mx` | Sentencias completas del pleno y salas. Índice público de sentencias JSON. |
| **CJF/OAJ** | `ejusticia.cjf.gob.mx/BuscadorSISE` | Sentencias de juzgados y tribunales federales (amparo en consumo). Versión pública anonimizada. |
| **PROFECO datos abiertos** | `datos.profeco.gob.mx/datos_abiertos/quejas.php` | CSV/JSON estructurado de quejas por empresa y categoría. Base estadística para enriquecer metadatos. |

Todas responden a `fetch` simple sin renderizado JS — no se necesita Playwright.
Rate limiting: 1 request cada 2 segundos por fuente para evitar bloqueos.

---

## 2. Data Schema

**File:** `data/jurisprudencia.json` — array de `JurisprudenciaCaseExtended`.

**Tipo actualizado** (extiende `JurisprudenciaCase` existente en `src/lib/types.ts`):

```typescript
// src/lib/types.ts — agregar junto al JurisprudenciaCase existente
export interface JurisprudenciaCaseExtended extends JurisprudenciaCase {
  // Nuevos campos
  categoria: JurisprudenciaCategoria;
  tribunal: string;                   // "CNACom Sala A" | "PROFECO CDMX" | etc.
  fecha_resolucion: string;           // ISO date "YYYY-MM-DD"
  url_fuente: string;                 // URL canónica del caso
  texto_crudo: string;                // Texto original antes de normalizar (auditoría)
  normalizado_por_ia: boolean;        // true cuando Gemini completó algún campo
}

export type JurisprudenciaCategoria =
  // Comunicaciones y tecnología
  | "telefonia_movil"
  | "telefonia_fija"
  | "internet"
  | "television_paga"
  | "correo_y_paqueteria"
  // Servicios financieros
  | "banca"
  | "tarjetas_credito_debito"
  | "prestamos_y_creditos"
  | "seguros"
  | "fintech_y_billeteras_digitales"
  // Comercio
  | "ecommerce"
  | "electrodomesticos"
  | "electronica_y_celulares"
  | "indumentaria_y_calzado"
  | "alimentos_y_bebidas"
  | "muebles_y_hogar"
  // Transporte
  | "aerolineas"
  | "transporte_terrestre"
  | "automotriz_y_concesionarias"
  | "taller_mecanico"
  // Servicios públicos y utilities
  | "energia_electrica"
  | "gas"
  | "agua_y_saneamiento"
  // Salud
  | "medicina_prepaga_y_obra_social"
  | "farmacias_y_medicamentos"
  | "servicios_medicos"
  // Turismo y entretenimiento
  | "agencias_de_viaje"
  | "hoteles_y_alojamiento"
  | "streaming_y_entretenimiento"
  | "gimnasios_y_deporte"
  // Educación y servicios profesionales
  | "educacion"
  | "servicios_profesionales"
  // Inmobiliaria
  | "inmobiliaria_y_alquiler"
  | "construccion_y_refacciones"
  // Otros
  | "publicidad_enganosa"
  | "otro";
```

**Clave de deduplicación:** `expediente_id`. Si ya existe en `data/jurisprudencia.json`, el scraper lo saltea.

**Metadata Pinecone:** todos los campos excepto `texto_crudo` (demasiado grande). `texto_crudo` queda solo en el JSON del repo.

---

## 3. Scripts

### 3.1 `scripts/scrape-jurisprudencia.ts`

Responsabilidades:
- Fetch de resultados paginados de cada una de las 10 fuentes
- Extraer texto crudo + metadata (expediente_id, tribunal, fecha, url, país)
- Merge en `data/jurisprudencia.json` (append only, saltar existentes por `expediente_id`)
- Escribir casos con `normalizado_por_ia: false` y `hechos`/`ratio_decidendi` vacíos si el texto no es parseable limpio
- Salir con conteo de casos nuevos encontrados

Extractores por fuente aislados como funciones individuales:

**Argentina:**
- `scrapeAR_SAIJ()` — búsqueda paginada por "relacion de consumo", extrae sumarios
- `scrapeAR_DESCAjus()` — listado de sentencias del Tribunal de Consumo CABA
- `scrapeAR_JURISTECA()` — sección "Defensa del Consumidor", extrae HTML curado
- `scrapeAR_PJN()` — buscador Justicia.ar con filtro por materia comercial/civil
- `scrapeAR_BoletinOficial()` — endpoint JSON de disposiciones con palabra clave "consumidor"
- `scrapeAR_CSJN()` — suplemento "Usuarios y Consumidores" de la Secretaría de Jurisprudencia

**México:**
- `scrapeMX_SJF2()` — tesis por materia "consumidor" vía búsqueda HTML + permalink por ID
- `scrapeMX_SCJN()` — índice público de sentencias JSON filtrado por "consumidor"
- `scrapeMX_CJF()` — buscador OAJ/SISE, sentencias versión pública
- `scrapeMX_PROFECO()` — descarga CSV de quejas como base de metadatos estadísticos

Cada función retorna `JurisprudenciaCaseExtended[]`.

### 3.2 `scripts/normalize-jurisprudencia.ts`

Responsabilidades:
- Leer `data/jurisprudencia.json`
- Encontrar todos los casos donde `normalizado_por_ia: false`
- Para cada uno: enviar `texto_crudo` a Gemini con prompt estructurado pidiendo JSON:
  ```
  hechos, ratio_decidendi, categoria, probabilidad_exito (0.0–1.0), duracion_dias
  ```
- Si Gemini devuelve JSON válido → actualizar campos del caso, setear `normalizado_por_ia: true`
- Si `probabilidad_exito` es null/inválido → dejar como `null`, marcar para revisión manual
- Procesar en batches de 5 casos para evitar rate limits de Gemini
- Escribir `data/jurisprudencia.json` actualizado

Prompt de Gemini (en `scripts/lib/normalize-prompt.ts`):
```
Eres un experto en derecho del consumidor de Argentina y México.
Dado el siguiente texto legal, extrae en JSON con exactamente estas claves:
- hechos: string (resumen de los hechos del caso en ≤150 palabras)
- ratio_decidendi: string (fundamento legal de la decisión en ≤100 palabras)
- categoria: una de [telefonia_movil, telefonia_fija, internet, television_paga,
  correo_y_paqueteria, banca, tarjetas_credito_debito, prestamos_y_creditos,
  seguros, fintech_y_billeteras_digitales, ecommerce, electrodomesticos,
  electronica_y_celulares, indumentaria_y_calzado, alimentos_y_bebidas,
  muebles_y_hogar, aerolineas, transporte_terrestre, automotriz_y_concesionarias,
  taller_mecanico, energia_electrica, gas, agua_y_saneamiento,
  medicina_prepaga_y_obra_social, farmacias_y_medicamentos, servicios_medicos,
  agencias_de_viaje, hoteles_y_alojamiento, streaming_y_entretenimiento,
  gimnasios_y_deporte, educacion, servicios_profesionales, inmobiliaria_y_alquiler,
  construccion_y_refacciones, publicidad_enganosa, otro]
- probabilidad_exito: número entre 0.0 y 1.0 (null si no se puede determinar)
- duracion_dias: número entero estimado (null si no se puede determinar)

Texto: {texto_crudo}

Responde SOLO con JSON válido, sin texto adicional ni markdown.
```

### 3.3 `scripts/seed-pinecone.ts` (modo incremental)

Agregar flag `--incremental` al script existente:
- En modo incremental: obtener IDs existentes de Pinecone con `index.listVectors()`
- Comparar contra `expediente_id`s en `data/jurisprudencia.json`
- Solo embeder + upsertear casos que no estén ya en Pinecone
- Saltar casos con `probabilidad_exito: null` (necesitan revisión manual primero)
- Log: `Skipped N (already indexed), Upserted M new, Skipped K (needs manual review)`

El modo sin flag (full re-seed) queda sin cambios.

### 3.4 `scripts/lib/jurisprudencia-io.ts` (helper compartido nuevo)

```typescript
export function readJurisprudenciaJSON(): JurisprudenciaCaseExtended[]
export function writeJurisprudenciaJSON(cases: JurisprudenciaCaseExtended[]): void
export function mergeNewCases(
  existing: JurisprudenciaCaseExtended[],
  incoming: JurisprudenciaCaseExtended[]
): { merged: JurisprudenciaCaseExtended[]; newCount: number }
```

Los 3 scripts usan este helper para leer/escribir el JSON consistentemente.

---

## 4. `data/jurisprudencia.json` — Archivo inicial

Los 10 casos existentes en `src/lib/jurisprudencia.ts` se migran a `data/jurisprudencia.json` como contenido inicial, extendidos con los campos nuevos (`tribunal`, `fecha_resolucion`, `url_fuente`, `texto_crudo`, `normalizado_por_ia`, `categoria`).

`src/lib/jurisprudencia.ts` se actualiza para importar desde el JSON en vez de hardcodear el array, así el fallback estático siempre refleja lo que está en el repo.

---

## 5. GitHub Actions Workflow

**Archivo:** `.github/workflows/jurisprudencia-cron.yml`

```yaml
name: Jurisprudencia Pipeline
on:
  schedule:
    - cron: '0 6 * * 1'   # Lunes 6am UTC cada semana
  workflow_dispatch:        # También triggerable manualmente desde GitHub UI

jobs:
  pipeline:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - checkout (fetch-depth: 0)
      - setup Node 22, npm ci
      - scrape:    npx tsx scripts/scrape-jurisprudencia.ts
      - normalize: npx tsx scripts/normalize-jurisprudencia.ts
      - seed:      npx tsx scripts/seed-pinecone.ts --incremental
      - check diff on data/jurisprudencia.json
      - if changed:
          - create branch jurisprudencia/YYYY-MM-DD
          - commit data/jurisprudencia.json
          - open PR via `gh pr create` with table of new cases in body
      - if unchanged:
          - echo "No new cases found, nothing to do" and exit 0
```

**Secrets requeridos:**
| Secret | Estado | Propósito |
|--------|--------|-----------|
| `PINECONE_API_KEY` | ✅ ya existe | Upsertear vectores |
| `GEMINI_API_KEY` | ✅ ya existe | Normalizar texto crudo |
| `GH_PAT` | ❌ nuevo | Abrir PRs automáticos desde Actions |

**GH_PAT:** Token de acceso personal de GitHub con scope `repo`. Se crea en GitHub → foto de perfil → Settings → Developer Settings → Personal Access Tokens → New token (classic) → marcar `repo` → copiar → pegar como secreto `GH_PAT` en Settings del repo (igual que los otros secrets).

---

## 6. npm Scripts

Agregar a `package.json`:
```json
{
  "scripts": {
    "scrape:jurisprudencia": "npx tsx scripts/scrape-jurisprudencia.ts",
    "normalize:jurisprudencia": "npx tsx scripts/normalize-jurisprudencia.ts",
    "seed:jurisprudencia": "npx tsx scripts/seed-pinecone.ts --incremental",
    "pipeline:jurisprudencia": "npm run scrape:jurisprudencia && npm run normalize:jurisprudencia && npm run seed:jurisprudencia"
  }
}
```

---

## 7. Error Handling

| Punto de falla | Comportamiento |
|----------------|----------------|
| Fuente no responde (HTTP error) | Log warning, saltar esa fuente, continuar con las demás |
| Gemini API error en normalización | Mantener caso con `normalizado_por_ia: false`, log warning |
| Pinecone upsert falla | JSON ya commiteado en PR — re-correr `seed:jurisprudencia` manualmente |
| No hay casos nuevos | Workflow termina con exit 0, sin PR, sin ruido |
| `probabilidad_exito: null` | Caso excluido de Pinecone hasta revisión manual — queda en el JSON |
| Caso sin `texto_crudo` suficiente | Se guarda con campos vacíos para revisión, no bloquea el pipeline |

---

## 8. Testing

- **Unit tests** para `scripts/lib/jurisprudencia-io.ts` — lógica de deduplicación en `mergeNewCases`
- **Unit tests** para cada extractor de fuente con fixtures HTML/JSON snapshot de cada portal
- **Unit test** para el parser del prompt de Gemini — dada una respuesta mock de Gemini, verificar extracción de campos
- **Integration test** para seed-pinecone modo incremental — mock del cliente Pinecone, verificar que solo se upsertean vectores delta

Tests en `src/__tests__/scripts/` siguiendo las convenciones existentes del proyecto.

---

## 9. File Map

| Acción | Path |
|--------|------|
| Create | `data/jurisprudencia.json` |
| Create | `scripts/scrape-jurisprudencia.ts` |
| Create | `scripts/normalize-jurisprudencia.ts` |
| Create | `scripts/lib/jurisprudencia-io.ts` |
| Create | `scripts/lib/normalize-prompt.ts` |
| Create | `.github/workflows/jurisprudencia-cron.yml` |
| Create | `src/__tests__/scripts/jurisprudencia-io.test.ts` |
| Create | `src/__tests__/scripts/scrape-saij.test.ts` |
| Create | `src/__tests__/scripts/scrape-descajus.test.ts` |
| Create | `src/__tests__/scripts/scrape-sjf2.test.ts` |
| Create | `src/__tests__/scripts/normalize.test.ts` |
| Create | `src/__tests__/scripts/seed-incremental.test.ts` |
| Modify | `scripts/seed-pinecone.ts` (agregar flag `--incremental`) |
| Modify | `src/lib/types.ts` (agregar `JurisprudenciaCaseExtended`, `JurisprudenciaCategoria`) |
| Modify | `src/lib/jurisprudencia.ts` (importar desde JSON en vez de hardcodear) |
| Modify | `package.json` (agregar scripts del pipeline) |
