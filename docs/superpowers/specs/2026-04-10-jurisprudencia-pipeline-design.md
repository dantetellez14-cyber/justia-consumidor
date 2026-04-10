# Jurisprudencia Pipeline Design

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the Pinecone jurisprudencia index from 10 sample cases to 100+ real cases scraped from public legal sources, with a weekly automated pipeline that opens a PR for review before merging new cases.

**Architecture:** fetch+cheerio scrapes public AR/MX legal portals without a headless browser. Gemini normalizes raw legal text into our schema. `data/jurisprudencia.json` is the auditable source of truth in the repo. GitHub Actions runs the full pipeline weekly and opens a PR only when new cases are found.

**Tech Stack:** Node.js/TypeScript, tsx, cheerio, `@google/generative-ai` (already in project), `@pinecone-database/pinecone` (already in project), GitHub Actions, `gh` CLI for PR creation.

---

## 1. Architecture Overview

```
data/jurisprudencia.json                  ← source of truth (committed to repo)
       ↑
scripts/scrape-jurisprudencia.ts          ← fetch + cheerio, 3 public sources
       ↓
scripts/normalize-jurisprudencia.ts       ← Gemini fills hechos/ratio/fields
       ↓
scripts/seed-pinecone.ts (incremental)    ← diff JSON vs Pinecone, upsert deltas only
       ↑
.github/workflows/jurisprudencia-cron.yml ← weekly cron, opens PR with new cases
```

**Public sources to scrape:**
- 🇦🇷 **SAIJ** (`saij.gob.ar/busqueda/jurisprudencia`) — sumarios of Cámaras Comerciales and Civiles filtered by "consumidor" / "ley 24240". Returns paginated HTML with case summaries.
- 🇲🇽 **PROFECO resoluciones** (`profeco.gob.mx/juridica/resoluciones`) — HTML index of published resolutions with consumer protection rulings.
- 🇲🇽 **SCJN Tesis** (`sjf.scjn.gob.mx/sjfsist`) — tesis jurisprudenciales in consumer protection matters via their public search JSON API.

All three respond to plain `fetch` without JavaScript rendering — no headless browser needed.

---

## 2. Data Schema

**File:** `data/jurisprudencia.json` — array of `JurisprudenciaCaseExtended`.

**Updated type** (extends existing `JurisprudenciaCase` in `src/lib/types.ts`):

```typescript
// src/lib/types.ts — add alongside existing JurisprudenciaCase
export interface JurisprudenciaCaseExtended extends JurisprudenciaCase {
  // New fields
  categoria: JurisprudenciaCategoria;
  tribunal: string;
  fecha_resolucion: string;       // ISO date "YYYY-MM-DD"
  url_fuente: string;             // canonical URL of the source page
  texto_crudo: string;            // raw extracted text before normalization
  normalizado_por_ia: boolean;    // true when Gemini filled any field
}

export type JurisprudenciaCategoria =
  | "telecomunicaciones"
  | "electrodomesticos"
  | "viajes"
  | "banca"
  | "automotriz"
  | "ecommerce"
  | "servicios"
  | "otro";
```

**Deduplication key:** `expediente_id`. If a case with the same `expediente_id` already exists in `data/jurisprudencia.json`, the scraper skips it entirely.

**Pinecone metadata** stored per vector: all fields except `texto_crudo` (too large). `texto_crudo` stays only in the JSON file.

---

## 3. Scripts

### 3.1 `scripts/scrape-jurisprudencia.ts`

Responsibilities:
- Fetch paginated results from each of the 3 sources
- Extract raw case text + metadata (expediente_id, tribunal, fecha, url, país)
- Merge into `data/jurisprudencia.json` (append only, skip existing by `expediente_id`)
- Write cases with `normalizado_por_ia: false` and empty `hechos`/`ratio_decidendi` if text couldn't be parsed cleanly
- Exit with count of new cases found

Per-source extractors are isolated functions: `scrapeAR_SAIJ()`, `scrapeMX_PROFECO()`, `scrapeMX_SCJN()`. Each returns `JurisprudenciaCaseExtended[]`.

Rate limiting: 1 request per 2 seconds per source to avoid bans.

### 3.2 `scripts/normalize-jurisprudencia.ts`

Responsibilities:
- Read `data/jurisprudencia.json`
- Find all cases where `normalizado_por_ia: false` (not yet normalized)
- For each: send `texto_crudo` to Gemini with a structured prompt requesting JSON output:
  ```
  hechos, ratio_decidendi, categoria, probabilidad_exito (0.0–1.0), duracion_dias
  ```
- If Gemini returns valid JSON → update the case fields, set `normalizado_por_ia: true`
- If Gemini returns invalid/null `probabilidad_exito` → leave as `null`, flag for manual review
- Batch cases in groups of 5 to avoid rate limits
- Write updated `data/jurisprudencia.json`

Gemini prompt template (stored in `scripts/lib/normalize-prompt.ts`):
```
Eres un experto en derecho del consumidor de Argentina y México.
Dado el siguiente texto legal, extrae en JSON:
- hechos: string (resumen de los hechos del caso en ≤150 palabras)
- ratio_decidendi: string (fundamento legal de la decisión en ≤100 palabras)
- categoria: una de [telecomunicaciones, electrodomesticos, viajes, banca, automotriz, ecommerce, servicios, otro]
- probabilidad_exito: número entre 0 y 1 (probabilidad de éxito para el consumidor basado en el precedente)
- duracion_dias: número entero (duración estimada del proceso en días)

Texto: {texto_crudo}

Responde SOLO con JSON válido, sin texto adicional.
```

