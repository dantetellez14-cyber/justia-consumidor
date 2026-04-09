# JustIA Consumidor - Resumen Completo de Sesiones

> Documento de referencia para continuar el desarrollo en una nueva sesion.
> Ultima actualizacion: 8 de abril de 2026

---

## 1. Descripcion del Proyecto

**JustIA Consumidor** es una plataforma ODR (Online Dispute Resolution) potenciada por IA para resolver disputas de consumidores en Argentina y Mexico. Permite a los consumidores:

1. Relatar su problema en lenguaje natural
2. Obtener un analisis legal automatizado con probabilidad de exito
3. Generar un reclamo formal
4. Enviarlo a la empresa
5. Recibir respuestas de la empresa
6. Escalar ante organismos oficiales (PROFECO en Mexico, COPREC en Argentina)

---

## 2. Stack Tecnologico

| Capa | Tecnologia | Detalle |
|------|-----------|---------|
| Framework | Next.js 16.2.2 | App Router, React 19.2.4 |
| Lenguaje | TypeScript | Strict mode |
| Auth | Clerk v7 | Dual role (consumer + empresa) |
| Base de datos | Supabase PostgreSQL | service_role key bypass pattern |
| Cache servidor | Upstash Redis | TTL-based, in-memory fallback |
| Cache cliente | SWR | stale-while-revalidate |
| Rate limiting | Upstash Ratelimit | Sliding window, in-memory fallback |
| Email | Resend | Transaccional, templates HTML |
| IA | Google Gemini | @google/generative-ai |
| Vector DB | Pinecone | Jurisprudencia embeddings |
| Analytics | PostHog | Con cookie consent |
| Errores | Sentry | @sentry/nextjs |
| Estilos | Tailwind CSS | + Framer Motion animaciones |
| Iconos | Lucide React | |
| Validacion | Zod v4 | .strict() en APIs |
| Charts | Recharts | Financial metrics |
| Testing | Vitest | 181 tests pasando |

---

## 3. Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                    # Home - flujo principal consumidor
│   ├── layout.tsx                  # Root layout (Clerk, PostHog, Sentry)
│   ├── empresa/page.tsx            # Portal empresa (dashboard, respuestas)
│   ├── mis-casos/page.tsx          # Lista de casos del consumidor
│   ├── privacidad/page.tsx         # Politica de privacidad
│   ├── terminos/page.tsx           # Terminos de uso
│   ├── sign-in/[[...sign-in]]/     # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/     # Clerk sign-up
│   └── api/
│       ├── analyze/route.ts        # POST - Analisis IA del relato
│       ├── cases/route.ts          # GET (lista) / POST (crear caso)
│       ├── cases/[id]/route.ts     # GET / PATCH caso individual
│       ├── complaint-stats/route.ts # GET - Estadisticas (cacheado 1h)
│       ├── empresa/route.ts        # GET (dashboard) / POST (registrar) / PUT (vincular)
│       ├── empresa/respond/route.ts # POST - Respuesta empresa a reclamo
│       ├── feedback/route.ts       # POST - Feedback del usuario
│       ├── search-jurisprudencia/   # GET - Busqueda legal (cacheado 24h)
│       └── send-complaint/route.ts # POST - Enviar reclamo + notificar empresa
├── components/
│   ├── arbitration-module.tsx      # Modulo de arbitraje IA
│   ├── case-tracker.tsx            # Timeline visual del caso + respuestas empresa
│   ├── company-response-card.tsx   # Tarjeta de respuesta empresa (consumer-facing)
│   ├── complaint-form.tsx          # Formulario de relato
│   ├── complaint-generator.tsx     # Generador de reclamo formal
│   ├── complaint-stats-panel.tsx   # Panel de estadisticas (SWR)
│   ├── cookie-consent-banner.tsx   # Banner GDPR cookies
│   ├── escalation-module.tsx       # Modulo escalamiento PROFECO/COPREC
│   ├── extracted-entities.tsx      # Entidades extraidas del relato
│   ├── feedback-rating.tsx         # Rating del usuario
│   ├── financial-chart.tsx         # Grafico financiero
│   ├── footer-metrics.tsx          # Metricas del footer
│   ├── formula-modal.tsx           # Modal de formula
│   ├── jurisprudencia-list.tsx     # Lista de jurisprudencia
│   ├── loading-animation.tsx       # Animacion de carga
│   ├── posthog-provider.tsx        # Provider PostHog + cookie consent
│   ├── recommendation-alert.tsx    # Alerta de recomendacion
│   ├── reputation-score-badge.tsx  # Badge de reputacion empresa
│   └── welcome-hero.tsx            # Hero section
├── lib/
│   ├── cache.ts                    # Redis + in-memory cache
│   ├── complaint-stats.ts          # Logica de estadisticas
│   ├── empresa.ts                  # Servicio empresa (CRUD, auto-deteccion)
│   ├── escalation.ts               # Logica de escalamiento
│   ├── jurisprudencia.ts           # Busqueda jurisprudencia
│   ├── logger.ts                   # Logger (Pino)
│   ├── notifications.ts           # Emails bidireccionales
│   ├── pinecone.ts                # Cliente Pinecone
│   ├── posthog.ts                 # PostHog con consent
│   ├── rate-limit.ts              # Rate limiting Upstash
│   ├── reputation-score.ts        # Calculo reputacion
│   ├── scoring.ts                 # Scoring de casos
│   ├── supabase.ts                # Cliente Supabase + tipos
│   ├── swr.ts                     # SWR fetchers
│   ├── types.ts                   # CaseAnalysis, FinancialMetrics, etc.
│   ├── validations.ts             # Schemas Zod
│   └── email/
│       └── templates.ts           # Templates HTML email
└── __tests__/                     # 16 archivos, 181 tests
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
    ├── validations.test.ts
    └── api/
        ├── analyze.test.ts
        ├── cases.test.ts
        ├── feedback.test.ts
        ├── search-jurisprudencia.test.ts
        └── send-complaint.test.ts
