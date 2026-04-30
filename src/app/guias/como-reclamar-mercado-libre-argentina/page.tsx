import type { Metadata } from "next";
import Link from "next/link";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const PAGE_PATH = "/guias/como-reclamar-mercado-libre-argentina";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-30";
const UPDATED = "2026-04-30";

export const metadata: Metadata = {
  title:
    "Cómo reclamar a Mercado Libre paso a paso (Argentina 2026)",
  description:
    "Guía práctica para reclamar a Mercado Libre en Argentina: producto no recibido, dañado o vendedor que no responde. Modelo de carta documento incluido. Ley 24.240.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cómo reclamar a Mercado Libre paso a paso (Argentina)",
    description:
      "Guía completa con todos los pasos legales. Mediación, COPREC, carta documento. Modelo descargable.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "cuando-conviene", label: "Cuándo conviene reclamar" },
  { id: "paso-1", label: "Paso 1 — Reclamo dentro de Mercado Libre" },
  { id: "paso-2", label: "Paso 2 — Mediación de Mercado Libre" },
  { id: "paso-3", label: "Paso 3 — Disputa con tu tarjeta (chargeback)" },
  { id: "paso-4", label: "Paso 4 — Defensa del Consumidor (COPREC)" },
  { id: "paso-5", label: "Paso 5 — Carta documento" },
  { id: "modelo-carta", label: "Modelo de carta documento (gratis)" },
  { id: "errores", label: "Errores comunes que invalidan tu reclamo" },
  { id: "faq", label: "Preguntas frecuentes" },
];

const faqItems = [
  {
    q: "¿Cuánto tiempo tengo para reclamar a Mercado Libre?",
    a: "La Compra Protegida de Mercado Libre cubre hasta 30 días desde la compra. Para Defensa del Consumidor (Ley 24.240), tenés hasta 3 años desde el incumplimiento. Para chargeback con tarjeta, 30 días desde que aparece el cargo en el resumen.",
  },
  {
    q: "¿Mercado Libre tiene que devolverme el dinero o solo darme un voucher?",
    a: "Si la compra está cubierta por Compra Protegida y aplica el reintegro, te corresponde la devolución del dinero al medio de pago original. No estás obligado a aceptar saldo en cuenta de Mercado Pago.",
  },
  {
    q: "¿Qué pasa si el vendedor no responde mi reclamo?",
    a: "Después de 5 días hábiles sin respuesta, podés solicitar la mediación de Mercado Libre desde la sección 'Mis compras'. Si tampoco resuelve, escalás a Defensa del Consumidor o iniciás una disputa con tu tarjeta.",
  },
  {
    q: "¿Necesito un abogado para reclamar?",
    a: "No. Defensa del Consumidor es un trámite gratuito y no requiere abogado. La carta documento tampoco requiere abogado, aunque conviene que tenga la fundamentación legal correcta.",
  },
  {
    q: "¿Puedo arrepentirme de una compra y devolverla?",
    a: "Sí. La Resolución 51/2017 establece el derecho de arrepentimiento en compras a distancia: tenés 10 días corridos desde que recibís el producto para devolverlo sin causa, y Mercado Libre debe reintegrarte el dinero, incluido el costo de envío.",
  },
  {
    q: "¿Qué documentación necesito guardar para reclamar?",
    a: "Captura del anuncio original, comprobante de pago, conversación con el vendedor, fotos del producto recibido (si llegó dañado o distinto), y el ticket de reclamo dentro de Mercado Libre.",
  },
];

