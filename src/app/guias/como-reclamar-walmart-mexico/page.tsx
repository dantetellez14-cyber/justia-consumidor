import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const SLUG = "como-reclamar-walmart-mexico";
const PAGE_URL = `${SITE_URL}/guias/${SLUG}`;

export const metadata: Metadata = {
  title:
    "Cómo reclamar a Walmart México: devoluciones, garantías y cobros | JustIA",
  description:
    "Guía paso a paso para reclamar a Walmart México: devoluciones rechazadas, garantías no respetadas, cobros indebidos y productos defectuosos. PROFECO y carta documento.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a Walmart México (2026)",
    description:
      "Devolución rechazada, garantía negada o cobro de más: 4 pasos legales para resolver tu reclamo ante Walmart. Modelo de carta gratis.",
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
        "Cómo reclamar a Walmart México: devoluciones, garantías y cobros indebidos",
      description:
        "Guía completa para reclamar a Walmart México por devoluciones rechazadas, garantías no respetadas o cobros erróneos.",
      url: PAGE_URL,
      datePublished: "2026-04-30",
      dateModified: "2026-04-30",
      author: { "@type": "Organization", name: "JustIA" },
    },
    {
      "@type": "HowTo",
      name: "Cómo reclamar a Walmart México paso a paso",
      totalTime: "PT2H",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Reclamo en tienda o Servicio al Cliente",
          text: "Presenta tu ticket, garantía o evidencia al gerente de la tienda. Solicita la resolución por escrito y el número de folio de tu queja.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Contracargo bancario",
          text: "Si pagaste con tarjeta, presenta un contracargo ante tu banco por cargo indebido o mercancía no recibida. Plazo: 90 días en tarjeta de crédito.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Queja ante PROFECO",
          text: "Registra tu queja en profeco.gob.mx o en el teléfono PROFECO 800-468-8722. Walmart está en el top 5 de empresas con más quejas en PROFECO.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Carta documento y acción legal",
          text: "Envía carta documento al domicilio legal de Wal-Mart de México (WALMEX). Si el monto es menor a 40 UMAS, puedes demandar en Juzgado de Paz.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Cuántos días tiene Walmart para aceptar una devolución?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Walmart tiene política de 30 días para devoluciones con ticket. La Ley Federal del Consumidor (LFPC) establece que el proveedor debe respetar la garantía y las condiciones pactadas al momento de la compra.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué pasa si Walmart no respeta la garantía?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Según el art. 77 de la LFPC, puedes exigir la reparación gratuita, sustitución del producto o devolución del precio pagado. PROFECO puede mediar y sancionar a Walmart.",
          },
        },
        {
          "@type": "Question",
          name: "¿Puedo reclamar si me cobraron más en caja que el precio exhibido?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. La LFPC art. 7 bis obliga a cobrar el precio más bajo cuando existe discrepancia. Tienes derecho al precio exhibido y puedes reclamar la diferencia ante PROFECO.",
          },
        },
      ],
    },
  ],
};

