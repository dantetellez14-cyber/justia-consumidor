import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://justia-consumidor.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/privacidad",
          "/terminos",
          "/empresa",
          "/empresas",
          "/proximamente",
          "/guias",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/mis-casos/",
          "/notificaciones/",
          "/sign-in/",
          "/sign-up/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
