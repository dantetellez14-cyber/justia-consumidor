import type { Metadata } from "next";
import { ProximamenteHero } from "@/components/proximamente-hero";

export const metadata: Metadata = {
  title: "JustIA — Próximamente. Reclamos de consumidor con IA.",
  description:
    "Generá tu reclamo formal de consumidor en 5 minutos con IA. Sin abogado. Sin filas. Pronto en Argentina y México. Sumate a la lista de espera.",
  openGraph: {
    title: "JustIA — Próximamente",
    description:
      "El abogado de IA que pelea tus reclamos. Gratis. Pronto en AR y MX.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProximamentePage() {
  return <ProximamenteHero />;
}
