/**
 * AI Provider Configuration
 * =============================================================================
 * This file follows the Vercel AI SDK pattern (provider-agnostic).
 *
 * Session 5B update: real provider integration via Vercel AI SDK `streamText()`.
 *
 * Provider selection:
 * - If OPENAI_API_KEY is set → use @ai-sdk/openai
 * - Else if ANTHROPIC_API_KEY is set → use @ai-sdk/anthropic
 * - Else → mock mode (returns realistic Arabic mock responses)
 *
 * RAG context injection:
 * - If request includes `documentIds`, retrieves relevant chunks via TF-IDF
 * - Builds an Arabic system prompt with the retrieved context
 * - Passes the system prompt to `streamText()` (or includes it in the mock)
 */

import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { ChatRequest } from "./types";
import { retrieveRelevantChunks } from "./embeddings";
import type { RetrievalResult } from "./embeddings";
import {
  AI_PROVIDER,
  AI_MODEL,
  AI_TEMPERATURE,
  AI_MAX_TOKENS,
  IS_MOCK_MODE,
} from "./ai-config";

// Re-export for backwards compatibility
export { AI_PROVIDER, AI_MODEL, AI_TEMPERATURE, AI_MAX_TOKENS, IS_MOCK_MODE };

/**
 * Number of chunks to retrieve for RAG context.
 */
const RAG_TOP_K = 3;

/**
 * Result of a chat generation — includes the stream + RAG context metadata.
 */
export interface ChatGenerationResult {
  stream: ReadableStream<Uint8Array>;
  ragContext?: {
    chunks: RetrievalResult[];
    systemPrompt: string;
  };
}

/**
 * Lazy-initialized provider instances (only created when API keys are present).
 */
let openaiProvider: ReturnType<typeof createOpenAI> | null = null;
let anthropicProvider: ReturnType<typeof createAnthropic> | null = null;

