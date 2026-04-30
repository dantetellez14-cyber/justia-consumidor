# JustIA Consumidor - Resumen Completo de Sesiones

> Documento de referencia para continuar el desarrollo en una nueva sesion.
> Ultima actualizacion: 29 de abril de 2026

---

## 1. Descripcion del Proyecto

**JustIA Consumidor** es una plataforma ODR (Online Dispute Resolution) potenciada por IA para resolver disputas de consumidores en Argentina y Mexico. Permite a los consumidores:

1. Relatar su problema en lenguaje natural
2. Obtener un analisis legal automatizado con probabilidad de exito
3. Generar un reclamo formal
4. Enviarlo a la empresa
5. Recibir respuestas de la empresa (con dialogo bidireccional)
6. Escalar ante organismos oficiales (PROFECO en Mexico, COPREC en Argentina)
7. Exportar reporte PDF completo del caso

---

## 2. Stack Tecnologico

| Capa | Tecnologia | Detalle |
|------|-----------|---------|
| Framework | Next.js 16.2.2 | App Router, React 19.2.4 |
| Lenguaje | TypeScript | Strict mode |
| Auth | Clerk v7 | Dual role (consumer + empresa) |
| Base de datos | Supabase PostgreSQL | RLS activo + service_role para servidor |
| Cache servidor | Upstash Redis | TTL-based, in-memory fallback |
| Cache cliente | SWR | stale-while-revalidate |
| Rate limiting | Upstash Ratelimit | Sliding window, in-memory fallback |
| Email | Resend | Transaccional, templates HTML |
| IA | Google Gemini 2.0 Flash | @google/generative-ai |
| Vector DB | Pinecone | Jurisprudencia embeddings |
| Pagos | Stripe | Suscripciones empresa (Pro plan) |
| Analytics | PostHog | Con cookie consent |
| Errores | Sentry | @sentry/nextjs |
| Estilos | Tailwind CSS v4 | + Framer Motion |
| 3D / Hero | Spline + Three.js | Welcome hero |
| Iconos | Lucide React | |
| Validacion | Zod v4 | .strict() en APIs |
| Charts | Recharts | Financial metrics |
| PDF | Generacion server-side | Reporte de caso |
| Testing unit | Vitest 4 | 23 archivos |
| Testing E2E | Playwright + MSW | 3 flows (auth, consumer, empresa) |
| PWA | Service worker | Cache version inyectado por git hash |

---

