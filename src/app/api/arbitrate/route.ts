import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError, createRouteLogger } from "@/lib/logger";
import { z } from "zod";

const log = createRouteLogger("/api/arbitrate");

const arbitrateSchema = z.object({
  analysis: z.object({
    empresa: z.string(),
    producto_servicio: z.string(),
    monto_reclamo: z.number(),
    core_grievance: z.string(),
    analisis_legal: z.string(),
    probabilidad_exito: z.number(),
    pais_detectado: z.enum(["AR", "MX"]),
    fecha_incidente: z.string(),
  }),
  companyResponse: z.string().min(1).max(5000),
  responseMode: z.enum(["custom", "no_response"]),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`arbitrate:${ip}`, {
    limit: 10,
    windowSeconds: 3600,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${Math.ceil(resetIn / 60)} minutos.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para usar esta función." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const parsed = arbitrateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { analysis, companyResponse, responseMode } = parsed.data;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Graceful fallback: return a static verdict if no API key configured
    return NextResponse.json(buildFallbackVerdict(analysis, companyResponse, responseMode));
  }

  const moneda = analysis.pais_detectado === "MX" ? "MXN" : "ARS";
  const ley =
    analysis.pais_detectado === "MX"
      ? "Ley Federal de Protección al Consumidor (LFPC)"
      : "Ley 24.240 de Defensa del Consumidor";

  const noResponseNote =
    responseMode === "no_response"
      ? "IMPORTANTE: La empresa NO respondió dentro del plazo legal de 10 días hábiles. Esto es en sí mismo una infracción y debe pesar fuertemente en el veredicto a favor del consumidor."
      : "";

  const prompt = `Eres un árbitro experto en derecho del consumidor de ${analysis.pais_detectado === "MX" ? "México" : "Argentina"}.

CASO:
- Empresa: ${analysis.empresa}
- Producto/servicio: ${analysis.producto_servicio}
- Monto reclamado: ${moneda} $${analysis.monto_reclamo.toLocaleString()}
- Agravio principal: ${analysis.core_grievance}
- Base legal: ${analysis.analisis_legal}
- Marco normativo: ${ley}

RESPUESTA DE LA EMPRESA:
${companyResponse}

${noResponseNote}

Analiza la respuesta de la empresa y emite un veredicto imparcial basado en:
1. El mérito legal del reclamo original
2. La postura y propuesta (si la hay) de la empresa
3. El marco normativo aplicable

Responde ÚNICAMENTE con un JSON con exactamente esta estructura:
{
  "resultado": "favorable" | "parcial" | "desfavorable" | "sin_respuesta",
  "titulo": "título breve del veredicto (máx 8 palabras)",
  "resumen": "resumen ejecutivo del veredicto en 2-3 oraciones",
  "puntos_fuertes": ["punto a favor del consumidor 1", "punto 2"],
  "puntos_debiles": ["punto débil del reclamo 1"],
  "recomendacion": "recomendación concreta de próximo paso",
  "probabilidad_exito_ajustada": 0.75,
  "escalar": true | false
}

Reglas:
- escalar=true si la empresa rechazó, no respondió, o su propuesta es claramente insuficiente
- probabilidad_exito_ajustada debe estar entre 0 y 1
- Sé objetivo y fundamenta en la ley, no en opiniones
- Responde SOLO el JSON, sin markdown ni texto adicional`;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    let verdict: Record<string, unknown>;
    try {
      verdict = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No se pudo extraer JSON del veredicto.");
      verdict = JSON.parse(match[0]);
    }

    log.info(
      { empresa: analysis.empresa, resultado: verdict.resultado },
      "Arbitration verdict generated"
    );

    return NextResponse.json({ ...verdict, source: "gemini" });
  } catch (err) {
    logError("Gemini arbitration error", err, { route: "/api/arbitrate" });
    // Fallback to static verdict on API error
    return NextResponse.json(buildFallbackVerdict(analysis, companyResponse, responseMode));
  }
}

function buildFallbackVerdict(
  analysis: { empresa: string; core_grievance: string; probabilidad_exito: number; pais_detectado: "AR" | "MX" },
  companyResponse: string,
  responseMode: "custom" | "no_response"
): Record<string, unknown> {
  if (responseMode === "no_response") {
    return {
      resultado: "sin_respuesta",
      titulo: "Empresa no respondió en el plazo legal",
      resumen: `${analysis.empresa} no respondió dentro de los 10 días hábiles estipulados por ley, lo que constituye en sí mismo una infracción. Se recomienda escalar el caso.`,
      puntos_fuertes: [
        "La falta de respuesta es una infracción legal documentable",
        "Fortalece la posición del consumidor ante organismos reguladores",
      ],
      puntos_debiles: [],
      recomendacion: "Escalar inmediatamente a PROFECO o Defensa del Consumidor con constancia del envío.",
      probabilidad_exito_ajustada: Math.min(1, analysis.probabilidad_exito + 0.1),
      escalar: true,
      source: "fallback",
    };
  }

  const lower = companyResponse.toLowerCase();
  const isRefusal = /rechazo|rechazamos|no procede|no corresponde|no ha lugar/i.test(lower);
  const hasOffer = /ofrecemos|proponemos|reembolso|acreditamos|devolución/i.test(lower);

  if (isRefusal) {
    return {
      resultado: "desfavorable",
      titulo: "Empresa rechazó el reclamo",
      resumen: `${analysis.empresa} rechazó el reclamo. Sin embargo, esto no es el fin del proceso: podés escalar ante el organismo regulador de tu país.`,
      puntos_fuertes: ["Tenés documentación del rechazo, útil para escalar"],
      puntos_debiles: ["La empresa no reconoce el incumplimiento"],
      recomendacion: "Escalar a PROFECO o Defensa del Consumidor adjuntando el rechazo de la empresa.",
      probabilidad_exito_ajustada: analysis.probabilidad_exito * 0.85,
      escalar: true,
      source: "fallback",
    };
  }

  if (hasOffer) {
    return {
      resultado: "parcial",
      titulo: "Empresa realizó una propuesta",
      resumen: `${analysis.empresa} realizó una propuesta de resolución. Evaluá si cubre el monto total reclamado y los perjuicios sufridos antes de aceptar.`,
      puntos_fuertes: ["La empresa reconoce el problema", "Hay voluntad de resolución"],
      puntos_debiles: ["La propuesta podría ser inferior al monto reclamado"],
      recomendacion: "Comparar la propuesta con el monto original. Si es insuficiente, contraofertar o escalar.",
      probabilidad_exito_ajustada: analysis.probabilidad_exito,
      escalar: false,
      source: "fallback",
    };
  }

  return {
    resultado: "parcial",
    titulo: "Respuesta recibida — análisis en proceso",
    resumen: `${analysis.empresa} respondió tu reclamo. La respuesta no es concluyente y requiere tu evaluación para determinar si es satisfactoria.`,
    puntos_fuertes: ["La empresa respondió dentro del plazo"],
    puntos_debiles: ["La postura no es clara"],
    recomendacion: "Solicitá una aclaración por escrito con una propuesta concreta y plazo de resolución.",
    probabilidad_exito_ajustada: analysis.probabilidad_exito,
    escalar: false,
    source: "fallback",
  };
}
