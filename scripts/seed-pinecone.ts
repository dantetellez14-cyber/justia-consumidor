/**
 * Seed script: upserts jurisprudencia cases into Pinecone.
 *
 * Usage:
 *   npx tsx scripts/seed-pinecone.ts
 *
 * Requires env vars: PINECONE_API_KEY, PINECONE_INDEX_NAME (optional, defaults to "justia-jurisprudencia")
 */

import { Pinecone } from "@pinecone-database/pinecone";

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "justia-jurisprudencia";
const EMBEDDING_MODEL = "multilingual-e5-large";
const EMBEDDING_DIM = 1024;

interface JurisprudenciaCase {
  expediente_id: string;
  hechos: string;
  ratio_decidendi: string;
  probabilidad_exito: number;
  duracion_dias: number;
  pais: "AR" | "MX";
}

const jurisprudencia: ReadonlyArray<JurisprudenciaCase> = [
  {
    expediente_id: "CNACom Sala A - 2023/04521",
    hechos: "Consumidor adquirió electrodoméstico con defecto de fábrica. La empresa se negó a reparar dentro del plazo de garantía legal.",
    ratio_decidendi: "Se aplicó el art. 17 de la Ley 24.240: el consumidor tiene derecho a la reparación, sustitución o devolución del precio pagado.",
    probabilidad_exito: 0.87,
    duracion_dias: 120,
    pais: "AR",
  },
  {
    expediente_id: "CNCiv Sala F - 2022/11234",
    hechos: "Compra online de producto que nunca fue entregado. Empresa no reembolsó ni respondió reclamos.",
    ratio_decidendi: "Incumplimiento contractual agravado por conducta dilatoria. Daño moral procedente conforme art. 40 bis Ley 24.240.",
    probabilidad_exito: 0.92,
    duracion_dias: 90,
    pais: "AR",
  },
  {
    expediente_id: "JNac1raInstCom N45 - 2023/07891",
    hechos: "Servicio de telecomunicaciones facturó importes superiores al plan contratado durante 6 meses.",
    ratio_decidendi: "Violación del deber de información (art. 4, Ley 24.240) y trato digno (art. 8 bis). Procedió restitución y daño punitivo.",
    probabilidad_exito: 0.78,
    duracion_dias: 180,
    pais: "AR",
  },
  {
    expediente_id: "CNACom Sala D - 2024/00234",
    hechos: "Vehículo nuevo con fallas mecánicas reiteradas. Concesionaria realizó múltiples reparaciones sin éxito.",
    ratio_decidendi: "Aplicación del art. 17 Ley 24.240: tras reparación insatisfactoria, procede sustitución del bien o devolución del importe.",
    probabilidad_exito: 0.83,
    duracion_dias: 240,
    pais: "AR",
  },
  {
    expediente_id: "CNCiv Sala K - 2023/15678",
    hechos: "Entidad bancaria cobró comisiones no informadas en cuenta de ahorro del consumidor.",
    ratio_decidendi: "Violación del deber de información y buena fe contractual. Restitución de comisiones más intereses conforme arts. 4 y 37 Ley 24.240.",
    probabilidad_exito: 0.75,
    duracion_dias: 150,
    pais: "AR",
  },
  {
    expediente_id: "PROFECO/CDMX/2023/C-4521",
    hechos: "Compra de vehículo con vicios ocultos. Agencia se negó a hacer válida la garantía.",
    ratio_decidendi: "Conforme art. 92 LFPC, el consumidor tiene derecho a la bonificación o compensación no menor al 20% del precio pagado.",
    probabilidad_exito: 0.85,
    duracion_dias: 60,
    pais: "MX",
  },
  {
    expediente_id: "PROFECO/JAL/2022/C-8901",
    hechos: "Aerolínea canceló vuelo sin previo aviso ni ofrecimiento de alternativas al pasajero.",
    ratio_decidendi: "Violación del art. 52 de la Ley de Aviación Civil y arts. 7 y 92 bis LFPC. Procedió indemnización por daños.",
    probabilidad_exito: 0.9,
    duracion_dias: 45,
    pais: "MX",
  },
  {
    expediente_id: "PROFECO/NL/2023/C-2345",
    hechos: "Empresa de telecomunicaciones incrementó tarifa mensual sin notificación previa al usuario.",
    ratio_decidendi: "Incumplimiento del art. 7 LFPC sobre información clara y veraz. Se ordenó restitución de diferencias cobradas.",
    probabilidad_exito: 0.8,
    duracion_dias: 75,
    pais: "MX",
  },
  {
    expediente_id: "PROFECO/CDMX/2024/C-0567",
    hechos: "Plataforma de e-commerce entregó producto diferente al anunciado sin ofrecer cambio ni devolución.",
    ratio_decidendi: "Publicidad engañosa conforme art. 32 LFPC. Se ordenó devolución del precio y bonificación del 20%.",
    probabilidad_exito: 0.88,
    duracion_dias: 30,
    pais: "MX",
  },
  {
    expediente_id: "PROFECO/QRO/2023/C-6789",
    hechos: "Gimnasio retuvo pagos anticipados tras cierre temporal y se negó a reembolsar al consumidor.",
    ratio_decidendi: "Aplicación del art. 92 LFPC: ante incumplimiento del proveedor, procede devolución íntegra más compensación.",
    probabilidad_exito: 0.82,
    duracion_dias: 50,
    pais: "MX",
  },
];

async function main() {
  if (!process.env.PINECONE_API_KEY) {
    console.error("Error: PINECONE_API_KEY is required");
    process.exit(1);
  }

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

  // Check if index exists, create if not
  const existingIndexes = await pc.listIndexes();
  const indexNames = existingIndexes.indexes?.map((i) => i.name) ?? [];

  if (!indexNames.includes(PINECONE_INDEX_NAME)) {
    console.log(`Creating index "${PINECONE_INDEX_NAME}" (dim=${EMBEDDING_DIM})...`);
    await pc.createIndex({
      name: PINECONE_INDEX_NAME,
      dimension: EMBEDDING_DIM,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    // Wait for index to be ready
    console.log("Waiting for index to be ready...");
    await new Promise((resolve) => setTimeout(resolve, 15000));
  } else {
    console.log(`Index "${PINECONE_INDEX_NAME}" already exists.`);
  }

  // Generate embeddings
  console.log("Generating embeddings for jurisprudencia cases...");
  const texts = jurisprudencia.map(
    (c) => `${c.hechos} ${c.ratio_decidendi}`
  );

  const embedResponse = await pc.inference.embed({
    model: EMBEDDING_MODEL,
    inputs: texts,
    parameters: { inputType: "passage" },
  });

  // Upsert to index
  const index = pc.index(PINECONE_INDEX_NAME);

  const vectors = jurisprudencia.map((c, i) => {
    const embedding = embedResponse.data[i];
    if (embedding.vectorType !== "dense") {
      throw new Error(`Unexpected vector type: ${embedding.vectorType}`);
    }
    return {
    id: c.expediente_id.replace(/[^a-zA-Z0-9_-]/g, "_"),
    values: embedding.values,
    metadata: {
      expediente_id: c.expediente_id,
      hechos: c.hechos,
      ratio_decidendi: c.ratio_decidendi,
      probabilidad_exito: c.probabilidad_exito,
      duracion_dias: c.duracion_dias,
      pais: c.pais,
    },
  };
  });

  console.log(`Upserting ${vectors.length} vectors...`);
  await index.upsert({ records: vectors });

  console.log("Done! Jurisprudencia seeded to Pinecone.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
