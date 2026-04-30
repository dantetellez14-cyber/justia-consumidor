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

  const REQUIRED_FIELDS = [
    "empresa",
    "producto_servicio",
    "monto_reclamo",
    "fecha_incidente",
    "core_grievance",
    "probabilidad_exito",
    "analisis_legal",
    "pais_detectado",
  ];

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!geminiKey && !anthropicKey) {
    return NextResponse.json(
      { error: "Nuestros servidores están procesando un alto volumen de reclamos en este momento. Tu caso es muy importante para nosotros, por favor intenta enviarlo nuevamente en un par de minutos." },
      { status: 503 }
    );
  }

  async function tryGemini(): Promise<{ analysis: Record<string, unknown>; latencyMs: number; usage: { input: number; output: number } }> {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genai = new GoogleGenerativeAI(geminiKey!);
    const model = genai.getGenerativeModel({
      model: "gemini-2.5-flash",
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

    return {
      analysis: extractJSON(rawText),
      latencyMs,
      usage: { input: usage?.promptTokenCount ?? 0, output: usage?.candidatesTokenCount ?? 0 },
    };
  }

  async function tryAnthropic(): Promise<{ analysis: Record<string, unknown>; latencyMs: number; usage: { input: number; output: number } }> {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: anthropicKey! });

    const t0 = Date.now();
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: relato }],
    });
    const latencyMs = Date.now() - t0;

    const block = message.content.find((c) => c.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("Respuesta de Anthropic sin contenido de texto.");
    }

    return {
      analysis: extractJSON(block.text),
      latencyMs,
      usage: { input: message.usage.input_tokens, output: message.usage.output_tokens },
    };
  }

  type Provider = { name: "gemini" | "anthropic"; model: string; run: typeof tryGemini };
  const providers: Provider[] = [];
  if (geminiKey) providers.push({ name: "gemini", model: "gemini-2.5-flash", run: tryGemini });
  if (anthropicKey) providers.push({ name: "anthropic", model: "claude-haiku-4-5-20251001", run: tryAnthropic });

  let lastError: unknown = null;

  for (const provider of providers) {
    try {
      const { analysis, latencyMs, usage } = await provider.run();

      for (const field of REQUIRED_FIELDS) {
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

      void trackTokenUsage({
        userId: userId ?? null,
        route: "/api/analyze",
        model: provider.model,
        provider: provider.name,
        inputTokens: usage.input,
        outputTokens: usage.output,
        latencyMs,
        success: true,
      });

      log.info(
        { provider: provider.name, empresa: String(analysis.empresa), pais: normalizedAnalysis.pais_detectado, latencyMs },
        "Analysis completed"
      );

      return NextResponse.json(normalizedAnalysis);
    } catch (err) {
      lastError = err;
      logError(`${provider.name} analysis failed, trying next provider`, err, {
        route: "/api/analyze",
        provider: provider.name,
      });
    }
  }

  logError("All providers failed for /api/analyze", lastError, { route: "/api/analyze" });
  return NextResponse.json(
    {
      error: "Nuestros servidores están procesando un alto volumen de reclamos en este momento. Tu caso es muy importante para nosotros, por favor intenta enviarlo nuevamente en un par de minutos.",
    },
    { status: 503 }
  );
}
