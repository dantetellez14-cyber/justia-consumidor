PARA: Clemente
DE: Dr. Dante Téllez
ASUNTO: Propuesta Estratégica de Inversión y Desarrollo – JustIA Consumidor
FECHA: 5 de abril de 2026

---

Estimado Clemente,

Basado en nuestras conversaciones sobre la visión de JustIA Consumidor, he avanzado significativamente más allá de la conceptualización: **ya existe un prototipo funcional en producción** con arquitectura enterprise-grade, inteligencia artificial integrada, y datos reales de PROFECO y Defensa del Consumidor. Lo que presento a continuación no es una promesa — es una demostración de capacidad ejecutada.

He estructurado una ruta de ejecución técnica y financiera que garantiza no solo la creación de la plataforma, sino su integridad jurídica y escalabilidad. Mi objetivo es que cuentes con un equipo de alto nivel que yo supervisaré directamente, permitiéndote a ti enfocarte en la validación legal estratégica.

---

## I. ESTADO ACTUAL: LO QUE YA EXISTE (MVP Funcional)

Antes de presentar la inversión por fases, es fundamental que conozcas el estado actual del desarrollo. **JustIA Consumidor ya es una plataforma funcional desplegada en producción**, no un wireframe ni un concepto. A continuación, el inventario técnico completo:

### A. Arquitectura de Producción

| Componente | Tecnología | Estado |
|------------|-----------|--------|
| Framework | Next.js 16 (App Router, React 19) | Producción |
| Lenguaje | TypeScript (tipado estricto) | Producción |
| Estilos | Tailwind CSS v4 + Framer Motion | Producción |
| Hosting | Vercel (serverless, edge-optimized) | Producción |
| Base de datos | Supabase PostgreSQL + Row-Level Security | Producción |
| Autenticación | Clerk (OAuth/OIDC, JWT) | Producción |
| Rate Limiting | Upstash Redis (distribuido) + fallback en memoria | Producción |
| Monitoreo de errores | Sentry (captura automática + replay) | Producción |
| Analytics | PostHog (eventos, funnels) | Producción |
| Email transaccional | Resend (reclamos formales + confirmaciones) | Producción |
| Búsqueda semántica | Pinecone (vector DB, embeddings multilingüe) | Producción |
| CI/CD | GitHub Actions (lint + test + type-check + build) | Producción |

### B. Motor de IA — "El Cerebro Legal"

El corazón de JustIA es un motor de análisis legal basado en inteligencia artificial que ya funciona:

- **Modelo**: Ollama con Gemma 2 (9B parámetros) — modelo open-source, sin costos de API por consulta
- **Temperatura**: 0.3 (precisión alta, alucinación mínima)
- **Salida estructurada**: JSON con 8 campos obligatorios validados por Zod:
  - Empresa identificada
  - Producto/servicio
  - Monto del reclamo
  - Fecha del incidente
  - Agravio principal (resumen de 1 línea)
  - Probabilidad de éxito (0-1)
  - Análisis legal (cita artículos específicos de Ley 24.240 o LFPC)
  - País detectado (AR/MX)
- **Modo demo**: Cuando el modelo no está disponible, la plataforma genera un análisis sintético para no interrumpir la experiencia del usuario
- **Búsqueda semántica de jurisprudencia**: Pinecone con embeddings `multilingual-e5-large` (1024 dimensiones) busca los 5 precedentes legales más similares al caso del usuario

### C. Datos Reales Integrados

| Fuente | País | Contenido | Registros |
|--------|------|-----------|-----------|
| PROFECO | MX | Estadísticas de quejas por empresa y sector | 20 empresas + 9 sectores |
| Defensa del Consumidor | AR | Estadísticas de quejas por empresa y sector | 20 empresas + 8 sectores |
| Jurisprudencia | AR/MX | Casos reales con ratio decidendi | 10 casos (5 AR + 5 MX) |
| Total | — | Quejas históricas cubiertas | 344,500 quejas |

**Empresas cubiertas (ejemplos)**:
- MX: Telmex, Telcel, BBVA México, Volaris, Liverpool, Coppel, Amazon México, Mercado Libre MX, CFE, Izzi
- AR: Personal, Telecom/Fibertel, MercadoLibre, Despegar, Edesur, Metrogas, Claro, LATAM Argentina, Garbarino, Fravega

**Cliente PROFECO API**: Código listo para sincronización automática cuando la API gubernamental vuelva a estar online (actualmente devuelve error 500 del lado del gobierno).

