import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const PAGE_PATH = "/guias/como-reclamar-att-mexico";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-30";
const UPDATED = "2026-04-30";

export const metadata: Metadata = {
  title:
    "Cómo reclamar a AT&T México: cobros, portabilidad y baja (2026)",
  description:
    "Guía paso a paso para reclamar a AT&T en México. Cobros indebidos, portabilidad bloqueada, baja imposible, sin señal con cobro. Soy Usuario IFT + PROFECO. Modelo de carta gratis.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a AT&T México — paso a paso",
    description:
      "IFT + PROFECO + carta documento. Modelo legal gratis para resolver cobros indebidos, portabilidad o baja.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

const faqItems = [
  {
    q: "¿AT&T puede negarse a darme de baja?",
    a: "No. La Ley Federal de Telecomunicaciones obliga a procesar bajas sin penalizaciones cuando el plazo forzoso ha sido cumplido. Si AT&T se niega, queja en Soy Usuario (IFT) y PROFECO.",
  },
  {
    q: "¿Cuánto tarda una portabilidad de AT&T a otro operador?",
    a: "Por ley, máximo 24 horas hábiles desde que el nuevo operador la solicita. Si AT&T la bloquea o demora más, presentás queja en IFT con el folio. AT&T no puede condicionarla a pagar adeudos disputados.",
  },
  {
    q: "Tengo que pagar la factura mientras reclamo cobros indebidos?",
    a: "Solo el monto NO disputado. Por la parte en disputa, podés pagar bajo protesta o no pagar. Una suspensión por monto disputado durante un reclamo activo refuerza tu caso.",
  },
  {
    q: "¿Puedo reclamar cargos por servicios que no contraté?",
    a: "Sí. Suscripciones, contenido premium, paquetes de datos extra o roaming sin tu consentimiento expreso son improcedentes. Pedí desactivación + reembolso de los meses cobrados.",
  },
  {
    q: "¿Qué hago si AT&T me cortó la línea sin avisarme?",
    a: "El corte sin notificación previa es ilegal. Llamá al *611, pedí folio, y si no se resuelve en 48 horas, escalá a Soy Usuario IFT. Reclamá bonificación por el tiempo sin servicio.",
  },
  {
    q: "¿Sirve quejarse en Twitter/redes a AT&T?",
    a: "Como complemento sí, pero NO reemplaza el folio formal. Sin folio escrito de AT&T no hay caso para escalar a IFT o PROFECO. Hacé las dos cosas: reclamo formal + denuncia pública.",
  },
];

const howToSteps = [
  {
    name: "Atención al cliente AT&T",
    text: "Llamá al *611 desde tu AT&T, al 800 288 2020 desde otro número, o entrá a Mi AT&T. Pedí siempre folio de queja por escrito. Plazo de respuesta: 5 días hábiles.",
  },
  {
    name: "Soy Usuario (IFT)",
    text: "Si AT&T no responde, presentá queja en soyusuario.ift.org.mx. El IFT actúa como mediador y resuelve en aproximadamente 30 días, con plazo de 10 días hábiles para que AT&T responda.",
  },
  {
    name: "PROFECO",
    text: "En paralelo o si IFT no resuelve, queja en Concilianet (concilianet.profeco.gob.mx). Audiencia de conciliación en 15-30 días. PROFECO puede emitir laudo arbitral vinculante.",
  },
  {
    name: "Carta documento o demanda",
    text: "Carta documento intima formalmente a resolver en 10 días hábiles. Demanda civil si el monto supera $20.000 MXN o hay daños no resueltos.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      name: "Cómo reclamar a AT&T México",
      description:
        "Pasos legales para reclamar a AT&T por cobros indebidos, portabilidad bloqueada, baja negada o sin señal con cobro.",
      datePublished: PUBLISHED,
      dateModified: UPDATED,
      step: howToSteps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@type": "Article",
      headline: "Cómo reclamar a AT&T México paso a paso (2026)",
      datePublished: PUBLISHED,
      dateModified: UPDATED,
      author: { "@type": "Organization", name: "JustIA Consumidor" },
      publisher: {
        "@type": "Organization",
        name: "JustIA Consumidor",
        url: SITE_URL,
      },
      url: PAGE_URL,
      mainEntityOfPage: PAGE_URL,
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-6 py-12 text-slate-900">
        <header className="mb-10">
          <p className="mb-3 text-sm text-slate-500">
            <Link href="/guias" className="hover:underline">
              Guías
            </Link>{" "}
            → México → AT&T
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a AT&T México paso a paso
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Última actualización: 30 de abril de 2026 · Tiempo de lectura: 8 min
          </p>
        </header>

        <aside className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            Resumen rápido
          </p>
          <p className="mt-2 text-slate-700">
            AT&T es la segunda telefónica con más quejas en IFT después de
            Telcel. Si te cobraron de más, te bloquearon una portabilidad, te
            niegan la baja o no tenés señal pero sí cargos, tenés 4 caminos
            legales: atención interna, Soy Usuario IFT, PROFECO y carta
            documento. Esta guía te lleva por todos con plazos, costos y
            modelo de carta gratis.
          </p>
        </aside>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Cuándo conviene reclamar a AT&T
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>Cobros indebidos: servicios que no contrataste, suscripciones premium, roaming sin notificar.</li>
            <li>Portabilidad bloqueada o demorada (excede 24 hs hábiles).</li>
            <li>Baja imposible después de cumplido el forzoso.</li>
            <li>Sin señal pero con cobro: zonas sin cobertura efectiva.</li>
            <li>Cambio de plan sin consentimiento.</li>
            <li>Velocidad o datos engañosos: lo entregado no coincide con lo publicitado.</li>
            <li>Equipo defectuoso bajo garantía: AT&T se niega a reparar o reemplazar.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 1 — Atención al cliente AT&T
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">
            <li><strong>*611</strong> desde tu AT&T, o <strong>800 288 2020</strong> desde otro número.</li>
            <li>App <em>Mi AT&T</em>: sección "Soporte" → "Quejas".</li>
            <li>Centro de Atención presencial.</li>
            <li><strong>Pedí folio de queja por escrito.</strong> Sin folio no hay caso.</li>
            <li>AT&T tiene <strong>5 días hábiles</strong> para responder.</li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 2 — Soy Usuario (IFT)
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            El IFT tiene plataforma específica para telecom. Es el camino más
            rápido para portabilidad, cobertura y calidad del servicio.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Plataforma:</strong>{" "}
              <a
                href="https://soyusuario.ift.org.mx"
                className="text-blue-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                soyusuario.ift.org.mx
              </a>
            </li>
            <li>Costo: gratis.</li>
            <li>Plazo de respuesta de AT&T: 10 días hábiles.</li>
            <li>Resolución estimada: 30 días.</li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="inline"
          source="guia-att"
          headline="¿Querés saltarte estos 4 pasos?"
          body="JustIA está construyendo una herramienta que hace todo este proceso por vos en 5 minutos. Sumate a la lista de espera."
        />

        <section className="mb-12 mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 3 — PROFECO
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            En paralelo o si IFT no resuelve, presentá queja en{" "}
            <a
              href="https://concilianet.profeco.gob.mx"
              className="text-blue-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              Concilianet
            </a>
            . Conviene PROFECO cuando hay publicidad engañosa, daños
            cuantificables o necesitás laudo arbitral vinculante.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 4 — Carta documento o demanda
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>Costo carta documento: $80-150 MXN en Correos de México.</li>
            <li>Plazo de respuesta legal: 10 días hábiles.</li>
            <li>Demanda civil: monto &gt;$20.000 MXN o daños no resueltos.</li>
          </ul>
        </section>

        <section className="mb-12 rounded-xl border border-slate-300 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Modelo de queja formal a AT&T (gratis)
          </h2>
          <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-5 font-mono text-xs leading-relaxed text-slate-100">
{`[Lugar y fecha]

AT&T Comunicaciones Digitales, S. de R.L. de C.V.
Av. Río Lerma No. 232, Col. Cuauhtémoc
06500, CDMX

ASUNTO: Reclamo formal — Línea [tu número AT&T]

[Nombre completo], titular de la línea [número de 10 dígitos],
con cuenta [número], domicilio en [dirección], correo
[email], comparezco y manifiesto:

HECHOS:
1) Soy cliente de AT&T desde [fecha aproximada], con plan
   [nombre], pagando $[monto] MXN mensuales.

2) [Describí en 3-5 líneas el problema concreto].

3) Presenté queja en AT&T con folio [número de folio] el
   [DD/MM/AAAA] y a la fecha de esta carta no he recibido
   respuesta satisfactoria.

DERECHO:
Conforme a los artículos 191, 198 y 199 de la Ley Federal de
Telecomunicaciones y Radiodifusión, y a los artículos 7, 32 y
92 de la Ley Federal de Protección al Consumidor, solicito la
atención inmediata de mi reclamo.

PETICIONES:
1) Reintegro de los montos cobrados indebidamente:
   $[monto] MXN.
2) [Petición específica: portabilidad, baja, reactivación].
3) Bonificación por días sin servicio o demora en atención.
4) Respuesta por escrito en 10 días hábiles, bajo
   apercibimiento de queja ante IFT (Soy Usuario) y PROFECO.

[Firma]
[Nombre completo]
[RFC opcional]
[Fecha]`}
          </pre>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Preguntas frecuentes
          </h2>
          <dl className="mt-6 space-y-6">
            {faqItems.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold text-slate-900">{item.q}</dt>
                <dd className="mt-2 text-slate-700">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">Guías relacionadas</h2>
          <ul className="mt-4 space-y-2 text-blue-700">
            <li>
              <Link href="/guias/como-reclamar-telcel-mexico" className="hover:underline">
                → Cómo reclamar a Telcel paso a paso (México)
              </Link>
            </li>
            <li>
              <Link href="/guias/como-reclamar-cfe-mexico" className="hover:underline">
                → Cómo reclamar a CFE: cobros indebidos y errores de medición
              </Link>
            </li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="footer"
          source="guia-att-footer"
          headline="JustIA está pronto"
          body="Reclamar a AT&T debería tomar 5 minutos, no 5 semanas. Sumate a la lista de espera."
        />
      </article>
    </>
  );
}
