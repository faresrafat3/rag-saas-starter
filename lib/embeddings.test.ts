import { describe, it, expect } from "vitest";
import {
  tokenize,
  embed,
  cosineSimilarity,
  ARABIC_STOPWORDS,
  ENGLISH_STOPWORDS,
} from "./embeddings";

// Note: We test only the pure functions (tokenize, embed, cosineSimilarity).
// The retrieveRelevantChunks function depends on the SQLite database and is
// tested via integration tests (not in this unit test file).

describe("tokenize", () => {
  describe("basic tokenization", () => {
    it("returns empty array for empty string", () => {
      expect(tokenize("")).toEqual([]);
    });

    it("returns empty array for whitespace-only string", () => {
      expect(tokenize("   ")).toEqual([]);
    });

    it("tokenizes simple English text", () => {
      const tokens = tokenize("Hello world foo bar");
      expect(tokens).toContain("hello");
      expect(tokens).toContain("world");
      expect(tokens).toContain("foo");
      expect(tokens).toContain("bar");
    });

    it("tokenizes simple Arabic text", () => {
      const tokens = tokenize("الذكاء الاصطناعي رائع");
      expect(tokens).toContain("الذكاء");
      expect(tokens).toContain("الاصطناعي");
      expect(tokens).toContain("رائع");
    });

    it("handles mixed Arabic + English", () => {
      const tokens = tokenize("AI and ذكاء اصطناعي");
      expect(tokens).toContain("ai");
      // "and" is a stopword, filtered out
      expect(tokens).toContain("ذكاء");
      expect(tokens).toContain("اصطناعي");
    });
  });

  describe("normalization", () => {
    it("lowercases English text", () => {
      const tokens = tokenize("HELLO World FOO");
      expect(tokens).toEqual(["hello", "world", "foo"]);
    });

    it("removes Arabic diacritics", () => {
      const withDiacritics = "الذَّكَاءُ الْحَدِيثُ";
      const without = "الذكاء الحديث";
      expect(tokenize(withDiacritics)).toEqual(tokenize(without));
    });

    it("normalizes Arabic alef variants (إأآا → ا)", () => {
      const variants = ["إسلام", "أحمد", "آمنة", "احمد"];
      const tokens = tokenize(variants[1]); // أحمد
      expect(tokens).toContain("احمد");
    });

    it("normalizes ى → ي", () => {
      const tokens = tokenize("مستشفى");
      expect(tokens).toContain("مستشفي");
    });

    it("normalizes ة → ه", () => {
      const tokens = tokenize("مدرسة");
      expect(tokens).toContain("مدرسه");
    });

    it("removes tatweel (ـ)", () => {
      const tokens = tokenize("الـذكاء الاصـطناعي");
      expect(tokens).toContain("الذكاء");
      expect(tokens).toContain("الاصطناعي");
    });
  });

  describe("stopwords filtering", () => {
    it("filters out English stopwords", () => {
      const tokens = tokenize("the quick brown fox jumps over the lazy dog");
      expect(tokens).not.toContain("the");
      expect(tokens).toContain("over"); // 'over' is NOT a stopword in our list
      expect(tokens).toContain("quick");
      expect(tokens).toContain("fox");
      expect(tokens).toContain("dog");
    });

    it("filters out Arabic stopwords", () => {
      const tokens = tokenize("في الذكاء الاصطناعي من العلوم الحديثة");
      expect(tokens).not.toContain("في");
      expect(tokens).not.toContain("من");
      expect(tokens).toContain("الذكاء");
      expect(tokens).toContain("الاصطناعي");
      expect(tokens).toContain("العلوم");
      // Note: ة → ه normalization, so "الحديثة" becomes "الحديثه"
      expect(tokens).toContain("الحديثه");
    });

    it("ARABIC_STOPWORDS contains common words", () => {
      expect(ARABIC_STOPWORDS.has("في")).toBe(true);
      expect(ARABIC_STOPWORDS.has("من")).toBe(true);
      expect(ARABIC_STOPWORDS.has("على")).toBe(true);
      expect(ARABIC_STOPWORDS.has("هذا")).toBe(true);
    });

    it("ENGLISH_STOPWORDS contains common words", () => {
      expect(ENGLISH_STOPWORDS.has("the")).toBe(true);
      expect(ENGLISH_STOPWORDS.has("is")).toBe(true);
      expect(ENGLISH_STOPWORDS.has("and")).toBe(true);
      expect(ENGLISH_STOPWORDS.has("of")).toBe(true);
    });
  });

  describe("filtering by length", () => {
    it("filters out single-character tokens", () => {
      const tokens = tokenize("a b cc ddd");
      expect(tokens).not.toContain("a");
      expect(tokens).not.toContain("b");
      expect(tokens).toContain("cc");
      expect(tokens).toContain("ddd");
    });
  });

  describe("special characters", () => {
    it("handles punctuation", () => {
      const tokens = tokenize("Hello, world! How are you?");
      expect(tokens).toContain("hello");
      expect(tokens).toContain("world");
      // 'how', 'are', 'you' are all stopwords in our list
      expect(tokens).not.toContain("are");
      expect(tokens).not.toContain("you");
    });

    it("handles numbers", () => {
      const tokens = tokenize("GPT-4 and Claude 3.5");
      expect(tokens).toContain("gpt");
      expect(tokens).toContain("claude");
      // Single-digit tokens (4, 3, 5) are filtered out by length >= 2
      // 'and' is a stopword
      expect(tokens).not.toContain("and");
    });

    it("handles Arabic-English mixed punctuation", () => {
      const tokens = tokenize("ما هو AI؟ ولماذا يهم؟");
      expect(tokens).toContain("ai");
      expect(tokens).toContain("ولماذا");
      expect(tokens).toContain("يهم");
    });
  });
});

