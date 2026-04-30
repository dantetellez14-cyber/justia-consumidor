# Product Marketing Context

*Last updated: 2026-04-29 — V1 auto-drafted from codebase, pendiente revisión humana*

## Product Overview

**One-liner:** El abogado de IA que pelea tus reclamos de consumidor — gratis, en 5 minutos, con jurisprudencia real.

**What it does:** JustIA Consumidor es una plataforma ODR (Online Dispute Resolution) que usa IA para analizar reclamos de consumo, generar cartas formales con base legal real (Ley 24.240 AR / LFPC MX), buscar jurisprudencia relevante, calcular el valor esperado del reclamo y asistir en arbitraje cuando la empresa no responde. Todo gratis para el consumidor.

**Product category:** AI-Powered Consumer Advocate (categoría nueva). En términos que el usuario busca: "asistente legal para reclamos", "abogado IA gratis", "generador de carta documento".

**Product type:** SaaS B2C con plan futuro de B2B (dashboard de empresas que responden reclamos, modelo Reclame AQUI).

**Business model:** Freemium B2C → B2B subsidia B2C.
- Consumidor: gratis (1 caso/mes) + Pro $5 USD/mes AR / $99 MXN.
- Empresa: $99 / $499 / Enterprise custom.

## Target Audience

**Target companies (B2B, fase 2):** Marcas con alta exposición a reclamos — e-commerce, fintech, telcos, retail, aerolíneas, suscripciones digitales. Especialmente las del bottom-10 de reputation score que necesitan limpiar imagen.

**Decision-makers (B2B):** Director de Customer Experience, Legal/Compliance, Marketing/Brand (preocupados por reputación online).

**Primary use case (B2C):** "Una empresa me cobró/incumplió/maltrató, y reclamar formalmente cuesta más de lo que voy a recuperar."

**Jobs to be done:**
- Hire #1: Generar un reclamo formal que la empresa **realmente lea y responda**, sin pagar abogado.
- Hire #2: Saber **si vale la pena** pelear (¿cuánto puedo recuperar vs. cuánto me cuesta el tiempo?).
- Hire #3: Tener **respaldo legal y jurisprudencial** para una denuncia o reclamo público.

**Use cases:**
- Cobros fantasma de servicios digitales (streaming, telcos, suscripciones)
- Producto defectuoso / no entregado en e-commerce
- Cargos no autorizados de bancos o fintechs
- Pasajes aéreos cancelados sin reembolso
- Suscripciones engañosas a adultos mayores
- Garantías no respetadas por retailers
- Influencers que necesitan munición legal para denuncias virales

## Personas (B2C primario, B2B fase 2)

| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| **Reclamador frustrado** (clase media 28-55) | Recuperar plata + sentirse escuchado | "Un abogado cuesta más que el reclamo, PROFECO/DCC me ignora" | Reclamo formal en 5 min, gratis, con jurisprudencia |
| **Comprador online frecuente** (e-commerce/fintech users) | Resolución rápida | Soporte de empresa robotizado o ausente | Carta formal que escala automáticamente |
| **Influencer/denunciante** (TikTok, IG) | Contenido con autoridad legal | No tiene base legal sólida para sus videos | Análisis IA + jurisprudencia citables |
| **Hijo/cuidador de adulto mayor** | Protegerlos de estafas | Padres mayores caen en suscripciones engañosas | Onboarding asistido, lenguaje simple |
| **(B2B) Director de CX** | Reducir litigios + NPS | Reclamos públicos dañan marca | Dashboard para responder + reputation lift |

## Problems & Pain Points

**Core problem:** El sistema de defensa del consumidor en LATAM está roto. PROFECO (MX) y Defensa del Consumidor (AR) son lentos y burocráticos. Los abogados no toman casos chicos (<$100 USD). Las empresas saben esto y abusan. El consumidor termina aceptando la pérdida.

**Why alternatives fall short:**
- **PROFECO / DCC:** procesos de meses, sin tecnología, requiere ir presencialmente o trámites lentos online.
- **Abogados particulares:** mínimo $200-500 USD por caso, no toman reclamos chicos.
- **Reclame AQUI (BR):** solo Brasil, solo reputación pública, no asesora legalmente ni genera reclamo formal.
- **Plantillas online de "carta de reclamo":** genéricas, sin análisis del caso, sin jurisprudencia, sin saber si vale la pena enviarlas.
- **Resignación:** la mayoría se queda sin reclamar, asumiendo la pérdida.

**What it costs them:** Plata directa (cargos no devueltos, productos defectuosos), tiempo (horas en call centers, idas a oficinas públicas), y emocional (impotencia, sentirse estafado y sin recurso).

**Emotional tension:** Frustración + impotencia. "Sé que tengo razón pero no puedo hacer nada porque pelear me sale más caro que perder." Sentimiento de David vs Goliat.