### D. Funcionalidades Implementadas (16 Componentes, 7 APIs)

#### Flujo Completo del Usuario:

```
1. BIENVENIDA → Landing con propuesta de valor
2. FORMULARIO ESTRUCTURADO → 15 categorías, canal de compra, resolución deseada
3. ANÁLISIS IA → Extracción de entidades + análisis legal + probabilidad de éxito
4. DASHBOARD DE RESULTADOS →
   ├── Entidades extraídas (empresa, producto, monto, fecha)
   ├── Análisis legal con artículos citados
   ├── Estadísticas de quejas PROFECO/Defensa del Consumidor
   ├── Score de reputación de la empresa (0-10, 5 niveles)
   ├── Gráfico financiero (Valor Esperado vs. Costo de litigio)
   ├── Recomendación de acción (CONCILIAR vs. DEFENDER)
   └── Jurisprudencia relevante (búsqueda semántica)
5. GENERADOR DE RECLAMO FORMAL → Texto legal formateado AR/MX
6. ENVÍO POR EMAIL → Reclamo a la empresa + confirmación al usuario
7. MÓDULO DE MEDIACIÓN/ODR → Interfaz de arbitraje AI-powered
8. SEGUIMIENTO DE CASO → Timeline de progresión con estados
9. FEEDBACK → Calificación 1-5 estrellas + comentario
```

#### APIs Construidas:

| Endpoint | Función | Seguridad |
|----------|---------|-----------|
| `POST /api/analyze` | Análisis legal IA del reclamo | Rate limit: 10/min, validación Zod |
| `POST /api/complaint-stats` | Estadísticas + reputación empresa | Rate limit: 30/min, validación Zod |
| `POST /api/search-jurisprudencia` | Búsqueda semántica de precedentes | Rate limit: 15/min, Pinecone |
| `POST /api/cases` | Crear caso en Supabase | Autenticación Clerk requerida |
| `GET /api/cases` | Listar casos del usuario | Autenticación + filtro por user_id |
| `PATCH /api/cases/[id]` | Actualizar estado del caso | Autenticación requerida |
| `POST /api/send-complaint` | Enviar reclamo por email | Rate limit: 5/hora (anti-spam) |
| `POST /api/feedback` | Registrar calificación del usuario | Vinculado a caso |

### E. Algoritmos Propietarios

#### 1. Fórmula de Valor Esperado (Scoring Financiero)
```
E = P × V - (1-P) × C

Donde:
P = Probabilidad de éxito (calculada por IA)
V = Valor del reclamo (monto ingresado por usuario)
C = Costo estimado de litigio (25% del valor del reclamo)
```
Genera recomendación automática: `CONCILIAR_AHORA` vs. `DEFENDER_SELECTIVAMENTE`

#### 2. Algoritmo de Reputación Empresarial (Inspirado en Reclame AQUI, Brasil)
Score de 0-10 con 4 dimensiones ponderadas:
- **Resolución** (40%): Tasa de resolución de quejas
- **Recuperación** (25%): % del monto reclamado que el consumidor recupera
- **Volumen** (15%): Quejas relativas al sector (invertido: menos = mejor)
- **Resultado** (20%): Calidad compuesta del resultado

5 niveles de clasificación:
| Nivel | Rango | Color |
|-------|-------|-------|
| Excelente | 8.0-10.0 | Verde |
| Bueno | 6.0-7.9 | Azul |
| Regular | 4.0-5.9 | Ámbar |
| Malo | 2.0-3.9 | Naranja |
| No recomendado | 0.0-1.9 | Rojo |

### F. Seguridad — Arquitectura de 7 Capas

| Capa | Implementación |
|------|---------------|
| 1. Autenticación | Clerk OAuth/OIDC con JWT en cada request protegido |
| 2. Autorización | Middleware de rutas con `auth.protect()` |
| 3. Validación de entrada | Schemas Zod en TODOS los endpoints (min/max, enums, email) |
| 4. Rate Limiting | Upstash Redis distribuido (sliding window) por IP y endpoint |
| 5. Seguridad de datos | Supabase RLS, secret key solo en servidor, pino redacta tokens/cookies |
| 6. Headers de seguridad | HSTS (2 años), CSP granular, X-Frame-Options, Permissions-Policy |
| 7. Monitoreo | Sentry con proxy tunnel (anti-adblockers), alertas automáticas |

