import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const SLUG = "como-reclamar-aeromexico-mexico";
const PAGE_URL = `${SITE_URL}/guias/${SLUG}`;

export const metadata: Metadata = {
  title:
    "Cómo reclamar a Aeroméxico y Volaris: cancelaciones, demoras y equipaje | JustIA",
  description:
    "Guía paso a paso para reclamar a Aeroméxico, Volaris, Viva Aerobús y VivaAerobus: cancelaciones, demoras, equipaje perdido y overbooking. AFAC, PROFECO y carta documento.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a Aeroméxico y Volaris (2026)",
    description:
      "Vuelo cancelado, demora o equipaje perdido en México: derechos y 4 pasos para cobrar la compensación que te corresponde.",
    type: "article",
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline:
        "Cómo reclamar a Aeroméxico y Volaris: cancelaciones, demoras y equipaje",
      description:
        "Guía completa de derechos de pasajeros aéreos en México: cancelaciones, demoras, equipaje y overbooking.",
      url: PAGE_URL,
      datePublished: "2026-04-30",
      dateModified: "2026-04-30",
      author: { "@type": "Organization", name: "JustIA" },
    },
    {
      "@type": "HowTo",
      name: "Cómo reclamar a aerolíneas en México paso a paso",
      totalTime: "PT3H",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Qué hacer en el aeropuerto",
          text: "Solicita constancia escrita de la cancelación o demora, y el Reporte de Irregularidades de Equipaje (PIR) si perdiste tu maleta. Guarda todos los comprobantes de gastos.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Reclamo formal a la aerolínea",
          text: "Presenta reclamo escrito a la aerolínea dentro de los 5 días (equipaje) o 10 días (demora/cancelación). Solicita número de folio.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Queja ante la AFAC",
          text: "La Agencia Federal de Aviación Civil (AFAC) recibe quejas de pasajeros en afac.gob.mx y puede sancionar a las aerolíneas.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "PROFECO y acción legal",
          text: "Presenta queja ante PROFECO en profeco.gob.mx o 800-468-8722. Para montos mayores, carta documento y juzgado civil.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Qué me deben si cancelan mi vuelo en México?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Según el art. 62 bis de la Ley de Aviación Civil: reintegro del boleto o reubicación en siguiente vuelo disponible, asistencia (comida, comunicación) y compensación de 25% del valor del boleto más gastos documentados si la cancelación es imputable a la aerolínea.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cuánto me pagan por equipaje perdido en México?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Para vuelos internacionales rige el Convenio de Montreal: hasta 1.131 DEG (aprox. USD 1.500). Para vuelos nacionales, la Ley de Aviación Civil establece el equivalente a 75 UMAS por pasajero.",
          },
        },
        {
          "@type": "Question",
          name: "¿Aplica lo mismo para Volaris y Viva Aerobús?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. Todas las aerolíneas que operan en México (Aeroméxico, Volaris, Viva Aerobús, Aeromar) deben cumplir la Ley de Aviación Civil y los tratados internacionales aplicables.",
          },
        },
      ],
    },
  ],
};

