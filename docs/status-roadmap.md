# JustIA Consumidor — Estado & Roadmap

> Actualizado: 5 de abril de 2026

---

## I. LO QUE YA ESTÁ HECHO

### 🏗️ Infraestructura & Arquitectura

| # | Componente | Tecnología | Estado |
|---|-----------|-----------|--------|
| 1 | 🌐 Framework | Next.js 16 (App Router, React 19, TypeScript) | ✅ Producción |
| 2 | 🎨 UI/Estilos | Tailwind CSS v4 + Framer Motion | ✅ Producción |
| 3 | ☁️ Hosting | Vercel (serverless, edge-optimized) | ✅ Producción |
| 4 | 🗄️ Base de datos | Supabase PostgreSQL + Row-Level Security | ✅ Producción |
| 5 | 🔐 Autenticación | Clerk OAuth/OIDC (JWT) | ✅ Producción |
| 6 | 🚦 Rate Limiting | Upstash Redis distribuido + fallback en memoria | ✅ Producción |
| 7 | 🐛 Monitoreo | Sentry (proxy tunnel anti-adblockers) | ✅ Producción |
| 8 | 📊 Analytics | PostHog (eventos, funnels) | ✅ Producción |
| 9 | 📧 Email | Resend (reclamos + confirmaciones) | ✅ Producción |
| 10 | 🔍 Búsqueda semántica | Pinecone (vector DB, embeddings multilingüe) | ✅ Producción |
| 11 | 🔄 CI/CD | GitHub Actions (lint + test + tsc + build) | ✅ Producción |

### 🛡️ Seguridad (7 Capas)

| # | Capa | Implementación | Estado |
|---|------|---------------|--------|
| 1 | 🔑 Autenticación | Clerk OAuth/OIDC con JWT por request | ✅ |
| 2 | 🚪 Autorización | Middleware `auth.protect()` en rutas privadas | ✅ |
| 3 | ✅ Validación | Zod schemas en TODOS los endpoints | ✅ |
| 4 | 🚦 Rate Limiting | Upstash Redis sliding window por IP/endpoint | ✅ |
| 5 | 🔒 Datos | Supabase RLS, secret key server-only, pino redacta tokens | ✅ |
| 6 | 🛡️ Headers | HSTS 2 años, CSP granular, X-Frame-Options, Permissions-Policy | ✅ |
| 7 | 📡 Monitoreo | Sentry con alertas automáticas + stack traces | ✅ |

### 🤖 Motor de IA

| # | Componente | Detalle | Estado |
|---|-----------|---------|--------|
| 1 | 🧠 Modelo LLM | Ollama Gemma 2 (9B), temp 0.3, JSON estructurado | ✅ |
| 2 | 📚 Jurisprudencia | 10 casos (5 AR + 5 MX) indexados en Pinecone | ✅ |
| 3 | 🔎 Búsqueda semántica | multilingual-e5-large (1024 dim), TOP_K=5 | ✅ |
| 4 | 🎭 Modo demo | Análisis sintético cuando modelo no disponible | ✅ |
| 5 | 📏 Scoring financiero | Fórmula E = P×V - (1-P)×C + recomendación | ✅ |
| 6 | ⭐ Score reputación | 0-10, 4 dimensiones, 5 niveles (estilo Reclame AQUI) | ✅ |

### 📊 Datos Integrados

| # | Fuente | País | Contenido | Estado |
|---|--------|------|-----------|--------|
| 1 | 🇲🇽 PROFECO | MX | 20 empresas + 9 sectores (quejas históricas) | ✅ Seeded |
| 2 | 🇦🇷 Defensa del Consumidor | AR | 20 empresas + 8 sectores (quejas históricas) | ✅ Seeded |
| 3 | ⚖️ Jurisprudencia | AR/MX | 10 casos reales con ratio decidendi | ✅ Indexado |
| 4 | 📋 Categorías | AR/MX | 15 categorías mapeadas a sectores | ✅ |
| 5 | 🏢 Empresas | AR/MX | 40 empresas con stats detallados | ✅ |
| — | — | — | **Total quejas cubiertas: 344,500** | — |

### ⚡ Funcionalidades (16 Componentes, 7 APIs)