**Content Security Policy (CSP)** — Cada recurso externo está explícitamente whitelisteado:
- Scripts: solo self + Clerk + PostHog + Sentry
- Conexiones: solo self + Supabase + Clerk + PostHog + Sentry + Pinecone + Upstash
- Frames: solo Clerk CAPTCHA + Cloudflare challenges
- Objects/plugins: completamente bloqueados

### G. Testing y Calidad

- **Framework**: Vitest (129 tests passing)
- **11 suites de prueba** cubriendo: scoring financiero, reputación, validaciones Zod, rate limiting, jurisprudencia, templates de email, y APIs
- **Type checking**: `tsc --noEmit` en CI/CD
- **Linting**: ESLint en cada push
- **Build verification**: Next.js build completo en pipeline

### H. Market Research Realizado

Se condujo investigación exhaustiva del mercado en México y Argentina:

**Hallazgo clave: NO EXISTE competidor directo.**

| Competidor potencial | Modelo | Por qué NO es competencia directa |
|---------------------|--------|-----------------------------------|
| PROFECO (MX) | Gubernamental | Solo recibe quejas, no asesora con IA ni calcula probabilidades |
| Defensa del Consumidor (AR) | Gubernamental | Proceso burocrático, sin tecnología de autoservicio |
| Abogados de consumo | Tradicional | No toman casos pequeños (la "fórmula" que discutimos) |
| Reclame AQUI (BR) | Solo reputación | No genera reclamos, no tiene IA legal, solo Brasil |
| Resolver.com | Mediación genérica | Sin especialización legal LATAM, sin IA |

**JustIA ocupa un espacio de mercado completamente vacío**: AI-powered consumer self-service ODR para reclamos pequeños en LATAM.

---

## II. DESGLOSE DE INVERSIÓN POR FASE

### Fase 1: MVP y "Cerebro" Legal (Mes 1-3)

**Enfoque**: Refinamiento del motor de IA, ingesta masiva de leyes, y hardening del MVP existente para lanzamiento público.

**Nota**: Gran parte de esta fase ya está avanzada. La inversión se enfoca en: integración de modelo de producción (migración de Ollama local a API cloud), ingesta completa de legislación, UX profesional, y validación legal de outputs.

| Integrante | Rol y Responsabilidad | Inversión Mensual | Total Fase 1 |
|------------|----------------------|-------------------|-------------|
| Full-Stack Developer | Migración a modelo cloud (GPT-4o/Claude), integración PROFECO live, hardening de APIs existentes | $3,500 USD | $10,500 USD |
| UX/UI Designer | Rediseño profesional sobre la base funcional existente (entrega inicial) | $1,500 USD* | $1,500 USD |
| QA Legal (Híbrido) | Estudiante de Derecho + IA. Validación de outputs legales, calibración de prompts, testing de artículos citados | $1,200 USD | $3,600 USD |
| Arquitecto & PM (Dante) | Dirección técnica, arquitectura Cloud, PM, supervisión de seguridad y compliance | $1,300 USD | $3,900 USD |
| **TOTAL FASE 1** | | | **$19,500 USD** |

**Entregables Fase 1**:
- Modelo de producción cloud con < 2% de alucinación legal
- Ingesta de Ley 24.240 completa (AR) y LFPC completa (MX) con articulado indexado
- Sincronización automática con PROFECO cuando API vuelva online
- UX/UI profesional sobre los 16 componentes existentes
- Base de jurisprudencia expandida de 10 a 100+ casos
- Suite de testing expandida a 300+ tests

### Fase 2: Gestión de Casos y Pagos (Mes 4-6)

**Enfoque**: Trazabilidad end-to-end de reclamos, interacción directa con empresas, pasarela de pagos, y monetización.

| Integrante | Rol y Responsabilidad | Inversión Mensual | Total Fase 2 |
|------------|----------------------|-------------------|-------------|
| Full-Stack Developer | Dashboard empresarial, pasarela de pagos (Stripe/Conekta), notificaciones en tiempo real, API empresas | $3,500 USD | $10,500 USD |
| QA Legal (Híbrido) | Validación de lógica de arbitraje, reportes legales densos, testing de flujos de mediación | $1,500 USD | $4,500 USD |
| Arquitecto (Dante) | Optimización de modelos, costos de tokens, escalabilidad, arquitectura de microservicios | $2,150 USD | $6,500 USD |
| **TOTAL FASE 2** | | | **$21,500 USD** |

