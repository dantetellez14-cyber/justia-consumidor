import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Casos",
  description: "Historial y seguimiento de tus reclamos de consumo.",
};

export default function MisCasosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