const howToSteps = [
  {
    name: "Reclamo dentro de Mercado Libre",
    text: "En 'Mis compras', seleccioná la compra problemática y hacé clic en 'Tengo un problema'. Describí qué pasó y subí evidencia (fotos, capturas). El vendedor tiene 5 días hábiles para responder.",
  },
  {
    name: "Mediación de Mercado Libre",
    text: "Si el vendedor no responde o no resuelve, hacé clic en 'Solicitar mediación'. Mercado Libre actúa como árbitro y aplica la Compra Protegida si corresponde. Plazo: 30 días desde la compra.",
  },
  {
    name: "Disputa con tu tarjeta de crédito (chargeback)",
    text: "Si Mercado Libre rechaza la mediación, contactá al banco emisor de tu tarjeta y pedí un chargeback por 'producto no recibido' o 'servicio no prestado'. Plazo: 30 días desde el resumen donde aparece el cargo.",
  },
  {
    name: "Defensa del Consumidor (COPREC)",
    text: "Iniciá un reclamo gratuito en COPREC (autogestion.produccion.gob.ar/coprec). En 30 días te citan a una audiencia de conciliación obligatoria. Si Mercado Libre no acude o no acuerda, podés ir a juicio.",
  },
  {
    name: "Carta documento",
    text: "Como paso previo o paralelo, podés enviar una carta documento a Mercado Libre intimando a resolver en 10 días hábiles. Costo aproximado: $3.000-5.000 ARS en Correo Argentino. Tiene valor probatorio.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      name: "Cómo reclamar a Mercado Libre paso a paso (Argentina)",
      description:
        "Guía con los 5 pasos legales para reclamar a Mercado Libre en Argentina cuando un producto no llegó, llegó dañado o el vendedor no responde.",
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
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
    {
      "@type": "Article",
      headline:
        "Cómo reclamar a Mercado Libre paso a paso (Argentina 2026)",
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
            → Argentina → Mercado Libre
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Cómo reclamar a Mercado Libre paso a paso (Argentina)
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
            Si tu compra en Mercado Libre tuvo problemas (no llegó, llegó
            distinta, dañada o el vendedor no responde), tenés 5 caminos
            legales en Argentina: reclamo interno, mediación de ML, chargeback
            con la tarjeta, COPREC y carta documento. Esta guía te lleva por
            los 5 con plazos, costos y un modelo de carta gratis.
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

        <section id="cuando-conviene" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Cuándo conviene reclamar a Mercado Libre
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            La Ley 24.240 de Defensa del Consumidor te ampara en{" "}
            <strong>todas</strong> las compras hechas a través de Mercado
            Libre, sin importar quién sea el vendedor. Conviene reclamar
            siempre que se cumpla alguno de estos escenarios:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>El producto no llegó</strong> y pasaron los plazos de
              entrega comprometidos.
            </li>
            <li>
              <strong>Llegó otro producto</strong> distinto al publicado en
              fotos o descripción.
            </li>
            <li>
              <strong>Llegó dañado, falsificado o usado</strong> cuando se
              vendía como nuevo.
            </li>
            <li>
              <strong>El vendedor no responde</strong> tus mensajes después de
              48-72 horas.
            </li>
            <li>
              <strong>Te cobraron de más</strong> o aparece un cargo que no
              autorizaste.
            </li>
            <li>
              <strong>Te negaron la garantía legal</strong> de 6 meses (3 para
              productos no nuevos) que establece el art. 11 de la ley.
            </li>
          </ul>
          <p className="mt-4 leading-relaxed text-slate-700">
            <strong>No conviene reclamar</strong> si simplemente cambiaste de
            opinión después del plazo de arrepentimiento (10 días corridos
            desde la recepción) o si el problema fue causado por uso indebido
            del producto.
          </p>
        </section>

        <section id="paso-1" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 1 — Reclamo dentro de Mercado Libre
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Es el primer paso obligatorio. Mercado Libre exige que intentes
            resolver con el vendedor antes de escalar.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">
            <li>
              Entrá a <em>Mis compras</em> y abrí la compra problemática.
            </li>
            <li>
              Hacé clic en <em>"Tengo un problema con mi compra"</em>.
            </li>
            <li>
              Elegí el motivo más cercano a tu situación (no llegó, llegó
              distinto, dañado, etc.).
            </li>
            <li>
              Subí <strong>evidencia</strong>: fotos del producto recibido,
              capturas del anuncio original, conversaciones previas.
            </li>
            <li>
              El vendedor tiene <strong>5 días hábiles</strong> para responder.
            </li>
          </ol>
          <p className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-slate-700">
            <strong>💡 Tip:</strong> documentá todo desde el primer momento. Si
            después tenés que escalar a Defensa del Consumidor o a un juzgado,
            las capturas y el ticket de reclamo son tu prueba principal.
          </p>
        </section>

        <section id="paso-2" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 2 — Mediación de Mercado Libre
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Si el vendedor no responde en 5 días hábiles o no llega a un
            acuerdo, podés escalar a Mercado Libre como mediador.
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">
            En la misma página del reclamo aparece el botón{" "}
            <em>"Solicitar mediación"</em>. ML revisa el caso y aplica la{" "}
            <strong>Compra Protegida</strong>: si la compra está dentro de los
            30 días, el producto está dentro de las categorías cubiertas y la
            evidencia respalda tu reclamo, normalmente devuelven el dinero.
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">
            <strong>Lo que ML cubre:</strong> producto no recibido, distinto al
            publicado, dañado o falsificado.
            <br />
            <strong>Lo que ML NO cubre:</strong> arrepentimiento fuera de
            plazo, productos digitales, servicios, compras pagadas fuera de
            Mercado Pago.
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">
            <strong>Importante:</strong> aceptar saldo en cuenta de Mercado
            Pago es opcional. Tenés derecho a pedir la devolución al medio de
            pago original (Ley 24.240 art. 10 ter).
          </p>
        </section>

        <section id="paso-3" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 3 — Disputa con tu tarjeta (chargeback)
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Si Mercado Libre rechaza la mediación o tu compra quedó fuera de
            cobertura, podés iniciar una disputa con el banco emisor de tu
            tarjeta. Es un mecanismo paralelo, regulado por las redes Visa y
            Mastercard.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">
            <li>
              Llamá al banco o entrá al home banking → "Desconocer cargo".
            </li>
            <li>
              Elegí motivo: <em>"Producto no recibido"</em> o{" "}
              <em>"Servicio no prestado"</em>.
            </li>
            <li>Adjuntá la documentación que ya tenés del paso 1.</li>
            <li>
              Plazo: <strong>30 días desde el resumen</strong> donde aparece el
              cargo.
            </li>
          </ol>
          <p className="mt-4 leading-relaxed text-slate-700">
            El banco te devuelve el monto provisoriamente mientras investiga.
            Si comprueba que tu reclamo es válido, el reintegro queda firme.
          </p>
        </section>

        <section id="paso-4" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 4 — Defensa del Consumidor (COPREC)
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Si nada de lo anterior funciona, COPREC (Conciliación Previa en
            Relaciones de Consumo) es el organismo nacional que media entre vos
            y la empresa <strong>antes</strong> de un juicio. Es gratuito y
            obligatorio para reclamos hasta cierto monto.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Dónde:</strong>{" "}
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
              <strong>Costo:</strong> gratis.
            </li>
            <li>
              <strong>Plazo:</strong> hasta 3 años desde el incumplimiento.
            </li>
            <li>
              <strong>Tiempo aproximado:</strong> 30 a 45 días hasta la
              audiencia.
            </li>
            <li>
              <strong>Documentación:</strong> DNI, comprobante de la compra,
              capturas del reclamo en ML, evidencia del problema.
            </li>
          </ul>
          <p className="mt-4 leading-relaxed text-slate-700">
            Si Mercado Libre o el vendedor no asisten a la audiencia o no se
            llega a un acuerdo, COPREC emite un certificado que habilita a ir a
            juicio. En CABA podés iniciar el reclamo también en{" "}
            <em>Defensa y Protección al Consumidor</em> de la Ciudad. Cada
            provincia tiene su propio organismo.
          </p>
        </section>

        <GuideWaitlistCTA
          variant="inline"
          source="guia-mercado-libre"
          headline="¿Querés saltarte estos 5 pasos?"
          body="JustIA está construyendo una herramienta que hace todo este proceso por vos en 5 minutos: análisis legal con IA, generación de carta documento y envío automático. Sumate a la lista de espera para ser de los primeros en usarla."
        />

        <section id="paso-5" className="mb-12 mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Paso 5 — Carta documento
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            La carta documento es un instrumento legal con valor probatorio que
            podés enviar por Correo Argentino. Sirve para intimar formalmente a
            Mercado Libre (o al vendedor) a resolver en un plazo fijo, antes de
            ir a la justicia.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Costo:</strong> aproximadamente $3.000 a $5.000 ARS
              (Correo Argentino, abril 2026).
            </li>
            <li>
              <strong>Plazo de respuesta:</strong> 10 días hábiles desde la
              recepción.
            </li>
            <li>
              <strong>Quién la firma:</strong> vos como consumidor, no requiere
              abogado.
            </li>
            <li>
              <strong>Qué incluye:</strong> identificación, descripción del
              problema, fundamentación legal, plazo de cumplimiento, advertencia
              de acciones legales.
            </li>
          </ul>
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
            y llevalo a una sucursal de Correo Argentino para enviarlo como
            carta documento.
          </p>
          <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-5 font-mono text-xs leading-relaxed text-slate-100">
{`A: MercadoLibre S.R.L.
   CUIT: 30-70308853-4
   Domicilio: Av. Caseros 3039, piso 2, CABA

DE: [Nombre y apellido completo]
    DNI: [Número]
    Domicilio: [Calle y número, ciudad, provincia, CP]
    Email: [Tu email]

REF: Compra ID #[número de operación] — Reclamo formal

Por la presente, en mi carácter de consumidor amparado por la
Ley 24.240 de Defensa del Consumidor y normativa concordante,
intimo a vuestra empresa a resolver dentro de los DIEZ (10) DÍAS
HÁBILES de recepcionada esta carta el siguiente reclamo:

HECHOS:
Con fecha [DD/MM/AAAA] adquirí a través de la plataforma
Mercado Libre el producto "[descripción exacta del producto]"
por la suma de $[monto] ARS, abonado mediante [medio de pago].
[Describí en 3-5 líneas qué pasó: no llegó, llegó dañado,
distinto al publicado, etc. Incluí fechas y número de reclamo
interno si lo hay].

DERECHO:
Los hechos descritos configuran un incumplimiento contractual
en los términos de los artículos 10, 17 y 19 de la Ley 24.240,
en tanto el bien adquirido no se ajusta a lo ofertado y no se
ha satisfecho la obligación principal del vendedor.

INTIMACIÓN:
En consecuencia, INTIMO a Mercado Libre a:
1) Reintegrar la totalidad del monto abonado ($[monto] ARS) al
   medio de pago original.
2) Hacerlo dentro de los 10 días hábiles de recibida esta CD.

Bajo apercibimiento de iniciar las acciones administrativas
ante COPREC y/o judiciales que correspondan, con expresa
imposición de costas, daños y perjuicios y daño punitivo
(art. 52 bis Ley 24.240).

Sin otro particular, saluda atentamente,

[Firma]
[Aclaración]
[DNI]
[Fecha]`}
          </pre>
          <p className="mt-4 text-sm text-slate-600">
            <strong>Antes de enviar:</strong> revisá que los datos del
            destinatario estén actualizados (Mercado Libre puede cambiar de
            domicilio fiscal). Verificá en{" "}
            <a
              href="https://www.mercadolibre.com.ar/ayuda"
              className="text-blue-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              mercadolibre.com.ar/ayuda
            </a>
            .
          </p>
        </section>

        <section id="errores" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Errores comunes que invalidan tu reclamo
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-slate-700">
            <li>
              <strong>No documentar desde el inicio.</strong> Si no tenés
              capturas del anuncio original ni fotos del producto recibido, tu
              reclamo pierde fuerza probatoria.
            </li>
            <li>
              <strong>Dejar pasar los 30 días de Compra Protegida.</strong>{" "}
              Vencido ese plazo, ML ya no media. Tenés que ir directo a
              chargeback o COPREC.
            </li>
            <li>
              <strong>Aceptar voucher en lugar de devolución.</strong> Por ley
              te corresponde el reintegro al medio de pago original. El voucher
              es una concesión opcional.
            </li>
            <li>
              <strong>No abrir el reclamo dentro de la plataforma.</strong> Si
              vas directo a Defensa del Consumidor sin pasar por ML, te van a
              pedir que primero intentes la vía interna.
            </li>
            <li>
              <strong>
                Confundir reclamo de consumidor con denuncia penal.
              </strong>{" "}
              "Estafa" tiene un significado técnico-penal. Para reclamos
              comerciales, el camino es Ley 24.240, no Código Penal.
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
                href="/guias/carta-documento-consumidor-argentina"
                className="hover:underline"
              >
                → Cómo hacer una carta documento de consumidor en Argentina
              </Link>
            </li>
            <li>
              <Link
                href="/guias/cargos-no-reconocidos-tarjeta-credito"
                className="hover:underline"
              >
                → Cargos no reconocidos en tu tarjeta: cómo reclamar al banco
              </Link>
            </li>
            <li>
              <Link
                href="/guias/compre-online-no-llego"
                className="hover:underline"
              >
                → Compré online y no llegó: pasos legales (AR/MX)
              </Link>
            </li>
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="footer"
          source="guia-mercado-libre-footer"
          headline="JustIA está pronto"
          body="Reclamar a Mercado Libre debería tomar 5 minutos, no 5 semanas. Estamos construyendo el abogado de IA que hace todo este proceso por vos. Sumate a la lista de espera."
        />

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            <strong>Disclaimer legal:</strong> esta guía tiene fines
            informativos y no reemplaza el asesoramiento de un abogado
            matriculado. La Ley 24.240 y sus reglamentaciones pueden
            actualizarse. Verificá la información oficial en{" "}
            <a
              href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
              className="text-blue-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              argentina.gob.ar/produccion/defensadelconsumidor
            </a>
            .
          </p>
        </footer>
      </article>
    </>
  );
}
