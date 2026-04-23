import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { PostHogProvider } from "@/components/posthog-provider";
import { MswProvider } from "@/components/msw-provider";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://justia-consumidor.vercel.app"),
  title: {
    default: "JustIA Consumidor — Resolución Inteligente de Disputas",
    template: "%s | JustIA Consumidor",
  },
  description:
    "Plataforma ODR con IA para reclamos de consumo en Argentina y México. Analiza tu caso, genera reclamos formales y simula arbitraje — todo gratis.",
  keywords: [
    "reclamo consumidor",
    "defensa del consumidor",
    "ley 24240",
    "LFPC",
    "PROFECO",
    "arbitraje online",
    "ODR",
    "inteligencia artificial legal",
    "reclamo empresa",
  ],
  authors: [{ name: "JustIA Consumidor" }],
  // PWA manifest
  manifest: "/manifest.json",
  // Apple PWA meta
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JustIA",
    startupImage: [
      {
        url: "/icons/icon-512.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/icon-96.png",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "JustIA Consumidor",
    title: "JustIA Consumidor — Resolución Inteligente de Disputas",
    description:
      "Analizá tu reclamo con IA, generá documentos legales y simulá un arbitraje. Gratis para consumidores de Argentina y México.",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JustIA Consumidor — ODR con IA",
    description:
      "Plataforma gratuita de resolución de disputas de consumo con inteligencia artificial.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "application-name": "JustIA",
    "msapplication-TileColor": "#6366f1",
    "msapplication-TileImage": "/icons/icon-144.png",
    "msapplication-config": "none",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <body className="antialiased">
          <MswProvider />
          <PostHogProvider>{children}</PostHogProvider>
          <PwaRegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
