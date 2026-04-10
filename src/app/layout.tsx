import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { PostHogProvider } from "@/components/posthog-provider";
import { MswProvider } from "@/components/msw-provider";
import "./globals.css";

export const metadata: Metadata = {
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
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "JustIA Consumidor",
    title: "JustIA Consumidor — Resolución Inteligente de Disputas",
    description:
      "Analizá tu reclamo con IA, generá documentos legales y simulá un arbitraje. Gratis para consumidores de Argentina y México.",
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
        </body>
      </html>
    </ClerkProvider>
  );
}
