import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const PAGE_PATH = "/guias/como-reclamar-telcel-mexico";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-30";
const UPDATED = "2026-04-30";

export const metadata: Metadata = {
  title:
    "Cómo reclamar a Telcel: cobros, portabilidad y baja (México 2026)",
  description:
    "Guía paso a paso para reclamar a Telcel. Cobros indebidos, portabilidad bloqueada, dar de baja un plan, sin señal pero con cargo. Soy Usuario IFT + PROFECO. Modelo de carta gratis.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a Telcel — paso a paso (México)",
    description:
      "IFT + PROFECO + carta documento. Resolvé cobros indebidos, portabilidad bloqueada o servicio interrumpido. Modelo gratis.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "cuando-reclamar", label: "Cuándo conviene reclamar a Telcel" },
  { id: "paso-1", label: "Paso 1 — Atención Telcel (*264)" },
  { id: "paso-2", label: "Paso 2 — Soy Usuario (IFT)" },
  { id: "paso-3", label: "Paso 3 — PROFECO" },
  { id: "paso-4", label: "Paso 4 — Carta documento" },
  { id: "modelo-carta", label: "Modelo de queja a Telcel (gratis)" },
  { id: "errores", label: "Errores comunes" },
  { id: "faq", label: "Preguntas frecuentes" },
];

const faqItems = [
  {
    q: "¿Telcel puede negarse a darme de baja?",
    a: "No. La Ley Federal de Telecomunicaciones obliga a las empresas a procesar bajas sin penalizaciones cuando el plan ha sido cumplido en el plazo forzoso. Si Telcel se niega, podés presentar queja en Soy Usuario (IFT) y PROFECO. La negativa es una infracción regulada.",
  },
  {
    q: "¿Cuánto tarda una portabilidad de Telcel a otro operador?",
    a: "Por ley, máximo 24 horas hábiles desde que el nuevo operador la solicita. Si Telcel la bloquea o demora más, presentás queja en IFT con el folio de portabilidad. Telcel no puede condicionarla a pagar adeudos disputados.",
  },
  {
    q: "¿Tengo que pagar la factura mientras reclamo cobros indebidos?",
    a: "Solo el monto NO disputado. Por la parte en disputa, podés pagar bajo protesta o no pagar. Si Telcel suspende tu servicio por el monto disputado mientras hay reclamo abierto en IFT/PROFECO, eso refuerza tu caso.",
  },
  {
    q: "¿Qué cobertura mínima debe darme Telcel por contrato?",
    a: "Telcel está obligado a entregar el servicio contratado con la calidad publicitada. Si vivís en una zona sin cobertura efectiva pero te venden el plan igual, eso es publicidad engañosa (LFPC art. 32).",
  },
  {
    q: "¿Puedo reclamar cargos por servicios que no contraté?",
    a: "Sí. Cargos por suscripciones, contenido premium, paquetes de datos extra o servicios adicionales sin tu consentimiento expreso son improcedentes. Pedí desactivación inmediata + reembolso de los meses cobrados.",
  },
  {
    q: "¿Qué hago si Telcel me cortó la línea sin avisarme?",
    a: "El corte sin notificación previa es ilegal. Llamá al *264, pedí folio del incidente, y si no se resuelve en 48 horas, escalá a Soy Usuario IFT. Podés reclamar bonificación por el tiempo sin servicio.",
  },
];

