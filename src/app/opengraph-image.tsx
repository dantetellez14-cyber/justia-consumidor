import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "JustIA Consumidor — Resolución Inteligente de Disputas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 20px 60px rgba(99,102,241,0.4)",
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3L4 7v5c0 4.4 3.4 8.6 8 9.9C16.6 20.6 20 16.4 20 12V7L12 3z" />
            <path d="M8 12l2.5 2.5L16 9" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-1px",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          JustIA Consumidor
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#a5b4fc",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
            marginBottom: 48,
          }}
        >
          Resolución Inteligente de Disputas de Consumo
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["⚖️ Argentina", "🇲🇽 México", "🤖 IA Legal", "✉️ Reclamos formales"].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: "rgba(99,102,241,0.25)",
                  border: "1px solid rgba(165,180,252,0.3)",
                  borderRadius: 100,
                  padding: "10px 20px",
                  color: "#c7d2fe",
                  fontSize: 18,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            color: "rgba(165,180,252,0.6)",
            fontSize: 18,
          }}
        >
          justia-consumidor.com
        </div>
      </div>
    ),
    { ...size }
  );
}
