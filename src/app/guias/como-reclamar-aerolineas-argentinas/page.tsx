import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const SLUG = "como-reclamar-aerolineas-argentinas";
const PAGE_URL = `${SITE_URL}/guias/${SLUG}`;

export const metadata: Metadata = {
  title:
    "Cómo reclamar a Aerolíneas Argentinas: cancelaciones, demoras y equipaje | JustIA",
  description:
    "Guía paso a paso para reclamar a Aerolíneas Argentinas y Flybondi: cancelaciones, demoras, equipaje perdido y denegación de embarque. ANAC, COPREC y carta documento.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a Aerolíneas Argentinas (2026)",
    description:
      "Vuelo cancelado, demora o equipaje perdido: tus derechos y 4 pasos para cobrar la compensación que te corresponde por ley.",
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
        "Cómo reclamar a Aerolíneas Argentinas: cancelaciones, demoras y equipaje",
      description:
        "Guía completa de derechos aéreos en Argentina: qué te deben compensar y cómo reclamar.",
      url: PAGE_URL,
      datePublished: "2026-04-30",
      dateModified: "2026-04-30",
      author: { "@type": "Organization", name: "JustIA" },
    },
    {
      "@type": "HowTo",
      name: "Cómo reclamar a Aerolíneas Argentinas paso a paso",
      totalTime: "PT3H",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Reclamo en el aeropuerto o en la aerolínea",
          text: "Solicitá el Formulario de Irregularidades de Equipaje (PIR) si perdiste valija, o un comprobante escrito si el vuelo fue cancelado o demorado. Anotá el número de reclamo.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Conocer tus derechos (Resolución ANAC 1532/98 y Convenio Montreal)",
          text: "En Argentina aplican derechos de pasajeros por cancelación (reintegro total o alternativa), demoras (asistencia desde 2hs) y equipaje (hasta 1.131 DEG del Convenio de Montreal).",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Denuncia ante la ANAC",
          text: "Presentá tu denuncia en anac.gob.ar → Pasajeros → Denuncias. La ANAC puede intimar a la aerolínea y aplicar sanciones.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "COPREC y carta documento",
          text: "Para compensación económica, presentá reclamo en consumidor.gob.ar contra Aerolíneas Argentinas S.A. o envía carta documento a su sede.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Qué me deben si cancelan mi vuelo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Tenés derecho a elegir entre: reintegro total del pasaje, reubicación en el próximo vuelo disponible, o reubicación en fecha posterior. Además, si la espera es mayor a 2 horas: comunicación gratuita, refrigerio o comida, y alojamiento si corresponde.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cuánto me pagan por equipaje perdido en Argentina?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El Convenio de Montreal establece un límite de 1.131 DEG (Derechos Especiales de Giro, aprox. USD 1.500 en 2026) por pasajero en vuelos internacionales. Para vuelos nacionales rige la Resolución ANAC 1532/98.",
          },
        },
        {
          "@type": "Question",
          name: "¿Aplica lo mismo para Flybondi y otras aerolíneas de bajo costo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. Todas las aerolíneas que operan en Argentina deben cumplir la misma normativa de derechos de pasajeros (Código Aeronáutico, Resolución ANAC 1532/98 y tratados internacionales aplicables).",
          },
        },
      ],
    },
  ],
};