```

---

## 4. Tablas de Base de Datos (Supabase)

| Tabla | Proposito |
|-------|----------|
| `cases` | Casos de reclamo (user_id, relato, empresa, status, analisis) |
| `company_accounts` | Cuentas de empresa registradas (nombre, RFC/CUIT, email_contacto) |
| `company_users` | Vinculo usuario Clerk ↔ empresa (rol: admin/operador/lectura) |
| `company_responses` | Respuestas de empresa a casos (tipo, mensaje, monto propuesto) |
| `feedback` | Feedback de usuarios sobre el servicio |

### Tipos de respuesta empresa (`company_responses.tipo_respuesta`):
- `aceptar` - Acepta el reclamo (caso pasa a "resuelto")
- `rechazar` - Rechaza el reclamo (caso pasa a "en_mediacion")
- `propuesta` - Propone resolucion con monto (caso pasa a "en_mediacion")
- `solicitar_info` - Solicita mas informacion (caso pasa a "en_mediacion")

### Estados de caso (`cases.status`):
1. `consulta_recibida` - Caso analizado por IA
2. `reclamo_generado` - Reclamo formal creado
3. `enviado_empresa` - Enviado a la empresa
4. `en_mediacion` - En proceso de mediacion
5. `resuelto` - Caso resuelto

---

## 5. Funcionalidades Completadas

### 5.1 Flujo Principal del Consumidor
- Relato en lenguaje natural → analisis IA (Gemini)
- Extraccion de entidades (empresa, producto, monto, fecha)
- Calculo de probabilidad de exito
- Analisis legal por pais (AR/MX)
- Busqueda de jurisprudencia con Pinecone
- Generacion de reclamo formal (carta)
- Envio por email con Resend
- Evaluacion arbitral IA
- Generacion de documento de escalamiento (PROFECO/COPREC)
- Timeline visual del caso (CaseTracker)
- Rating y feedback del usuario

### 5.2 Portal Empresa
- Auto-deteccion de empresa por dominio de email (e.g., @telmex.com.mx → Telmex)
- Filtro de proveedores genericos (gmail, hotmail, outlook, etc.)
- Registro de nueva empresa (nombre, RFC/CUIT, sector, contacto)
- Vinculacion a empresa existente (claim)
- Dashboard con estadisticas (casos pendientes, resueltos, tiempo promedio)
- Lista de reclamos recibidos con filtros
- Sistema de respuesta a reclamos (4 tipos)
- Historial de respuestas previas por caso

### 5.3 Notificaciones Email Bidireccionales
- **Consumidor → Empresa**: Al enviar reclamo, se notifica a la empresa (email_contacto de company_accounts)
- **Empresa → Consumidor**: Al responder la empresa, se notifica al consumidor (email via Clerk API)
- Templates HTML con branding, color-coded por tipo de respuesta
- Patron fire-and-forget (async, no-blocking, errores logueados pero no lanzados)
- Links directos al portal correspondiente (CTA buttons)

### 5.4 Visibilidad de Respuestas para el Consumidor
- API `/api/cases` ahora incluye `company_responses` via Supabase join
- Tipo `CaseWithResponses` extiende `CaseRecord` con array de respuestas
- Tipo `CompanyResponseView` (consumer-facing, sin IDs internos de empresa)
- Componente `CompanyResponseCard` con badges color-coded por tipo
- Componente `ResponseIndicator` (badge compacto para lista de casos)
- `/mis-casos` muestra indicador de respuestas en cada tarjeta
- Tarjetas expandibles con click para ver detalle de respuestas (AnimatePresence)
- `CaseTracker` actualizado:
  - Timeline refleja cuando empresa responde (paso "Enviado" = completado)
  - Seccion "Respuestas de [empresa]" con tarjetas detalladas
  - "Resolucion" se marca completado cuando empresa acepta
  - Badge superior cambia a "Resuelto" (verde) en aceptacion
  - Proximo paso sugerido contextual segun tipo de respuesta

### 5.5 Seguridad Implementada
- **Caching**: Redis server-side (Upstash) + Cache-Control headers + SWR client-side
  - complaint-stats: 1h TTL
  - jurisprudencia: 24h TTL
  - cases list: 30s max-age + 60s stale-while-revalidate
- **Rate Limiting**: Todos los endpoints protegidos (20-30 req/min por IP)
  - Upstash sliding window en produccion
  - In-memory fallback en desarrollo
- **Validacion de entrada**: Zod `.strict()` en endpoints (rechaza campos desconocidos)
- **Sin API keys en codigo**: Todas via env vars
- **Cookie Compliance**: Banner de consentimiento, PostHog solo se inicializa con consentimiento
  - localStorage key: `justia_cookie_consent`
  - Opciones: "Aceptar todas" vs "Solo esenciales"
- **Auth**: Clerk middleware protege rutas privadas

### 5.6 Performance
- Redis caching multi-capa
- SWR con deduplication intervals
- Cache-Control headers para CDN
- In-memory fallbacks para desarrollo local

---

## 6. Variables de Entorno Necesarias

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

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=

# MCP Servers (Claude Code dev tools)
FIRECRAWL_API_KEY=fc-41b40d3408364df5a277be3eebb19811
```

