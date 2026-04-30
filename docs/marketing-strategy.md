# Justia Consumidor — Estrategia de Marketing

> Generado: 2026-04-29
> Basado en: marketing-skills (Corey Haines) + status-roadmap.md
> Mercados: 🇦🇷 Argentina, 🇲🇽 México (Fase 1)

---

## 1. Posicionamiento (One-liner)

**"El abogado de IA que pelea tus reclamos de consumidor — gratis, en 5 minutos, con jurisprudencia real."**

Variantes A/B para testing:
- **Velocidad:** "Reclamá como abogado en 5 minutos. Sin abogado."
- **Resultado:** "PROFECO/Defensa del Consumidor te ignora. Justia no."
- **Autoridad:** "344.500 quejas analizadas. Tu caso es el siguiente."
- **Plata:** "Recuperá tu plata sin pagarle un peso a un abogado."

Categoría a crear: **AI-Powered Consumer Advocate** (no "legaltech", no "complaints platform").

---

## 2. ICP (Ideal Customer Profile)

| Segmento | Pain | Mensaje |
|----------|------|---------|
| **Clase media frustrada** (25-55) | "Me cobraron de más, la empresa no responde, un abogado cuesta más que el reclamo" | "Recuperá <$500 USD sin pagar nada" |
| **Comprador online** (e-commerce, fintech, telcos) | Productos defectuosos, cobros fantasma, soporte fantasma | "El reclamo formal que las empresas sí leen" |
| **Influencers de denuncia** (TikTok consumidor) | Necesitan munición legal para sus videos | "Generá el reclamo + jurisprudencia para tu denuncia" |
| **Adultos mayores** (vía hijos) | Estafas telefónicas, suscripciones engañosas | Onboarding asistido, simple |

**Anti-ICP:** B2B, casos >$10K USD, casos penales. Decir "no" claramente en la home.

---

## 3. Embudo de Adquisición (priorizado por ROI / esfuerzo)

### TIER 1 — Gratis y compounding (empezar AHORA)

#### A. Programmatic SEO (skill: `programmatic-seo`) — **Mayor palanca**

Tenés 40 empresas + 8-9 sectores + 2 países = base de datos lista para pSEO.

**Templates a generar (URLs):**

```
/empresa/[slug]                     → 40 páginas (ya existen, optimizar)
/empresa/[slug]/como-reclamar       → 40 páginas
/empresa/[slug]/vs-[competidor]     → ~80 páginas (cross-product)
/sector/[sector]/quejas             → 17 páginas
/sector/[sector]/[país]             → 34 páginas
/como-reclamar-a-[empresa]          → 40 páginas (long-tail intent)
/jurisprudencia/[caso-slug]         → 100+ páginas (cuando expandas Pinecone)
```

**Total potencial:** ~300+ páginas SEO con datos reales (no thin content).

**Keywords tier 1 (volumen alto, intención comercial):**
- "como reclamar a [empresa]" (ej: "como reclamar a mercado libre")
- "quejas [empresa]"
- "[empresa] no me responde"
- "estafa [empresa]"
- "carta documento [empresa]" (AR)
- "denuncia profeco [empresa]" (MX)

**Estructura de cada página de empresa:**
1. Score de reputación (visual, copiable como badge)
2. "Quejas recientes" (placeholder hasta tener UGC)
3. **CTA primario:** "Generar mi reclamo contra [empresa] →"
4. Stats del sector
5. FAQ con schema markup (skill: `schema-markup`)
6. Jurisprudencia relacionada

#### B. Schema markup (skill: `schema-markup`)

- `LegalService` schema en home
- `Review` + `AggregateRating` en `/empresa/[slug]` (te da estrellas en Google)
- `FAQPage` en cada página
- `HowTo` en "/como-reclamar-a-X"
- `Article` en jurisprudencia

Esto solo te puede multiplicar CTR 30-80% en SERPs.

#### C. Free tool play (skill: `free-tool-strategy`)

Convertí el motor en herramientas standalone linkeables:

| Tool | URL | Hook |
|------|-----|------|
| **Calculadora de Valor Esperado** | `/calculadora-reclamo` | "¿Vale la pena reclamar? Calculá en 30s" |
| **Generador de Carta Documento** | `/carta-documento` (AR) | "Carta documento gratis (formato legal AR)" |
| **Score de empresa** | `/score/[empresa]` | Embed-able badge para periodistas/blogs |
| **Quejómetro PROFECO** (MX) | `/profecometro` | "¿Qué tan quejada está esta empresa?" |

Cada uno = lead magnet + backlinks naturales + earned media.

### TIER 2 — Distribución orgánica (skill: `social-content`)

