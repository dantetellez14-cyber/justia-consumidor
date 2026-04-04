import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

export function getPinecone(): Pinecone {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY no está configurada.");
    }
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
}

export const PINECONE_INDEX_NAME =
  process.env.PINECONE_INDEX_NAME || "justia-jurisprudencia";