---

## 7. Pendientes por Prioridad

### CRITICO - Funcionalidad Core

#### 7.1 Migracion de IA: Ollama → API Cloud (GPT-4o/Claude)
- **Estado**: La app usa Google Gemini (@google/generative-ai)
- **Problema**: Depende de una sola API key, sin fallback
- **Accion**: Evaluar si agregar fallback a otro proveedor (Claude API, GPT-4o)
- **Archivos**: `src/app/api/analyze/route.ts`, `src/lib/types.ts`

#### 7.2 Verificacion de Empresa
- **Estado**: Cualquier usuario puede registrarse como cualquier empresa
- **Problema**: No hay verificacion de que el usuario realmente pertenece a la empresa
- **Accion**: Implementar verificacion por email corporativo, codigo de invitacion, o validacion manual
- **Archivos**: `src/app/api/empresa/route.ts`, `src/lib/empresa.ts`

### ALTO - Experiencia Completa

#### 7.3 Dominio DNS + Verificacion Resend
- **Estado**: Emails se envian desde dominio no verificado
- **Problema**: Emails pueden caer en spam
- **Accion**: Configurar dominio propio en Resend, agregar registros DNS (SPF, DKIM, DMARC)
- **Archivos**: Configuracion en dashboard de Resend

#### 7.4 Expansion de Jurisprudencia
- **Estado**: Solo ~10 casos de prueba
- **Accion**: Expandir a 100+ casos reales de PROFECO y COPREC
- **Archivos**: `src/lib/jurisprudencia.ts`, Pinecone index

#### 7.5 Row Level Security (RLS) en Supabase
- **Estado**: No implementado, se usa service_role key que bypassa RLS
- **Problema**: Si alguien obtiene el anon key, podria leer/escribir todo
- **Accion**: Configurar politicas RLS como capa de defensa adicional
- **Archivos**: Supabase dashboard, SQL migrations

### MEDIO - Calidad y Testing

#### 7.6 E2E Tests con Playwright
- **Estado**: Solo tests unitarios (Vitest, 181 tests)
- **Accion**: Agregar E2E tests para flujos criticos:
  - Consumidor: relato → analisis → reclamo → envio
  - Empresa: login → dashboard → respuesta
  - Notificaciones: verificar emails enviados