| # | Feature | Descripción | Estado |
|---|---------|-------------|--------|
| 1 | 📝 Formulario estructurado | 15 categorías, canal de compra, resolución deseada, "Cargar ejemplo" | ✅ |
| 2 | 🤖 Análisis IA | Extracción de entidades + análisis legal + probabilidad de éxito | ✅ |
| 3 | 📊 Dashboard resultados | Entidades, legal, stats, reputación, gráfico, jurisprudencia | ✅ |
| 4 | ⭐ Score de reputación | Badge animado con círculo, barras por dimensión, veredicto | ✅ |
| 5 | 💰 Gráfico financiero | Valor Esperado vs. Costo (Recharts) | ✅ |
| 6 | 🎯 Recomendación | CONCILIAR_AHORA vs. DEFENDER_SELECTIVAMENTE | ✅ |
| 7 | ⚖️ Jurisprudencia | Búsqueda semántica de precedentes legales | ✅ |
| 8 | 📄 Generador de reclamo | Texto formal en formato legal AR/MX | ✅ |
| 9 | 📧 Envío por email | Dual: empresa + confirmación al usuario (Resend) | ✅ |
| 10 | 🤝 Módulo mediación/ODR | Interfaz de arbitraje AI-powered | ✅ |
| 11 | 📍 Seguimiento de caso | Timeline de estados con progresión visual | ✅ |
| 12 | ⭐ Feedback | Calificación 1-5 estrellas + comentario | ✅ |
| 13 | 📂 Mis casos | Página con historial de casos del usuario | ✅ |
| 14 | 🏠 Welcome hero | Landing con propuesta de valor | ✅ |
| 15 | ℹ️ Fórmula modal | Explicación del Valor Esperado | ✅ |
| 16 | ⏳ Loading animation | Animación durante análisis IA | ✅ |

### 🧪 Testing

| # | Suite | Tests | Estado |
|---|-------|-------|--------|
| 1 | 💰 Scoring financiero | Cálculos E=PV-(1-P)C, recomendaciones | ✅ |
| 2 | ⭐ Reputación empresarial | Score, niveles, helpers, null handling | ✅ |
| 3 | ✅ Validaciones Zod | Schemas de todos los endpoints | ✅ |
| 4 | 🚦 Rate limiting | Sliding window, fallback | ✅ |
| 5 | ⚖️ Jurisprudencia | Filtrado por país | ✅ |
| 6 | 📧 Email templates | HTML generation | ✅ |
| 7-11 | 🔌 APIs | analyze, cases, send-complaint, search, feedback | ✅ |
| — | **TOTAL** | **129 tests** | **✅ Passing** |

### 🔬 Market Research

| # | Hallazgo | Detalle |
|---|----------|---------|
| 1 | 🏆 Sin competidor directo | No existe ODR con IA para consumidor en LATAM |
| 2 | 🇲🇽 PROFECO | Solo recibe quejas, no asesora con IA |
| 3 | 🇦🇷 DCC | Proceso burocrático sin tecnología |
| 4 | 👔 Abogados | No toman reclamos pequeños (<$100 USD) |
| 5 | 🇧🇷 Reclame AQUI | Solo reputación, solo Brasil, sin IA legal |

---

## II. LO QUE FALTA

### 🔴 Prioridad Alta (Bloqueantes / Corto Plazo)

| # | Tarea | Descripción | Bloqueado por | Esfuerzo |
|---|-------|-------------|---------------|----------|
| 1 | 🧠 Migración modelo IA | Ollama local → API cloud (GPT-4o / Claude) | Decisión de costo | 1-2 semanas |
| 2 | 🇲🇽 Sync PROFECO live | Cliente listo, API del gobierno caída (500) | Gobierno MX | 0 (esperando) |
| 3 | 🇦🇷 Dataset alternativo AR | Dataset original removido de datos.gob.ar | Investigación | 1 semana |
| 4 | 🌐 Dominio + DNS Resend | Verificación para envío con dominio propio | Compra dominio | 1 día |
| 5 | 🎭 Tests E2E | Playwright — flujo completo del usuario | Nada | 1-2 semanas |
| 6 | ⚖️ Expandir jurisprudencia | De 10 a 100+ casos en Pinecone | Investigación legal | 2-3 semanas |

