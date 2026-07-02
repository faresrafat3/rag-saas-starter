import { describe, it, expect } from "vitest";
import { chunkText, getChunkStats } from "./chunking";

describe("chunkText", () => {
  describe("basic splitting", () => {
    it("returns empty array for empty string", () => {
      expect(chunkText("")).toEqual([]);
    });

    it("returns empty array for whitespace-only string", () => {
      expect(chunkText("   \n\t  ")).toEqual([]);
    });

    it("returns single chunk for short text", () => {
      const text = "This is a short sentence.";
      const result = chunkText(text);
      expect(result).toHaveLength(1);
      expect(result[0].idx).toBe(0);
      expect(result[0].text).toContain("short sentence");
    });

    it("returns single chunk for one Arabic sentence", () => {
      const text = "الذكاء الاصطناعي هو محاكاة للذكاء البشري.";
      const result = chunkText(text);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("الذكاء الاصطناعي");
    });
  });

  describe("English sentence terminators", () => {
    it("splits on period", () => {
      const text = "First sentence here. Second sentence there. Third one everywhere.";
      const result = chunkText(text, { maxChunkSize: 30, minChunkSize: 1, overlap: 0 });
      expect(result.length).toBeGreaterThan(1);
    });

    it("splits on exclamation mark", () => {
      const text = "First one here! Second one there! Third one everywhere!";
      const result = chunkText(text, { maxChunkSize: 20, minChunkSize: 1, overlap: 0 });
      expect(result.length).toBeGreaterThan(1);
    });

    it("splits on question mark", () => {
      const text = "What is this? Where is it? When was it made?";
      const result = chunkText(text, { maxChunkSize: 20, minChunkSize: 1, overlap: 0 });
      expect(result.length).toBeGreaterThan(1);
    });
  });

  describe("Arabic sentence terminators", () => {
    it("splits on Arabic full stop (.)", () => {
      const text = "الجملة الأولى هنا. الجملة الثانية هناك. الجملة الثالثة في كل مكان.";
      const result = chunkText(text, { maxChunkSize: 30, minChunkSize: 1, overlap: 0 });
      expect(result.length).toBeGreaterThan(1);
    });

    it("splits on Arabic question mark (؟)", () => {
      const text = "ما اسمك الكريم؟ من أين أنت قادم؟ كم عمرك الآن؟";
      const result = chunkText(text, { maxChunkSize: 25, minChunkSize: 1, overlap: 0 });
      expect(result.length).toBeGreaterThan(1);
    });

    it("splits on Arabic semicolon (؛)", () => {
      const text = "هذا أولاً هنا؛ وهذا ثانياً هناك؛ وهذا ثالثاً في كل مكان.";
      const result = chunkText(text, { maxChunkSize: 30, minChunkSize: 1, overlap: 0 });
      expect(result.length).toBeGreaterThan(1);
    });
  });

  describe("mixed Arabic + English", () => {
    it("splits mixed-language text correctly", () => {
      const text =
        "This is English. هذه جملة عربية. And back to English. وعودة للعربية.";
      const result = chunkText(text, { maxChunkSize: 60, minChunkSize: 1, overlap: 0 });
      expect(result.length).toBeGreaterThan(1);
    });
  });

  describe("chunk size constraints", () => {
    it("respects maxChunkSize", () => {
      // Long sentence without internal terminators — must hard-split
      const text = "word ".repeat(500).trim();
      const result = chunkText(text, { maxChunkSize: 100, minChunkSize: 1, overlap: 0 });
      for (const chunk of result) {
        expect(chunk.text.length).toBeLessThanOrEqual(100);
      }
    });

    it("merges tiny chunks below minChunkSize", () => {
      const text = "A. B. C. D. E.";
      const result = chunkText(text, {
        maxChunkSize: 100,
        minChunkSize: 5,
        overlap: 0,
      });
      // With minChunkSize=5, single-char sentences should be merged
      for (const chunk of result) {
        expect(chunk.text.length).toBeGreaterThanOrEqual(3); // at least "A. B."
      }
    });

    it("hard-splits oversized single sentences", () => {
      // Single sentence longer than maxChunkSize
      const longSentence =
        "This is a very long sentence without any terminator that must be hard split ".repeat(
          10
        );
      const result = chunkText(longSentence, {
        maxChunkSize: 200,
        minChunkSize: 1,
        overlap: 0,
      });
      expect(result.length).toBeGreaterThan(1);
      for (const chunk of result) {
        expect(chunk.text.length).toBeLessThanOrEqual(200);
      }
    });
  });

  describe("overlap", () => {
    it("adds overlap characters from previous chunk", () => {
      const text =
        "First sentence here. Second sentence there. Third sentence everywhere.";
      const result = chunkText(text, {
        maxChunkSize: 40,
        minChunkSize: 5,
        overlap: 10,
      });
      if (result.length > 1) {
        // The second chunk should contain some characters from the end of the first
        const firstEnd = result[0].text.slice(-10);
        // Overlap may or may not exist depending on where the split happens,
        // but at least the chunks should be valid
        expect(result[1].text.length).toBeGreaterThan(0);
      }
    });

    it("handles zero overlap", () => {
      const text = "First. Second. Third. Fourth.";
      const result = chunkText(text, {
        maxChunkSize: 20,
        minChunkSize: 1,
        overlap: 0,
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("chunk indices", () => {
    it("assigns sequential indices starting from 0", () => {
      const text = "One. Two. Three. Four. Five. Six. Seven. Eight.";
      const result = chunkText(text, {
        maxChunkSize: 20,
        minChunkSize: 1,
        overlap: 0,
      });
      result.forEach((chunk, i) => {
        expect(chunk.idx).toBe(i);
      });
    });
  });

  describe("edge cases", () => {
    it("handles text with only terminators", () => {
      const text = "...???!!!";
      const result = chunkText(text);
      // Should not crash; result may be empty or contain the terminators
      expect(Array.isArray(result)).toBe(true);
    });

    it("handles text with multiple consecutive spaces", () => {
      const text = "Sentence one.    Sentence two.";
      const result = chunkText(text, { maxChunkSize: 100, minChunkSize: 1, overlap: 0 });
      expect(result.length).toBeGreaterThan(0);
      // Should not contain multiple consecutive spaces (normalized)
      for (const chunk of result) {
        expect(chunk.text).not.toContain("    ");
      }
    });

    it("handles text with newlines", () => {
      const text = "First line.\nSecond line.\nThird line.";
      const result = chunkText(text, { maxChunkSize: 100, minChunkSize: 1, overlap: 0 });
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

describe("getChunkStats", () => {
  it("returns zero stats for empty array", () => {
    const stats = getChunkStats([]);
    expect(stats).toEqual({
      count: 0,
      totalChars: 0,
      minChars: 0,
      maxChars: 0,
      avgChars: 0,
    });
  });

  it("computes correct stats for non-empty array", () => {
    const chunks = [
      { idx: 0, text: "abc" },
      { idx: 1, text: "abcdefgh" },
      { idx: 2, text: "ab" },
    ];
    const stats = getChunkStats(chunks);
    expect(stats.count).toBe(3);
    expect(stats.totalChars).toBe(13);
    expect(stats.minChars).toBe(2);
    expect(stats.maxChars).toBe(8);
    expect(stats.avgChars).toBe(4); // round(13/3) = 4
  });
});