- **Herramientas**: Playwright MCP server ya instalado

#### 7.7 Pen Test con OWASP ZAP
- **Estado**: No realizado
- **Accion**: Correr OWASP ZAP o herramienta similar
- **Foco**: SQL injection (ya mitigado con Supabase parameterized), XSS, CSRF, SSRF

### BAJO - Mejoras Futuras

#### 7.8 Panel de Administracion
- Dashboard admin para gestionar empresas, usuarios, casos
- Metricas globales de la plataforma
- Moderacion de contenido

#### 7.9 Monetizacion
- Plan de precios para empresas
- Modelo freemium para consumidores
- Integracion con Stripe

#### 7.10 Accesibilidad (a11y)
- Audit con Lighthouse
- ARIA labels
- Keyboard navigation
- Screen reader support

#### 7.11 GDPR - Derecho a Eliminacion
- Endpoint para que usuarios soliciten borrar sus datos
- Eliminacion en cascada (cases, feedback, company_responses)

#### 7.12 PWA (Progressive Web App)
- Service worker
- Manifest
- Offline support basico
- Push notifications

#### 7.13 Respuesta del Consumidor a la Empresa
- Actualmente el flujo es unidireccional post-respuesta empresa
- Agregar posibilidad de que el consumidor responda a propuestas
- Chat-like flow entre consumidor y empresa dentro de la plataforma

---

## 8. Archivos Clave para Continuar

### Para trabajar en verificacion de empresa:
```
src/lib/empresa.ts          # extractCompanyFromEmail, findCompanyByEmailDomain
src/app/api/empresa/route.ts # GET (auto-deteccion), POST (registro), PUT (vincular)
src/app/empresa/page.tsx     # Portal completo de empresa
```

### Para trabajar en E2E tests:
```
src/app/page.tsx            # Flujo principal consumidor
src/app/empresa/page.tsx    # Flujo empresa
src/app/mis-casos/page.tsx  # Lista de casos
```

### Para trabajar en RLS:
```
src/lib/supabase.ts         # supabase (service_role) vs supabasePublic (anon)
```

### Para trabajar en expansion de jurisprudencia:
```
src/lib/jurisprudencia.ts   # Logica de busqueda
src/lib/pinecone.ts         # Cliente Pinecone
src/app/api/search-jurisprudencia/route.ts
```

---

## 9. Comandos Utiles

```bash
# Desarrollo
npm run dev                    # Servidor de desarrollo

# Tests
npx vitest run                 # Correr todos los tests (181)
npx vitest run src/__tests__/cache.test.ts  # Test individual
npx tsc --noEmit               # Type check sin compilar

# Lint
npx next lint                  # ESLint

# Build
npm run build                  # Build de produccion
```

---

## 10. MCP Servers Configurados

En `~/.claude.json`:
- **Firecrawl**: Web scraping (API key: fc-41b40d3408364df5a277be3eebb19811)
- **Playwright**: E2E browser automation (@playwright/mcp)
- **Supabase**: Database management MCP

---

## 11. Notas Tecnicas Importantes

1. **Patron service_role**: Supabase se accede con `SUPABASE_SECRET_KEY` (bypasa RLS). La autorizacion se maneja en cada API route con Clerk. Esto es intencional pero deberia tener RLS como capa adicional.

2. **Fire-and-forget notifications**: Las notificaciones email NUNCA bloquean el flujo principal. Errores se loguean pero no se lanzan. Patron:
   ```typescript
   notifyEmpresaNewComplaint(params).catch(() => {});
   ```

3. **SWR pattern**: Reemplazo de useEffect/useState/fetchData con useSWR + mutate(). Las paginas `/mis-casos` y `/empresa` usan este patron.

4. **Auto-deteccion empresa**: Extrae dominio del email Clerk, filtra proveedores genericos (gmail, hotmail, etc.), busca en `company_accounts.nombre_normalizado` y luego en `cases.empresa`.

5. **Cookie consent**: PostHog NO se inicializa hasta que el usuario da consentimiento explicito. El banner aparece con delay de 1.5s con animacion Framer Motion.

6. **Tipos consumer-facing vs internos**: `CompanyResponseView` (consumer) omite `company_id` y `respondido_por`. `CompanyResponse` (empresa) incluye todo.

7. **Cache layers**:
   - L1: SWR en cliente (30-60s dedup)
   - L2: Cache-Control headers (CDN)
   - L3: Redis server (1h-24h TTL)
   - Fallback: In-memory Map (dev, max 500 entries)
