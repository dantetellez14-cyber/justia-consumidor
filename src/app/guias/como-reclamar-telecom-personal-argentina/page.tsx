import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const PAGE_PATH = "/guias/como-reclamar-telecom-personal-argentina";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-30";
const UPDATED = "2026-04-30";

export const metadata: Metadata = {
  title:
    "Cómo reclamar a Telecom/Personal: factura, baja y portabilidad (Argentina 2026)",
  description:
    "Guía paso a paso para reclamar a Telecom Personal en Argentina. Factura mal cobrada, baja imposible, sin servicio, portabilidad bloqueada. Botón de baja Ley 27.250. ENACOM + COPREC. Modelo gratis.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a Telecom/Personal — paso a paso (Argentina)",
    description:
      "ENACOM + COPREC + carta documento. Botón de baja, portabilidad, factura disputada. Modelo legal gratis. Aplica también a Movistar, Claro y Telecentro.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "cuando-reclamar", label: "Cuándo conviene reclamar" },
  { id: "paso-1", label: "Paso 1 — Atención al cliente Personal" },
  { id: "paso-2", label: "Paso 2 — Reclamo en ENACOM" },
  { id: "paso-3", label: "Paso 3 — COPREC / Defensa del Consumidor" },
  { id: "paso-4", label: "Paso 4 — Carta documento" },
  { id: "boton-baja", label: "El botón de baja (Ley 27.250)" },
  { id: "modelo-carta", label: "Modelo de carta documento (gratis)" },
  { id: "errores", label: "Errores comunes" },
  { id: "faq", label: "Preguntas frecuentes" },
];

const faqItems = [
  {
    q: "¿Telecom Personal puede negarse a darme de baja?",
    a: "No. La Ley 27.250 y la Resolución 316/2018 SCI obligan a las empresas a tener un 'botón de baja' visible en su web y a procesar la solicitud sin penalizaciones cuando se cumplió el plazo forzoso. La baja debe ser efectiva en máximo 10 días corridos. Si Personal te traba el proceso, eso es una infracción directa.",
  },
  {
    q: "¿Cuánto tarda una portabilidad de Personal a otro operador?",
    a: "Por la Resolución 9/2014, la portabilidad debe completarse en máximo 24 horas hábiles. Si Personal la demora, presentá queja en ENACOM con tu folio de portabilidad. Personal no puede condicionar la portabilidad al pago de adeudos disputados.",
  },
  {
    q: "Me cobran un servicio que cancelé. ¿Qué hago?",
    a: "Reclamo formal a Personal con folio. Si en 10 días hábiles no resuelven, presentás queja en ENACOM (defensa.enacom.gob.ar). Adjuntá comprobante de la baja y las facturas posteriores que reclaman pago. Tenés derecho a reembolso íntegro + interés punitorio (Ley 24.240 art. 31).",
  },
  {
    q: "¿Qué hago si tengo cortes de servicio frecuentes?",
    a: "Por el art. 25 de la Ley 27.078 (Argentina Digital), Personal debe acreditar bonificaciones automáticas por interrupciones que excedan los plazos regulados. Si no las aplica, reclamás en ENACOM aportando capturas de los cortes con fecha y hora.",
  },
  {
    q: "¿Puedo cancelar el contrato sin esperar al fin del forzoso si el servicio es deficiente?",
    a: "Sí, sin penalidades. La Ley 24.240 (art. 10 y 17) permite resolver el contrato cuando el servicio no se presta en las condiciones pactadas. Documentá las fallas, intimá por carta documento y, si no resuelven, iniciás reclamo en COPREC.",
  },
  {
    q: "¿Las cláusulas que limitan mi derecho a reclamar son válidas?",
    a: "No. La Resolución 53/2003 declara abusivas las cláusulas que limitan responsabilidad de la empresa, dificultan la rescisión o imponen renuncia a derechos. Aunque las firmes, son nulas de pleno derecho.",
  },
];