export default function AerolineasARGuide() {
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
            Aerolíneas Argentinas
          </span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
            Transporte aéreo · Argentina
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a Aerolíneas Argentinas
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Vuelo cancelado, demora, equipaje perdido o denegación de embarque:
            tus derechos y cómo cobrar la compensación que la ley te garantiza.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Aplica también para Flybondi, LATAM y otras aerolíneas en
            Argentina · Actualizado: abril 2026
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
              <strong>En el aeropuerto</strong>: pedí constancia escrita
              (cancelación, demora o PIR de equipaje)
            </li>
            <li>
              <strong>Tus derechos</strong>: reintegro o reubicación, asistencia
              desde 2 hs de demora, compensación equipaje
            </li>
            <li>
              <strong>ANAC</strong>: denuncia en anac.gob.ar → Pasajeros
            </li>
            <li>
              <strong>COPREC + carta documento</strong>: para compensación
              económica (consumidor.gob.ar)
            </li>
          </ol>
        </aside>

        {/* TOC */}
        <nav className="my-8 rounded-xl bg-slate-50 p-5 text-sm">
          <p className="font-bold text-slate-700 mb-3">En esta guía:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>
              <a href="#derechos" className="hover:underline">
                Tus derechos como pasajero en Argentina
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
                Paso 3: Denuncia ante la ANAC
              </a>
            </li>
            <li>
              <a href="#paso4" className="hover:underline">
                Paso 4: COPREC y carta documento
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
            Tus derechos como pasajero aéreo en Argentina
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            El marco legal combina el <strong>Código Aeronáutico (Ley
            17.285)</strong>, la <strong>Resolución ANAC 1532/98</strong> y el{" "}
            <strong>Convenio de Montreal</strong> (para vuelos internacionales):
          </p>

          <div className="space-y-4">
            {[
              {
                title: "Vuelo cancelado",
                color: "border-red-300 bg-red-50",
                titleColor: "text-red-800",
                items: [
                  "Reintegro total del pasaje O reubicación en siguiente vuelo disponible",
                  "Asistencia: comunicación gratuita, refrigerio/comida según tiempo de espera",
                  "Si la espera es nocturna: alojamiento y traslado",
                  "Compensación económica si la cancelación es imputable a la aerolínea (no causa mayor)",
                ],
              },
              {
                title: "Vuelo demorado",
                color: "border-orange-300 bg-orange-50",
                titleColor: "text-orange-800",
                items: [
                  "Desde 2 hs de demora: comunicación gratuita",
                  "Desde 4 hs: refrigerio o comida",
                  "Desde 6 hs: alojamiento y traslado si corresponde",
                  "Demoras superiores a 4 hs habilitan el reintegro del pasaje",
                ],
              },
              {
                title: "Equipaje perdido, demorado o dañado",
                color: "border-blue-300 bg-blue-50",
                titleColor: "text-blue-800",
                items: [
                  "Completar PIR (Property Irregularity Report) en el aeropuerto",
                  "Plazo para reclamar daños: 7 días desde recepción",
                  "Plazo para reclamar demora: 21 días desde recepción",
                  "Límite de compensación vuelos internacionales: 1.131 DEG (≈USD 1.500)",
                ],
              },
              {
                title: "Denegación de embarque (overbooking)",
                color: "border-purple-300 bg-purple-50",
                titleColor: "text-purple-800",
                items: [
                  "Si tenés pasaje confirmado y te niegan el embarque: compensación económica obligatoria",
                  "Reubicación en vuelo alternativo o reintegro total del pasaje",
                  "Asistencia completa durante la espera",
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
          <p className="text-slate-700 mb-4">
            Lo que hagas en el aeropuerto determina la solidez de tu reclamo
            posterior. No salgas sin documentación.
          </p>
          <ol className="list-decimal list-inside space-y-3 text-slate-700">
            <li>
              <strong>Pedí constancia escrita</strong> de la cancelación o
              demora al personal de mostrador — con hora y motivo
            </li>
            <li>
              Si perdiste equipaje: dirigite de inmediato al{" "}
              <strong>Mostrador de Equipajes</strong> y completá el{" "}
              <strong>PIR (Property Irregularity Report)</strong>. Sin PIR, el
              reclamo posterior es muy difícil
            </li>
            <li>
              <strong>Guardá todos los comprobantes:</strong> tarjeta de
              embarque, etiqueta de equipaje, recibos de gastos (comida,
              alojamiento, traslados)
            </li>
            <li>
              Fotografiá el tablero de llegadas/salidas con la hora real y el
              estado del vuelo
            </li>
            <li>
              Anotá el número de vuelo, fecha, ruta y nombre del agente que te
              atendió
            </li>
          </ol>
        </section>

        {/* Paso 2 */}
        <section id="paso2" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 2: Reclamo formal a la aerolínea
          </h2>
          <p className="text-slate-700 mb-4">
            Una vez de regreso, presentá el reclamo formal a Aerolíneas
            Argentinas para agotar la vía interna.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Ingresá a{" "}
              <strong>aerolineas.com.ar</strong> → Contáctanos → Felicitaciones
              y Reclamos
            </li>
            <li>
              O enviá email a{" "}
              <strong>relacionesconclientes@aerolineas.com.ar</strong>
            </li>
            <li>
              Describí el incidente con fechas, número de vuelo y daño
              económico
            </li>
            <li>Adjuntá toda la documentación</li>
            <li>
              <strong>Solicitá número de caso</strong> y guardalo
            </li>
          </ol>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            <strong>Plazo de respuesta:</strong> la aerolínea tiene 30 días
            corridos para responder formalmente. Si no responde o la respuesta
            es insatisfactoria, pasá al Paso 3.
          </div>
        </section>

        {/* Paso 3 */}
        <section id="paso3" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 3: Denuncia ante la ANAC
          </h2>
          <p className="text-slate-700 mb-4">
            La Administración Nacional de Aviación Civil (ANAC) regula y
            fiscaliza a todas las aerolíneas en Argentina. Una denuncia ante la
            ANAC puede generar presión real sobre la aerolínea.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Ingresá a <strong>anac.gob.ar</strong> → Pasajeros → Denuncias y
              Reclamos
            </li>
            <li>
              Completá el formulario online con datos del vuelo, tipo de
              problema y daño
            </li>
            <li>
              Adjuntá: PIR (si corresponde), tarjeta de embarque, respuesta de
              la aerolínea, recibos de gastos
            </li>
            <li>
              La ANAC puede intimar formalmente a la aerolínea y aplicar
              sanciones administrativas
            </li>
          </ol>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            <strong>Nota:</strong> la denuncia ante la ANAC es gratuita y
            puede hacerse en paralelo al reclamo interno y al COPREC.
          </div>
        </section>

        {/* Paso 4 */}
        <section id="paso4" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 4: COPREC y carta documento
          </h2>
          <p className="text-slate-700 mb-4">
            Para obtener compensación económica directa, la vía más efectiva
            combinada es el COPREC más una carta documento simultánea.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Ingresá a <strong>consumidor.gob.ar</strong> → Nuevo reclamo
            </li>
            <li>
              Empresa: <strong>Aerolíneas Argentinas S.A.</strong>
            </li>
            <li>
              Calculá el daño: gastos de bolsillo documentados + valor del
              equipaje perdido + daño moral si corresponde
            </li>
            <li>
              Adjuntá toda la documentación y número de denuncia ANAC
            </li>
            <li>
              Paralelamente, enviá{" "}
              <strong>carta documento</strong> a la sede de Aerolíneas (ver
              modelo abajo)
            </li>
          </ol>
        </section>

        {/* Modelo carta */}
        <section id="modelo-carta" className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            Modelo de carta documento
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Completá los campos entre corchetes con tus datos reales.
          </p>
          <pre className="whitespace-pre-wrap rounded-xl bg-slate-800 text-slate-100 p-6 text-sm leading-relaxed overflow-x-auto">
{`[Ciudad], [fecha]

Señores
AEROLÍNEAS ARGENTINAS S.A.
Bouchard 547, Piso 8°
Ciudad Autónoma de Buenos Aires

Ref.: RECLAMO FORMAL — VUELO [NÚMERO] / [EQUIPAJE / CANCELACIÓN / DEMORA]

Yo, [NOMBRE COMPLETO], DNI N° [NÚMERO], con domicilio en [DIRECCIÓN],
me dirijo a Uds. para formular el siguiente reclamo:

HECHOS:
El día [FECHA], era pasajero del vuelo [NÚMERO DE VUELO] con ruta
[ORIGEN - DESTINO], con reserva N° [PNR/LOCALIZADOR].

[Seleccioná según tu caso:]

OPCIÓN A — CANCELACIÓN:
El vuelo fue cancelado [sin previo aviso / con aviso insuficiente], sin
que la empresa ofreciera reubicación adecuada ni me informara mis
derechos conforme a la Resolución ANAC 1532/98.
Gastos incurridos: $[MONTO] (adjunto comprobantes).

OPCIÓN B — DEMORA:
El vuelo sufrió una demora de [X] horas, sin que se me ofreciera
la asistencia obligatoria prevista en la normativa aplicable.
Gastos incurridos: $[MONTO] (adjunto comprobantes).

OPCIÓN C — EQUIPAJE:
Mi equipaje (etiqueta N° [NÚMERO]) fue [extraviado / dañado /
demorado]. Presenté PIR N° [NÚMERO] en fecha [FECHA].
Valor estimado del contenido: $[MONTO].

DERECHO:
Fundo mi reclamo en: Código Aeronáutico Ley 17.285, Resolución ANAC
1532/98, Convenio de Montreal (para vuelos internacionales), Ley 24.240
de Defensa del Consumidor (arts. 10 bis y 40).
Número de reclamo interno: [NÚMERO].
Número de denuncia ANAC: [NÚMERO] (si corresponde).

PETICIÓN:
1. Compensación por gastos documentados: $[MONTO].
2. Compensación por equipaje: hasta 1.131 DEG / $[MONTO].
3. Daño moral: $[MONTO].
En caso de no resolver en 10 días hábiles, iniciaré acciones ante
COPREC, ANAC y la justicia ordinaria.

[FIRMA]
[NOMBRE COMPLETO]
DNI [NÚMERO]`}
          </pre>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Preguntas frecuentes</h2>
          <dl className="space-y-6">
            {[
              {
                q: "¿Qué me deben si cancelan mi vuelo?",
                a: "Tenés derecho a elegir entre reintegro total del pasaje, reubicación en el próximo vuelo disponible o reubicación en fecha posterior. Si la espera supera 2 horas: comunicación gratuita, refrigerio o comida; si es nocturna: alojamiento y traslado.",
              },
              {
                q: "¿Cuánto me pagan por equipaje perdido?",
                a: "En vuelos internacionales, el Convenio de Montreal establece un límite de 1.131 DEG (aprox. USD 1.500 en 2026) por pasajero. Para vuelos de cabotaje rige la Resolución ANAC 1532/98 con montos diferentes.",
              },
              {
                q: "¿Aplica lo mismo para Flybondi y LATAM?",
                a: "Sí. Todas las aerolíneas que operan vuelos en Argentina deben cumplir la misma normativa (Código Aeronáutico + Resolución ANAC 1532/98 + tratados internacionales). Flybondi, LATAM, JetSmart, etc.",
              },
              {
                q: "¿Qué pasa si la cancelación fue por mal tiempo?",
                a: "El mal tiempo es considerado causa mayor (fuerza mayor), lo que puede eximir a la aerolínea de compensación económica adicional, pero no del deber de asistencia (comida, alojamiento) ni de ofrecer reubicación o reintegro.",
              },
              {
                q: "¿Tengo plazo para reclamar por equipaje dañado?",
                a: "Sí: 7 días corridos desde que recibiste la valija para daños, 21 días desde que la recibiste en caso de demora en la entrega. Pasado ese plazo, perdés el derecho a reclamar.",
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
          body="Analizamos tu caso, calculamos la compensación que te corresponde y redactamos el reclamo. Sumate a la lista de espera."
        />

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            <strong>Disclaimer legal:</strong> esta guía tiene fines
            informativos y no reemplaza el asesoramiento de un abogado
            matriculado. Verificá la información en ANAC (anac.gob.ar) y
            Defensa del Consumidor (consumidor.gob.ar).
          </p>
        </footer>
      </main>
    </>
  );
}