## 3. Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                    # Home (refactor: split de 593 lineas en modulos)
│   ├── layout.tsx                  # Root (Clerk, PostHog, Sentry, MSW)
│   ├── error.tsx / global-error.tsx
│   ├── not-found.tsx / loading.tsx
│   ├── offline/                    # PWA offline page
│   ├── opengraph-image.tsx / sitemap.ts / robots.ts
│   ├── admin/                      # Panel admin (protegido a nivel proxy)
│   ├── empresa/                    # Portal empresa (dashboard, billing, plan)
│   ├── empresas/                   # Listado publico / brand matching
│   ├── mis-casos/                  # Casos del consumidor
│   ├── notificaciones/             # Centro de notificaciones in-app
│   ├── pro/                        # Landing del plan Pro
│   ├── privacidad/ terminos/
│   ├── sign-in/ sign-up/           # Clerk
│   └── api/
│       ├── admin/                  # Endpoints admin
│       ├── analyze/                # Analisis IA (Gemini 2.0 Flash)
│       ├── arbitrate/              # Evaluacion arbitral IA
│       ├── cases/                  # CRUD casos + responses anidadas
│       ├── complaint-stats/        # Estadisticas (cache 1h)
│       ├── cron/                   # Jobs programados
│       ├── empresa/                # Portal empresa (GET/POST/PUT)
│       ├── empresa/respond/        # Respuesta empresa a reclamo
│       ├── empresas/               # Brand matching / listado
│       ├── feedback/
│       ├── jurisprudencia-fallback/
│       ├── notifications/          # In-app notifications
│       ├── search-jurisprudencia/  # Cache 24h
│       ├── send-complaint/
│       └── stripe/                 # Checkout + webhook
├── components/
│   ├── app-header.tsx
│   ├── arbitration-module.tsx
│   ├── case-tracker.tsx
│   ├── company-response-card.tsx
│   ├── complaint-form.tsx / complaint-form-data.ts
│   ├── complaint-generator.tsx
│   ├── complaint-stats-panel.tsx
│   ├── cookie-consent-banner.tsx
│   ├── escalation-module.tsx
│   ├── extracted-entities.tsx
│   ├── feedback-rating.tsx
│   ├── financial-chart.tsx
│   ├── footer-metrics.tsx
│   ├── formula-modal.tsx
│   ├── jurisprudencia-list.tsx
│   ├── loading-animation.tsx
│   ├── login-prompt-modal.tsx
│   ├── message-thread.tsx          # Chat bidireccional consumidor ↔ empresa
│   ├── msw-provider.tsx            # Mock Service Worker (E2E)
│   ├── notification-bell.tsx
│   ├── posthog-provider.tsx
│   ├── pwa-register.tsx
│   ├── recommendation-alert.tsx
│   ├── reputation-score-badge.tsx
│   ├── ui/                         # Primitivos
│   └── welcome-hero.tsx
├── lib/
│   ├── cache.ts
│   ├── cases-client.ts / cases-utils.ts
│   ├── complaint-document.ts
│   ├── complaint-stats.ts
│   ├── email/                      # Templates HTML
│   ├── empresa.ts / empresa-matcher.ts
│   ├── escalation.ts
│   ├── jurisprudencia.ts
│   ├── logger.ts                   # Pino
│   ├── msw-init.ts
│   ├── notifications.ts
│   ├── pdf-report.ts               # Export PDF de caso
│   ├── pinecone.ts
│   ├── posthog.ts
│   ├── providers/
│   ├── rate-limit.ts
│   ├── reputation-score.ts
│   ├── scoring.ts
│   ├── stripe.ts                   # Cliente Stripe + helpers
│   ├── supabase.ts
│   ├── swr.ts
│   ├── track-tokens.ts             # Tracking de uso de IA
│   ├── types.ts
│   ├── utils.ts
│   └── validations.ts
└── __tests__/                      # Vitest
    ├── api/
    │   ├── analyze.test.ts
    │   ├── cases.test.ts
    │   ├── empresa-respond.test.ts
    │   ├── feedback.test.ts
    │   ├── search-jurisprudencia.test.ts
    │   └── send-complaint.test.ts
    ├── scripts/                    # Tests de pipeline jurisprudencia
    │   ├── jurisprudencia-io.test.ts
    │   ├── normalize-prompt.test.ts
    │   ├── scraper-ar-boletin.test.ts
    │   ├── scraper-ar-saij.test.ts
    │   ├── scraper-mx-sjf2.test.ts
    │   └── seed-incremental.test.ts
    ├── cache.test.ts
    ├── company-response-card.test.ts
    ├── email-templates.test.ts
    ├── empresa.test.ts
    ├── escalation.test.ts
    ├── jurisprudencia.test.ts
    ├── notifications.test.ts
    ├── rate-limit.test.ts
    ├── reputation-score.test.ts
    ├── scoring.test.ts
    └── validations.test.ts

e2e/                                # Playwright
├── flows/
│   ├── auth-flow.spec.ts
│   ├── consumer-flow.spec.ts
│   └── empresa-flow.spec.ts
├── fixtures/ mocks/ global-setup.ts