export default function AeromexicoMXGuide() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-3xl px-6 py-12 text-slate-900">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/guias" className="hover:underline">
            Guías
          </Link>{" "}
          /{" "}
          <span className="text-amber-600 font-semibold">
            Aeroméxico / Volaris
          </span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
            Transporte aéreo · México
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a Aeroméxico y Volaris
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Vuelo cancelado, demora, equipaje perdido u overbooking en México:
            tus derechos y los 4 pasos para obtener compensación.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Aplica también para Viva Aerobús, Aeromar y otras aerolíneas
            mexicanas · Actualizado: abril 2026
          </p>
        </header>

        <GuideWaitlistCTA
          variant="inline"
          source={SLUG}
          headline="¿Querés que JustIA haga esto por vos?"
          body="Nuestro asistente de IA analiza tu caso, redacta el reclamo y te guía paso a paso. Sumate a la lista de espera."
        />

        {/* TL;DR */}
        <aside className="my-8 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-5">
          <p className="font-bold text-amber-800 mb-2">TL;DR — Resumen rápido</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-amber-900">
            <li>
              <strong>En el aeropuerto</strong>: pide constancia escrita de la
              cancelación/demora o PIR de equipaje
            </li>
            <li>
              <strong>Tus derechos</strong>: reintegro o reubicación + 25% del
              boleto si cancelan por causa imputable
            </li>
            <li>
              <strong>AFAC</strong>: queja en afac.gob.mx → Buzón de
              Atención al Pasajero
            </li>
            <li>
              <strong>PROFECO</strong>: profeco.gob.mx o 800-468-8722 para
              compensación económica
            </li>
          </ol>
        </aside>

        {/* TOC */}
        <nav className="my-8 rounded-xl bg-slate-50 p-5 text-sm">
          <p className="font-bold text-slate-700 mb-3">En esta guía:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>
              <a href="#derechos" className="hover:underline">
                Tus derechos como pasajero en México
              </a>
            </li>
            <li>
              <a href="#paso1" className="hover:underline">
                Paso 1: Qué hacer en el aeropuerto
              </a>
            </li>
            <li>
              <a href="#paso2" className="hover:underline">
                Paso 2: Reclamo formal a la aerolínea
              </a>
            </li>
            <li>
              <a href="#paso3" className="hover:underline">
                Paso 3: Queja ante la AFAC
              </a>
            </li>
            <li>
              <a href="#paso4" className="hover:underline">
                Paso 4: PROFECO y acción legal
              </a>
            </li>
            <li>
              <a href="#modelo-carta" className="hover:underline">
                Modelo de carta documento
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:underline">
                Preguntas frecuentes
              </a>
            </li>
          </ol>
        </nav>

        {/* Derechos */}
        <section id="derechos" className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            Tus derechos como pasajero aéreo en México
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            El marco legal se basa en la{" "}
            <strong>Ley de Aviación Civil (art. 62 bis)</strong>, la{" "}
            <strong>Ley Federal de Protección al Consumidor</strong> y el{" "}
            <strong>Convenio de Montreal</strong> para vuelos internacionales:
          </p>

          <div className="space-y-4">
            {[
              {
                title: "Vuelo cancelado por la aerolínea",
                color: "border-red-300 bg-red-50",
                titleColor: "text-red-800",
                items: [
                  "Reintegro total del boleto O reubicación en el siguiente vuelo disponible",
                  "Asistencia: comida y bebida durante la espera",
                  "Comunicación gratuita (llamada o acceso a internet)",
                  "Compensación del 25% del precio del boleto (tramo afectado) si la causa es imputable a la aerolínea",
                  "Alojamiento y traslado si el siguiente vuelo es al día siguiente",
                ],
              },
              {
                title: "Vuelo demorado",
                color: "border-orange-300 bg-orange-50",
                titleColor: "text-orange-800",
                items: [
                  "A partir de 1 hora de demora: alimentos y bebidas",
                  "A partir de 4 horas: posibilidad de reintegro proporcional del boleto",
                  "La aerolínea debe informar la causa y el nuevo horario estimado",
                ],
              },
              {
                title: "Equipaje perdido, dañado o demorado",
                color: "border-blue-300 bg-blue-50",
                titleColor: "text-blue-800",
                items: [
                  "Llena el Reporte de Irregularidad de Equipaje (PIR) antes de salir del aeropuerto",
                  "Vuelos nacionales: compensación equivalente a 75 UMAS (aprox. $8.600 MXN en 2026)",
                  "Vuelos internacionales: Convenio de Montreal — hasta 1.131 DEG (≈USD 1.500)",
                  "Plazo para reportar daños: 3 días (equipaje de mano) / 7 días (bodega)",
                ],
              },
              {
                title: "Overbooking (sobreventa de vuelo)",
                color: "border-purple-300 bg-purple-50",
                titleColor: "text-purple-800",
                items: [
                  "Si tenés boleto confirmado y te niegan el embarque involuntariamente",
                  "Compensación del 25% del precio del boleto + asistencia + reintegro o reubicación",
                  "Podés rechazar la compensación ofrecida y exigir el cumplimiento del contrato",
                ],
              },
            ].map((section) => (
              <div
                key={section.title}
                className={`rounded-lg border p-4 ${section.color}`}
              >
                <p className={`font-bold mb-2 ${section.titleColor}`}>
                  {section.title}
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Paso 1 */}
        <section id="paso1" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 1: Qué hacer en el aeropuerto
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-slate-700">
            <li>
              <strong>Pide constancia escrita</strong> de la cancelación o
              demora — con hora, motivo y firma del agente
            </li>
            <li>
              Si perdiste equipaje: dirígete al{" "}
              <strong>Mostrador de Equipajes</strong> y llena el{" "}
              <strong>PIR (Reporte de Irregularidad)</strong> antes de salir del
              aeropuerto. Sin PIR es muy difícil reclamar después
            </li>
            <li>
              <strong>Guarda todos los recibos:</strong> comida, transporte,
              alojamiento. Estos gastos son reembolsables si la cancelación es
              imputable a la aerolínea
            </li>
            <li>
              Fotografía el tablero de salidas con el estado del vuelo y la hora
            </li>
            <li>
              Anota número de vuelo, localizador/PNR, nombre del agente de
              mostrador y hora exacta
            </li>
          </ol>
        </section>

        {/* Paso 2 */}
        <section id="paso2" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 2: Reclamo formal a la aerolínea
          </h2>
          <p className="text-slate-700 mb-4">
            Agota el canal interno antes de escalar. Esto también documenta que
            intentaste resolver directamente.
          </p>

          <div className="space-y-3 mb-4">
            {[
              {
                title: "Aeroméxico",
                contact:
                  "aeromexico.com → Atención al cliente → Formulario de quejas. Tel: 800-021-4000.",
              },
              {
                title: "Volaris",
                contact:
                  "volaris.com → Ayuda → Contacto → Formulario de contacto. Tel: 55-1102-8000.",
              },
              {
                title: "Viva Aerobús",
                contact:
                  "vivaaerobus.com → Ayuda → Contacto. Tel: 81-8215-0150.",
              },
            ].map((airline) => (
              <div
                key={airline.title}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <p className="font-semibold text-slate-900">{airline.title}</p>
                <p className="text-sm text-slate-500">{airline.contact}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            <strong>Plazos para reclamar:</strong> equipaje dañado: 3–7 días.
            Equipaje perdido: 21 días desde la fecha en que debió entregarse.
            Cancelación/demora: 10 días hábiles desde el vuelo.
          </div>
        </section>

        {/* Paso 3 */}
        <section id="paso3" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 3: Queja ante la AFAC
          </h2>
          <p className="text-slate-700 mb-4">
            La Agencia Federal de Aviación Civil (AFAC) es el organismo
            regulador del transporte aéreo en México. Tiene facultades para
            investigar y sancionar a las aerolíneas.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Ingresa a <strong>afac.gob.mx</strong> → Pasajeros → Buzón de
              Atención al Pasajero
            </li>
            <li>
              Completa el formulario con datos del vuelo, tipo de incidencia y
              daño
            </li>
            <li>
              Adjunta: PIR (si corresponde), tarjeta de embarque, respuesta de
              la aerolínea, recibos
            </li>
            <li>
              La AFAC puede requerir información a la aerolínea e imponer
              sanciones administrativas
            </li>
          </ol>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            <strong>Alternativa:</strong> también puedes reportar directamente a
            la{" "}
            <strong>
              Secretaría de Infraestructura, Comunicaciones y Transportes
              (SICT)
            </strong>
            , que supervisa a la AFAC.
          </div>
        </section>

        {/* Paso 4 */}
        <section id="paso4" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 4: PROFECO y acción legal
          </h2>
          <p className="text-slate-700 mb-4">
            Para obtener compensación económica, la combinación más efectiva es
            PROFECO + carta documento.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Ingresa a <strong>profeco.gob.mx</strong> → Queja → Nueva queja
            </li>
            <li>
              También puedes llamar al{" "}
              <strong>800-PROFECO (800-468-8722)</strong>
            </li>
            <li>
              Empresa: nombre legal de la aerolínea (ej.{" "}
              <strong>Aerovías de México S.A. de C.V.</strong> para Aeroméxico,{" "}
              <strong>Concesionaria Vuela Compañía de Aviación S.A.P.I. de C.V.</strong>{" "}
              para Volaris)
            </li>
            <li>
              Incluye: número de queja AFAC, constancia de cancelación/demora,
              PIR, recibos de gastos, respuesta (o silencio) de la aerolínea
            </li>
            <li>
              PROFECO cita a conciliación. Si no hay acuerdo, puede actuar como
              árbitro
            </li>
          </ol>
        </section>

        {/* Modelo carta */}
        <section id="modelo-carta" className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            Modelo de carta documento
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Ajusta el nombre legal y domicilio según la aerolínea.
          </p>
          <pre className="whitespace-pre-wrap rounded-xl bg-slate-800 text-slate-100 p-6 text-sm leading-relaxed overflow-x-auto">
{`[Ciudad], [fecha]

Señores
[NOMBRE LEGAL DE LA AEROLÍNEA]
[DOMICILIO LEGAL]
[CIUDAD, C.P.]

Ref.: RECLAMACIÓN FORMAL — VUELO [NÚMERO] / [CANCELACIÓN / DEMORA / EQUIPAJE]

Yo, [NOMBRE COMPLETO], con credencial de elector No. [NÚMERO],
domicilio en [DIRECCIÓN], C.P. [CÓDIGO POSTAL], tel. [TELÉFONO],
me dirijo a ustedes para formular la siguiente reclamación:

HECHOS:
El día [FECHA] era pasajero del vuelo [NÚMERO] con ruta
[ORIGEN - DESTINO], localizador/PNR [NÚMERO].

[Selecciona según tu caso:]

OPCIÓN A — CANCELACIÓN:
El vuelo fue cancelado [sin previo aviso / con aviso menor a X horas].
La empresa no me ofreció la asistencia ni la compensación establecidas
en el art. 62 bis de la Ley de Aviación Civil.
Gastos incurridos: $[MONTO] MXN (adjunto comprobantes).

OPCIÓN B — DEMORA:
El vuelo sufrió una demora de [X] horas sin asistencia adecuada.
Gastos incurridos: $[MONTO] MXN.

OPCIÓN C — EQUIPAJE:
Mi equipaje (etiqueta No. [NÚMERO]) fue [extraviado / dañado].
Reporte PIR No. [NÚMERO], fecha: [FECHA].
Valor del contenido: $[MONTO] MXN.

DERECHO:
Ley de Aviación Civil art. 62 bis, Ley Federal de Protección al
Consumidor arts. 7 y 92, Convenio de Montreal (para vuelos
internacionales). Número de queja AFAC: [NÚMERO].

PETICIÓN:
1. Pago de compensación del 25% del boleto ($[MONTO] MXN).
2. Reembolso de gastos documentados ($[MONTO] MXN).
3. [Compensación por equipaje: $[MONTO] MXN.]
En caso de no resolver en 10 días hábiles, presentaré queja ante
PROFECO y ejerceré acciones legales por daños y perjuicios.

Atentamente,

[FIRMA]
[NOMBRE COMPLETO]`}
          </pre>

          <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
            <p className="font-semibold mb-2">Domicilios legales principales:</p>
            <ul className="space-y-1">
              <li>
                <strong>Aeroméxico</strong> — Paseo de la Reforma 243, Piso 25,
                Col. Cuauhtémoc, CDMX 06500
              </li>
              <li>
                <strong>Volaris</strong> — Prolongación Paseo de la Reforma 490,
                Col. Santa Fe, CDMX 05109
              </li>
              <li>
                <strong>Viva Aerobús</strong> — Av. Fundidora 501, Piso 8, Col.
                Obrera, Monterrey, NL 64010
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Preguntas frecuentes</h2>
          <dl className="space-y-6">
            {[
              {
                q: "¿Qué me deben si cancelan mi vuelo en México?",
                a: "Según el art. 62 bis de la Ley de Aviación Civil: reintegro del boleto o reubicación en siguiente vuelo disponible, asistencia (comida, comunicación) y compensación del 25% del valor del boleto más gastos documentados si la cancelación es imputable a la aerolínea.",
              },
              {
                q: "¿Cuánto me pagan por equipaje perdido en México?",
                a: "Para vuelos nacionales: equivalente a 75 UMAS (aprox. $8.600 MXN en 2026). Para vuelos internacionales: Convenio de Montreal — hasta 1.131 DEG (aprox. USD 1.500 en 2026).",
              },
              {
                q: "¿Aplica lo mismo para Volaris y Viva Aerobús?",
                a: "Sí. Todas las aerolíneas que operan en México deben cumplir la Ley de Aviación Civil y los tratados internacionales. Las aerolíneas de bajo costo no tienen excepción en materia de derechos de pasajeros.",
              },
              {
                q: "¿Qué pasa si el vuelo se cancela por mal tiempo?",
                a: "El mal tiempo es causa de fuerza mayor, lo que puede eximir a la aerolínea de la compensación del 25%, pero NO del deber de asistencia (comida, alojamiento) ni de ofrecer reintegro o reubicación.",
              },
              {
                q: "¿Cuánto tiempo tengo para reclamar equipaje?",
                a: "Para equipaje de mano dañado: 3 días desde la recepción. Para equipaje de bodega dañado: 7 días. Para equipaje perdido: 21 días desde la fecha en que debió entregarse. Pasados estos plazos se pierde el derecho.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-slate-200 pb-6">
                <dt className="font-bold text-slate-900 mb-2">{q}</dt>
                <dd className="text-slate-600">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <GuideWaitlistCTA
          variant="footer"
          source={SLUG}
          headline="JustIA hace esto en 5 minutos"
          body="Analizamos tu caso, calculamos la compensación y redactamos el reclamo. Sumate a la lista de espera."
        />

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            <strong>Disclaimer legal:</strong> esta guía tiene fines
            informativos y no reemplaza el asesoramiento de un abogado.
            Verifica la información en AFAC (afac.gob.mx) y PROFECO
            (profeco.gob.mx).
          </p>
        </footer>
      </main>
    </>
  );
}
