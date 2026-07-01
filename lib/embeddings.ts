/**
 * TF-IDF Embeddings Module (Local, Zero-Dependency)
 * =============================================================================
 * Provides local TF-IDF vector embeddings for RAG retrieval.
 *
 * Why TF-IDF (not OpenAI/transformers)?
 * - Zero-cost: no API key, no GPU, no 100MB downloads
 * - Works offline
 * - Sufficient quality for demo / starter projects
 * - Easy to swap out for a real embedding model later (see `embed()` abstraction)
 *
 * Algorithm:
 * - Tokenize: lowercase, split on non-word chars, filter stopwords (Ar + En)
 * - TF (term frequency): count(term) / total_terms
 * - IDF (inverse document frequency): log(N / df(term))  where N = total chunks
 * - Vector: sparse map of { term: tf * idf }
 * - Cosine similarity for retrieval
 *
 * Attribution: TF-IDF is a public-domain algorithm dating back to 1972 (Karen Spärck Jones).
 * This implementation is independent.
 */

import { getAllEmbeddings, getAllChunksWithDocuments, getEmbeddingsForDocuments } from "./db";

// === Stopwords ===

const ARABIC_STOPWORDS = new Set([
  "في", "من", "على", "إلى", "عن", "مع", "هذا", "هذه", "ذلك", "تلك",
  "التي", "الذي", "الذين", "اللاتي", "اللائي", "هو", "هي", "هم", "هن",
  "نحن", "أنا", "أنت", "أنتم", "كان", "كانت", "يكون", "تكون", "قد",
  "لقد", "كما", "حيث", "إذا", "عند", "عندما", "بعد", "قبل", "خلال",
  "بين", "أو", "أم", "ثم", "لكن", "بل", "حتى", "إلا", "لا", "لم",
  "لن", "إن", "أن", "كي", "لذلك", "بسبب", "حول", "نحو", "دون", "غير",
  "كل", "بعض", "كثير", "قليل", "جدا", "فقط", "أيضا", "دائما", "أبدا",
]);

const ENGLISH_STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "up", "about", "into", "through", "during",
  "before", "after", "above", "below", "between", "this", "that", "these",
  "those", "is", "are", "was", "were", "be", "been", "being", "have",
  "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "shall", "can", "need", "i", "you", "he", "she",
  "it", "we", "they", "them", "their", "there", "here", "what", "which",
  "who", "when", "where", "why", "how", "all", "each", "every", "both",
  "few", "more", "most", "other", "some", "such", "no", "nor", "not",
  "only", "own", "same", "so", "than", "too", "very", "just", "also",
]);

// === Tokenization ===

/**
 * Tokenize text into lowercase word tokens.
 * Handles Arabic + English + digits.
 * Removes stopwords.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];

  // Normalize: lowercase + remove diacritics + normalize Arabic
  const normalized = text
    .toLowerCase()
    // Remove Arabic diacritics
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    // Normalize Arabic alef variants
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");

  // Tokenize: split on non-word characters (preserves Arabic + English + digits)
  const tokens = normalized.match(/[\u0600-\u06FFa-zA-Z0-9]+/g) ?? [];

  // Filter: stopwords + length >= 2
  return tokens.filter(
    (t) =>
      t.length >= 2 &&
      !ARABIC_STOPWORDS.has(t) &&
      !ENGLISH_STOPWORDS.has(t)
  );
}

// === TF-IDF ===

/**
 * Compute term frequencies (TF) for a tokenized document.
 * Returns a sparse map: { term: count }.
 *
 * Note: We use raw counts here (not normalized by length) — the
 * cosine similarity in retrieval handles the normalization.
 */
function computeTermCounts(tokens: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of tokens) {
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}

/**
 * Compute the L2 norm of a TF-IDF vector.
 */
function computeNorm(vector: Record<string, number>): number {
  let sum = 0;
  for (const term in vector) {
    const v = vector[term];
    sum += v * v;
  }
  return Math.sqrt(sum);
}

/**
 * Build IDF (inverse document frequency) map from all chunks.
 *
 * IDF(term) = log( (1 + N) / (1 + df(term)) ) + 1
 * (smoothed variant — avoids division by zero + extreme values)
 *
 * This is computed lazily and cached.
 */
let idfCache: { idf: Record<string, number>; totalChunks: number } | null = null;

function computeIdf(): { idf: Record<string, number>; totalChunks: number } {
  if (idfCache) return idfCache;

  const allChunks = getAllChunksWithDocuments();
  const N = allChunks.length;
  const df: Record<string, number> = {};

  for (const chunk of allChunks) {
    const tokens = tokenize(chunk.text);
    const uniqueTokens = new Set(tokens);
    for (const t of uniqueTokens) {
      df[t] = (df[t] ?? 0) + 1;
    }
  }

  const idf: Record<string, number> = {};
  for (const term in df) {
    // Smoothed IDF (standard formula)
    idf[term] = Math.log((1 + N) / (1 + df[term])) + 1;
  }

  idfCache = { idf, totalChunks: N };
  return idfCache;
}

