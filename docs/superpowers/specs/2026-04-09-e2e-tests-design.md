# E2E Tests — Playwright + MSW

> Spec para la suite de tests end-to-end de JustIA Consumidor.
> Fecha: 2026-04-09

---

## Objetivo

Cubrir los 2 flujos críticos de la app con tests automatizados que corren en GitHub Actions en cada PR/push a `main`. Todas las dependencias externas (Clerk auth, Gemini IA, Resend email) son mockeadas — no se gasta tokens ni se requieren credenciales de servicios en CI.

---

## Stack

| Herramienta | Rol |
|-------------|-----|
| `@playwright/test` | Runner, assertions, browser automation |
| `msw` v2 | Intercepta fetch requests en el browser (Service Worker) |
| `@clerk/testing/playwright` | Helpers oficiales: `clerkSetup`, `setupClerkTestingToken` |

Solo Chromium en CI para velocidad. Local puede usar todos los browsers.

---

## Estructura de archivos

```
e2e/
  fixtures/
    analysis.ts         # Respuesta mockeada de Gemini (CaseAnalysis fijo)
    cases.ts            # Lista de casos mockeada para /api/cases
  mocks/
    handlers.ts         # MSW handlers para todas las API routes
    worker.ts           # MSW service worker setup (browser)
  flows/
    consumer-flow.spec.ts   # Flujo completo consumidor (5 tests)
    auth-flow.spec.ts       # Sign-in y mis-casos (3 tests)
playwright.config.ts
public/mockServiceWorker.js  # Auto-generado por `msw init`
.github/workflows/e2e.yml
```

---

## MSW Handlers (`e2e/mocks/handlers.ts`)

Cuatro endpoints mockeados:

| Endpoint | Mock response |
|----------|--------------|
| `POST /api/analyze` | `CaseAnalysis` fijo: empresa "Telecom", probabilidad_exito 0.75, pais "AR" |
| `POST /api/cases` | `{ id: "test-case-uuid", status: "consulta_recibida", ...validCase }` |
| `GET /api/cases` | Array con 2 casos de prueba |
| `POST /api/send-complaint` | `{ success: true, message: "Reclamo enviado exitosamente." }` |

Clerk auth se maneja con `@clerk/testing` — no necesita MSW handler.

---

## Tests

### `consumer-flow.spec.ts` — Flujo consumidor (5 tests)

1. **Formulario → análisis IA**: Usuario no autenticado completa el formulario con un relato, hace submit, y ve el panel de análisis con empresa "Telecom" y la probabilidad de éxito.

2. **Análisis → genera carta**: Desde el análisis, hace click en "Generar carta de reclamo" y el texto de la carta aparece en pantalla.

3. **Envía email a empresa** *(requiere auth)*: Usuario autenticado ingresa email de empresa y nombre, hace click en "Enviar reclamo", y ve el mensaje de éxito.

4. **Caso queda en tracking**: Después de enviar, el paso avanza a "tracking" y muestra el estado del caso.

5. **Feedback**: El usuario puede seleccionar un rating y enviarlo — aparece confirmación de feedback enviado.

### `auth-flow.spec.ts` — Flujo auth (3 tests)

1. **Redirect sin auth**: Usuario no autenticado navega a `/mis-casos` y es redirigido a la página de sign-in.

2. **Lista de casos autenticado**: Usuario autenticado navega a `/mis-casos` y ve la lista con los 2 casos mockeados.

3. **Detalle de caso**: Hace click en un caso y ve su detalle (empresa, status, fecha).

---

## GitHub Actions (`/.github/workflows/e2e.yml`)

```yaml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
        env:
          # Clerk (build only — no real auth in tests)
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
          # Supabase (build only — MSW intercepts all API calls)
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SECRET_KEY: ${{ secrets.SUPABASE_SECRET_KEY }}
      - run: npm run start &
      - run: npx playwright test
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

GitHub Secrets requeridos:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY`

Gemini, Resend y Upstash **no son necesarios** — todas sus rutas están mockeadas por MSW.

---

## Archivos impactados

| Archivo | Accion |
|---------|--------|
| `e2e/fixtures/analysis.ts` | Crear |
| `e2e/fixtures/cases.ts` | Crear |
| `e2e/mocks/handlers.ts` | Crear |
| `e2e/mocks/worker.ts` | Crear |
| `e2e/flows/consumer-flow.spec.ts` | Crear |
| `e2e/flows/auth-flow.spec.ts` | Crear |
| `playwright.config.ts` | Crear |
| `public/mockServiceWorker.js` | Auto-generado por `msw init public` |
| `.github/workflows/e2e.yml` | Crear |
| `package.json` | Agregar devDependencies y script `test:e2e` |

Ningun archivo existente `.ts`/`.tsx` de la app se modifica.
