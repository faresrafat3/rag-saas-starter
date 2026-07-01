/**
 * AI Provider Configuration (Client-Safe)
 * =============================================================================
 * This file is safe to import from client components.
 * It contains only constants derived from environment variables —
 * no Node.js-only modules (no `better-sqlite3`, no `node:fs`).
 *
 * The actual provider logic (generateChatResponse, RAG retrieval) lives in
 * `lib/ai-provider.ts` and is server-only.
 */

export const AI_PROVIDER =
  process.env.AI_PROVIDER ?? (process.env.OPENAI_API_KEY ? "openai" : "mock");

export const AI_MODEL = process.env.AI_MODEL ?? "gpt-4o-mini";

export const AI_TEMPERATURE = Number(process.env.AI_TEMPERATURE ?? 0.7);

export const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS ?? 2000);

/**
 * Whether we're running in mock mode (no real AI provider configured).
 */
export const IS_MOCK_MODE = AI_PROVIDER === "mock";