#### TikTok / Instagram Reels — **canal #1 para consumer LATAM**

Formato repetible: **"Le saqué $X a [empresa] con IA en 5 min"**

- POV: persona común muestra problema → mete caso en Justia → aparece reclamo formal → corte a confirmación de reembolso
- Hook visual: el dashboard con el score de reputación rojo + el gráfico financiero
- **Cuenta-vehículo:** "@JustiaArmy" o "@TeAyudoAReclamar" (no la marca seca)

Series:
1. **"Empresas que no querés enojar (y las que sí)"** — top/bottom de reputation score
2. **"Reclamos virales analizados por IA"** — reaccionar a casos virales con tu motor
3. **"Te leo el contrato"** — TOS abusivos detectados por IA

#### X / LinkedIn (founder-led)

Cuenta del fundador, no de la marca. Build-in-public:
- Métricas semanales (casos generados, % éxito, $ recuperados)
- Threads sobre el motor (cómo el LLM extrae entidades, scoring financiero)
- Hot takes sobre PROFECO/DCC (controversia controlada)

### TIER 3 — Pago (skill: `paid-ads`) — **solo después de validar funnel orgánico**

**Google Ads (mayor intent):**
- Match exacto: "como reclamar a [empresa]" — pujar bajo, alto QS por landing programática
- Competidor brand: "[empresa] reclamos" → llevar a `/empresa/[slug]`
- **NO pujar** por "abogado" (CPC suicida)

**Meta Ads:**
- Lookalike de usuarios que completaron caso
- Creatives = los mismos UGC de TikTok (no producir aparte)
- Targeting: edad 28-55, intereses "consumer rights" + buyers de e-commerce

Presupuesto sugerido validación: $500 USD/mes/país durante 30 días antes de escalar.

### TIER 4 — Earned media / PR

Ángulos de prensa pre-cocinados:
1. **"El primer abogado de IA gratis para consumidores de LATAM"** (tech press: Infobae Tech, Wired ES, Xataka MX)
2. **"Ranking: las 10 empresas más quejadas de [país]"** (general press, recurrente cada Q)
3. **"Analizamos 344.500 quejas con IA. Esto descubrimos."** (data journalism)
4. **"Caso real: usuario recuperó $X usando IA"** (testimonios)

Outreach a periodistas de consumo: La Nación Economía (AR), El Universal Cartera (MX), El Cronista, Expansión.

---

## 4. Onboarding & Conversion (skill: `onboarding-cro` + `signup-flow-cro`)

**Friction audit ahora mismo:**

1. ¿Hay que loguearse antes de probar? → **No.** Probar primero, login al guardar caso/enviar email.
2. ¿Cuánto tarda el "aha moment"? Debería ser <90 segundos desde landing → análisis IA visible.
3. **"Cargar ejemplo"** ya existe ✅ — usalo como gancho en el hero ("¿No tenés ganas de tipear? Mirá un caso real ↓").

**Activación → Retención:**
- Email post-caso (D+1, D+7, D+30): "¿La empresa respondió?"
- WhatsApp opt-in para seguimiento de caso (LATAM = WA-first)
- Gamificación: "Sos parte del 12% que ya recuperó plata con Justia"

---

## 5. Pricing (skill: `pricing-strategy`)

Modelo recomendado **Freemium → B2B subsidia B2C**:

| Tier | Precio | Para quién | Qué incluye |
|------|--------|-----------|-------------|
| **Free (consumidor)** | $0 | Siempre | Análisis IA + carta + envío (1 caso/mes) |
| **Pro consumidor** | $5/mes (AR) / $99 MXN | Reclamadores frecuentes | Casos ilimitados, PDF, prioridad |
| **Empresa Basic** | $99/mes | PYMEs | Dashboard de reclamos, respuesta directa |
| **Empresa Pro** | $499/mes | Marcas grandes | API, analytics, SLA |
| **Empresa Enterprise** | Custom | Top 50 empresas quejadas | Integración + SOC 2 |

El modelo Reclame AQUI demuestra que **las empresas pagan para responder reclamos públicos** cuando la presión reputacional es real. Tu reputation score + SEO = crear esa presión.

**Anti-pattern:** no cobres por consumidor antes de tener masa crítica. La gratuidad es el moat.

---

## 6. Launch Strategy (skill: `launch-strategy`)

Aprovechá los hitos del roadmap como momentos de prensa:

