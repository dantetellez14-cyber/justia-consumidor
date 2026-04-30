import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const PAGE_PATH = "/guias/como-reclamar-telecentro-argentina";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-30";
const UPDATED = "2026-04-30";

export const metadata: Metadata = {
  title:
    "Cómo reclamar a Telecentro: factura, baja y servicio (Argentina 2026)",
  description:
    "Guía paso a paso para reclamar a Telecentro en Argentina. Factura mal cobrada, baja imposible, internet caído, cargos por servicios no contratados. ENACOM + COPREC. Botón de baja Ley 27.250. Modelo gratis.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a Telecentro — paso a paso (Argentina)",
    description:
      "ENACOM + COPREC + carta documento. Botón de baja, factura, internet caído. Modelo legal gratis.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

const faqItems = [
  {
    q: "¿Telecentro puede negarse a darme de baja?",
    a: "No. La Ley 27.250 obliga a tener botón de baja online y procesar la solicitud sin penalizaciones. Telecentro figura entre las telecom más reclamadas justamente por trabar bajas. La baja debe efectivizarse en máximo 10 días corridos, con constancia escrita inmediata.",
  },
  {
    q: "¿Qué hago si tengo internet caído todo el tiempo?",
    a: "Por el art. 25 de la Ley 27.078, Telecentro debe acreditar bonificaciones automáticas por interrupciones que excedan los plazos regulados. Si no las aplica, reclamás en ENACOM con capturas de los cortes (fecha y hora) y mediciones de velocidad.",
  },
  {
    q: "Telecentro me cobra un servicio que cancelé. ¿Qué hago?",
    a: "Reclamo formal con número. Si en 10 días hábiles no resuelven, queja en ENACOM (defensa.enacom.gob.ar). Tenés derecho a reembolso íntegro + interés punitorio (Ley 24.240 art. 31).",
  },
  {
    q: "¿Puedo cancelar el contrato sin esperar al fin del forzoso si el servicio es deficiente?",
    a: "Sí, sin penalidades. La Ley 24.240 (art. 10 y 17) permite resolver el contrato cuando el servicio no se presta en las condiciones pactadas. Documentá las fallas e intimá por carta documento.",
  },
  {
    q: "¿Qué hago si Telecentro me cambió el plan o subió el precio sin avisarme?",
    a: "Es una infracción al art. 19 de la Ley 24.240. Pedí restitución del plan original, reembolso de la diferencia cobrada y bonificación. Si Telecentro no resuelve, queja en ENACOM y COPREC.",
  },
  {
    q: "¿Tengo que pagar la factura mientras reclamo cobros indebidos?",
    a: "Solo el monto NO disputado. Por la parte en disputa, podés pagar bajo protesta o no pagar. Si Telecentro suspende el servicio por monto disputado durante un reclamo activo, eso refuerza tu caso.",
  },
];

const howToSteps = [
  {
    name: "Atención al cliente Telecentro",
    text: "Llamá al 6380-0000, o entrá a Mi Telecentro. Pedí siempre número de reclamo. Plazo de respuesta: 5 días hábiles.",
  },
  {
    name: "Reclamo en ENACOM",
    text: "Si Telecentro no resuelve en 10 días hábiles, presentá reclamo gratuito en defensa.enacom.gob.ar. ENACOM es el ente regulador de telecomunicaciones. Resolución estimada: 30-45 días.",
  },
  {
    name: "COPREC o Defensa del Consumidor provincial",
    text: "En paralelo, podés iniciar reclamo gratuito en COPREC (autogestion.produccion.gob.ar/coprec) o en Defensa del Consumidor provincial. Audiencia de conciliación en 30-45 días.",
  },
  {
    name: "Carta documento",
    text: "Como paso paralelo o previo a un juicio, intimá por carta documento (Correo Argentino, $3.000-5.000 ARS). Plazo de respuesta legal: 10 días hábiles.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      name: "Cómo reclamar a Telecentro Argentina",
      description:
        "Pasos legales para reclamar a Telecentro Argentina por factura disputada, baja imposible, internet caído o servicios no contratados.",
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
      headline: "Cómo reclamar a Telecentro paso a paso (Argentina 2026)",
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
            <Link href="/guias" className="hover:underline">Guías</Link> → Argentina → Telecentro
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a Telecentro paso a paso (Argentina)
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
            Telecentro figura consistentemente en el top 3 de empresas más
            reclamadas en Argentina (~7.000 reclamos/año). Si te facturaron de
            más, te bloquearon la baja, internet no funciona o demoran la
            atención, tenés 4 caminos legales: atención interna, ENACOM,
            COPREC y carta documento. Esta guía te lleva por todos con plazos,
            costos y modelo legal gratis.
          </p>
        </aside>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Cuándo conviene reclamar a Telecentro</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>Factura con cargos no autorizados.</li>
            <li>Débito automático sin autorización.</li>
            <li>Baja imposible (las trabas son su queja más frecuente).</li>
            <li>Internet caído pero con cobro.</li>
            <li>Velocidad de internet muy inferior a la contratada.</li>
            <li>Cambio de plan sin consentimiento.</li>
            <li>Cargos por canales premium o servicios extra no contratados.</li>
            <li>Demoras en instalación o reparación de averías.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Paso 1 — Atención al cliente Telecentro</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">
            <li><strong>Telefónica:</strong> 6380-0000.</li>
            <li>App <em>Mi Telecentro</em>.</li>
            <li>Web: telecentro.com.ar → "Atención".</li>
            <li><strong>Pedí número de reclamo</strong> y guardalo.</li>
            <li>Telecentro tiene <strong>5 días hábiles</strong> para responder.</li>
          </ol>
          <p className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-slate-700">
            <strong>💡 Tip:</strong> grabá la llamada (avisando que la grabás).
            Telecentro suele prometer plazos por teléfono que no se cumplen.
            La grabación es prueba.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Paso 2 — Reclamo en ENACOM</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Plataforma:</strong>{" "}
              <a href="https://defensa.enacom.gob.ar" className="text-blue-700 underline" target="_blank" rel="noreferrer">
                defensa.enacom.gob.ar
              </a>
            </li>
            <li>Costo: gratuito.</li>
            <li>Plazo de respuesta de Telecentro: 10 días hábiles.</li>
            <li>Resolución estimada: 30-45 días.</li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="inline"
          source="guia-telecentro"
          headline="¿Querés saltarte estos 4 pasos?"
          body="JustIA está construyendo una herramienta que hace todo este proceso por vos en 5 minutos. Sumate a la lista de espera."
        />

        <section className="mb-12 mt-12">
          <h2 className="text-2xl font-bold text-slate-900">Paso 3 — COPREC o Defensa del Consumidor</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>COPREC nacional:</strong>{" "}
              <a href="https://autogestion.produccion.gob.ar/coprec" className="text-blue-700 underline" target="_blank" rel="noreferrer">
                autogestion.produccion.gob.ar/coprec
              </a>
            </li>
            <li>Defensa del Consumidor provincial.</li>
            <li>Audiencia de conciliación: 30-45 días.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Paso 4 — Carta documento</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>Costo: $3.000-5.000 ARS en Correo Argentino.</li>
            <li>Plazo de respuesta legal: 10 días hábiles.</li>
            <li>Cuándo conviene: antes de un juicio, o cuando ENACOM/COPREC se demoran.</li>
          </ul>
        </section>

        <section className="mb-12 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-2xl font-bold text-slate-900">El "botón de baja" — Ley 27.250</h2>
          <p className="mt-3 text-slate-700">
            Telecentro está obligada por la Ley 27.250 a tener un botón de baja
            online, sin necesidad de llamar ni ir a una oficina. Debe estar en
            la página principal y procesar la baja en máximo 10 días corridos,
            con constancia escrita inmediata. Si te derivan a un canal infinito
            o exigen "retención" presencial, eso es una infracción directa.
          </p>
        </section>

        <section className="mb-12 rounded-xl border border-slate-300 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-900">Modelo de carta documento (gratis)</h2>
          <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-5 font-mono text-xs leading-relaxed text-slate-100">
{`A: Telecentro S.A.
   CUIT: 30-66120971-9
   Domicilio: Av. Gaona 1130, CABA

DE: [Nombre y apellido completo]
    DNI: [Número]
    Domicilio: [Dirección completa]
    Cuenta: [número]
    Email: [Tu email]

REF: Reclamo formal — Cuenta [número]

Por la presente, en mi carácter de consumidor amparado por la
Ley 24.240, Ley 27.078 (Argentina Digital) y Ley 27.250
(botón de baja), intimo a vuestra empresa a resolver dentro
de los DIEZ (10) DÍAS HÁBILES de recepcionada esta carta:

HECHOS:
1) Soy cliente desde [fecha], cuenta [número], plan [nombre],
   abonando $[monto] ARS mensuales.

2) [Describí el problema concreto: factura por $X no
   autorizada, baja solicitada el día Y sin efectivizar,
   internet sin servicio desde fecha Z, etc.].

3) Presenté reclamo en Telecentro con número [folio] el día
   [DD/MM/AAAA] sin resolución satisfactoria.

DERECHO:
Los hechos configuran incumplimiento contractual en los
términos de los artículos 10, 17, 19 y 31 de la Ley 24.240
y del artículo 25 de la Ley 27.078. La negativa a la baja
infringe la Ley 27.250 y la Resolución 316/2018 SCI.

INTIMACIÓN:
1) [Petición concreta: efectivizar baja / restituir $X /
   reactivar servicio / aplicar bonificación].
2) Cesar todo cobro vinculado al servicio reclamado.

Bajo apercibimiento de iniciar reclamo ante ENACOM, COPREC y
las acciones judiciales que correspondan, con expresa
imposición de costas, daños y perjuicios y daño punitivo
(art. 52 bis Ley 24.240).

Sin otro particular, saluda atentamente,

[Firma]
[Aclaración]
[DNI]
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
              <Link href="/guias/como-reclamar-telecom-personal-argentina" className="hover:underline">
                → Cómo reclamar a Telecom/Personal (Argentina)
              </Link>
            </li>
            <li>
              <Link href="/guias/como-reclamar-movistar-argentina" className="hover:underline">
                → Cómo reclamar a Movistar (Argentina)
              </Link>
            </li>
            <li>
              <Link href="/guias/como-reclamar-claro-argentina" className="hover:underline">
                → Cómo reclamar a Claro (Argentina)
              </Link>
            </li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="footer"
          source="guia-telecentro-footer"
          headline="JustIA está pronto"
          body="Reclamar a Telecentro debería tomar 5 minutos, no 5 semanas. Sumate a la lista de espera."
        />
      </article>
    </>
  );
}