### 3.3 `scripts/seed-pinecone.ts` (incremental mode)

Add `--incremental` flag to existing script:
- In incremental mode: fetch all existing vector IDs from Pinecone with `index.listVectors()`
- Compare against `expediente_id`s in `data/jurisprudencia.json`
- Only embed + upsert cases not already in Pinecone
- Skip cases with `probabilidad_exito: null` (need manual review first)
- Log: `Skipped N (already indexed), Upserted M new, Skipped K (needs review)`

The existing non-incremental mode (no flag) remains unchanged for full re-seeds.

### 3.4 `scripts/lib/jurisprudencia-io.ts` (new shared helper)

```typescript
export function readJurisprudenciaJSON(): JurisprudenciaCaseExtended[]
export function writeJurisprudenciaJSON(cases: JurisprudenciaCaseExtended[]): void
export function mergeNewCases(
  existing: JurisprudenciaCaseExtended[],
  incoming: JurisprudenciaCaseExtended[]
): { merged: JurisprudenciaCaseExtended[]; newCount: number }
```

All three scripts use this helper to read/write the JSON file consistently.

---

## 4. `data/jurisprudencia.json` — Seed File

The existing 10 cases from `src/lib/jurisprudencia.ts` are migrated into `data/jurisprudencia.json` as the initial content, extended with the new fields (tribunal, fecha_resolucion, url_fuente, texto_crudo, normalizado_por_ia, categoria).

`src/lib/jurisprudencia.ts` is updated to import from the JSON file instead of hardcoding the array, so the static fallback always reflects what's in the repo.

---

## 5. GitHub Actions Workflow

**File:** `.github/workflows/jurisprudencia-cron.yml`

```yaml
name: Jurisprudencia Pipeline
on:
  schedule:
    - cron: '0 6 * * 1'   # Every Monday 6am UTC
  workflow_dispatch:        # Also triggerable manually

jobs:
  pipeline:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - checkout (fetch-depth: 0)
      - setup Node 22, npm ci
      - scrape:   npx tsx scripts/scrape-jurisprudencia.ts
      - normalize: npx tsx scripts/normalize-jurisprudencia.ts
      - seed:     npx tsx scripts/seed-pinecone.ts --incremental
      - check diff on data/jurisprudencia.json
      - if changed:
          - create branch jurisprudencia/YYYY-MM-DD
          - commit data/jurisprudencia.json
          - open PR via `gh pr create` with table of new cases in body
      - if unchanged:
          - echo "No new cases found, nothing to do"
```

**Required secrets:**
| Secret | Status | Purpose |
|--------|--------|---------|
| `PINECONE_API_KEY` | ✅ already exists | Upsert vectors |
| `GEMINI_API_KEY` | ✅ already exists | Normalize text |
| `GH_PAT` | ❌ new | Open PRs from Actions |

`GH_PAT` needs `repo` scope. Created in GitHub → Settings → Developer Settings → Personal Access Tokens.

---

## 6. npm Scripts

Add to `package.json`:
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

| Failure point | Behavior |
|---------------|----------|
| Source unreachable (HTTP error) | Log warning, skip that source, continue with others |
| Gemini API error on normalization | Keep case with `normalizado_por_ia: false`, log warning |
| Pinecone upsert fails | JSON already committed in PR — re-run `seed:jurisprudencia` manually |
| No new cases found | Workflow exits 0 silently, no PR opened |
| `probabilidad_exito: null` | Case excluded from Pinecone until manually reviewed and filled |

---

## 8. Testing

- **Unit tests** for `scripts/lib/jurisprudencia-io.ts` — mergeNewCases deduplication logic
- **Unit tests** for each source extractor (SAIJ, PROFECO, SCJN) with fixture HTML/JSON snapshots
- **Unit test** for the Gemini prompt parser — given mock Gemini response, verify field extraction
- **Integration test** for seed-pinecone incremental mode — mock Pinecone client, verify only delta vectors are upserted

Tests live in `src/__tests__/scripts/` following existing project conventions.

---

## 9. File Map

| Action | Path |
|--------|------|
| Create | `data/jurisprudencia.json` |
| Create | `scripts/scrape-jurisprudencia.ts` |
| Create | `scripts/normalize-jurisprudencia.ts` |
| Create | `scripts/lib/jurisprudencia-io.ts` |
| Create | `scripts/lib/normalize-prompt.ts` |
| Create | `.github/workflows/jurisprudencia-cron.yml` |
| Create | `src/__tests__/scripts/jurisprudencia-io.test.ts` |
| Create | `src/__tests__/scripts/scrape-saij.test.ts` |
| Create | `src/__tests__/scripts/scrape-profeco.test.ts` |
| Create | `src/__tests__/scripts/scrape-scjn.test.ts` |
| Create | `src/__tests__/scripts/normalize.test.ts` |
| Create | `src/__tests__/scripts/seed-incremental.test.ts` |
| Modify | `scripts/seed-pinecone.ts` (add `--incremental` flag) |
| Modify | `src/lib/types.ts` (add `JurisprudenciaCaseExtended`, `JurisprudenciaCategoria`) |
| Modify | `src/lib/jurisprudencia.ts` (import from JSON instead of hardcoding) |
| Modify | `package.json` (add pipeline scripts) |
