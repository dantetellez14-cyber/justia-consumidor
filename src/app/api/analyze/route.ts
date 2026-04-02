import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma2:9b";

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
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // ignore
  }

  // Try extracting from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim());
  }

  // Try finding first { ... } block
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    return JSON.parse(braceMatch[0]);
  }

  throw new Error("No se pudo extraer JSON de la respuesta del modelo.");
}

export async function POST(request: NextRequest) {
  const { relato } = await request.json();

  if (!relato || typeof relato !== "string" || relato.trim().length === 0) {
    return NextResponse.json(
      { error: "El relato del caso es requerido." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: relato },
        ],
        stream: false,
        format: "json",
        options: {
          temperature: 0.3,
          num_predict: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const rawText: string = result.message?.content ?? "";
    const analysis = extractJSON(rawText);

    // Validate required fields
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

    // Normalize pais_detectado
    const pais = String(analysis.pais_detectado).toUpperCase();
    const normalizedAnalysis = {
      ...analysis,
      monto_reclamo: Number(analysis.monto_reclamo),
      probabilidad_exito: Math.min(
        1,
        Math.max(0, Number(analysis.probabilidad_exito))
      ),
      pais_detectado: pais === "MX" ? "MX" : "AR",
    };

    return NextResponse.json(normalizedAnalysis);
  } catch (err) {
    console.error("Ollama API error:", err);

    // Fallback: generate a demo analysis when Ollama is unavailable (e.g., Vercel production)
    if (process.env.DEMO_MODE === "true" || (err instanceof TypeError && String(err.message).includes("fetch"))) {
      return NextResponse.json(generateDemoAnalysis(relato));
    }

    const message =
      err instanceof Error ? err.message : "Error al analizar el caso con IA.";
    return NextResponse.json({ error: message }, { status: 500 });
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