### 🟡 Prioridad Media (Fase 2)

| # | Tarea | Descripción | Dependencia | Esfuerzo |
|---|-------|-------------|-------------|----------|
| 7 | 🏢 Dashboard empresas | Portal donde empresas responden reclamos | Fase 1 completa | 3-4 semanas |
| 8 | 💳 Pasarela de pagos | Stripe / Conekta, modelo freemium → premium | Dashboard | 2 semanas |
| 9 | 🔔 Notificaciones real-time | Push + email cuando cambia estado del caso | Dashboard | 1-2 semanas |
| 10 | 💬 Chat de mediación | Conversación AI-assisted consumidor ↔ empresa | Dashboard + modelo cloud | 3-4 semanas |
| 11 | 📑 Reportes PDF | Reclamo + análisis exportable en PDF | Nada | 1 semana |
| 12 | 🔌 API pública empresas | Integración de respuesta a reclamos | Dashboard | 2-3 semanas |

### 🟢 Prioridad Baja (Fase 3)

| # | Tarea | Descripción | Dependencia | Esfuerzo |
|---|-------|-------------|-------------|----------|
| 13 | 🌎 Expansión LATAM | Colombia, Chile, Perú (legislación local) | Validación legal | 4-6 semanas/país |
| 14 | 📱 App móvil | React Native / Expo | Fase 2 estable | 6-8 semanas |
| 15 | 🤖 ML predictivo | Mejorar predicciones con feedback real | +1,000 casos resueltos | Continuo |
| 16 | 🏅 Certificación SOC 2 | Cumplimiento enterprise-grade | Fase 2 completa | 3-6 meses |
| 17 | 🏛️ Alianzas gobierno | Convenios con organismos de protección | Tracción demostrada | Continuo |

---

## III. ROADMAP VISUAL

```
                          JUSTIA CONSUMIDOR — ROADMAP 2026-2027
═══════════════════════════════════════════════════════════════════════════════

  ABR    MAY    JUN    JUL    AGO    SEP    OCT    NOV    DIC    ENE    FEB
  2026                                                           2027
   │      │      │      │      │      │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼


   ████████████████████████████████
   █  FASE 1: MVP & CEREBRO LEGAL █  Mes 1-3  │  $19,500 USD
   ████████████████████████████████
   │                              │
   │ ✅ MVP funcional (HECHO)     │
   │ 🧠 Migración modelo cloud   │
   │ ⚖️ Expandir jurisprudencia  │
   │ 🎨 UX/UI profesional        │
   │ 🎭 Tests E2E Playwright     │
   │ 🇲🇽 Sync PROFECO live       │
   │ 👨‍⚖️ QA Legal onboarding     │
   │                              │
   ├──────────────────────────────┤
                                  │
                                  ████████████████████████████████
                                  █  FASE 2: GESTIÓN & PAGOS     █  Mes 4-6  │  $21,500 USD
                                  ████████████████████████████████
                                  │                              │
                                  │ 🏢 Dashboard empresas       │
                                  │ 💳 Pasarela pagos           │
                                  │ 🔔 Notificaciones real-time │
                                  │ 💬 Chat mediación AI        │
                                  │ 📑 Reportes PDF             │
                                  │ 🔌 API pública empresas     │
                                  │                              │
                                  ├──────────────────────────────┤
                                                                 │
                                                                 ██████████████████████ →
                                                                 █  FASE 3: ESCALA    █  Mes 7+
                                                                 ██████████████████████ →
                                                                 │
                                                                 │ 🌎 Colombia, Chile
                                                                 │ 📱 App móvil
                                                                 │ 🤖 ML predictivo
                                                                 │ 🏅 SOC 2
                                                                 │ 🏛️ Alianzas gobierno
                                                                 │


═══════════════════════════════════════════════════════════════════════════════
  HITOS CLAVE
═══════════════════════════════════════════════════════════════════════════════

   ABR 2026          JUN 2026          SEP 2026          DIC 2026
      │                 │                 │                 │
      ▼                 ▼                 ▼                 ▼
   ┌──────┐         ┌──────┐         ┌──────┐         ┌──────┐
   │  🚀  │         │  🎯  │         │  💰  │         │  🌎  │
   │LAUNCH│         │ BETA │         │MONETZ│         │EXPAND│
   │PUBLIC│         │EMPRES│         │ START│         │ LATAM│
   └──────┘         └──────┘         └──────┘         └──────┘
   Lanzamiento      Beta dashboard   Primera           Expansión
   público con      empresas con     transacción       Colombia
   modelo cloud     5 empresas       de pago           o Chile
   + 100 casos      piloto           procesada


═══════════════════════════════════════════════════════════════════════════════
  MÉTRICAS DE PROGRESO
═══════════════════════════════════════════════════════════════════════════════

   Componentes:  [████████████████████████████████████████] 16/16  100%
   APIs:         [████████████████████████████████████████]  7/7   100%
   Tests:        [████████████████████████████████████████] 129    ✅
   Seguridad:    [████████████████████████████████████████]  7/7   100%
   Datos:        [██████████████████████████████░░░░░░░░░░] 344K   75%
   IA modelo:    [████████████████░░░░░░░░░░░░░░░░░░░░░░░░] Local  40%
   Jurisprud.:   [████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 10/100 10%
   E2E Tests:    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  0     0%
   Dashboard:    [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  0     0%
   Pagos:        [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  0     0%


═══════════════════════════════════════════════════════════════════════════════
  INVERSIÓN ACUMULADA
═══════════════════════════════════════════════════════════════════════════════

   $0          $19.5K         $41K          $53K
    │─────────────│──────────────│──────────────│──────── →
    ▲             ▲              ▲              ▲
   HOY         Fin Fase 1    Fin Fase 2    Fin Año 1
   (MVP        (Cloud IA     (Monetización  (+ 15%
   funcional)   + UX pro)     activa)       equity)
```

