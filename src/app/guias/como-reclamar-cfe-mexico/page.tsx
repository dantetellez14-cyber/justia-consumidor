import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const PAGE_PATH = "/guias/como-reclamar-cfe-mexico";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-30";
const UPDATED = "2026-04-30";

export const metadata: Metadata = {
  title:
    "Cómo reclamar a CFE: cobros indebidos y errores de medición (México 2026)",
  description:
    "Guía paso a paso para reclamar a CFE: aclaración de recibo, queja en PROFECO, denuncia ante CRE. Modelo de carta legal incluido. Ley LFPC + Ley de Industria Eléctrica.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a CFE — paso a paso (México)",
    description:
      "Aclaración de recibo, queja en PROFECO, denuncia en CRE. Modelo de carta gratis. Es la empresa #1 con más quejas en PROFECO (65.988 históricas).",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "cuando-reclamar", label: "Cuándo conviene reclamar a CFE" },
  { id: "paso-1", label: "Paso 1 — Aclaración con CFE" },
  { id: "paso-2", label: "Paso 2 — Queja en PROFECO" },
  { id: "paso-3", label: "Paso 3 — Denuncia ante CRE" },
  { id: "paso-4", label: "Paso 4 — Amparo o juicio civil" },
  { id: "modelo-carta", label: "Modelo de queja a CFE (gratis)" },
  { id: "errores", label: "Errores comunes" },
  { id: "faq", label: "Preguntas frecuentes" },
];

const faqItems = [
  {
    q: "¿Qué pasa si CFE me corta la luz por una factura que estoy reclamando?",
    a: "El corte mientras hay un proceso de aclaración o reclamo en PROFECO/CRE es ilegal. Podés exigir reconexión inmediata y reclamar daños. La Ley de la Industria Eléctrica establece que el suministro no puede interrumpirse mientras esté en proceso una aclaración formal.",
  },
  {
    q: "¿CFE puede cobrarme más alto sin avisarme?",
    a: "El cambio de tarifa o de DAC (Doméstica de Alto Consumo) requiere notificación. Si te clasificaron en DAC sin aviso o por una medición errónea, podés pedir reclasificación con base en la facturación histórica.",
  },
  {
    q: "¿Cómo pruebo que mi medidor está mal?",
    a: "Podés pedir una verificación del medidor en CFE (es gratis si el medidor está dentro de garantía). Si CFE se niega, contratás un perito independiente certificado por la CRE. El costo se le imputa a CFE si comprueba la falla.",
  },
  {
    q: "¿Cuánto tiempo tengo para reclamar un cobro indebido?",
    a: "5 años para reclamar restitución de pagos indebidos (LFPC art. 99). Pero conviene actuar dentro de los 30 días para frenar intereses y un posible corte.",
  },
  {
    q: "¿Tengo que pagar el recibo mientras reclamo?",
    a: "No. La aclaración formal suspende el cobro hasta que se resuelva. Si CFE insiste en cobrar o cortar, eso refuerza tu caso ante PROFECO.",
  },
  {
    q: "¿PROFECO puede obligar a CFE a devolverme el dinero?",
    a: "PROFECO puede mediar y, si no hay acuerdo, emitir una resolución vinculante. CFE como empresa estatal está sujeta a PROFECO en materia de servicios al consumidor (LFPC).",
  },
];

