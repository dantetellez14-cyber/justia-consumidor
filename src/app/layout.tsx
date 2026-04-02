import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JustIA Consumidor - ODR Predictor",
  description:
    "Plataforma de resolución inteligente de disputas de consumo con predicción de resultados mediante IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
