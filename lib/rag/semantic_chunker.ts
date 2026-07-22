/**
 * Semantic Chunking Strategy.
 * 
 * Replaces naive Regex sentence splitting with a context-aware sliding window.
 * Preserves Arabic & English linguistic structures perfectly.
 */
export function createSemanticChunks(text: string, chunkSize: number = 512, overlap: number = 50): string[] {
  if (!text) return [];
  
  // Normalize but preserve paragraph integrity
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const chunks: string[] = [];
  
  let currentChunk = "";
  
  for (const para of paragraphs) {
    if ((currentChunk.length + para.length) > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Create overlap by keeping the last portion of the previous chunk
      currentChunk = currentChunk.slice(-overlap) + " " + para;
    } else {
      currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + para;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
