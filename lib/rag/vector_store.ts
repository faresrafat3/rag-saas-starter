/**
 * SOTA Semantic Vector Store Adapter (Agentic RAG Ready).
 * 
 * Implements the Adapter Pattern to solve the Serverless Trap:
 * - In Development: Uses local ChromaDB (free, zero-latency).
 * - In Production (Vercel): Uses Pinecone Serverless (stateless, highly scalable).
 */
import { ChromaClient } from "chromadb";
import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

// Singleton Embedder
class Embedder {
  static instance: FeatureExtractionPipeline | null = null;
  static async getInstance() {
    if (!this.instance) {
      this.instance = await pipeline("feature-extraction", "Xenova/bge-m3");
    }
    return this.instance;
  }
}

export interface RetrievedDocument {
  text: string;
  metadata: Record<string, any>;
}

export class VectorMemory {
  private isProduction = process.env.NODE_ENV === "production";
  private chromaClient?: ChromaClient;
  private pineconeClient?: Pinecone;
  private indexName = "saas-rag-documents";

  constructor() {
    if (this.isProduction) {
      if (!process.env.PINECONE_API_KEY) throw new Error("PINECONE_API_KEY required in production.");
      this.pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    } else {
      // Local fallbacks
      this.chromaClient = new ChromaClient({ path: "http://localhost:8000" });
    }
  }

  async embedText(text: string): Promise<number[]> {
    const embedder = await Embedder.getInstance();
    const output = await embedder(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }

  async ingestChunks(documentId: string, chunks: string[], sourceName: string) {
    const embeddings = await Promise.all(chunks.map(c => this.embedText(c)));
    
    if (this.isProduction && this.pineconeClient) {
      const index = this.pineconeClient.Index(this.indexName);
      const records = chunks.map((chunk, i) => ({
        id: `${documentId}_${i}`,
        values: embeddings[i],
        metadata: { text: chunk, documentId, source: sourceName }
      }));
      await index.upsert(records);
    } else if (this.chromaClient) {
      const collection = await this.chromaClient.getOrCreateCollection({ name: this.indexName });
      await collection.add({
        ids: chunks.map((_, i) => `${documentId}_${i}`),
        embeddings,
        metadatas: chunks.map(() => ({ documentId, source: sourceName })),
        documents: chunks
      });
    }
  }

  async semanticSearch(query: string, documentIds: string[], topK: number = 3): Promise<RetrievedDocument[]> {
    const queryEmbedding = await this.embedText(query);

    if (this.isProduction && this.pineconeClient) {
      const index = this.pineconeClient.Index(this.indexName);
      const results = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter: { documentId: { "$in": documentIds } }
      });
      return results.matches.map(m => ({
        text: m.metadata?.text as string,
        metadata: { source: m.metadata?.source }
      }));
    } else if (this.chromaClient) {
      const collection = await this.chromaClient.getOrCreateCollection({ name: this.indexName });
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        where: { documentId: { "$in": documentIds } }
      });
      
      const docs: RetrievedDocument[] = [];
      if (results.documents[0] && results.metadatas[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          docs.push({
            text: results.documents[0][i] as string,
            metadata: results.metadatas[0][i] || {}
          });
        }
      }
      return docs;
    }
    return [];
  }
}