| Mes | Hito técnico | Momento marketing |
|-----|-------------|-------------------|
| May 2026 | Migración a LLM cloud | "Justia ahora usa GPT-4o para tus reclamos" |
| Jun 2026 | Dominio propio + Resend | Soft launch oficial (Product Hunt LATAM) |
| Jul 2026 | E2E completos + 100+ casos jurisprudencia | Hard launch + PR push |
| Sep 2026 | Dashboard empresas live | Anuncio B2B + primeros 10 logos |
| Q4 2026 | Stripe + Pro tier | Monetización pública + caso de inversión |

**Product Hunt:** apuntá al top 3 del día con audiencia LATAM movilizada (no audiencia US generalista — vas a perder). Mejor: **Producthunters.es** + foros locales (Frogx3, BlogdelMexicano tech, etc.).

---

## 7. Métricas de seguimiento (skill: `analytics-tracking`)

Ya tenés PostHog ✅. Eventos críticos a confirmar:

```
landing_view
example_loaded
analysis_started
analysis_completed              ← AHA MOMENT (medí time-to-this)
report_generated
email_sent
case_saved
return_visit_d7
case_resolved (self-reported)
```

North star metric candidato: **% reclamos enviados que reportan resolución positiva en 30 días.**
(Combina activación + valor real entregado.)

Funnel objetivo (mes 1 post-launch):
- Landing → analysis_completed: **>40%** (alto porque el ejemplo precargado ayuda)
- analysis_completed → email_sent: **>25%**
- email_sent → return_visit_d7: **>30%**

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Empresas grandes te denuncian por "asesoramiento legal sin matrícula" | Disclaimer claro: "Justia no reemplaza a un abogado". Posicionar como "asistente". |
| Costos de LLM cloud explotan con tracción | Cache agresivo de análisis por empresa+categoría, fallback a Gemma local para casos repetidos |
| PROFECO/DCC se enojan | Co-opción: ofrecé API gratuita para que ellos consuman tu motor. Aliarse > pelear. |
| Spam / abuso del generador de cartas | Rate limiting ya está ✅. Verificación email antes de envío masivo. |

---

## 9. Plan de 30 / 60 / 90 días

### Días 1-30 (Foundation)
- [ ] Definir y publicar product-marketing-context (skill: `product-marketing-context`)
- [ ] Escribir copy de homepage A/B-able (skill: `copywriting`) — 3 variantes de hero
- [ ] Lanzar 40 páginas `/empresa/[slug]` optimizadas + schema markup
- [ ] Setup TikTok cuenta-vehículo, postear 30 videos (1/día)
- [ ] Founder-led en X: 1 post/día, 1 thread/semana

### Días 31-60 (Distribución)
- [ ] Lanzar primer free tool (`/calculadora-reclamo`)
- [ ] Lanzar series pSEO `/como-reclamar-a-[empresa]`
- [ ] Outreach a 20 periodistas con dataset "Top 10 empresas más quejadas"
- [ ] Primera campaña Google Ads ($500 budget) en keywords brand-competitor
- [ ] Activar email sequence post-caso (skill: `email-sequence`)

### Días 61-90 (Escalar lo que funciona)
- [ ] Doblar inversión en el canal con mejor CAC
- [ ] Lanzar embeddable badge de reputación (link-bait)
- [ ] Soft pitch a 5 empresas para portal B2B (lista priorizada por bottom 10 reputation)
- [ ] Product Hunt LATAM launch
- [ ] Primer reporte público "Estado del reclamo en LATAM Q3 2026"

---

## 10. Skills aplicables del repo (referencia rápida)

| Skill | Cuándo invocarla |
|-------|------------------|
| `programmatic-seo` | Al diseñar templates de empresa/sector/jurisprudencia |
| `copywriting` | Al rehacer hero, página de empresa, emails |
| `schema-markup` | Antes de publicar las páginas pSEO |
| `free-tool-strategy` | Al planear `/calculadora-reclamo` y `/profecometro` |
| `launch-strategy` | Antes del hard launch de jul/2026 |
| `social-content` | Al planear contenido TikTok/IG semanal |
| `marketing-psychology` | Al diseñar el dashboard de resultado (anclaje, autoridad, prueba social) |
| `email-sequence` | Para el flow post-caso (D+1, D+7, D+30) |
| `paid-ads` | Antes de prender Google/Meta Ads |
| `onboarding-cro` | Para iterar el funnel landing → análisis → envío |
| `pricing-strategy` | Cuando actives el Pro tier en Q4 |
| `competitor-alternatives` | Para `/justia-vs-reclame-aqui`, `/justia-vs-profeco` |
| `analytics-tracking` | Auditar eventos PostHog y definir north star |
| `product-marketing-context` | Documento maestro a generar primero |

**Próximo paso recomendado:** correr el skill `product-marketing-context` para fijar el documento canónico de posicionamiento, luego `copywriting` sobre el hero actual.
