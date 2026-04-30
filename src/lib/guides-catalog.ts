/**
 * Central catalog of evergreen SEO guides.
 * Single source of truth for /guias/page.tsx, sitemap.ts, and internal links.
 *
 * Adding a guide:
 * 1) Create the page at src/app/guias/<slug>/page.tsx
 * 2) Append a new entry to GUIDES with slug, title, country, summary, etc.
 * 3) Sitemap and index page pick it up automatically.
 */

export type GuideCountry = "AR" | "MX";

export interface GuideEntry {
  slug: string;
  title: string;
  shortTitle: string;
  country: GuideCountry;
  category: string;
  company?: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  searchVolumeEstimate?: string;
}

export const GUIDES: GuideEntry[] = [
  {
    slug: "como-reclamar-mercado-libre-argentina",
    title: "Cómo reclamar a Mercado Libre paso a paso (Argentina)",
    shortTitle: "Mercado Libre",
    country: "AR",
    category: "E-commerce",
    company: "Mercado Libre",
    summary:
      "5 caminos legales: reclamo interno, mediación ML, chargeback, COPREC, carta documento. Modelo de carta gratis.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~12.000/mes",
  },
  {
    slug: "como-reclamar-cfe-mexico",
    title: "Cómo reclamar a CFE: cobros indebidos y errores de medición",
    shortTitle: "CFE",
    country: "MX",
    category: "Energía",
    company: "CFE",
    summary:
      "Aclaración con CFE, queja en PROFECO, denuncia ante CRE, amparo. Para la empresa #1 con más quejas en PROFECO.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~18.000/mes",
  },
  {
    slug: "como-reclamar-telcel-mexico",
    title: "Cómo reclamar a Telcel: cobros, portabilidad y baja",
    shortTitle: "Telcel",
    country: "MX",
    category: "Telecomunicaciones",
    company: "Telcel",
    summary:
      "Atención Telcel + Soy Usuario IFT + PROFECO + carta documento. Cobros indebidos, portabilidad, baja.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~8.000/mes",
  },
  {
    slug: "como-reclamar-att-mexico",
    title: "Cómo reclamar a AT&T México: cobros, portabilidad y baja",
    shortTitle: "AT&T",
    country: "MX",
    category: "Telecomunicaciones",
    company: "AT&T",
    summary:
      "IFT + PROFECO + carta documento. Modelo legal gratis para resolver cobros, portabilidad o baja.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~4.000/mes",
  },
  {
    slug: "como-reclamar-movistar-mexico",
    title: "Cómo reclamar a Movistar México",
    shortTitle: "Movistar",
    country: "MX",
    category: "Telecomunicaciones",
    company: "Movistar",
    summary:
      "Atención Movistar + Soy Usuario IFT + PROFECO + carta documento. Modelo gratis.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~3.500/mes",
  },
  {
    slug: "como-reclamar-telecom-personal-argentina",
    title: "Cómo reclamar a Telecom/Personal: factura, baja y portabilidad",
    shortTitle: "Telecom / Personal",
    country: "AR",
    category: "Telecomunicaciones",
    company: "Telecom / Personal",
    summary:
      "ENACOM + COPREC + carta documento. Botón de baja Ley 27.250. Modelo legal gratis.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~5.000/mes",
  },
  {
    slug: "como-reclamar-movistar-argentina",
    title: "Cómo reclamar a Movistar Argentina",
    shortTitle: "Movistar",
    country: "AR",
    category: "Telecomunicaciones",
    company: "Movistar",
    summary:
      "ENACOM + COPREC + carta documento. Botón de baja, portabilidad, factura disputada.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~4.500/mes",
  },
  {
    slug: "como-reclamar-claro-argentina",
    title: "Cómo reclamar a Claro Argentina",
    shortTitle: "Claro",
    country: "AR",
    category: "Telecomunicaciones",
    company: "Claro",
    summary:
      "ENACOM + COPREC + carta documento. Modelo legal gratis para baja, portabilidad o factura.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~3.500/mes",
  },
  {
    slug: "como-reclamar-telecentro-argentina",
    title: "Cómo reclamar a Telecentro: factura, baja y servicio",
    shortTitle: "Telecentro",
    country: "AR",
    category: "Telecomunicaciones",
    company: "Telecentro",
    summary:
      "ENACOM + COPREC + carta documento. Botón de baja, factura, internet caído.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~5.500/mes",
  },
  {
    slug: "como-reclamar-mercado-pago-argentina",
    title: "Cómo reclamar a Mercado Pago Argentina: cargos, cuenta bloqueada y fraude",
    shortTitle: "Mercado Pago",
    country: "AR",
    category: "Fintech",
    company: "Mercado Pago",
    summary:
      "Cargo no autorizado, cuenta bloqueada o fraude: reclamo interno, contracargo bancario, BCRA y COPREC. Modelo de carta gratis.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~9.000/mes",
  },
  {
    slug: "como-reclamar-walmart-mexico",
    title: "Cómo reclamar a Walmart México: devoluciones, garantías y cobros",
    shortTitle: "Walmart",
    country: "MX",
    category: "Retail",
    company: "Walmart",
    summary:
      "Devolución rechazada, garantía negada o cobro de más: reclamo en tienda, contracargo, PROFECO y carta documento. Aplica a Bodega Aurrerá y Sam's Club.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~7.000/mes",
  },
  {
    slug: "como-reclamar-aerolineas-argentinas",
    title: "Cómo reclamar a Aerolíneas Argentinas: cancelaciones, demoras y equipaje",
    shortTitle: "Aerolíneas Argentinas",
    country: "AR",
    category: "Transporte aéreo",
    company: "Aerolíneas Argentinas",
    summary:
      "Vuelo cancelado, demora o equipaje perdido: derechos, ANAC, COPREC y modelo de carta. Aplica a Flybondi, LATAM y otras aerolíneas en Argentina.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~6.500/mes",
  },
  {
    slug: "como-reclamar-aeromexico-mexico",
    title: "Cómo reclamar a Aeroméxico y Volaris: cancelaciones, demoras y equipaje",
    shortTitle: "Aeroméxico / Volaris",
    country: "MX",
    category: "Transporte aéreo",
    company: "Aeroméxico / Volaris",
    summary:
      "Vuelo cancelado, demora u overbooking: derechos (art. 62 bis Ley Aviación Civil), AFAC, PROFECO y modelo de carta. Aplica a Viva Aerobús.",
    publishedAt: "2026-04-30",
    updatedAt: "2026-04-30",
    searchVolumeEstimate: "~8.000/mes",
  },
];

export function guidesByCountry(country: GuideCountry): GuideEntry[] {
  return GUIDES.filter((g) => g.country === country);
}

export function guidesByCategory(category: string): GuideEntry[] {
  return GUIDES.filter((g) => g.category === category);
}
