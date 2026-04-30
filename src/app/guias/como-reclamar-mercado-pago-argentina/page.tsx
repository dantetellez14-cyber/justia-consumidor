import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const SLUG = "como-reclamar-mercado-pago-argentina";
const PAGE_URL = `${SITE_URL}/guias/${SLUG}`;

export const metadata: Metadata = {
  title:
    "Cómo reclamar a Mercado Pago Argentina: cargos, cuenta bloqueada y fraude | JustIA",
  description:
    "Guía paso a paso para reclamar a Mercado Pago Argentina: disputa de cargos, cuenta bloqueada, fraude y estafa. Reclamo interno, BCRA, Defensa del Consumidor y carta documento.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a Mercado Pago Argentina (2026)",
    description:
      "Cargos no autorizados, cuenta congelada o fraude: 4 caminos legales para resolver tu reclamo. Modelo de carta documento gratis.",
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
        "Cómo reclamar a Mercado Pago Argentina: cargos, cuenta bloqueada y fraude",
      description:
        "Guía paso a paso para reclamar a Mercado Pago Argentina por cargos no autorizados, cuenta bloqueada o fraude.",
      url: PAGE_URL,
      datePublished: "2026-04-30",
      dateModified: "2026-04-30",
      author: { "@type": "Organization", name: "JustIA" },
    },
    {
      "@type": "HowTo",
      name: "Cómo reclamar a Mercado Pago Argentina paso a paso",
      totalTime: "PT3H",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Reclamo interno en Mercado Pago",
          text: "Disputá el cargo desde la app: Actividad → seleccioná la operación → 'Tuve un problema'. Tenés 45 días desde la operación. Solicitá el número de caso.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Reclamo al banco emisor",
          text: "Si usaste tarjeta de crédito o débito, presentá un contracargo (chargeback) ante tu banco. Plazo: 30 días hábiles desde el extracto.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Denuncia al BCRA",
          text: "Mercado Pago opera como proveedor de servicios de pago regulado por el BCRA. Presentá reclamo en bcra.gob.ar/SistemasFinancieros si el problema involucra fondos.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Defensa del Consumidor / COPREC",
          text: "Presentá reclamo en consumidor.gob.ar (COPREC) contra Mercado Pago S.A. Incluí capturas, número de caso interno y descripción del daño.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Cuánto tiempo tarda la disputa de cargo en Mercado Pago?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El proceso interno tarda entre 5 y 15 días hábiles. Si no resuelven a tu favor, podés escalar al banco (contracargo) o al COPREC.",
          },
        },
        {
          "@type": "Question",
          name: "¿Mercado Pago está regulado como banco?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No es banco, pero está regulado por el BCRA como Proveedor de Servicios de Pago (PSP). Los fondos en tu cuenta virtual tienen protección limitada distinta a un banco.",
          },
        },
        {
          "@type": "Question",
          name: "¿Me pueden bloquear la cuenta sin previo aviso?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí, pueden bloquear por sospechas de fraude o incumplimiento de términos. Tenés derecho a solicitar explicación por escrito y a impugnar el bloqueo ante Defensa del Consumidor.",
          },
        },
        {
          "@type": "Question",
          name: "¿Puedo reclamar si fui víctima de un fraude de terceros?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. Reportá el fraude dentro de las 24hs en la app, presentá denuncia policial y solicitá la reversión del cargo. Si MP no revierte, escalá al COPREC y al BCRA.",
          },
        },
      ],
    },
  ],
};

