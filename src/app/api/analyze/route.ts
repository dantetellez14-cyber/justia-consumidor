import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError, createRouteLogger } from "@/lib/logger";
import { trackTokenUsage } from "@/lib/track-tokens";

const log = createRouteLogger("/api/analyze");

const SYSTEM_PROMPT = `Actúa como un experto legal en derecho del consumo de Argentina y México.
Analiza el relato del usuario y responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional.

El JSON debe tener exactamente estos campos:
{
  "empresa": "nombre de la empresa",
  "producto_servicio": "producto o servicio involucrado",
  "monto_reclamo": 10000,
  "fecha_incidente": "fecha aproximada",
  "core_grievance": "agravio principal resumido en una frase",
  "probabilidad_exito": 0.75,
  "analisis_legal": "análisis citando Ley 24.240 (Argentina) o LFPC (México)",
  "pais_detectado": "AR"
}

Reglas estrictas:
- Responde SOLO con el JSON, sin markdown, sin explicaciones, sin bloques de código.
- Detecta el país (AR o MX) según el contexto (moneda, empresa, ubicación). Si no puedes detectar, usa "AR".
- monto_reclamo debe ser un número positivo. Si el usuario no especifica monto, estima uno razonable.
- probabilidad_exito debe ser un número entre 0 y 1.
- analisis_legal debe citar artículos específicos de la Ley 24.240 (Argentina) o LFPC (México).
- pais_detectado debe ser exactamente "AR" o "MX".`;

function extractJSON(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text);
  } catch {
    // ignore
  }

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim());
  }

  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    return JSON.parse(braceMatch[0]);
  }

  throw new Error("No se pudo extraer JSON de la respuesta del modelo.");
}

export async function POST(request: NextRequest) {
  const { userId } = await auth().catch(() => ({ userId: null as string | null }));

  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`analyze:${ip}`, {
    limit: 10,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta de nuevo en ${resetIn} segundos.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const { analyzeSchema, formatZodError } = await import("@/lib/validations");
  const parsed = analyzeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const { relato } = parsed.data;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(generateDemoAnalysis(relato));
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    });

    const t0 = Date.now();
    const result = await model.generateContent(relato);
    const latencyMs = Date.now() - t0;
    const rawText = result.response.text();

    const usage = result.response.usageMetadata;
    void trackTokenUsage({
      userId: userId ?? null,
      route: "/api/analyze",
      model: "gemini-2.0-flash",
      provider: "gemini",
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
      latencyMs,
      success: true,
    });

    const analysis = extractJSON(rawText);

    const required = [
      "empresa",
      "producto_servicio",
      "monto_reclamo",
      "fecha_incidente",
      "core_grievance",
      "probabilidad_exito",
      "analisis_legal",
      "pais_detectado",
    ];
    for (const field of required) {
      if (!(field in analysis)) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    const pais = String(analysis.pais_detectado).toUpperCase();
    const normalizedAnalysis = {
      ...analysis,
      monto_reclamo: Number(analysis.monto_reclamo),
      probabilidad_exito: Math.min(1, Math.max(0, Number(analysis.probabilidad_exito))),
      pais_detectado: pais === "MX" ? "MX" : "AR",
    };

    log.info(
      { empresa: String(analysis.empresa), pais: normalizedAnalysis.pais_detectado, latencyMs },
      "Analysis completed"
    );

    return NextResponse.json(normalizedAnalysis);
  } catch (err) {
    logError("Gemini analysis error", err, { route: "/api/analyze" });
    return NextResponse.json(generateDemoAnalysis(relato));
  }
}

function generateDemoAnalysis(relato: string): Record<string, unknown> {
  const isMexico = /\b(MXN|pesos mexicanos|PROFECO|México|mexico|CDMX)\b/i.test(relato);
  const amountMatch = relato.match(/\$\s?([\d.,]+)/);
  const amount = amountMatch
    ? Number(amountMatch[1].replace(/[.,]/g, ""))
    : isMexico ? 15000 : 450000;

  const companyMatch = relato.match(/(?:empresa|tienda|marca|compañía)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+?)(?:\s+(?:pero|y|no|se|me|que|del|de|la|el|en|por|con|sin))/i);
  const empresa = companyMatch ? companyMatch[1].trim() : "Empresa no especificada";

  return {
    empresa,
    producto_servicio: "Producto/servicio según relato del consumidor",
    monto_reclamo: amount,
    fecha_incidente: "Fecha reciente",
    core_grievance: "Incumplimiento de garantía y/o negativa de reembolso",
    probabilidad_exito: 0.72,
    analisis_legal: isMexico
      ? "Conforme a la Ley Federal de Protección al Consumidor (LFPC), artículos 7, 32 y 92, el consumidor tiene derecho a la reparación, reposición o devolución del bien. La PROFECO puede intervenir como mediador. NOTA: Este es un análisis de demostración."
      : "Conforme a la Ley 24.240 de Defensa del Consumidor, artículos 10 bis, 11 y 17, el consumidor tiene derecho a la reparación, sustitución o devolución del producto. El plazo de garantía legal es de 6 meses. NOTA: Este es un análisis de demostración.",
    pais_detectado: isMexico ? "MX" : "AR",
  };
}