/**
 * Invalidate the IDF cache.
 * Call this after adding/removing documents.
 */
export function invalidateIdfCache(): void {
  idfCache = null;
}

/**
 * Compute the TF-IDF vector for a piece of text.
 *
 * TF(term) = count(term) — raw count, not normalized
 * TF-IDF(term) = TF(term) * IDF(term)
 *
 * @returns { vector, norm } — the sparse vector and its L2 norm
 */
export function embed(
  text: string
): { vector: Record<string, number>; norm: number } {
  const { idf } = computeIdf();
  const tokens = tokenize(text);
  const termCounts = computeTermCounts(tokens);

  // Default IDF for unseen terms = log((1+N)/(1+0)) + 1 = log(1+N) + 1
  // (gives some weight to unseen terms so they can still match)
  const { totalChunks } = computeIdf();
  const defaultIdf = Math.log(1 + totalChunks) + 1;

  const vector: Record<string, number> = {};
  for (const term in termCounts) {
    const tf = termCounts[term];
    const termIdf = idf[term] ?? defaultIdf;
    vector[term] = tf * termIdf;
  }

  return { vector, norm: computeNorm(vector) };
}

/**
 * Compute cosine similarity between two TF-IDF vectors.
 *
 * cos(a, b) = (a · b) / (|a| * |b|)
 *
 * We iterate over the smaller vector for efficiency.
 */
export function cosineSimilarity(
  a: { vector: Record<string, number>; norm: number },
  b: { vector: Record<string, number>; norm: number }
): number {
  if (a.norm === 0 || b.norm === 0) return 0;

  // Iterate over the smaller vector
  const [smaller, larger] =
    Object.keys(a.vector).length < Object.keys(b.vector).length
      ? [a.vector, b.vector]
      : [b.vector, a.vector];

  let dot = 0;
  for (const term in smaller) {
    if (term in larger) {
      dot += smaller[term] * larger[term];
    }
  }

  return dot / (a.norm * b.norm);
}

// === Retrieval ===

export interface RetrievalResult {
  chunkId: string;
  documentId: string;
  documentName: string;
  chunkText: string;
  score: number;
  chunkIdx: number;
}

/**
 * Retrieve the top-K most similar chunks to a query.
 *
 * @param query The user's question
 * @param topK How many chunks to return (default: 3)
 * @param documentIds Optional: restrict to specific documents
 */
export function retrieveRelevantChunks(
  query: string,
  topK = 3,
  documentIds?: string[]
): RetrievalResult[] {
  const queryEmbedding = embed(query);
  if (queryEmbedding.norm === 0) return [];

  // Get all embeddings (filtered by documentIds if provided)
  let embeddingsData: Array<{
    chunk_id: string;
    vector_json: string;
    norm: number;
    document_id: string;
    chunk_text: string;
    document_name: string;
    chunk_idx: number;
  }>;

  if (documentIds && documentIds.length > 0) {
    // Filter by document IDs
    const rawEmbeddings = getEmbeddingsForDocuments(documentIds);
    const chunksWithDocs = getAllChunksWithDocuments();
    const chunkMap = new Map(chunksWithDocs.map((c) => [c.id, c]));
    embeddingsData = rawEmbeddings.map((e) => {
      const chunk = chunkMap.get(e.chunk_id);
      return {
        chunk_id: e.chunk_id,
        vector_json: e.vector_json,
        norm: e.norm,
        document_id: chunk?.document_id ?? "",
        chunk_text: chunk?.text ?? "",
        document_name: chunk?.document_name ?? "",
        chunk_idx: chunk?.idx ?? 0,
      };
    });
  } else {
    // All embeddings
    const allEmbeddings = getAllEmbeddings();
    const chunksWithDocs = getAllChunksWithDocuments();
    const chunkMap = new Map(chunksWithDocs.map((c) => [c.id, c]));
    embeddingsData = allEmbeddings.map((e: { chunk_id: string; vector_json: string; norm: number }) => {
      const chunk = chunkMap.get(e.chunk_id);
      return {
        chunk_id: e.chunk_id,
        vector_json: e.vector_json,
        norm: e.norm,
        document_id: chunk?.document_id ?? "",
        chunk_text: chunk?.text ?? "",
        document_name: chunk?.document_name ?? "",
        chunk_idx: chunk?.idx ?? 0,
      };
    });
  }

  // Score each chunk
  const scored = embeddingsData.map((e) => {
    const chunkEmbedding = {
      vector: JSON.parse(e.vector_json) as Record<string, number>,
      norm: e.norm,
    };
    return {
      chunkId: e.chunk_id,
      documentId: e.document_id,
      documentName: e.document_name,
      chunkText: e.chunk_text,
      chunkIdx: e.chunk_idx,
      score: cosineSimilarity(queryEmbedding, chunkEmbedding),
    };
  });

  // Sort by score descending, take top K
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}
