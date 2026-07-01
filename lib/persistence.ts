/**
 * localStorage Persistence Helpers
 * =============================================================================
 * Saves chat history + selected document IDs to localStorage so the user's
 * session survives page refreshes.
 *
 * Keys:
 * - `rag-starter:messages` — ChatMessage[]
 * - `rag-starter:selected-docs` — string[] (document IDs)
 *
 * Notes:
 * - localStorage has a ~5MB limit per origin. We truncate messages if needed.
 * - All operations are wrapped in try/catch — localStorage may be unavailable
 *   (private browsing, SSR, etc.).
 * - This module is client-only. Never import from server code.
 */

import type { ChatMessage } from "./types";

const MESSAGES_KEY = "rag-starter:messages";
const SELECTED_DOCS_KEY = "rag-starter:selected-docs";
const MAX_MESSAGES = 100; // cap to avoid quota issues

/**
 * Check if localStorage is available (client-side + not blocked).
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const test = "__rag_test__";
    window.localStorage.setItem(test, "1");
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load saved messages from localStorage.
 * Returns [] if unavailable or no saved data.
 */
export function loadMessages(): ChatMessage[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    // Basic validation
    return parsed.filter(
      (m) => typeof m.id === "string" && typeof m.content === "string"
    );
  } catch {
    return [];
  }
}

/**
 * Save messages to localStorage.
 * Truncates to the most recent MAX_MESSAGES if needed.
 */
export function saveMessages(messages: ChatMessage[]): void {
  if (!isLocalStorageAvailable()) return;
  try {
    const toSave =
      messages.length > MAX_MESSAGES
        ? messages.slice(-MAX_MESSAGES)
        : messages;
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(toSave));
  } catch (e) {
    // Quota exceeded — try saving fewer messages
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      try {
        const trimmed = messages.slice(-Math.floor(MAX_MESSAGES / 2));
        window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(trimmed));
      } catch {
        // Give up silently — localStorage is best-effort
      }
    }
  }
}

/**
 * Clear saved messages.
 */
export function clearMessages(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(MESSAGES_KEY);
  } catch {
    // ignore
  }
}

/**
 * Load selected document IDs from localStorage.
 */
export function loadSelectedDocIds(): string[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(SELECTED_DOCS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

/**
 * Save selected document IDs to localStorage.
 */
export function saveSelectedDocIds(ids: string[]): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(SELECTED_DOCS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}
