import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const PAGE_PATH = "/guias/como-reclamar-movistar-mexico";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-30";
const UPDATED = "2026-04-30";

export const metadata: Metadata = {
  title:
    "Cómo reclamar a Movistar México: cobros, baja y portabilidad (2026)",
  description:
    "Guía paso a paso para reclamar a Movistar en México. Cobros indebidos, portabilidad bloqueada, baja imposible. Soy Usuario IFT + PROFECO. Modelo de carta gratis.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a Movistar México — paso a paso",
    description: "IFT + PROFECO + carta documento. Modelo legal gratis.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

const faqItems = [
  {
    q: "¿Movistar México sigue operando como tal en 2026?",
    a: "Movistar México vendió su red móvil a AT&T en 2019 pero sigue ofreciendo planes prepago y de servicios bajo su marca. Si tu plan es de telefonía móvil reciente, podría estar operado por AT&T u otra contratante. Verificá en tu factura quién es el prestador legal.",
  },
  {
    q: "¿Movistar puede negarse a darme de baja?",
    a: "No. La Ley Federal de Telecomunicaciones obliga a procesar bajas sin penalizaciones cuando el plazo forzoso ha sido cumplido. Si Movistar se niega, queja en Soy Usuario (IFT) y PROFECO.",
  },
  {
    q: "¿Cuánto tarda una portabilidad de Movistar?",
    a: "Por ley, máximo 24 horas hábiles desde que el nuevo operador la solicita. No pueden condicionarla al pago de adeudos disputados.",
  },
  {
    q: "¿Tengo que pagar la factura mientras reclamo?",
    a: "Solo el monto NO disputado. Por la parte en disputa, podés pagar bajo protesta o no pagar. Si Movistar suspende el servicio por monto disputado durante un reclamo activo, eso refuerza tu caso.",
  },
  {
    q: "¿Puedo reclamar cargos por servicios que no contraté?",
    a: "Sí. Suscripciones, contenido premium, paquetes de datos extra o roaming sin tu consentimiento expreso son improcedentes. Pedí desactivación + reembolso.",
  },
  {
    q: "¿Qué hago si Movistar me cortó el servicio sin avisarme?",
    a: "El corte sin notificación previa es ilegal. Pedí folio del incidente y, si no se resuelve en 48 horas, escalá a Soy Usuario IFT. Reclamá bonificación por el tiempo sin servicio.",
  },
];

const howToSteps = [
  {
    name: "Atención al cliente Movistar",
    text: "Llamá al 800 888 8366, o entrá a Mi Movistar. Pedí folio de queja por escrito. Plazo de respuesta: 5 días hábiles.",
  },
  {
    name: "Soy Usuario (IFT)",
    text: "Si Movistar no responde, presentá queja en soyusuario.ift.org.mx. Resolución estimada: 30 días, con plazo de 10 días hábiles para que Movistar responda.",
  },
  {
    name: "PROFECO",
    text: "En paralelo o si IFT no resuelve, queja en Concilianet (concilianet.profeco.gob.mx). Audiencia en 15-30 días.",
  },
  {
    name: "Carta documento o demanda",
    text: "Carta documento intima formalmente a resolver en 10 días hábiles. Demanda civil si el monto supera $20.000 MXN.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      name: "Cómo reclamar a Movistar México",
      description:
        "Pasos legales para reclamar a Movistar por cobros indebidos, portabilidad bloqueada, baja negada o sin señal con cobro.",
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
      headline: "Cómo reclamar a Movistar México paso a paso (2026)",
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
            <Link href="/guias" className="hover:underline">Guías</Link> → México → Movistar
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a Movistar México paso a paso
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Última actualización: 30 de abril de 2026 · Tiempo de lectura: 7 min
          </p>
        </header>

        <aside className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            Resumen rápido
          </p>
          <p className="mt-2 text-slate-700">
            Si Movistar te cobró de más, te bloqueó la portabilidad o te niegan
            la baja, tenés 4 caminos legales: atención interna, Soy Usuario
            IFT, PROFECO y carta documento. Esta guía te lleva por todos con
            plazos, costos y modelo legal gratis.
          </p>
        </aside>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Cuándo conviene reclamar a Movistar</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>Cobros indebidos: servicios extra, suscripciones, roaming sin notificar.</li>
            <li>Portabilidad bloqueada o demorada (excede 24 hs hábiles).</li>
            <li>Baja imposible después de cumplido el forzoso.</li>
            <li>Sin señal pero con cobro: zonas sin cobertura efectiva.</li>
            <li>Cambio de plan sin consentimiento.</li>
            <li>Velocidad o datos engañosos.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Paso 1 — Atención al cliente Movistar</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">
            <li><strong>Telefónica:</strong> 800 888 8366 o *611 desde tu Movistar.</li>
            <li><strong>App Mi Movistar:</strong> sección "Atención" → "Quejas".</li>
            <li><strong>Centro de Atención:</strong> presencial en cualquier oficina.</li>
            <li><strong>Pedí folio</strong> de queja por escrito.</li>
            <li>Movistar tiene <strong>5 días hábiles</strong> para responder.</li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Paso 2 — Soy Usuario (IFT)</h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Camino más rápido para portabilidad, cobertura y calidad del servicio.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Plataforma:</strong>{" "}
              <a href="https://soyusuario.ift.org.mx" className="text-blue-700 underline" target="_blank" rel="noreferrer">
                soyusuario.ift.org.mx
              </a>
            </li>
            <li>Costo: gratis.</li>
            <li>Plazo de respuesta de Movistar: 10 días hábiles.</li>
            <li>Resolución estimada: 30 días.</li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="inline"
          source="guia-movistar-mx"
          headline="¿Querés saltarte estos 4 pasos?"
          body="JustIA está construyendo una herramienta que hace todo este proceso por vos en 5 minutos. Sumate a la lista de espera."
        />

        <section className="mb-12 mt-12">
          <h2 className="text-2xl font-bold text-slate-900">Paso 3 — PROFECO</h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Conviene cuando hay publicidad engañosa, daños cuantificables o
            necesitás laudo arbitral vinculante.{" "}
            <a href="https://concilianet.profeco.gob.mx" className="text-blue-700 underline" target="_blank" rel="noreferrer">
              concilianet.profeco.gob.mx
            </a>
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Paso 4 — Carta documento o demanda</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>Costo carta documento: $80-150 MXN.</li>
            <li>Plazo de respuesta legal: 10 días hábiles.</li>
            <li>Demanda civil: monto &gt;$20.000 MXN o daños no resueltos.</li>
          </ul>
        </section>

        <section className="mb-12 rounded-xl border border-slate-300 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Modelo de queja formal a Movistar (gratis)
          </h2>
          <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-5 font-mono text-xs leading-relaxed text-slate-100">
{`[Lugar y fecha]

Telefónica Movistar México (Telefónica Movistar
México, S.A. de C.V.)
[Domicilio fiscal vigente — verificar en factura]

ASUNTO: Reclamo formal — Línea [tu número Movistar]

[Nombre completo], titular de la línea [número], con cuenta
[número], domicilio en [dirección], correo [email],
comparezco y manifiesto:

HECHOS:
1) Soy cliente de Movistar desde [fecha], plan [nombre],
   pagando $[monto] MXN mensuales.

2) [Describí el problema concreto].

3) Presenté queja con folio [número] el [DD/MM/AAAA] sin
   respuesta satisfactoria.

DERECHO:
Conforme a los artículos 191, 198 y 199 de la Ley Federal
de Telecomunicaciones y Radiodifusión, y artículos 7, 32 y
92 de la LFPC.

PETICIONES:
1) Reintegro de los montos cobrados indebidamente.
2) [Petición específica: portabilidad / baja / reactivación].
3) Bonificación por días sin servicio.
4) Respuesta en 10 días hábiles, bajo apercibimiento de
   queja ante IFT (Soy Usuario) y PROFECO.

[Firma]
[Nombre completo]
[RFC opcional]
[Fecha]`}
          </pre>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Preguntas frecuentes</h2>
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
              <Link href="/guias/como-reclamar-att-mexico" className="hover:underline">
                → Cómo reclamar a AT&T paso a paso (México)
              </Link>
            </li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="footer"
          source="guia-movistar-mx-footer"
          headline="JustIA está pronto"
          body="Reclamar a Movistar debería tomar 5 minutos, no 5 semanas. Sumate a la lista de espera."
        />
      </article>
    </>
  );
}