## Competitive Landscape

**Direct:** *Ninguno en LATAM.* Es un greenfield (verificado en market research del roadmap). En US, plataformas como FairShake o DoNotPay tocan partes del problema pero no aplican a derecho LATAM.

**Secondary (mismo problema, otra solución):**
- **PROFECO / Defensa del Consumidor:** burocrático, sin IA, sin priorización, sin generación automática de documentos.
- **Reclame AQUI (BR):** solo presión reputacional pública, sin generación de reclamo formal ni análisis legal.
- **Abogado particular:** caro, no toma casos chicos.
- **ChatGPT genérico:** sin jurisprudencia indexada, sin scoring financiero, sin envío automático, sin respaldo legal específico AR/MX.

**Indirect (enfoque opuesto):**
- **Resignación / "no vale la pena":** el competidor más grande. Mucha gente no reclama.
- **Denuncia en redes sociales (TikTok rant):** alto reach pero sin resolución estructurada.

## Differentiation

**Key differentiators:**
- **Único en LATAM con IA legal específica AR/MX** (Ley 24.240 + LFPC con embeddings de jurisprudencia real).
- **Scoring financiero (Valor Esperado E = P×V − (1−P)×C):** te dice si vale la pena pelear, en plata.
- **Reputation score multi-dimensional** estilo Reclame AQUI pero con análisis de IA por categoría.
- **Generador + envío de reclamo formal** end-to-end (no solo plantilla).
- **Jurisprudencia indexada con búsqueda semántica** (Pinecone, multilingual-e5-large).
- **Módulo de mediación/arbitraje AI-powered** cuando la empresa no responde.
- **Gratis para el consumidor.** No paywall en core features.

**How we do it differently:** Combinamos lo que hoy está fragmentado — análisis legal + generación de documento + envío + búsqueda de precedentes + scoring financiero + reputación pública — en un único flujo de 5 minutos. Y lo damos gratis al consumidor, monetizando del lado de las empresas que quieren responder.

**Why that's better:**
- Más rápido que cualquier alternativa (5 min vs. semanas).
- Más informado que un abogado promedio (jurisprudencia + datos sectoriales).
- Más barato que todas las alternativas (gratis).
- Más accionable que Reclame AQUI (genera y envía la carta, no solo se queja).

**Why customers choose us:** Porque es la única forma de pelear un reclamo de <$500 USD sin perder más en el intento.

## Objections

| Objection | Response |
|-----------|----------|
| "¿Una IA puede dar consejo legal?" | No reemplazamos a un abogado. Asistimos. La IA está entrenada con leyes vigentes y jurisprudencia real. Para casos >$10K USD recomendamos siempre un abogado humano. |
| "¿Es realmente gratis? ¿Qué obtienen ustedes?" | Sí, gratis para el consumidor. Monetizamos cobrando a las empresas que quieren responder reclamos en nuestro portal (modelo Reclame AQUI). |
| "¿Las empresas van a hacer caso a un reclamo generado por IA?" | El reclamo final es texto legal estándar con tu firma. La empresa no sabe (ni le importa) si lo escribió IA. Lo que importa es la calidad legal del documento. |
| "Mis datos son sensibles. ¿Qué hacen con ellos?" | RLS en Supabase, secrets server-only, Sentry redacta tokens, no compartimos datos con terceros. Compliance LGPD/LFPDPPP. |
| "Ya intenté con PROFECO/DCC y no pasó nada." | Por eso existe Justia. Saltamos al reclamo directo a la empresa primero, escalamos a organismo público solo si es necesario. Resolución más rápida. |

**Anti-persona:**
- Casos penales (estafa criminal grave, no consumidor).
- Disputas B2B (no es nuestro foco).
- Casos >$10K USD (mejor con abogado especializado).
- Usuarios que buscan "venganza" más que resolución (la IA mide intención y desincentiva).

## Switching Dynamics (JTBD Four Forces)

**Push (los aleja del status quo):**
- "Me cansé de llamar al call center."
- "PROFECO/DCC tarda meses, mi caso es de hace 3 semanas y nada."
- "El abogado me dijo que no le cierra cobrarme menos de $500 por mi caso de $200."
- "Ya hice queja en redes y la empresa la borró."

**Pull (los atrae a Justia):**
- "Me dijeron que en 5 minutos genera la carta legal."
- "Es gratis. ¿Qué pierdo?"
- "Tiene jurisprudencia real, no es un genérico."
- "Me dice incluso si vale la pena pelear o no."

**Habit (los mantiene en el viejo método):**
- Resignación aprendida: "estas cosas siempre salen mal."
- Confusión: no saben que tienen derecho.
- Costumbre de quejarse en redes sin acción formal.