const howToSteps = [
  {
    name: "Aclaración con CFE",
    text: "Llamá al 071 (CFE Contigo), entrá a la app CFE Contigo, o presentá la aclaración por escrito en cualquier centro de atención. Plazo de respuesta: 5 días hábiles. Mientras dure el proceso, no pueden cortarte la luz ni exigirte el pago disputado.",
  },
  {
    name: "Queja en PROFECO",
    text: "Si CFE no responde o rechaza tu aclaración, presentá queja en Concilianet (concilianet.profeco.gob.mx) o en cualquier delegación. PROFECO cita a una audiencia de conciliación en aproximadamente 15-30 días.",
  },
  {
    name: "Denuncia ante la CRE",
    text: "La Comisión Reguladora de Energía (cre.gob.mx) recibe quejas sobre calidad del suministro, mediciones erróneas y procesos técnicos. Es complementario a PROFECO.",
  },
  {
    name: "Amparo o juicio civil",
    text: "Si nada de lo anterior funciona, podés iniciar amparo (si hubo corte indebido o violación a derechos) o demanda civil por daños. Aquí sí conviene un abogado especializado.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      name: "Cómo reclamar a CFE en México",
      description:
        "Pasos legales para reclamar a CFE por cobros indebidos, errores de medición o corte injustificado.",
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
      headline:
        "Cómo reclamar a CFE: cobros indebidos y errores de medición (México)",
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
            → México → CFE
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a CFE paso a paso (México)
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Última actualización: 30 de abril de 2026 · Tiempo de lectura: 9 min
          </p>
        </header>

        <aside className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            Resumen rápido
          </p>
          <p className="mt-2 text-slate-700">
            CFE es la empresa con más quejas en PROFECO (65.988 históricas, 3.248
            solo en 2025). Si te facturaron de más, hubo un error de medición o
            te cortaron la luz injustamente, tenés 4 caminos legales: aclaración
            interna, PROFECO, CRE y, en última instancia, amparo. Esta guía te
            lleva por los 4 con plazos, costos y modelo de carta gratis.
          </p>
        </aside>

        <nav
          aria-label="Tabla de contenidos"
          className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-5"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            En esta guía
          </p>
          <ol className="space-y-1.5 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-blue-700 hover:underline"
                >
                  {i + 1}. {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <section id="cuando-reclamar" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Cuándo conviene reclamar a CFE
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            La Ley Federal de Protección al Consumidor (LFPC) y la Ley de la
            Industria Eléctrica te amparan en estos casos:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Cobro excesivo o sin lectura real:</strong> CFE
              estimó tu consumo sin tomar lectura del medidor.
            </li>
            <li>
              <strong>Reclasificación a tarifa DAC sin aviso:</strong> te
              cambiaron a Doméstica de Alto Consumo y no te notificaron.
            </li>
            <li>
              <strong>Medidor con falla técnica:</strong> registra consumo
              que no corresponde a tu uso real.
            </li>
            <li>
              <strong>Corte de luz indebido:</strong> sin aviso previo o
              durante un proceso de aclaración.
            </li>
            <li>
              <strong>Reconexión cobrada de más:</strong> el cargo por
              reconexión no puede superar el costo real.
            </li>
            <li>
              <strong>Daños a tus electrodomésticos por sobrevoltaje:</strong>{" "}
              CFE responde si la falla viene de la red.
            </li>
            <li>
              <strong>Bonificación negada por apagón prolongado:</strong> si
              la interrupción excedió los plazos regulados.
            </li>
          </ul>
        </section>

        <section id="paso-1" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 1 — Aclaración con CFE
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Es el primer paso obligatorio. CFE exige intentar la aclaración
            interna antes de que PROFECO tome el caso.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Por teléfono:</strong> llamá al <strong>071</strong> (CFE
              Contigo). Pedí <em>folio de aclaración</em>.
            </li>
            <li>
              <strong>App CFE Contigo:</strong> sección "Aclaraciones".
              Adjuntá foto del medidor y del recibo.
            </li>
            <li>
              <strong>Por escrito:</strong> presentá la queja en cualquier
              Centro de Atención CFE. Pedí copia sellada.
            </li>
            <li>
              CFE tiene <strong>5 días hábiles</strong> para responder.
            </li>
            <li>
              <strong>No te pueden cortar la luz</strong> mientras la
              aclaración está en proceso.
            </li>
          </ol>
          <p className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-slate-700">
            <strong>💡 Tip:</strong> tomá foto del medidor con fecha y hora el
            día que abrís la aclaración. Es prueba clave si CFE alega que tu
            consumo subió.
          </p>
        </section>

        <section id="paso-2" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 2 — Queja en PROFECO
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Si CFE rechaza tu aclaración o no responde, llevá el caso a PROFECO.
            CFE como empresa de servicio público está sujeta a la LFPC en
            materia de relación con consumidores.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Concilianet:</strong>{" "}
              <a
                href="https://concilianet.profeco.gob.mx"
                className="text-blue-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                concilianet.profeco.gob.mx
              </a>{" "}
              (sistema online).
            </li>
            <li>
              <strong>Telefónica del Consumidor:</strong> 800 468 8722.
            </li>
            <li>
              <strong>Presencial:</strong> cualquier delegación PROFECO.
            </li>
            <li>
              <strong>Plazo:</strong> 30 días para presentar tu queja desde
              la respuesta (o falta de respuesta) de CFE.
            </li>
            <li>
              <strong>Documentación:</strong> recibo disputado, folio de
              aclaración CFE, fotos del medidor, recibos históricos.
            </li>
            <li>
              <strong>Tiempo a audiencia:</strong> 15-30 días.
            </li>
          </ul>
          <p className="mt-4 leading-relaxed text-slate-700">
            En la audiencia de conciliación, PROFECO actúa como mediador. Si CFE
            no asiste o no llegan a acuerdo, el caso pasa a un procedimiento
            arbitral cuyo laudo es vinculante.
          </p>
        </section>

        <section id="paso-3" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 3 — Denuncia ante la CRE
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            La Comisión Reguladora de Energía (CRE) regula a CFE en aspectos
            técnicos. Conviene denunciar acá cuando el reclamo es por:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>Calidad del suministro (apagones frecuentes, sobrevoltajes).</li>
            <li>Errores en mediciones técnicas.</li>
            <li>Negativa de CFE a verificar tu medidor.</li>
            <li>Daños a equipos por fallas en la red eléctrica.</li>
          </ul>
          <p className="mt-4 leading-relaxed text-slate-700">
            <strong>Cómo:</strong>{" "}
            <a
              href="https://www.cre.gob.mx"
              className="text-blue-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              cre.gob.mx
            </a>{" "}
            → "Atención ciudadana" → "Quejas y denuncias". Es complementario al
            proceso PROFECO.
          </p>
        </section>

        <GuideWaitlistCTA
          variant="inline"
          source="guia-cfe"
          headline="¿Querés saltarte estos 4 pasos?"
          body="JustIA está construyendo una herramienta que hace todo este proceso por vos en 5 minutos: análisis legal con IA, generación de carta y envío automático a CFE/PROFECO. Sumate a la lista de espera."
        />

        <section id="paso-4" className="mb-12 mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 4 — Amparo o juicio civil
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Última instancia, cuando PROFECO no resuelve o el daño es mayor:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Amparo:</strong> si hubo corte de luz indebido o
              violación a derechos fundamentales (agua + luz son servicios
              esenciales).
            </li>
            <li>
              <strong>Juicio civil por daños:</strong> si los electrodomésticos
              quemados o el lucro cesante superan unos $10.000 MXN.
            </li>
            <li>
              <strong>Costo:</strong> aquí sí conviene un abogado. PROFECO
              tiene servicios de asesoría legal gratuita en delegaciones.
            </li>
          </ul>
        </section>

        <section
          id="modelo-carta"
          className="mb-12 rounded-xl border border-slate-300 bg-white p-6"
        >
          <h2 className="text-2xl font-bold text-slate-900">
            Modelo de queja formal a CFE (gratis)
          </h2>
          <p className="mt-3 text-slate-700">
            Copiá este modelo, completá los datos en{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
              [corchetes]
            </code>{" "}
            y presentalo en cualquier Centro de Atención CFE. Pedí copia
            sellada como acuse de recibo.
          </p>
          <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-5 font-mono text-xs leading-relaxed text-slate-100">
{`[Lugar y fecha]

Comisión Federal de Electricidad
Centro de Atención [nombre / dirección]

ASUNTO: Solicitud formal de aclaración —
Recibo No. [número] / RPU [tu RPU]

[Nombre completo], titular del servicio con número de
cuenta/RPU [RPU], domicilio del suministro en [dirección
completa], teléfono [teléfono] y correo [email], comparezco
y manifiesto:

HECHOS:
1) En el recibo correspondiente al período [DD/MM/AAAA al
   DD/MM/AAAA] se me cobraron $[monto] MXN por un consumo
   declarado de [kWh] kWh.

2) Mi consumo histórico promedio es de [kWh promedio] kWh
   mensuales (acompaño copia de los últimos 6 recibos como
   prueba).

3) [Describí en 3-5 líneas el problema: medidor sin lectura,
   estimación errada, reclasificación DAC sin aviso, etc.].

DERECHO:
Conforme a los artículos 7 y 99 de la Ley Federal de
Protección al Consumidor y los artículos 4, fracción XX, y
139 de la Ley de la Industria Eléctrica, solicito la
aclaración del recibo y la suspensión del cobro disputado
hasta que se resuelva.

PETICIONES:
1) Verificación del medidor por personal técnico de CFE.
2) Recálculo del consumo con base en mi histórico.
3) Suspensión inmediata de cualquier acción de corte
   mientras la aclaración esté en trámite.
4) Folio de aclaración por escrito.

Sin más por el momento, quedo en espera de respuesta dentro
del plazo legal de 5 días hábiles.

[Firma]
[Nombre completo]
[RFC opcional]
[Fecha]`}
          </pre>
        </section>

        <section id="errores" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Errores comunes que debilitan tu reclamo
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-slate-700">
            <li>
              <strong>Pagar el recibo "para evitar problemas".</strong> El
              pago bajo protesta es válido, pero pagar sin reservas puede
              interpretarse como conformidad.
            </li>
            <li>
              <strong>No fotografiar el medidor.</strong> Sin evidencia de la
              lectura real, CFE puede sostener su estimación.
            </li>
            <li>
              <strong>Saltarte el paso de aclaración interna.</strong> PROFECO
              te pide acreditar que intentaste primero con CFE.
            </li>
            <li>
              <strong>Confundir CFE con CFE Suministrador Básico.</strong> Son
              entidades distintas; verificá quién emite tu recibo.
            </li>
            <li>
              <strong>No conservar recibos históricos.</strong> Son la prueba
              más fuerte para mostrar que el consumo facturado es atípico.
            </li>
          </ul>
        </section>

        <section id="faq" className="mb-12">
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
              <Link
                href="/guias/como-reclamar-telcel-mexico"
                className="hover:underline"
              >
                → Cómo reclamar a Telcel: cobros, baja, portabilidad (México)
              </Link>
            </li>
            <li>
              <Link
                href="/guias/como-presentar-queja-profeco-online"
                className="hover:underline"
              >
                → Cómo presentar una queja en PROFECO online
              </Link>
            </li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="footer"
          source="guia-cfe-footer"
          headline="JustIA está pronto"
          body="Reclamar a CFE debería tomar 5 minutos, no 5 semanas. Estamos construyendo el abogado de IA que hace todo este proceso por vos. Sumate a la lista de espera."
        />

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            <strong>Disclaimer legal:</strong> esta guía tiene fines
            informativos y no reemplaza el asesoramiento de un abogado
            mexicano. Verificá la información oficial en{" "}
            <a
              href="https://www.profeco.gob.mx"
              className="text-blue-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              profeco.gob.mx
            </a>
            .
          </p>
        </footer>
      </article>
    </>
  );
}