const howToSteps = [
  {
    name: "Atención al cliente Telcel",
    text: "Llamá al *264 desde tu Telcel, al 800 710 9999 desde otro número, o entrá a Mi Telcel. Pedí siempre un folio de queja por escrito. Plazo de respuesta: 5 días hábiles.",
  },
  {
    name: "Soy Usuario (IFT)",
    text: "Si Telcel no responde, presentá queja en soyusuario.ift.org.mx. El IFT actúa como mediador y tiene atribuciones específicas en telecom: portabilidad, cobertura, calidad del servicio. Resolución estimada: 30 días.",
  },
  {
    name: "PROFECO",
    text: "En paralelo o si Soy Usuario no resuelve, presentá queja en Concilianet (concilianet.profeco.gob.mx) o por teléfono al 800 468 8722. Audiencia de conciliación en 15-30 días. PROFECO puede emitir laudo arbitral vinculante.",
  },
  {
    name: "Carta documento o demanda",
    text: "Como paso paralelo, una carta documento intima formalmente a Telcel a resolver en 10 días hábiles. Si nada de lo anterior funciona, demanda civil por daños y perjuicios (vale la pena con abogado si el monto supera $20.000 MXN).",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      name: "Cómo reclamar a Telcel en México",
      description:
        "Pasos legales para reclamar a Telcel por cobros indebidos, portabilidad bloqueada, baja negada o sin señal con cobro.",
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
      headline: "Cómo reclamar a Telcel paso a paso (México 2026)",
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
            → México → Telcel
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a Telcel paso a paso (México)
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
            Telcel domina el mercado celular mexicano y eso lo lleva al top de
            quejas en PROFECO e IFT. Si te cobraron de más, te bloquearon una
            portabilidad, te niegan dar de baja o no tenés señal pero sí cargos,
            tenés 4 caminos legales. Esta guía te lleva por todos con plazos,
            costos y modelo de carta gratis.
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
            Cuándo conviene reclamar a Telcel
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            La Ley Federal de Telecomunicaciones y la LFPC te amparan en estos
            casos:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Cobros indebidos:</strong> servicios que no contrataste,
              suscripciones premium, cargos por roaming sin notificar.
            </li>
            <li>
              <strong>Portabilidad bloqueada:</strong> Telcel demora o se
              niega a procesar tu salida a otro operador.
            </li>
            <li>
              <strong>Baja imposible:</strong> después de cumplir el forzoso,
              te ponen trabas para cancelar.
            </li>
            <li>
              <strong>Sin señal pero con cobro:</strong> zonas sin cobertura
              efectiva donde igual te venden el plan.
            </li>
            <li>
              <strong>Cambio de plan sin consentimiento:</strong> te subieron
              al plan superior sin autorizar.
            </li>
            <li>
              <strong>Velocidad/datos engañosos:</strong> el plan publicitado
              no coincide con lo entregado.
            </li>
            <li>
              <strong>Equipo defectuoso bajo garantía:</strong> Telcel se
              niega a reparar o reemplazar.
            </li>
          </ul>
        </section>

        <section id="paso-1" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 1 — Atención al cliente Telcel
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Es el primer paso obligatorio. Tanto IFT como PROFECO te piden
            acreditar que primero intentaste con Telcel.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Telefónica:</strong> *264 desde tu Telcel, o 800 710 9999
              desde otro número.
            </li>
            <li>
              <strong>App Mi Telcel:</strong> sección "Atención y servicios" →
              "Quejas".
            </li>
            <li>
              <strong>Centro de Atención:</strong> presencial en cualquier CAC
              Telcel.
            </li>
            <li>
              <strong>Pedí folio de queja por escrito.</strong> Sin folio no
              hay caso para escalar.
            </li>
            <li>
              Telcel tiene <strong>5 días hábiles</strong> para responder.
            </li>
          </ol>
          <p className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-slate-700">
            <strong>💡 Tip:</strong> grabá la llamada (avisando que la grabás).
            Es prueba de la respuesta del agente y de los plazos prometidos.
          </p>
        </section>

        <section id="paso-2" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 2 — Soy Usuario (IFT)
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            El Instituto Federal de Telecomunicaciones (IFT) tiene una
            plataforma específica para quejas de telecom: <strong>Soy
            Usuario</strong>. Es el camino más rápido para temas de portabilidad,
            cobertura y calidad del servicio.
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
            <li>
              <strong>Costo:</strong> gratis.
            </li>
            <li>
              <strong>Documentación:</strong> folio de Telcel, contrato, factura
              disputada, capturas, evidencia de cobertura (si aplica).
            </li>
            <li>
              <strong>Resolución estimada:</strong> 30 días.
            </li>
            <li>
              <strong>Plazo legal de Telcel para responder:</strong> 10 días
              hábiles desde que IFT le traslada la queja.
            </li>
          </ul>
          <p className="mt-4 leading-relaxed text-slate-700">
            IFT puede ordenar a Telcel restituir cobros indebidos, completar
            portabilidades bloqueadas y aplicar bonificaciones por interrupción
            del servicio.
          </p>
        </section>

        <section id="paso-3" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 3 — PROFECO
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            En paralelo o si IFT no resuelve, PROFECO también acepta quejas de
            telecom (es competencia concurrente). Conviene PROFECO sobre todo
            cuando:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>El reclamo es por publicidad engañosa.</li>
            <li>Hubo daños o perjuicios cuantificables.</li>
            <li>Es necesario un laudo arbitral vinculante.</li>
            <li>
              <strong>Concilianet:</strong>{" "}
              <a
                href="https://concilianet.profeco.gob.mx"
                className="text-blue-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                concilianet.profeco.gob.mx
              </a>
            </li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="inline"
          source="guia-telcel"
          headline="¿Querés saltarte estos 4 pasos?"
          body="JustIA está construyendo una herramienta que hace todo este proceso por vos en 5 minutos: análisis legal con IA, generación de carta y envío automático a Telcel/IFT/PROFECO. Sumate a la lista de espera."
        />

        <section id="paso-4" className="mb-12 mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 4 — Carta documento o demanda
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            La carta documento intima formalmente a Telcel a resolver en 10
            días hábiles. Tiene valor probatorio y suele acelerar respuestas
            cuando los pasos anteriores se demoraron.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Costo:</strong> $80-150 MXN aprox. en oficinas de
              Correos de México.
            </li>
            <li>
              <strong>Plazo de respuesta legal:</strong> 10 días hábiles.
            </li>
            <li>
              <strong>Demanda civil:</strong> conviene si el monto supera los
              $20.000 MXN o hay daños no resueltos por PROFECO.
            </li>
          </ul>
        </section>

        <section
          id="modelo-carta"
          className="mb-12 rounded-xl border border-slate-300 bg-white p-6"
        >
          <h2 className="text-2xl font-bold text-slate-900">
            Modelo de queja formal a Telcel (gratis)
          </h2>
          <p className="mt-3 text-slate-700">
            Copiá este modelo, completá los datos en{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
              [corchetes]
            </code>{" "}
            y presentalo en cualquier CAC Telcel o adjuntalo en tu queja en
            Soy Usuario IFT.
          </p>
          <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-5 font-mono text-xs leading-relaxed text-slate-100">
{`[Lugar y fecha]

Radiomóvil Dipsa, S.A. de C.V. (Telcel)
Lago Zúrich No. 245, Col. Ampliación Granada
Miguel Hidalgo, C.P. 11529, CDMX

ASUNTO: Reclamo formal — Línea [tu número Telcel]

[Nombre completo], titular de la línea [número de 10
dígitos], con cuenta/contrato [número de cuenta], domicilio
en [dirección completa], correo [email], comparezco y
manifiesto:

HECHOS:
1) Soy cliente de Telcel desde [fecha aproximada], con plan
   [nombre del plan], pagando $[monto] MXN mensuales.

2) [Describí en 3-5 líneas el problema: cobros indebidos por
   $X, portabilidad bloqueada con folio Y, sin señal en mi
   domicilio desde fecha Z, baja negada el día W, etc.].

3) Presenté queja en Telcel con folio [número de folio] el
   día [DD/MM/AAAA] y a la fecha de esta carta no he
   recibido respuesta satisfactoria.

DERECHO:
Conforme a los artículos 191, 198 y 199 de la Ley Federal de
Telecomunicaciones y Radiodifusión, y a los artículos 7, 32
y 92 de la Ley Federal de Protección al Consumidor,
solicito la atención inmediata de mi reclamo.

PETICIONES:
1) Reintegro de los montos cobrados indebidamente:
   $[monto] MXN.
2) [Otra petición específica: completar portabilidad,
   procesar baja, reactivar servicio, etc.]
3) Bonificación por los días sin servicio o por la demora
   en la atención.
4) Respuesta por escrito en un plazo de 10 días hábiles,
   bajo apercibimiento de presentar queja ante el Instituto
   Federal de Telecomunicaciones (Soy Usuario) y la
   Procuraduría Federal del Consumidor (PROFECO).

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
              <strong>No pedir folio en cada llamada.</strong> Sin folio, no
              hay rastro de la queja para escalar a IFT.
            </li>
            <li>
              <strong>Pagar la totalidad de la factura disputada.</strong>{" "}
              Pagá solo el monto NO disputado, o pagá bajo protesta.
            </li>
            <li>
              <strong>Aceptar la oferta de "permanencia con descuento".</strong>{" "}
              Telcel suele ofrecer bonos para retenerte. Si firmás un nuevo
              forzoso, no podés irte por meses.
            </li>
            <li>
              <strong>Confundir Soy Usuario con PROFECO.</strong> Soy Usuario
              (IFT) es para temas técnicos de telecom; PROFECO para
              violaciones a derechos del consumidor. Podés usar los dos.
            </li>
            <li>
              <strong>No documentar la falta de cobertura.</strong> Capturas
              de la app de medición de señal + fecha y hora son la prueba.
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
                href="/guias/como-reclamar-cfe-mexico"
                className="hover:underline"
              >
                → Cómo reclamar a CFE: cobros indebidos y errores de medición
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
          source="guia-telcel-footer"
          headline="JustIA está pronto"
          body="Reclamar a Telcel debería tomar 5 minutos, no 5 semanas. Estamos construyendo el abogado de IA que hace todo este proceso por vos. Sumate a la lista de espera."
        />

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            <strong>Disclaimer legal:</strong> esta guía tiene fines
            informativos y no reemplaza el asesoramiento de un abogado
            mexicano. Verificá información oficial en{" "}
            <a
              href="https://www.ift.org.mx"
              className="text-blue-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              ift.org.mx
            </a>{" "}
            y{" "}
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