scripts/
├── inject-sw-version.js            # PWA cache version (prebuild)
├── generate-pwa-icons.mjs
├── scrape-jurisprudencia.ts        # Pipeline: scrape → normalize → seed
├── normalize-jurisprudencia.ts
├── seed-pinecone.ts
├── scrape-scjn-bulk.ts / run-ar-sanciones.ts / run-ingest-local.ts
├── migrate-json-to-supabase.ts
├── verify-existing-companies.ts
└── lib/ python/ fleet/

supabase/migrations/                # Migraciones SQL versionadas
├── 20260408_empresa_verification.sql
├── 20260409_rls_policies.sql
├── 20260416_jurisprudencia_cases.sql
├── 20260417_consumer_responses.sql
├── 20260417_notifications.sql
├── 20260424_user_analytics.sql
├── 20260427_empresa_billing.sql
└── 20260427_empresa_billing_hardening.sql
```

---

## 4. Tablas de Base de Datos (Supabase)

| Tabla | Proposito |
|-------|----------|
| `cases` | Casos de reclamo (user_id, relato, empresa, status, analisis) |
| `company_accounts` | Cuentas empresa (con billing, plan, stripe_customer_id) |
| `company_users` | Vinculo Clerk ↔ empresa (rol: admin/operador/lectura) |
| `company_responses` | Respuestas de empresa a casos |
| `consumer_responses` | Respuestas del consumidor (dialogo bidireccional) |
| `feedback` | Feedback de usuarios |
| `notifications` | Notificaciones in-app |
| `jurisprudencia_cases` | Casos de jurisprudencia normalizados |
| `user_analytics` | Tracking de uso |

### Tipos de respuesta empresa (`company_responses.tipo_respuesta`)
- `aceptar` — caso pasa a "resuelto"
- `rechazar` — caso pasa a "en_mediacion"
- `propuesta` — propuesta con monto, caso a "en_mediacion"
- `solicitar_info` — solicita informacion adicional

### Estados de caso (`cases.status`)
1. `consulta_recibida`
2. `reclamo_generado`
3. `enviado_empresa`
4. `en_mediacion`
5. `resuelto`

### RLS
Activado via migracion `20260409_rls_policies.sql`. El servidor sigue usando `SUPABASE_SECRET_KEY` (service_role) en API routes, pero RLS protege accesos directos con anon key como capa de defensa adicional.

---

## 5. Funcionalidades Completadas

### 5.1 Flujo Principal del Consumidor
- Relato en lenguaje natural → analisis IA (Gemini 2.0 Flash)
- Extraccion de entidades (empresa, producto, monto, fecha)
- Calculo de probabilidad de exito y analisis legal por pais (AR/MX)
- Busqueda de jurisprudencia con Pinecone
- Generacion de reclamo formal y envio por email (Resend)
- Evaluacion arbitral IA (`/api/arbitrate`)
- Generacion de documento de escalamiento (PROFECO/COPREC)
- Timeline visual del caso (CaseTracker)
- Rating y feedback
- **Exportar reporte PDF completo del caso** desde la pagina de seguimiento

### 5.2 Portal Empresa
- Auto-deteccion por dominio de email (filtro de proveedores genericos)
- Registro / vinculacion (claim) de empresa existente
- Dashboard con estadisticas (casos pendientes, resueltos, tiempo promedio)
- Brand matching para identificar la empresa correcta
- Sistema de respuesta a reclamos (4 tipos)
- Historial de respuestas previas por caso
- **Billing con Stripe**: plan dashboard, suscripcion al plan Pro
- Webhook Stripe + hardening contra abuso

### 5.3 Notificaciones (Email + In-App)
- **Email bidireccional** (Resend, fire-and-forget):
  - Consumidor → Empresa al enviar reclamo
  - Empresa → Consumidor al responder
  - Templates HTML color-coded
- **Notificaciones in-app**:
  - Tabla `notifications`, endpoint `/api/notifications`
  - Componente `notification-bell` con badge
  - Pagina `/notificaciones` con feed completo

### 5.4 Visibilidad y Dialogo Bidireccional
- API `/api/cases` incluye `company_responses` y `consumer_responses` via Supabase join
- Componente `CompanyResponseCard` con badges color-coded
- Componente `MessageThread` para chat bidireccional consumidor ↔ empresa
- `CaseTracker` refleja respuestas y resoluciones en timeline
- `/mis-casos` con indicador de respuestas, tarjetas expandibles

### 5.5 Seguridad
- **Caching multi-capa**: Redis + Cache-Control + SWR
- **Rate limiting**: Upstash sliding window en todos los endpoints
- **Validacion Zod** `.strict()`
- **RLS Supabase activo** (migracion 20260409)
- **Auth guards** en API routes (Clerk)
- **Anti ilike-injection** en busquedas
- **Proteccion `/admin` a nivel proxy** (redirect non-admin)
- **503 explicito** en errores de quota/auth (sin fallback demo silencioso)
- **Cookie consent**: PostHog solo se inicializa con consentimiento
- **Sin secretos en codigo**: env vars

### 5.6 PWA
- Service worker con cache version auto-inyectada por git hash en `prebuild`
- `pwa-register.tsx` para registro
- Pagina `/offline`
- Manifest e iconos generados (`generate-pwa-icons.mjs`)
- Network-first para HTML (evita blank pages por cache stale)

### 5.7 Mobile / Responsive
- Audit completo de breakpoints, tap targets, overflow
- Sidebar oculto en mobile en seguimiento, layout flex-col
- Optimizaciones para pantallas <390px

### 5.8 Pipeline de Jurisprudencia
- Scrapers para SAIJ (AR), Boletin Oficial (AR), SJF2 (MX), SCJN bulk
- Normalizacion con prompt LLM
- Seed incremental a Pinecone
- Tabla `jurisprudencia_cases` en Supabase
- Comando: `npm run pipeline:jurisprudencia`

### 5.9 Testing
- **Unit (Vitest)**: 23 archivos cubriendo lib, API routes, components, scripts
- **E2E (Playwright + MSW)**: 3 flows (auth, consumer, empresa)
- `test:e2e` script + `global-setup.ts`

---

## 6. Variables de Entorno Necesarias

> No commitear valores reales. Mantener un `.env.example` con placeholders.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Google Gemini AI
GEMINI_API_KEY=

# Pinecone Vector DB
PINECONE_API_KEY=
PINECONE_INDEX=

# Upstash Redis (Rate Limiting + Cache)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Stripe (Billing empresa)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID_PRO=

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Admin (proxy guard)
ADMIN_USER_IDS=

# App
NEXT_PUBLIC_APP_URL=

# Dev tools (NUNCA commitear valores reales)
FIRECRAWL_API_KEY=
```