const howToSteps = [
  {
    name: "Atención al cliente Personal",
    text: "Llamá al *611 desde tu Personal, al 0800 444 4000 desde otro número, o entrá a Mi Personal. Pedí siempre número de reclamo. Plazo de respuesta: hasta 5 días hábiles.",
  },
  {
    name: "Reclamo en ENACOM",
    text: "Si Personal no resuelve en 10 días hábiles, presentá reclamo gratuito en defensa.enacom.gob.ar. ENACOM es el ente regulador de telecomunicaciones y tiene atribución directa sobre Personal, Movistar, Claro, Telecentro y Telecom.",
  },
  {
    name: "COPREC o Defensa del Consumidor provincial",
    text: "En paralelo, podés iniciar reclamo gratuito en COPREC (autogestion.produccion.gob.ar/coprec) o en Defensa del Consumidor de tu provincia/ciudad. Audiencia de conciliación en 30-45 días.",
  },
  {
    name: "Carta documento",
    text: "Como paso paralelo o previo a un juicio, intimá por carta documento (Correo Argentino, $3.000-5.000 ARS). Plazo de respuesta legal: 10 días hábiles. Tiene valor probatorio fuerte.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      name: "Cómo reclamar a Telecom/Personal en Argentina",
      description:
        "Pasos legales para reclamar a Telecom Personal por factura disputada, baja imposible, portabilidad bloqueada o servicio interrumpido.",
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
        "Cómo reclamar a Telecom/Personal paso a paso (Argentina 2026)",
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
            → Argentina → Telecom / Personal
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a Telecom/Personal paso a paso (Argentina)
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Última actualización: 30 de abril de 2026 · Tiempo de lectura: 9 min ·
            Aplica también a Movistar, Claro y Telecentro
          </p>
        </header>

        <aside className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            Resumen rápido
          </p>
          <p className="mt-2 text-slate-700">
            Las telecom lideran el ranking de Defensa del Consumidor en Argentina
            por séptimo mes consecutivo. Telecom Argentina sola acumula ~13.000
            reclamos al año. Si te facturaron de más, te bloquearon la baja, no
            tenés servicio o demoran la portabilidad, tenés 4 caminos legales:
            atención interna, ENACOM, COPREC y carta documento. Esta guía te
            lleva por todos con plazos, costos y modelo legal gratis.
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
            Cuándo conviene reclamar a Telecom/Personal
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            La Ley 24.240, la Ley 27.078 (Argentina Digital) y la Ley 27.250
            (botón de baja) te amparan en estos casos:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Factura con cargos no autorizados:</strong> servicios
              extra, paquetes, suscripciones que no contrataste.
            </li>
            <li>
              <strong>Débito automático sin autorización:</strong> Personal
              cobra a tu tarjeta sin tu consentimiento expreso.
            </li>
            <li>
              <strong>Baja imposible:</strong> el botón de baja no funciona,
              te derivan a un canal infinito o exigen pagos retenidos.
            </li>
            <li>
              <strong>Sin servicio pero con cobro:</strong> cortes frecuentes
              o internet/línea inactivos pero igual te facturan.
            </li>
            <li>
              <strong>Portabilidad bloqueada o demorada:</strong> exceden las
              24 horas hábiles regulatorias.
            </li>
            <li>
              <strong>Cambio de plan sin consentimiento:</strong> te
              modificaron el plan o subieron el precio sin avisar.
            </li>
            <li>
              <strong>Velocidad de internet engañosa:</strong> el plan
              contratado no alcanza la velocidad publicitada.
            </li>
          </ul>
        </section>

        <section id="paso-1" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 1 — Atención al cliente Personal
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Es el primer paso obligatorio. ENACOM y COPREC te exigen acreditar
            que primero intentaste con la empresa.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Telefónica:</strong> *611 desde tu Personal, o 0800 444
              4000 desde otro número.
            </li>
            <li>
              <strong>App Mi Personal:</strong> sección "Ayuda" → "Reclamos".
            </li>
            <li>
              <strong>Web:</strong> personal.com.ar → "Atención al cliente".
            </li>
            <li>
              <strong>Pedí siempre número de reclamo</strong> y guardalo.
            </li>
            <li>
              Personal tiene <strong>5 días hábiles</strong> para responder.
            </li>
          </ol>
          <p className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-slate-700">
            <strong>💡 Tip:</strong> grabá la llamada (avisando que la grabás
            por motivos legales — está permitido en Argentina). Si la promesa
            se rompe, tenés evidencia.
          </p>
        </section>

        <section id="paso-2" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 2 — Reclamo en ENACOM
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            ENACOM (Ente Nacional de Comunicaciones) es el regulador específico
            de telecomunicaciones. Es el camino más rápido para temas
            técnicos, portabilidad y calidad del servicio.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Plataforma:</strong>{" "}
              <a
                href="https://defensa.enacom.gob.ar"
                className="text-blue-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                defensa.enacom.gob.ar
              </a>
            </li>
            <li>
              <strong>Costo:</strong> gratuito.
            </li>
            <li>
              <strong>Documentación:</strong> número de reclamo Personal,
              factura disputada, contrato (si tenés), capturas de cortes,
              evidencia de la falla.
            </li>
            <li>
              <strong>Plazo de respuesta de Personal:</strong> 10 días hábiles
              desde que ENACOM le traslada el reclamo.
            </li>
            <li>
              <strong>Resolución estimada:</strong> 30-45 días.
            </li>
          </ul>
          <p className="mt-4 leading-relaxed text-slate-700">
            ENACOM puede ordenar a Personal restituir cobros indebidos,
            efectivizar bajas demoradas, completar portabilidades bloqueadas y
            aplicar bonificaciones por interrupciones del servicio.
          </p>
        </section>

        <section id="paso-3" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 3 — COPREC o Defensa del Consumidor provincial
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            En paralelo o si ENACOM no resuelve, podés escalar al sistema
            general de Defensa del Consumidor:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>COPREC nacional (gratuito):</strong>{" "}
              <a
                href="https://autogestion.produccion.gob.ar/coprec"
                className="text-blue-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                autogestion.produccion.gob.ar/coprec
              </a>
            </li>
            <li>
              <strong>Defensa del Consumidor provincial:</strong> CABA, PBA,
              Córdoba, Santa Fe, etc. Cada una tiene su propio organismo.
            </li>
            <li>
              <strong>Audiencia de conciliación:</strong> 30-45 días.
            </li>
            <li>
              <strong>Si no hay acuerdo:</strong> certificado para iniciar
              juicio.
            </li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="inline"
          source="guia-telecom-personal"
          headline="¿Querés saltarte estos 4 pasos?"
          body="JustIA está construyendo una herramienta que hace todo este proceso por vos en 5 minutos: análisis legal con IA, generación de carta documento y envío automático a Personal/ENACOM/COPREC. Sumate a la lista de espera."
        />

        <section id="paso-4" className="mb-12 mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 4 — Carta documento
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            La carta documento intima formalmente a Personal a resolver en 10
            días hábiles, con valor probatorio. Útil sobre todo cuando hay
            pretensión económica concreta o se prepara un eventual juicio.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Costo:</strong> $3.000-5.000 ARS aprox. en Correo Argentino.
            </li>
            <li>
              <strong>Plazo de respuesta legal:</strong> 10 días hábiles.
            </li>
            <li>
              <strong>Cuándo conviene:</strong> antes de un juicio, o cuando
              ENACOM/COPREC se demoran.
            </li>
          </ul>
        </section>

        <section
          id="boton-baja"
          className="mb-12 rounded-xl border border-emerald-200 bg-emerald-50 p-6"
        >
          <h2 className="text-2xl font-bold text-slate-900">
            El "botón de baja" — Ley 27.250
          </h2>
          <p className="mt-3 text-slate-700">
            En Argentina, las empresas de servicios continuos están obligadas
            por la <strong>Ley 27.250</strong> y la{" "}
            <strong>Resolución 316/2018</strong> a tener un botón claro y visible
            en su web para procesar bajas online, sin necesidad de llamar ni ir
            a una oficina.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              Debe estar en la <strong>página principal</strong> de la web,
              identificable a primera vista.
            </li>
            <li>
              No pueden exigir requisitos extra (visitas, "retención", etc.).
            </li>
            <li>
              La baja se efectiviza en{" "}
              <strong>máximo 10 días corridos</strong>.
            </li>
            <li>
              Personal te debe entregar una <strong>constancia escrita</strong>{" "}
              (mail con número de baja) inmediatamente.
            </li>
            <li>
              Si te demoran, te derivan o te ponen trabas, eso es una
              infracción directa que ENACOM sanciona.
            </li>
          </ul>
          <p className="mt-3 text-slate-700">
            <strong>Botón de baja Personal:</strong>{" "}
            <a
              href="https://www.personal.com.ar/baja"
              className="text-blue-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              personal.com.ar/baja
            </a>{" "}
            (verificá la URL actualizada en su sitio).
          </p>
        </section>

        <section
          id="modelo-carta"
          className="mb-12 rounded-xl border border-slate-300 bg-white p-6"
        >
          <h2 className="text-2xl font-bold text-slate-900">
            Modelo de carta documento (gratis)
          </h2>
          <p className="mt-3 text-slate-700">
            Copiá este modelo, completá los datos en{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
              [corchetes]
            </code>{" "}
            y llevalo a una sucursal de Correo Argentino.
          </p>
          <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-5 font-mono text-xs leading-relaxed text-slate-100">
{`A: Telecom Argentina S.A.
   CUIT: 30-63945373-8
   Domicilio: Av. Alicia Moreau de Justo 50, CABA

DE: [Nombre y apellido completo]
    DNI: [Número]
    Domicilio: [Calle, número, ciudad, provincia, CP]
    Línea/cuenta: [número de línea o cuenta]
    Email: [Tu email]

REF: Reclamo formal — Cuenta/Línea [número]

Por la presente, en mi carácter de consumidor amparado por la
Ley 24.240 de Defensa del Consumidor, la Ley 27.078 Argentina
Digital y la Ley 27.250 (botón de baja), intimo a vuestra
empresa a resolver dentro de los DIEZ (10) DÍAS HÁBILES de
recepcionada esta carta el siguiente reclamo:

HECHOS:
1) Soy cliente desde [fecha aproximada], línea [número],
   plan [nombre del plan], abonando $[monto] ARS mensuales.

2) [Describí en 3-5 líneas el problema concreto: factura con
   cargos por $X que no contraté, solicitud de baja
   solicitada el día Y con número Z sin efectivizar, sin
   servicio desde fecha W, etc.].

3) Presenté reclamo en Personal con número [folio] el día
   [DD/MM/AAAA] sin resolución satisfactoria.

DERECHO:
Los hechos descriptos configuran un incumplimiento contractual
en los términos de los artículos 10, 17, 19 y 31 de la Ley
24.240 y del artículo 25 de la Ley 27.078. La negativa a la
baja, en su caso, infringe la Ley 27.250 y la Resolución
316/2018 SCI.

INTIMACIÓN:
1) [Petición concreta: efectivizar la baja con constancia
   escrita / restituir $X / reactivar el servicio / completar
   portabilidad / etc.]
2) Cesar todo cobro vinculado al servicio reclamado.
3) Aplicar bonificación correspondiente por los días sin
   servicio o por la demora.

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

        <section id="errores" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Errores comunes que debilitan tu reclamo
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-slate-700">
            <li>
              <strong>No pedir número de reclamo en Personal.</strong> Sin
              número, ENACOM no puede acreditar que reclamaste primero a la
              empresa.
            </li>
            <li>
              <strong>Aceptar la "retención" sin documentar.</strong> Personal
              te ofrece descuentos o bonos para que sigas. Si aceptás, el
              forzoso se renueva y perdés derecho a baja inmediata.
            </li>
            <li>
              <strong>Pagar la factura completa estando en disputa.</strong> El
              pago sin protesta puede interpretarse como conformidad. Pagá
              solo lo no disputado.
            </li>
            <li>
              <strong>Confundir ENACOM con Defensa del Consumidor.</strong>{" "}
              ENACOM es el regulador técnico (telecom). Defensa es el general
              (todos los consumidores). Podés usar los dos.
            </li>
            <li>
              <strong>No documentar los cortes de servicio.</strong> Capturas
              con fecha y hora, mediciones de velocidad, son la prueba clave
              para reclamar bonificaciones.
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
                href="/guias/como-reclamar-mercado-libre-argentina"
                className="hover:underline"
              >
                → Cómo reclamar a Mercado Libre paso a paso (Argentina)
              </Link>
            </li>
            <li>
              <Link
                href="/guias/carta-documento-consumidor-argentina"
                className="hover:underline"
              >
                → Cómo hacer una carta documento de consumidor (Argentina)
              </Link>
            </li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="footer"
          source="guia-telecom-personal-footer"
          headline="JustIA está pronto"
          body="Reclamar a Personal/Movistar/Claro debería tomar 5 minutos, no 5 semanas. Estamos construyendo el abogado de IA que hace todo este proceso por vos. Sumate a la lista de espera."
        />

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            <strong>Disclaimer legal:</strong> esta guía tiene fines
            informativos y no reemplaza el asesoramiento de un abogado
            matriculado. Verificá información oficial en{" "}
            <a
              href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
              className="text-blue-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              argentina.gob.ar/defensadelconsumidor
            </a>{" "}
            y{" "}
            <a
              href="https://www.enacom.gob.ar"
              className="text-blue-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              enacom.gob.ar
            </a>
            .
          </p>
        </footer>
      </article>
    </>
  );
}