function getOpenAIProvider() {
  if (!openaiProvider && process.env.OPENAI_API_KEY) {
    openaiProvider = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiProvider;
}

function getAnthropicProvider() {
  if (!anthropicProvider && process.env.ANTHROPIC_API_KEY) {
    anthropicProvider = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicProvider;
}

/**
 * Determine which provider to use.
 * Priority: explicit AI_PROVIDER env > OPENAI_API_KEY > ANTHROPIC_API_KEY > mock
 */
function resolveProvider(): "openai" | "anthropic" | "mock" {
  if (AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (AI_PROVIDER === "anthropic" && process.env.ANTHROPIC_API_KEY)
    return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

/**
 * Generate a streaming response for the given chat request.
 *
 * If `request.documentIds` is provided, retrieves relevant chunks
 * via TF-IDF and prepends them to the context as a system prompt.
 */
export async function generateChatResponse(
  request: ChatRequest
): Promise<ChatGenerationResult> {
  // 1. RAG retrieval (if documents are specified)
  let ragContext: {
    chunks: RetrievalResult[];
    systemPrompt: string;
  } | undefined;

  if (request.documentIds && request.documentIds.length > 0) {
    const lastUserMessage = [...request.messages]
      .reverse()
      .find((m) => m.role === "user");

    if (lastUserMessage) {
      const chunks = retrieveRelevantChunks(
        lastUserMessage.content,
        RAG_TOP_K,
        request.documentIds
      );

      if (chunks.length > 0) {
        const systemPrompt = buildRagSystemPrompt(chunks);
        ragContext = { chunks, systemPrompt };
      }
    }
  }

  // 2. Generate the stream
  const provider = resolveProvider();

  if (provider === "openai") {
    return generateOpenAIStream(request, ragContext);
  }

  if (provider === "anthropic") {
    return generateAnthropicStream(request, ragContext);
  }

  // Mock fallback
  return {
    stream: generateMockStream(request, ragContext),
    ragContext,
  };
}

/**
 * Generate a streaming response using OpenAI via Vercel AI SDK.
 */
async function generateOpenAIStream(
  request: ChatRequest,
  ragContext?: { chunks: RetrievalResult[]; systemPrompt: string }
): Promise<ChatGenerationResult> {
  const openai = getOpenAIProvider();
  if (!openai) {
    // Race condition: API key was removed between resolveProvider and here
    return {
      stream: generateMockStream(request, ragContext),
      ragContext,
    };
  }

  const messages = buildMessages(request, ragContext);

  const result = streamText({
    model: openai(AI_MODEL),
    messages,
    temperature: AI_TEMPERATURE,
    maxTokens: AI_MAX_TOKENS,
  });

  // Convert the AI SDK's text stream (AsyncIterable<string>) to a
  // ReadableStream<Uint8Array> for compatibility with our API route.
  return {
    stream: textStreamToReadableStream(result.textStream),
    ragContext,
  };
}

/**
 * Generate a streaming response using Anthropic via Vercel AI SDK.
 */
async function generateAnthropicStream(
  request: ChatRequest,
  ragContext?: { chunks: RetrievalResult[]; systemPrompt: string }
): Promise<ChatGenerationResult> {
  const anthropic = getAnthropicProvider();
  if (!anthropic) {
    return {
      stream: generateMockStream(request, ragContext),
      ragContext,
    };
  }

  const messages = buildMessages(request, ragContext);

  const result = streamText({
    model: anthropic(AI_MODEL),
    messages,
    temperature: AI_TEMPERATURE,
    maxTokens: AI_MAX_TOKENS,
  });

  return {
    stream: textStreamToReadableStream(result.textStream),
    ragContext,
  };
}

/**
 * Convert an AsyncIterable<string> (Vercel AI SDK's text stream) into a
 * ReadableStream<Uint8Array> (Web Streams API) that Next.js Route Handlers
 * can return directly.
 */
function textStreamToReadableStream(
  iterable: AsyncIterable<string>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of iterable) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

/**
 * Build the messages array for the AI SDK, including the RAG system prompt
 * if available.
 *
 * The AI SDK accepts a `system` parameter separately, but for RAG we
 * include it as the first message to keep the protocol uniform across
 * providers (some providers handle `system` differently).
 */
function buildMessages(
  request: ChatRequest,
  ragContext?: { chunks: RetrievalResult[]; systemPrompt: string }
) {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> =
    [];

  if (ragContext) {
    messages.push({
      role: "system",
      content: ragContext.systemPrompt,
    });
  }

  for (const m of request.messages) {
    messages.push({
      role: m.role,
      content: m.content,
    });
  }

  return messages;
}

/**
 * Build the system prompt for RAG-augmented chat.
 */
function buildRagSystemPrompt(chunks: RetrievalResult[]): string {
  const chunksText = chunks
    .map(
      (c, i) =>
        `--- مصدر ${i + 1}: ${c.documentName} (قطعة ${c.chunkIdx + 1}) ---\n${c.chunkText}`
    )
    .join("\n\n");

  return `أنت مساعد ذكي يستخدم سياق المستندات التالية للإجابة على أسئلة المستخدم.

السياق (من المستندات المرفوعة):
${chunksText}

تعليمات:
1. أجب على سؤال المستخدم بناءً على السياق المقدم فقط.
2. اذكر اسم المستند الذي أخذت منه المعلومة.
3. إذا لم تكن الإجابة موجودة في السياق، قل ذلك بصراحة.
4. أجب باللغة نفسها التي استخدمها المستخدم (عربي/إنجليزي).`;
}

/**
 * Mock streaming response generator — for development without API keys.
 *
 * In RAG mode, it acknowledges the retrieved context.
 * Otherwise, it produces a generic Arabic response.
 */
function generateMockStream(
  request: ChatRequest,
  ragContext?: { chunks: RetrievalResult[]; systemPrompt: string }
): ReadableStream<Uint8Array> {
  const lastUserMessage = [...request.messages]
    .reverse()
    .find((m) => m.role === "user");

  const userText = lastUserMessage?.content?.trim() ?? "";

  const responses: string[] = [];

  if (ragContext && ragContext.chunks.length > 0) {
    responses.push(
      `📚 **وضع RAG مفعّل** — تم استرجاع ${ragContext.chunks.length} قطعة من المستندات:\n\n`
    );
    ragContext.chunks.forEach((c, i) => {
      responses.push(
        `**مصدر ${i + 1}**: ${c.documentName} (قطعة ${c.chunkIdx + 1}) — التشابه: ${(c.score * 100).toFixed(1)}%\n`
      );
    });
    responses.push(
      `\n**سؤالك**: ${userText.slice(0, 300)}${userText.length > 300 ? "..." : ""}\n\n`
    );
    responses.push(
      `هذا رد تجريبي (mock mode). لتفعيل الردود الحقيقية، أضف \`OPENAI_API_KEY\` إلى \`.env.local\`.\n\n`
    );
    responses.push(
      `**معاينة السياق المُحقن**:\n\`\`\`\n${ragContext.systemPrompt.slice(0, 400)}...\n\`\`\``
    );
  } else if (!userText) {
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
      `هذا رد تجريبي (mock mode). لتفعيل الردود الحقيقية:\n`,
      `1. أضف OPENAI_API_KEY إلى .env.local\n`,
      `2. أعد تشغيل npm run dev\n\n`,
      `لتفعيل RAG، ارفع مستندًا من الشريط الجانبي وحدده. 📚`
    );
  }

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (const chunk of responses) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}
