import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, guidesByCountry } from "@/lib/guides-catalog";
import { GuideWaitlistCTA } from "@/components/guide-waitlist-cta";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://justia.app";
const PAGE_URL = `${SITE_URL}/guias`;

export const metadata: Metadata = {
  title:
    "Guías para reclamar a empresas en Argentina y México | JustIA",
  description:
    "Guías paso a paso para reclamar a empresas en Argentina y México: telecomunicaciones, e-commerce, energía y más. Modelos de carta documento legales y gratuitos.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Guías para reclamar a empresas (AR + MX) | JustIA",
    description:
      "Defensa del consumidor sin abogado. Guías legales paso a paso para Telcel, CFE, Mercado Libre, Movistar, Claro, Personal y más.",
    type: "website",
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

const argentinaGuides = guidesByCountry("AR");
const mexicoGuides = guidesByCountry("MX");

const collectionPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Guías para reclamar a empresas en Argentina y México",
  description:
    "Catálogo de guías legales paso a paso para reclamos de consumidor en LATAM.",
  url: PAGE_URL,
  hasPart: GUIDES.map((g) => ({
    "@type": "Article",
    headline: g.title,
    url: `${SITE_URL}/guias/${g.slug}`,
    datePublished: g.publishedAt,
    dateModified: g.updatedAt,
  })),
};

export default function GuiasIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd),
        }}
      />
      <main className="mx-auto max-w-4xl px-6 py-12 text-slate-900">
        <header className="mb-12">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Guías para reclamar a empresas
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Cómo defender tus derechos como consumidor en Argentina y México.
            Sin abogado. Sin filas. Con modelos de carta legales gratis.
          </p>
        </header>

        <section className="mb-14">
          <div className="mb-6 flex items-baseline gap-3">
            <h2 className="text-2xl font-bold text-slate-900">
              🇦🇷 Argentina
            </h2>
            <p className="text-sm text-slate-500">
              {argentinaGuides.length} guías
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {argentinaGuides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guias/${guide.slug}`}
                  className="block h-full rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                    {guide.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    {guide.shortTitle}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{guide.summary}</p>
                  <p className="mt-3 text-sm font-semibold text-blue-700">
                    Leer guía →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-14">
          <div className="mb-6 flex items-baseline gap-3">
            <h2 className="text-2xl font-bold text-slate-900">🇲🇽 México</h2>
            <p className="text-sm text-slate-500">
              {mexicoGuides.length} guías
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {mexicoGuides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guias/${guide.slug}`}
                  className="block h-full rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                    {guide.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    {guide.shortTitle}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{guide.summary}</p>
                  <p className="mt-3 text-sm font-semibold text-blue-700">
                    Leer guía →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <GuideWaitlistCTA
          variant="footer"
          source="guias-index"
          headline="JustIA está pronto"
          body="¿Querés que todo este proceso lo haga una IA en 5 minutos? Sumate a la lista de espera para ser de los primeros en usar JustIA cuando lance en Argentina y México."
        />

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            <strong>Disclaimer legal:</strong> estas guías tienen fines
            informativos y no reemplazan el asesoramiento de un abogado
            matriculado. Las leyes y reglamentaciones pueden actualizarse;
            verificá la información oficial en los organismos correspondientes
            (PROFECO, Defensa del Consumidor, ENACOM, IFT, CRE).
          </p>
        </footer>
      </main>
    </>
  );
}
