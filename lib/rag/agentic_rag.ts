/**
 * Agentic RAG Controller (SOTA 2026).
 * 
 * Supports Query Decomposition and explicitly returns Citations 
 * alongside the retrieved context for auditable AI responses.
 */
import { VectorMemory, RetrievedDocument } from "./vector_store";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export class AgenticRAG {
  private memory: VectorMemory;

  constructor() {
    this.memory = new VectorMemory();
  }

  private async decomposeQuery(query: string): Promise<string[]> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: "You are an Elite Search Strategist. If the query requires multi-hop reasoning, break it down into exactly two distinct sub-queries separated by a newline. Otherwise, output the original query.",
        prompt: `User Query: ${query}`
      });
      return text.split("\n").filter(q => q.trim().length > 0);
    } catch {
      return [query]; // Fallback to single-hop if LLM fails
    }
  }

  async retrieveAndSynthesize(userQuery: string, documentIds: string[]): Promise<{ contextString: string, citations: any[] }> {
    const subQueries = await this.decomposeQuery(userQuery);
    
    // Parallel Retrieval
    const retrievalPromises = subQueries.map(sq => this.memory.semanticSearch(sq, documentIds));
    const allResultsArrays = await Promise.all(retrievalPromises);
    
    // Deduplicate and aggregate
    const uniqueDocs = new Map<string, RetrievedDocument>();
    allResultsArrays.flat().forEach(doc => {
      uniqueDocs.set(doc.text, doc); // Use text as unique key to prevent duplicate chunks
    });

    const finalDocs = Array.from(uniqueDocs.values());
    
    // Format for the LLM Prompt (Numbered Contexts)
    let contextString = "";
    const citations: { id: number; source: string }[] = [];
    
    finalDocs.forEach((doc, index) => {
      const citationId = index + 1;
      const source = doc.metadata.source || "Unknown Document";
      contextString += `[Citation ${citationId} | Source: ${source}]\n${doc.text}\n\n`;
      citations.push({ id: citationId, source });
    });

    return { contextString, citations };
  }
}
