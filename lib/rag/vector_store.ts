/**
 * SOTA Semantic Vector Store (Agentic RAG Ready).
 * 
 * Replaces legacy TF-IDF with ChromaDB and Transformers.js for true 
 * deep semantic retrieval. Runs 100% locally and free, while achieving 
 * OpenAI-level embedding quality.
 */
import { ChromaClient } from "chromadb";
import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

// Singleton pattern for the embedding pipeline to prevent memory leaks
class Embedder {
  static instance: FeatureExtractionPipeline | null = null;

  static async getInstance() {
    if (!this.instance) {
      // Using a multilingual model to support native Arabic and English Semantic Search
      this.instance = await pipeline("feature-extraction", "Xenova/bge-m3");
    }
    return this.instance;
  }
}

export class VectorMemory {
  private client: ChromaClient;
  private collectionName = "saas_rag_documents";

  constructor() {
    // Connect to local persistent ChromaDB
    this.client = new ChromaClient({ path: "http://localhost:8000" });
  }

  async getCollection() {
    return await this.client.getOrCreateCollection({ name: this.collectionName });
  }

  async embedText(text: string): Promise<number[]> {
    const embedder = await Embedder.getInstance();
    const output = await embedder(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }

  async ingestChunks(documentId: string, chunks: string[]) {
    const collection = await this.getCollection();
    
    // Parallel embedding for high-speed SaaS ingestion
    const embeddings = await Promise.all(chunks.map(chunk => this.embedText(chunk)));
    
    const ids = chunks.map((_, i) => `${documentId}_chunk_${i}`);
    const metadatas = chunks.map((_, i) => ({ documentId, chunkIndex: i }));

    await collection.add({
      ids,
      embeddings,
      metadatas,
      documents: chunks
    });
  }

  async semanticSearch(query: string, documentIds: string[], topK: int = 5) {
    const collection = await this.getCollection();
    const queryEmbedding = await this.embedText(query);

    // Context-bound retrieval (Only search inside the user's selected documents)
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
      where: { documentId: { "$in": documentIds } }
    });

    return results.documents[0] || [];
  }
}
