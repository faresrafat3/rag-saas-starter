/**
 * Shared types for the chat system.
 */

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  /** Optional: which documents this message references (for RAG, coming in session 5) */
  documentIds?: string[];
  /** Optional: streaming state for assistant messages */
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/**
 * The request body sent to /api/chat
 */
export interface ChatRequest {
  messages: Pick<ChatMessage, "role" | "content">[];
  /** Optional: document IDs to use as RAG context (session 5) */
  documentIds?: string[];
  /** Optional: model override */
  model?: string;
  /** Optional: temperature override */
  temperature?: number;
}

/**
 * The streaming response chunks sent back from /api/chat.
 * Uses Vercel AI SDK streaming protocol (SSE-like text stream).
 */
export type ChatStreamChunk = string;