**Entregables Fase 2**:
- Dashboard para empresas (portal de respuesta a reclamos)
- Pasarela de pagos integrada (modelo freemium + premium)
- Sistema de notificaciones push/email en tiempo real
- API pública para empresas que quieran integrar respuesta a reclamos
- Módulo de mediación con chat AI-assisted entre consumidor y empresa
- Reportes legales PDF exportables

### Fase 3: Consolidación y Escalamiento (Mes 7+)

**Enfoque**: Mejora continua, mantenimiento, expansión regional, y alianzas estratégicas.

Para esta etapa, propongo un modelo de sociedad tecnológica que asegure mi acompañamiento y evolución de la plataforma de por vida:

- **Inversión Ejecutiva**: $12,000 USD (fee anual / fase de ejecución técnica)
- **Participación**: 15% de Equity sobre la propiedad de la plataforma
- **Continuidad**: Supervisión del equipo de desarrollo y QA Legal según requerimientos

**Entregables Fase 3**:
- Expansión a Colombia, Chile, Perú (adaptación legislativa)
- Alianzas con organismos gubernamentales de protección al consumidor
- App móvil nativa (React Native / Expo)
- Machine learning sobre datos históricos para mejorar predicciones
- Certificación de seguridad (SOC 2 Type II)

---

## III. MODELO DE VALIDACIÓN DE TRIPLE CAPA

Para tu tranquilidad como abogado, la plataforma opera bajo un esquema de seguridad jurídica robusto:

| Capa | Responsable | Función | Estado |
|------|-------------|---------|--------|
| **Capa Técnica** | Dante + equipo dev | Garantizar que la IA no "alucine", use fuentes verificadas, y outputs sean estructurados y validados | Implementado (Zod schemas, temperatura 0.3, modo demo) |
| **Capa QA Legal** | Perfil híbrido Derecho+IA | Filtrar y validar que las respuestas cumplan con la normativa vigente, calibrar prompts legales | A contratar Fase 1 |
| **Validación Final (SME)** | Clemente | Recibir casos pre-validados por las 2 capas anteriores para visto bueno final, optimizando tiempo de revisión | Listo para activar |

**Seguridades técnicas ya implementadas**:
- Rate limiting distribuido previene abuso
- Validación Zod en cada entrada previene inyección
- Content Security Policy previene XSS/clickjacking
- Row-Level Security en Supabase previene acceso no autorizado
- Sentry captura cada error en producción con stack trace completo
- Logs estructurados con redacción automática de datos sensibles

---

## IV. VENTAJA COMPETITIVA VERIFICABLE

| Factor | JustIA | PROFECO/DCC | Abogados tradicionales |
|--------|--------|-------------|----------------------|
| Accesibilidad 24/7 | Si | No (horario oficina) | No (cita previa) |
| Costo para el usuario | Gratis/bajo costo | Gratis pero burocrático | $500-5,000 USD |
| Análisis con IA | Si (probabilidad + jurisprudencia) | No | No |
| Reclamos pequeños (<$100 USD) | Viables | Posibles pero ineficientes | No rentables |
| Tiempo de análisis | < 30 segundos | Días/semanas | Días |
| Score de reputación | Si (algoritmo propio) | No | No |
| Generación automática de reclamo | Si (formateado legal AR/MX) | No | Manual |
| Multi-país | AR + MX (expandible) | Solo 1 país | Solo 1 jurisdicción |

---

## V. RESUMEN FINANCIERO

| Fase | Periodo | Inversión | Acumulado |
|------|---------|-----------|-----------|
| Fase 1: MVP y Cerebro Legal | Mes 1-3 | $19,500 USD | $19,500 USD |
| Fase 2: Gestión y Pagos | Mes 4-6 | $21,500 USD | $41,000 USD |
| Fase 3: Escalamiento | Mes 7+ | $12,000 USD/año + 15% equity | $53,000 USD (año 1) |

---

Clemente, esta propuesta está respaldada por un producto que ya funciona, no por promesas. Puedo hacerte una demostración en vivo de todo lo descrito arriba en cualquier momento. Esta estructura nos permite lanzar un producto de clase mundial con una inversión controlada y un equipo que yo personalmente seleccionaré y gestionaré para asegurar el éxito de JustIA.

Quedo a tu disposición para revisar cualquier punto y dar el siguiente paso.

Atentamente,

**Dr. Dante Téllez**
Arquitecto de Software & Director Técnico, JustIA Consumidor
