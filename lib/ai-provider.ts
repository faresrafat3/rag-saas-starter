/**
 * AI Provider Configuration
 * =============================================================================
 * This file follows the Vercel AI SDK pattern (provider-agnostic).
 * The provider is selected based on environment variables.
 *
 * For the demo (when no API key is set), it falls back to a mock streaming
 * response so the UI is fully functional without external dependencies.
 *
 * To use a real provider:
 * 1. Copy `.env.example` to `.env.local`
 * 2. Set OPENAI_API_KEY (or ANTHROPIC_API_KEY)
 * 3. Set AI_PROVIDER=openai (or anthropic)
 */

import type { ChatRequest } from "./types";

export const AI_PROVIDER =
  process.env.AI_PROVIDER ?? (process.env.OPENAI_API_KEY ? "openai" : "mock");

export const AI_MODEL = process.env.AI_MODEL ?? "gpt-4o-mini";

export const AI_TEMPERATURE = Number(process.env.AI_TEMPERATURE ?? 0.7);

export const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS ?? 2000);

/**
 * Whether we're running in mock mode (no real AI provider configured).
 */
export const IS_MOCK_MODE = AI_PROVIDER === "mock";

/**
 * Generate a streaming response for the given chat request.
 *
 * This is the provider-agnostic entry point. In session 5, we'll switch
 * this to use the actual Vercel AI SDK (`streamText` from `ai` package).
 *
 * For now (session 4), it returns a mock streaming response.
 */
export async function generateChatResponse(
  request: ChatRequest
): Promise<ReadableStream<Uint8Array>> {
  if (IS_MOCK_MODE) {
    return generateMockStream(request);
  }

  // Real provider integration is coming in session 5
  // For now, fall back to mock if we get here without a real implementation
  return generateMockStream(request);
}

/**
 * Mock streaming response generator — for development without API keys.
 *
 * Produces a realistic-looking assistant response in Arabic that
 * acknowledges the user's last message.
 */
function generateMockStream(request: ChatRequest): ReadableStream<Uint8Array> {
  const lastUserMessage = [...request.messages]
    .reverse()
    .find((m) => m.role === "user");

  const userText = lastUserMessage?.content?.trim() ?? "";

  const responses: string[] = [];

  if (!userText) {
    responses.push("مرحبًا! كيف يمكنني مساعدتك اليوم؟");
  } else if (userText.length < 20) {
    responses.push(
      `سؤال جيد حول "${userText}". `,
      `هذا نموذج تجريبي (mock mode) — لا يتم استدعاء أي مزود ذكاء اصطناعي حقيقي. `,
      `لتفعيل الردود الحقيقية، أضف OPENAI_API_KEY إلى ملف .env.local.`
    );
  } else {
    responses.push(
      `شكرًا على رسالتك. فهمت أنك تسأل عن:\n\n`,
      `> ${userText.slice(0, 200)}${userText.length > 200 ? "..." : ""}\n\n`,
      `هذا رد تجريبي من النظام (mock mode). في الجلسة القادمة سيتم:\n`,
      `1. ربط API حقيقي (OpenAI / Anthropic)\n`,
      `2. إضافة RAG pipeline للاستدلال على المستندات\n`,
      `3. دعم المحادثة متعددة المستندات\n\n`,
      `ترقب الجلسة 5! 🚀`
    );
  }

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (const chunk of responses) {
        // Simulate streaming delay
        await new Promise((resolve) => setTimeout(resolve, 80));
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}
