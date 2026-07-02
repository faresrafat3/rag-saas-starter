/**
 * Text Chunking Module
 * =============================================================================
 * Splits text into chunks suitable for RAG embeddings.
 *
 * Strategy (Session 5): sentence-based chunking with overlap.
 *
 * Why sentence-based (not fixed-size):
 * - Better for Arabic text (preserves meaning across sentence boundaries)
 * - More coherent chunks → better RAG retrieval
 * - Standard pattern in LangChain's RecursiveCharacterTextSplitter
 *
 * Attribution: This pattern is inspired by LangChain's text splitters (MIT).
 * Implementation is independent.
 */

export interface ChunkOptions {
  /** Maximum characters per chunk (default: 1000) */
  maxChunkSize?: number;
  /** Minimum characters per chunk — smaller chunks are merged (default: 100) */
  minChunkSize?: number;
  /** Overlap characters between adjacent chunks (default: 100) */
  overlap?: number;
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  maxChunkSize: 1000,
  minChunkSize: 100,
  overlap: 100,
};

/**
 * Arabic + English sentence terminators.
 * Includes: . ! ? Arabic full stop (۔) Arabic question mark (؟) Arabic semicolon (؛)
 */
const SENTENCE_TERMINATORS = /([.!?؟۔؛])\s+/g;

/**
 * Split text into sentences (preserving the terminator at the end of each sentence).
 */
function splitIntoSentences(text: string): string[] {
  if (!text || !text.trim()) return [];

  // Normalize whitespace
  const normalized = text.replace(/\s+/g, " ").trim();

  // Split on terminators, keeping the terminator at the end of each sentence
  const sentences: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  SENTENCE_TERMINATORS.lastIndex = 0;
  while ((match = SENTENCE_TERMINATORS.exec(normalized)) !== null) {
    const end = match.index + match[1].length;
    const sentence = normalized.slice(lastIndex, end).trim();
    if (sentence) sentences.push(sentence);
    lastIndex = end;
  }

  // Trailing text without terminator
  if (lastIndex < normalized.length) {
    const trailing = normalized.slice(lastIndex).trim();
    if (trailing) sentences.push(trailing);
  }

  return sentences;
}

/**
 * Chunk text into pieces suitable for embedding.
 *
 * Algorithm:
 * 1. Split text into sentences.
 * 2. Greedily accumulate sentences into chunks up to `maxChunkSize`.
 * 3. If a single sentence exceeds `maxChunkSize`, hard-split it.
 * 4. Add `overlap` characters from the previous chunk to the next (if any).
 *
 * @returns Array of chunks, each with an index.
 */
export function chunkText(
  text: string,
  options: ChunkOptions = {}
): { idx: number; text: string }[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { maxChunkSize, minChunkSize, overlap } = opts;

  if (!text || !text.trim()) return [];

  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) return [];

  const chunks: string[] = [];
  let current = "";

  const flush = (isFinal = false) => {
    const trimmed = current.trim();
    if (trimmed.length === 0) {
      current = "";
      return;
    }
    // Accept the chunk if:
    // - it meets minChunkSize, OR
    // - it's the final flush and there are no other chunks (don't lose data)
    if (
      trimmed.length >= minChunkSize ||
      (isFinal && chunks.length === 0)
    ) {
      chunks.push(trimmed);
    } else if (trimmed.length > 0 && chunks.length > 0) {
      // Merge tiny tail into previous chunk
      chunks[chunks.length - 1] += "\n" + trimmed;
    }
    current = "";
  };

  for (const sentence of sentences) {
    // If a single sentence exceeds maxChunkSize, hard-split it
    if (sentence.length > maxChunkSize) {
      flush();
      for (let i = 0; i < sentence.length; i += maxChunkSize) {
        chunks.push(sentence.slice(i, i + maxChunkSize).trim());
      }
      continue;
    }

    // If adding this sentence exceeds max, flush first
    if (current.length + sentence.length + 1 > maxChunkSize && current) {
      flush();

      // Start next chunk with overlap from previous (if any)
      if (overlap > 0 && chunks.length > 0) {
        const prev = chunks[chunks.length - 1];
        const overlapText = prev.slice(-overlap);
        current = overlapText + " " + sentence;
      } else {
        current = sentence;
      }
    } else {
      current = current ? current + " " + sentence : sentence;
    }
  }

  flush(true);

  return chunks.map((text, idx) => ({ idx, text }));
}

/**
 * Get statistics about a chunking result.
 * Useful for logging + debugging.
 */
export function getChunkStats(chunks: { idx: number; text: string }[]): {
  count: number;
  totalChars: number;
  minChars: number;
  maxChars: number;
  avgChars: number;
} {
  if (chunks.length === 0) {
    return { count: 0, totalChars: 0, minChars: 0, maxChars: 0, avgChars: 0 };
  }
  const sizes = chunks.map((c) => c.text.length);
  return {
    count: chunks.length,
    totalChars: sizes.reduce((a, b) => a + b, 0),
    minChars: Math.min(...sizes),
    maxChars: Math.max(...sizes),
    avgChars: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
  };
}
