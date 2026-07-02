import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  loadMessages,
  saveMessages,
  clearMessages,
  loadSelectedDocIds,
  saveSelectedDocIds,
} from "./persistence";
import type { ChatMessage } from "./types";

// Mock localStorage
// Vitest runs in Node.js by default, so we need to provide a localStorage mock.

class LocalStorageMock {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  get length(): number {
    return this.store.size;
  }
}

describe("persistence", () => {
  beforeEach(() => {
    // Set up window + localStorage mocks
    const ls = new LocalStorageMock();
    Object.defineProperty(globalThis, "window", {
      value: { localStorage: ls },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loadMessages", () => {
    it("returns empty array when localStorage is empty", () => {
      expect(loadMessages()).toEqual([]);
    });

    it("returns messages from localStorage", () => {
      const messages: ChatMessage[] = [
        {
          id: "msg_1",
          role: "user",
          content: "مرحبًا",
          createdAt: 1000,
        },
        {
          id: "msg_2",
          role: "assistant",
          content: "أهلًا بك",
          createdAt: 1001,
        },
      ];
      window.localStorage.setItem(
        "rag-starter:messages",
        JSON.stringify(messages)
      );
      const result = loadMessages();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("msg_1");
      expect(result[1].content).toBe("أهلًا بك");
    });

    it("returns empty array for invalid JSON", () => {
      window.localStorage.setItem("rag-starter:messages", "{not json}");
      expect(loadMessages()).toEqual([]);
    });

    it("returns empty array for non-array JSON", () => {
      window.localStorage.setItem("rag-starter:messages", '{"a":1}');
      expect(loadMessages()).toEqual([]);
    });

    it("filters out invalid message objects", () => {
      const invalid = [
        { id: "valid", role: "user", content: "ok", createdAt: 1 },
        { id: 123, role: "user", content: "ok", createdAt: 2 }, // invalid id type
        { id: "no_content", role: "user", createdAt: 3 }, // missing content
        "not an object",
        null,
      ];
      window.localStorage.setItem(
        "rag-starter:messages",
        JSON.stringify(invalid)
      );
      const result = loadMessages();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("valid");
    });
  });

  describe("saveMessages", () => {
    it("saves messages to localStorage", () => {
      const messages: ChatMessage[] = [
        {
          id: "msg_1",
          role: "user",
          content: "test",
          createdAt: 1000,
        },
      ];
      saveMessages(messages);
      const stored = window.localStorage.getItem("rag-starter:messages");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe("msg_1");
    });

    it("truncates to MAX_MESSAGES (100) when exceeding", () => {
      const messages: ChatMessage[] = Array.from({ length: 150 }, (_, i) => ({
        id: `msg_${i}`,
        role: "user" as const,
        content: `message ${i}`,
        createdAt: i,
      }));
      saveMessages(messages);
      const stored = window.localStorage.getItem("rag-starter:messages");
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(100);
      // Should keep the last 100
      expect(parsed[0].id).toBe("msg_50");
      expect(parsed[99].id).toBe("msg_149");
    });

    it("handles empty array", () => {
      saveMessages([]);
      const stored = window.localStorage.getItem("rag-starter:messages");
      expect(stored).toBe("[]");
    });
  });

  describe("clearMessages", () => {
    it("removes messages from localStorage", () => {
      window.localStorage.setItem(
        "rag-starter:messages",
        JSON.stringify([{ id: "x", role: "user", content: "y", createdAt: 0 }])
      );
      clearMessages();
      expect(window.localStorage.getItem("rag-starter:messages")).toBeNull();
    });

    it("does not throw when nothing to clear", () => {
      expect(() => clearMessages()).not.toThrow();
    });
  });

  describe("loadSelectedDocIds", () => {
    it("returns empty array when localStorage is empty", () => {
      expect(loadSelectedDocIds()).toEqual([]);
    });

    it("returns IDs from localStorage", () => {
      window.localStorage.setItem(
        "rag-starter:selected-docs",
        JSON.stringify(["doc_1", "doc_2", "doc_3"])
      );
      const result = loadSelectedDocIds();
      expect(result).toEqual(["doc_1", "doc_2", "doc_3"]);
    });

    it("returns empty array for invalid JSON", () => {
      window.localStorage.setItem(
        "rag-starter:selected-docs",
        "{not json}"
      );
      expect(loadSelectedDocIds()).toEqual([]);
    });

    it("filters out non-string entries", () => {
      window.localStorage.setItem(
        "rag-starter:selected-docs",
        JSON.stringify(["valid", 123, null, { obj: true }, "also_valid"])
      );
      const result = loadSelectedDocIds();
      expect(result).toEqual(["valid", "also_valid"]);
    });
  });

  describe("saveSelectedDocIds", () => {
    it("saves IDs to localStorage", () => {
      saveSelectedDocIds(["a", "b", "c"]);
      const stored = window.localStorage.getItem(
        "rag-starter:selected-docs"
      );
      expect(stored).toBe(JSON.stringify(["a", "b", "c"]));
    });

    it("handles empty array", () => {
      saveSelectedDocIds([]);
      const stored = window.localStorage.getItem(
        "rag-starter:selected-docs"
      );
      expect(stored).toBe("[]");
    });
  });

  describe("SSR safety", () => {
    it("loadMessages returns [] when window is undefined", () => {
      const originalWindow = (globalThis as { window?: unknown }).window;
      // @ts-expect-error — intentionally deleting window
      delete globalThis.window;
      try {
        expect(loadMessages()).toEqual([]);
      } finally {
        (globalThis as { window?: unknown }).window = originalWindow;
      }
    });

    it("saveMessages does not throw when window is undefined", () => {
      const originalWindow = (globalThis as { window?: unknown }).window;
      // @ts-expect-error — intentionally deleting window
      delete globalThis.window;
      try {
        expect(() => saveMessages([])).not.toThrow();
      } finally {
        (globalThis as { window?: unknown }).window = originalWindow;
      }
    });

    it("loadSelectedDocIds returns [] when window is undefined", () => {
      const originalWindow = (globalThis as { window?: unknown }).window;
      // @ts-expect-error — intentionally deleting window
      delete globalThis.window;
      try {
        expect(loadSelectedDocIds()).toEqual([]);
      } finally {
        (globalThis as { window?: unknown }).window = originalWindow;
      }
    });
  });
});