---

## 7. Pendientes por Prioridad

### ALTO

#### 7.1 Verificacion de Empresa (claim)
- **Estado**: existe migracion `20260408_empresa_verification.sql` y script `verify-existing-companies.ts`
- **Pendiente**: completar UX de verificacion (codigo invitacion / email corporativo / validacion manual) end-to-end y gating del portal hasta verificacion
- **Archivos**: `src/app/api/empresa/route.ts`, `src/lib/empresa.ts`, `src/app/empresa/page.tsx`

#### 7.2 Dominio DNS + Verificacion Resend
- **Estado**: emails funcionan pero desde dominio no verificado
- **Accion**: configurar SPF/DKIM/DMARC en dominio propio en Resend

#### 7.3 Expansion de Jurisprudencia
- **Estado**: pipeline operativo (scrapers + normalize + seed)
- **Accion**: correr pipeline completo y poblar Pinecone con 500+ casos reales

### MEDIO

#### 7.4 Cobertura E2E
- **Estado**: 3 flows base (auth, consumer, empresa)
- **Accion**: agregar flows para billing Stripe, notificaciones, dialogo bidireccional, export PDF, escalamiento

#### 7.5 Pen Test
- Correr OWASP ZAP / equivalente
- Foco: XSS, CSRF, SSRF, IDOR en `/api/cases/[id]` y `/api/empresa/respond`