**Anxiety (les preocupa cambiar):**
- "¿Y si la empresa me bloquea / cobra represalia?"
- "¿Y si la IA escribe algo mal y me hace quedar mal?"
- "¿Tengo que dar mi DNI/CURP?"
- "¿Y si me sale más caro al final?"

## Customer Language

**How they describe the problem (verbatim — pendiente validación con entrevistas):**
- "Me clavaron"
- "No me devuelven la plata"
- "Me cobraron de más"
- "La empresa no me da bolilla"
- "No te atiende nadie"
- "Es un robo"
- "Quiero hacer un reclamo formal"
- "Necesito una carta documento" (AR)
- "Quiero denunciar a [empresa]" (a veces denunciar = reclamar, no penal)

**How they describe Justia (aspiracional, validar con users reales):**
- "Es como tener un abogado en el bolsillo"
- "Te hace la carta sola"
- "Te dice si te conviene pelear"

**Words to use:**
- Reclamo formal, reclamo, recuperar tu plata, derechos del consumidor, defensa del consumidor, carta documento (AR), queja PROFECO (MX), gratis, en 5 minutos, jurisprudencia real, sin abogado.

**Words to avoid:**
- "Asesoramiento legal" / "consultoría legal" (riesgo regulatorio — no tenemos matrícula).
- "Litigio" / "demanda" / "juicio" (suena caro/penal, espanta al usuario chico).
- "Plataforma legaltech" (jerga de inversor, no de usuario).
- "Disrupción" / "innovación" (vacío).
- "ODR" en marketing al consumidor final (jerga; sí usar en B2B y prensa).

**Glossary:**
| Term | Meaning |
|------|---------|
| Caso | Una instancia de reclamo de un usuario |
| Reputation Score | Puntaje 0-10 de una empresa basado en quejas históricas + dimensiones |
| Valor Esperado (VE / E) | Cálculo financiero E = P×V − (1−P)×C que indica si vale la pena reclamar |
| Jurisprudencia | Casos judiciales previos relevantes al reclamo del usuario |
| Carta documento | Documento legal formal con valor probatorio (uso AR) |
| Mediación / ODR | Resolución alternativa de disputas asistida por IA |
| Recomendación | "CONCILIAR_AHORA" vs "DEFENDER_SELECTIVAMENTE" — output del motor |

## Brand Voice

**Tone:** Aliado del consumidor, levemente combativo contra empresas abusivas, claro y desburocratizado. Cercano sin ser informal de más. Confiable sin ser corporativo.

**Style:**
- Directo: frases cortas, verbos en imperativo amable ("Reclamá", "Recuperá").
- Conversacional: "vos" en AR, "tú" en MX (i18n por país).
- Anti-jerga: si hay que decir un término legal, explicarlo en la misma frase.
- Concreto: cifras, plazos, casos reales — nunca abstracto.

**Personality:** Aliado, decidido, transparente, accesible, anti-burocrático.

**Frase ancla actual del sitio:** "La justicia no debe ser un laberinto, sino un camino con señales claras."
**Tagline alternativo:** "Cuando una empresa falla, tus derechos no deben fallar contigo."

## Proof Points

**Metrics (al 2026-04-29):**
- 344.500 quejas históricas indexadas (PROFECO MX + DCC AR)
- 40 empresas con stats detallados, 17 sectores mapeados
- 10 casos de jurisprudencia real (escalando a 100+ en Q3)
- 129 tests unit + integración pasando ✅
- Stack en producción: Next.js 16, Supabase RLS, Clerk, Sentry, PostHog, Pinecone
- 7 capas de seguridad

**Customers:** *Pendiente — fase de soft launch.* Capturar primeros casos resueltos como case studies.

**Testimonials:** *Pendiente — recolectar via encuesta post-resolución desde el componente FeedbackRating.*

**Value themes:**
| Theme | Proof |
|-------|-------|
| Velocidad | Reclamo formal en 5 min vs. semanas en PROFECO/DCC |
| Costo cero | Gratis vs. $200-500 USD de un abogado |
| Rigor legal | Jurisprudencia real indexada, basado en Ley 24.240 / LFPC |
| Decisión informada | Scoring financiero te dice si vale la pena |
| Sin competidor | Único ODR con IA para consumidor en LATAM |

## Goals

**Business goal (12 meses):**
- Q2 2026: Soft launch + 1.000 casos generados
- Q3 2026: 10.000 casos + primeros 10 logos B2B
- Q4 2026: Activar Pro tier, $10K MRR, prepararse para ronda

**Conversion action (key):**
1. **Primary:** completar análisis IA (analysis_completed) — el momento "aha".
2. **Secondary:** enviar reclamo formal por email (email_sent).
3. **Retention:** volver al D+7 a actualizar estado del caso.

**North star metric candidato:** % de reclamos enviados que reportan resolución positiva en 30 días. Combina activación + valor entregado real.

**Current metrics:** *Pendiente baseline post-launch.*