export default function WalmartMXGuide() {
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
          <span className="text-amber-600 font-semibold">Walmart México</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
            Retail · México
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a Walmart México
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Devolución rechazada, garantía negada o cobro de más en caja: tus
            derechos como consumidor y cómo hacerlos valer.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Actualizado: abril 2026 · Tiempo estimado: 25 min
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
              <strong>Tienda / Servicio al Cliente</strong>: pide resolución
              escrita y número de folio
            </li>
            <li>
              <strong>Contracargo bancario</strong>: si pagaste con tarjeta (90
              días crédito)
            </li>
            <li>
              <strong>PROFECO</strong>: queja en profeco.gob.mx o 800-468-8722
            </li>
            <li>
              <strong>Carta documento + juzgado</strong>: para montos mayores o
              garantías negadas
            </li>
          </ol>
        </aside>

        {/* TOC */}
        <nav className="my-8 rounded-xl bg-slate-50 p-5 text-sm">
          <p className="font-bold text-slate-700 mb-3">En esta guía:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>
              <a href="#problemas-comunes" className="hover:underline">
                Problemas más comunes con Walmart
              </a>
            </li>
            <li>
              <a href="#paso1" className="hover:underline">
                Paso 1: Reclamo en tienda
              </a>
            </li>
            <li>
              <a href="#paso2" className="hover:underline">
                Paso 2: Contracargo bancario
              </a>
            </li>
            <li>
              <a href="#paso3" className="hover:underline">
                Paso 3: Queja ante PROFECO
              </a>
            </li>
            <li>
              <a href="#paso4" className="hover:underline">
                Paso 4: Carta documento y acción legal
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

        {/* Problemas comunes */}
        <section id="problemas-comunes" className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            Problemas más comunes con Walmart México
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Wal-Mart de México (WALMEX) opera Walmart, Bodega Aurrerá, Sam's
            Club y Superama. Estos son los reclamos más frecuentes en PROFECO:
          </p>
          <ul className="space-y-3 text-slate-700">
            {[
              {
                icon: "↩️",
                title: "Devolución rechazada",
                desc: "Niegan la devolución a pesar de tener ticket y estar dentro del plazo.",
              },
              {
                icon: "🛡️",
                title: "Garantía no respetada",
                desc: "Producto defectuoso al que no aplican la garantía del fabricante.",
              },
              {
                icon: "💰",
                title: "Cobro incorrecto en caja",
                desc: "Precio en sistema mayor al etiquetado en góndola.",
              },
              {
                icon: "📦",
                title: "Producto no entregado (e-commerce)",
                desc: "Compra en walmart.com.mx no llega o llega incompleta.",
              },
              {
                icon: "🏷️",
                title: "Publicidad engañosa",
                desc: "Promoción anunciada que no aplican al momento del cobro.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Paso 1 */}
        <section id="paso1" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 1: Reclamo en tienda o Servicio al Cliente
          </h2>
          <p className="text-slate-700 mb-4">
            El primer paso siempre es intentar resolver en tienda. Esto crea un
            registro y es requisito previo para PROFECO.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Ve al módulo de <strong>Servicio al Cliente</strong> con tu ticket
              y el producto
            </li>
            <li>
              Exige hablar con el <strong>gerente de turno</strong> si el
              cajero no puede resolver
            </li>
            <li>
              Solicita el <strong>número de folio</strong> de tu queja y que te
              lo entreguen por escrito o por correo
            </li>
            <li>
              Si hay discrepancia de precio, señala el producto en góndola y
              toma foto del etiquetado
            </li>
            <li>
              Guarda todos los documentos: ticket original, folio de queja,
              fotos
            </li>
          </ol>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            <strong>Para e-commerce:</strong> contáctate vía chat en
            walmart.com.mx → Mi cuenta → Mis pedidos → Reportar problema.
            Solicita número de caso.
          </div>
        </section>

        {/* Paso 2 */}
        <section id="paso2" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 2: Contracargo bancario
          </h2>
          <p className="text-slate-700 mb-4">
            Si pagaste con tarjeta de crédito o débito y no recibiste el producto
            o te cobraron de más, tu banco puede revertir el cargo.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Comunícate con el banco por teléfono, app o sucursal
            </li>
            <li>
              Solicita el formulario de <strong>contracargo por cargo
              indebido</strong> o <strong>mercancía no recibida</strong>
            </li>
            <li>
              Adjunta: ticket/estado de cuenta, folio de queja Walmart, fotos
            </li>
            <li>
              <strong>Tarjeta de crédito:</strong> plazo hasta 90 días desde el
              cargo
            </li>
            <li>
              <strong>Tarjeta de débito:</strong> plazo más corto (varía por
              banco, típico 30–60 días)
            </li>
          </ol>
        </section>

        {/* Paso 3 */}
        <section id="paso3" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 3: Queja ante PROFECO
          </h2>
          <p className="text-slate-700 mb-4">
            PROFECO es la Procuraduría Federal del Consumidor. Walmart está
            sistemáticamente en el top 5 de empresas con más quejas, lo que
            significa que PROFECO conoce bien sus prácticas y tiene precedentes
            favorables para consumidores.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Ingresa a <strong>profeco.gob.mx</strong> → Servicios al
              Consumidor → Queja
            </li>
            <li>
              También puedes llamar al <strong>800-PROFECO (800-468-8722)</strong>
            </li>
            <li>
              Llena el formulario: empresa (Wal-Mart de México S.A.B. de C.V.),
              tipo de queja, monto, fechas
            </li>
            <li>
              Adjunta toda la evidencia: ticket, fotos, folio de queja, historial
              de chat
            </li>
            <li>
              PROFECO notifica a Walmart y cita a ambas partes a una{" "}
              <strong>audiencia de conciliación</strong>
            </li>
          </ol>
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            <strong>Resultado esperado:</strong> en la mayoría de los casos con
            evidencia, Walmart resuelve en la audiencia de conciliación para
            evitar una multa de PROFECO (hasta $2.3 millones de pesos para
            empresas grandes).
          </div>
        </section>

        {/* Paso 4 */}
        <section id="paso4" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 4: Carta documento y acción legal
          </h2>
          <p className="text-slate-700 mb-4">
            Si la conciliación en PROFECO no funciona o el monto es significativo,
            el siguiente paso es la vía legal directa.
          </p>
          <ul className="space-y-3 text-slate-700 mb-4">
            <li className="flex gap-3">
              <span className="font-bold text-slate-400 shrink-0">01</span>
              <div>
                <p className="font-semibold">
                  Carta documento / burofax notarial
                </p>
                <p className="text-sm text-slate-500">
                  Envía al domicilio legal de WALMEX con descripción del daño,
                  fundamento legal (LFPC arts. 7, 77, 92) y plazo de 10 días
                  para resolver.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-400 shrink-0">02</span>
              <div>
                <p className="font-semibold">Juzgado de Paz / Civil</p>
                <p className="text-sm text-slate-500">
                  Para montos menores a 40 UMAS (aprox. $4,600 MXN en 2026),
                  puedes demandar en juzgado de paz sin abogado. Para montos
                  mayores, juzgado civil o procedimiento ante PROFECO como árbitro.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-400 shrink-0">03</span>
              <div>
                <p className="font-semibold">Arbitraje PROFECO</p>
                <p className="text-sm text-slate-500">
                  PROFECO puede actuar como árbitro si ambas partes lo aceptan.
                  El laudo es vinculante. Trámite gratuito.
                </p>
              </div>
            </li>
          </ul>
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
WAL-MART DE MÉXICO, S.A.B. DE C.V.
Nextengo No. 78, Col. Santa Cruz Acayucan
Alcaldía Azcapotzalco, Ciudad de México, C.P. 02770

Ref.: RECLAMACIÓN FORMAL — [DEVOLUCIÓN / GARANTÍA / COBRO INDEBIDO]

Yo, [NOMBRE COMPLETO], con credencial de elector / pasaporte
No. [NÚMERO], domicilio en [DIRECCIÓN COMPLETA], C.P. [CÓDIGO POSTAL],
me dirijo a ustedes para formular la siguiente reclamación:

HECHOS:
El día [FECHA], realicé una compra en su tienda ubicada en [DIRECCIÓN
TIENDA] / en walmart.com.mx, por la cantidad de $[MONTO] MXN
correspondiente a [DESCRIPCIÓN DEL PRODUCTO/SERVICIO].

El problema que presento es: [DESCRIPCIÓN DETALLADA DEL PROBLEMA].
Folio de queja en tienda: [NÚMERO] (fecha: [FECHA]).

A la fecha, su empresa no ha resuelto el problema de manera satisfactoria.

FUNDAMENTO LEGAL:
La Ley Federal de Protección al Consumidor (LFPC) establece:
- Art. 7: derecho al precio más bajo ante discrepancia
- Art. 77: garantía obligatoria sobre productos y servicios
- Art. 92 TER: indemnización por daños causados

PETICIÓN:
1. [DEVOLUCIÓN DEL DINERO / REPOSICIÓN DEL PRODUCTO / CORRECCIÓN
   DEL COBRO] por un monto de $[MONTO] MXN.
2. En caso de no atender esta reclamación en 10 días hábiles,
   presentaré queja ante PROFECO y ejerceré las acciones legales
   correspondientes, incluyendo daños y perjuicios.

Atentamente,

[FIRMA]
[NOMBRE COMPLETO]
Tel: [TELÉFONO]
Email: [CORREO]`}
          </pre>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Preguntas frecuentes</h2>
          <dl className="space-y-6">
            {[
              {
                q: "¿Cuántos días tiene Walmart para aceptar una devolución?",
                a: "Walmart tiene política interna de 30 días con ticket. La LFPC establece que el proveedor debe respetar las condiciones pactadas al momento de la compra y la garantía del producto.",
              },
              {
                q: "¿Qué pasa si Walmart no respeta la garantía?",
                a: "Según el art. 77 de la LFPC, puedes exigir reparación gratuita, sustitución del producto o devolución del precio. PROFECO puede mediar y sancionar a Walmart con multas.",
              },
              {
                q: "¿Puedo reclamar si me cobraron más en caja que el precio exhibido?",
                a: "Sí. La LFPC art. 7 bis obliga a cobrar el precio más bajo ante discrepancia. Tienes derecho al precio del etiquetado y puedes reclamar la diferencia ante PROFECO.",
              },
              {
                q: "¿Aplica para Bodega Aurrerá y Sam's Club?",
                a: "Sí. Bodega Aurrerá y Sam's Club son operados por Wal-Mart de México (WALMEX). Los mismos derechos y el mismo domicilio legal aplican para todos.",
              },
              {
                q: "¿Tengo que ir personalmente a PROFECO?",
                a: "No. Puedes presentar la queja completamente en línea en profeco.gob.mx. Las audiencias de conciliación también pueden ser telefónicas.",
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
          body="Analizamos tu caso, redactamos la carta y te guiamos en cada paso. Sumate a la lista de espera."
        />

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            <strong>Disclaimer legal:</strong> esta guía tiene fines
            informativos y no reemplaza el asesoramiento de un abogado. Verificá
            la información en PROFECO (profeco.gob.mx) y la Ley Federal de
            Protección al Consumidor.
          </p>
        </footer>
      </main>
    </>
  );
}