---

## IV. STACK TECNOLÓGICO VISUAL

```
┌─────────────────────────────────────────────────────────────────┐
│                        JUSTIA CONSUMIDOR                        │
│                     Architecture Overview                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   👤 USUARIO                                                    │
│      │                                                          │
│      ▼                                                          │
│   ┌──────────────────────────────────────────┐                  │
│   │          🌐 FRONTEND (Next.js 16)        │                  │
│   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │                  │
│   │  │ Form │ │Score │ │Chart │ │Track │    │  🎨 Tailwind v4  │
│   │  │  📝  │ │  ⭐  │ │  📊  │ │  📍  │    │  🎬 Framer Motion│
│   │  └──────┘ └──────┘ └──────┘ └──────┘    │  📊 Recharts     │
│   └──────────────────┬───────────────────────┘                  │
│                      │                                          │
│                      ▼                                          │
│   ┌──────────────────────────────────────────┐                  │
│   │         🔐 MIDDLEWARE (Clerk)            │                  │
│   │  Auth ─── Rate Limit ─── Validation      │                  │
│   └──────────────────┬───────────────────────┘                  │
│                      │                                          │
│          ┌───────────┼───────────┐                              │
│          ▼           ▼           ▼                              │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│   │ 🤖 IA    │ │ 🗄️ DATA  │ │ 📧 EMAIL │                       │
│   │          │ │          │ │          │                       │
│   │ Ollama   │ │ Supabase │ │ Resend   │                       │
│   │ Gemma 2  │ │ Postgres │ │          │                       │
│   │ (9B)     │ │ + RLS    │ │ Reclamo  │                       │
│   │          │ │          │ │ + Confirm │                       │
│   └──────────┘ └──────────┘ └──────────┘                       │
│          │           │                                          │
│          ▼           ▼                                          │
│   ┌──────────┐ ┌──────────┐                                     │
│   │ 🔍 VECTOR│ │ 🚦 CACHE │                                     │
│   │          │ │          │                                     │
│   │ Pinecone │ │ Upstash  │                                     │
│   │ e5-large │ │ Redis    │                                     │
│   └──────────┘ └──────────┘                                     │
│                                                                 │
│   ┌─────────────────────────────────────────┐                   │
│   │           📡 OBSERVABILIDAD             │                   │
│   │  Sentry (errores) │ PostHog (analytics) │                   │
│   └─────────────────────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