#### 7.6 Fallback de IA
- **Estado**: solo Gemini 2.0 Flash; ya hay manejo de 503 ante quota errors
- **Accion**: agregar fallback a Claude o GPT-4o ante quota / outage

### BAJO

#### 7.7 Panel Admin completo
- Existe `/admin` protegido. Falta poblar con metricas globales, moderacion, gestion de usuarios/empresas

#### 7.8 Accesibilidad (a11y)
- Audit Lighthouse, ARIA labels, keyboard nav, screen reader

#### 7.9 GDPR - Derecho a eliminacion
- Endpoint para borrado en cascada (cases, feedback, responses, notifications)

#### 7.10 Push Notifications PWA
- Service worker ya existe; falta canal de push real

#### 7.11 Monetizacion - tier consumidor
- Stripe ya integrado para empresas. Evaluar freemium consumidor

---

## 8. Comandos Utiles

```bash
# Desarrollo
npm run dev

# Tests
npm test                              # Vitest (unit)
npm run test:watch
npm run test:coverage
npm run test:e2e                      # Playwright

# Type / Lint
npx tsc --noEmit
npm run lint

# Build
npm run build                         # incluye prebuild (inject-sw-version)

# Pipeline jurisprudencia
npm run scrape:jurisprudencia
npm run normalize:jurisprudencia
npm run seed:jurisprudencia
npm run pipeline:jurisprudencia

# Supabase
npm run db:push
npm run db:new <nombre>
npm run migrate:json
```

---

## 9. MCP Servers Configurados

En `~/.claude.json` (no commitear keys):
- **Firecrawl**: web scraping
- **Playwright**: E2E browser automation
- **Supabase**: database management

---

## 10. Notas Tecnicas Importantes

1. **service_role + RLS coexisten**: el servidor usa `SUPABASE_SECRET_KEY` y autoriza con Clerk en cada API route. RLS (migracion `20260409`) protege accesos directos con anon key como capa de defensa adicional.

2. **Fire-and-forget notifications**: emails y notificaciones in-app NUNCA bloquean el flujo. Errores se loguean.
   ```typescript
   notifyEmpresaNewComplaint(params).catch(() => {});
   ```

3. **SWR pattern** en `/mis-casos`, `/empresa`, `/notificaciones`.

4. **Auto-deteccion empresa**: extrae dominio del email, filtra genericos (gmail, hotmail, etc.), busca en `company_accounts.nombre_normalizado` y luego en `cases.empresa`.

5. **Cookie consent**: PostHog NO se inicializa hasta consentimiento explicito (localStorage `justia_cookie_consent`). Banner con delay 1.5s + Framer Motion.

6. **Tipos consumer-facing vs internos**: `CompanyResponseView` (consumer) omite IDs internos. `CompanyResponse` (empresa) incluye todo.

7. **Cache layers**:
   - L1: SWR cliente (30-60s dedup)
   - L2: Cache-Control headers (CDN)
   - L3: Redis server (1h-24h TTL)
   - Fallback: in-memory Map (dev, max 500 entries)

8. **PWA cache invalidation**: el script `prebuild` (`inject-sw-version.js`) inyecta el git hash actual como version del service worker, evitando blank pages por cache stale. HTML usa estrategia network-first.

9. **Refactor `page.tsx`**: la home estaba en 593 lineas; se dividio en modulos focalizados.

10. **503 explicito**: ante errores de quota o auth de Gemini, la app devuelve 503 en lugar de fallback silencioso a demo.

11. **`/admin` proxy guard**: la proteccion ocurre antes del routing de Next, redirect a non-admin.

12. **MSW en producto**: usado para E2E con Playwright; el `msw-provider.tsx` se monta condicionalmente.