export default function MercadoPagoARGuide() {
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
            Mercado Pago Argentina
          </span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
            Fintech · Argentina
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a Mercado Pago Argentina
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Cargo no autorizado, cuenta bloqueada o fraude: 4 caminos legales
            para recuperar tu dinero y tus derechos.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Actualizado: abril 2026 · Tiempo estimado: 30 min
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
              <strong>App Mercado Pago</strong>: disputá el cargo en Actividad
              (hasta 45 días)
            </li>
            <li>
              <strong>Contracargo bancario</strong>: si usaste tarjeta, reclamá
              al banco (30 días hábiles desde extracto)
            </li>
            <li>
              <strong>BCRA</strong>: para problemas con fondos de cuenta virtual
              (bcra.gob.ar)
            </li>
            <li>
              <strong>COPREC</strong>: mediación gratuita con Mercado Pago S.A.
              (consumidor.gob.ar)
            </li>
          </ol>
        </aside>

        {/* TOC */}
        <nav className="my-8 rounded-xl bg-slate-50 p-5 text-sm">
          <p className="font-bold text-slate-700 mb-3">En esta guía:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>
              <a href="#problemas-comunes" className="hover:underline">
                Problemas más comunes con Mercado Pago
              </a>
            </li>
            <li>
              <a href="#paso1" className="hover:underline">
                Paso 1: Reclamo interno en la app
              </a>
            </li>
            <li>
              <a href="#paso2" className="hover:underline">
                Paso 2: Contracargo al banco emisor
              </a>
            </li>
            <li>
              <a href="#paso3" className="hover:underline">
                Paso 3: Denuncia al BCRA
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

        {/* Problemas comunes */}
        <section id="problemas-comunes" className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            Problemas más comunes con Mercado Pago
          </h2>
          <ul className="space-y-3 text-slate-700">
            {[
              {
                icon: "💳",
                title: "Cargo no autorizado",
                desc: "Compra o transferencia que no realizaste.",
              },
              {
                icon: "🔒",
                title: "Cuenta bloqueada o suspendida",
                desc: "Sin acceso a tus fondos sin explicación clara.",
              },
              {
                icon: "🕵️",
                title: "Fraude o estafa",
                desc: "Phishing, QR falso o transferencia engañosa.",
              },
              {
                icon: "⏳",
                title: "Fondos retenidos",
                desc: "Dinero en cuenta que no podés retirar ni usar.",
              },
              {
                icon: "❌",
                title: "Tarjeta vinculada rechazada",
                desc: "Tu tarjeta fue debitada pero MP no acredita el pago.",
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
            Paso 1: Reclamo interno en la app
          </h2>
          <p className="text-slate-700 mb-4">
            Antes de escalar, agotá el canal interno. Mercado Pago tiene
            obligación de responder en un plazo razonable y generar un número de
            caso que podrás usar en etapas siguientes.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Abrí la app → tocá <strong>Actividad</strong>
            </li>
            <li>Seleccioná la operación problemática</li>
            <li>
              Tocá <strong>"Tuve un problema"</strong> o{" "}
              <strong>"Quiero reclamar"</strong>
            </li>
            <li>
              Completá el formulario con descripción detallada y adjuntá
              capturas
            </li>
            <li>
              <strong>Anotá el número de caso</strong> — es tu constancia
            </li>
          </ol>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            <strong>Plazo:</strong> 45 días corridos desde la operación para
            disputar cargos. Si la cuenta está bloqueada, reclamá de inmediato
            por cualquier canal disponible (chat, email, redes).
          </div>
        </section>

        {/* Paso 2 */}
        <section id="paso2" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 2: Contracargo al banco emisor
          </h2>
          <p className="text-slate-700 mb-4">
            Si el cargo se realizó con una tarjeta de crédito o débito vinculada
            a Mercado Pago, tu banco puede revertirlo mediante un{" "}
            <strong>contracargo (chargeback)</strong>. Esto es independiente del
            reclamo en la app de MP.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Llamá al 0800 de tu banco o ingresá al home banking
            </li>
            <li>
              Solicitá el formulario de <strong>desconocimiento de cargo</strong>
            </li>
            <li>
              Adjuntá: extracto, captura de la transacción en MP, número de caso
              MP
            </li>
            <li>
              El banco tiene 30 días hábiles para responder
            </li>
          </ol>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            <strong>Importante:</strong> el contracargo bancario y el reclamo en
            MP son procesos paralelos. Podés hacer ambos simultáneamente, pero
            no podés cobrar dos veces el mismo monto.
          </div>
        </section>

        {/* Paso 3 */}
        <section id="paso3" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 3: Denuncia al BCRA
          </h2>
          <p className="text-slate-700 mb-4">
            Mercado Pago está regulado como{" "}
            <strong>Proveedor de Servicios de Pago (PSP)</strong> por el Banco
            Central de la República Argentina. Para problemas relacionados con
            retención indebida de fondos, bloqueo de cuenta o incumplimiento
            normativo:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Ingresá a{" "}
              <strong>bcra.gob.ar → Usuarios Financieros → Reclamos</strong>
            </li>
            <li>
              Creá un usuario en el sistema de reclamos del BCRA
            </li>
            <li>
              Completá los datos: empresa (Mercado Pago S.A.), tipo de problema,
              monto afectado
            </li>
            <li>Adjuntá toda la documentación disponible</li>
            <li>El BCRA notifica a MP y exige respuesta formal</li>
          </ol>
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            <strong>Dato útil:</strong> el BCRA tiene poder regulatorio sobre
            MP. Un reclamo ante el Banco Central suele acelerar la respuesta de
            Mercado Pago más que cualquier otro canal.
          </div>
        </section>

        {/* Paso 4 */}
        <section id="paso4" className="mb-10">
          <h2 className="text-2xl font-bold mb-3">
            Paso 4: COPREC y carta documento
          </h2>
          <p className="text-slate-700 mb-4">
            Si los pasos anteriores no resolvieron el problema en 15 días
            hábiles, recurrí a la Secretaría de Comercio mediante el sistema
            COPREC, que genera una instancia de mediación gratuita y obligatoria.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
            <li>
              Ingresá a{" "}
              <strong>consumidor.gob.ar</strong> → Reclamo nuevo
            </li>
            <li>
              Empresa: <strong>Mercado Pago S.A.</strong>
            </li>
            <li>
              Describí el problema con fechas, montos y acciones previas
            </li>
            <li>
              Adjuntá: capturas, número de caso MP, extracto bancario
            </li>
            <li>
              Recibirás fecha para audiencia de mediación (telefónica o
              presencial)
            </li>
          </ol>
          <p className="text-slate-700">
            Simultáneamente, enviá una{" "}
            <strong>carta documento</strong> al domicilio legal de Mercado Pago:
          </p>
          <p className="mt-2 text-sm text-slate-500 italic">
            Mercado Pago S.A. — Arias 3751, Piso 4°, Ciudad Autónoma de Buenos
            Aires (C1430CRG)
          </p>
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
MERCADO PAGO S.A.
Arias 3751, Piso 4°
C.A.B.A. (C1430CRG)

Ref.: RECLAMO FORMAL — CARGO NO AUTORIZADO / CUENTA BLOQUEADA

Yo, [NOMBRE COMPLETO], DNI N° [NÚMERO], con domicilio en [DIRECCIÓN],
CUIT/CUIL [NÚMERO], usuario de Mercado Pago con CBU/CVU
[NÚMERO] y correo electrónico [EMAIL], me dirijo a Uds. para
formular el siguiente reclamo:

HECHOS:
Con fecha [FECHA DEL HECHO], se realizó en mi cuenta el siguiente
movimiento que impugno: [DESCRIPCIÓN DEL CARGO / BLOQUEO].
Monto afectado: $ [MONTO].
Número de caso interno MP: [NÚMERO DE CASO].

El día [FECHA] presenté reclamo formal por los canales internos de
la empresa sin obtener solución satisfactoria dentro del plazo legal.

DERECHO:
Fundo mi reclamo en la Ley 24.240 de Defensa del Consumidor (arts. 4,
10 bis, 19 y 40), las Comunicaciones del BCRA aplicables a PSP y el
Código Civil y Comercial de la Nación (arts. 1092 y ss.).

PETICIÓN:
1. Reversión inmediata del cargo / desbloqueo de cuenta.
2. Devolución del monto $ [MONTO] más intereses compensatorios.
3. En caso de incumplimiento, me reservo el derecho de iniciar
   acciones ante el COPREC, el BCRA y la justicia ordinaria,
   reclamando daño directo, daño moral y daño punitivo.

Aguardo respuesta en el plazo de 10 días hábiles.

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
                q: "¿Cuánto tiempo tarda la disputa de cargo en Mercado Pago?",
                a: "El proceso interno tarda entre 5 y 15 días hábiles. Si no resuelven a tu favor, podés escalar al banco (contracargo) o al COPREC.",
              },
              {
                q: "¿Mercado Pago está regulado como banco?",
                a: "No es banco, pero está regulado por el BCRA como Proveedor de Servicios de Pago (PSP). Los fondos en tu cuenta virtual tienen protección limitada, distinta a la de un banco.",
              },
              {
                q: "¿Me pueden bloquear la cuenta sin previo aviso?",
                a: "Sí, pueden bloquear por sospechas de fraude o incumplimiento de términos. Tenés derecho a solicitar explicación por escrito y a impugnar el bloqueo ante Defensa del Consumidor.",
              },
              {
                q: "¿Puedo reclamar si fui víctima de fraude de terceros?",
                a: "Sí. Reportá el fraude dentro de las 24 hs en la app, presentá denuncia policial y solicitá la reversión. Si MP no revierte, escalá al COPREC y al BCRA.",
              },
              {
                q: "¿Qué pasa si el fraudo fue con mi QR?",
                a: "Desactivá el QR de inmediato desde la app y reportá el caso. Presentá denuncia policial para documentar el hecho antes de reclamar la reversión.",
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
          body="Analizamos tu caso, redactamos la carta documento y te guiamos hasta la resolución. Sumate a la lista de espera."
        />

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            <strong>Disclaimer legal:</strong> esta guía tiene fines
            informativos y no reemplaza el asesoramiento de un abogado
            matriculado. Verificá la información en BCRA (bcra.gob.ar) y
            Defensa del Consumidor (consumidor.gob.ar).
          </p>
        </footer>
      </main>
    </>
  );
}