describe("embed", () => {
  it("returns a vector with norm for non-empty text", () => {
    const result = embed("الذكاء الاصطناعي");
    expect(result.vector).toBeDefined();
    expect(typeof result.norm).toBe("number");
    expect(result.norm).toBeGreaterThan(0);
  });

  it("returns zero norm for text with only stopwords", () => {
    const result = embed("في من على إلى عن مع");
    expect(result.norm).toBe(0);
    expect(Object.keys(result.vector)).toHaveLength(0);
  });

  it("returns zero norm for empty string", () => {
    const result = embed("");
    expect(result.norm).toBe(0);
  });

  it("produces different vectors for different texts", () => {
    const a = embed("الذكاء الاصطناعي");
    const b = embed("الطبخ والطعام");
    // Vectors should have different terms
    const aTerms = new Set(Object.keys(a.vector));
    const bTerms = new Set(Object.keys(b.vector));
    const intersection = [...aTerms].filter((t) => bTerms.has(t));
    expect(intersection.length).toBeLessThan(aTerms.size);
  });

  it("produces same vector for same text", () => {
    const a = embed("نص تجريبي متطابق");
    const b = embed("نص تجريبي متطابق");
    expect(a.vector).toEqual(b.vector);
    expect(a.norm).toBe(b.norm);
  });
});

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const a = embed("الذكاء الاصطناعي الحديث");
    const sim = cosineSimilarity(a, a);
    expect(sim).toBeCloseTo(1, 5);
  });

  it("returns 0 for completely disjoint vectors", () => {
    const a = {
      vector: { apple: 1, banana: 1 },
      norm: Math.sqrt(2),
    };
    const b = {
      vector: { cat: 1, dog: 1 },
      norm: Math.sqrt(2),
    };
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it("returns 0 when one vector has zero norm", () => {
    const a = embed("الذكاء");
    const b = embed("في من"); // all stopwords → zero norm
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it("returns 0 when both vectors have zero norm", () => {
    const a = embed("في من");
    const b = embed("على إلى");
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it("returns value between 0 and 1 for partial overlap", () => {
    const a = embed("الذكاء الاصطناعي تعلم الآلة");
    const b = embed("الذكاء الاصطناعي الطبخ");
    const sim = cosineSimilarity(a, b);
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });

  it("handles sparse vectors efficiently (no overlap → 0 fast)", () => {
    const a = {
      vector: { a: 1 },
      norm: 1,
    };
    const b = {
      vector: { z: 1 },
      norm: 1,
    };
    // Should not throw and should return 0
    expect(cosineSimilarity(a, b)).toBe(0);
  });
});
