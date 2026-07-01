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
 *
 * Session 5 update: RAG context injection.
 * If the request includes `documentIds`, relevant chunks are retrieved
 * via TF-IDF and prepended to the system context.
 */

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

// Re-export for backwards compatibility with any code that imports from here
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
 * Generate a streaming response for the given chat request.
 *
 * If `request.documentIds` is provided, retrieves relevant chunks
 * via TF-IDF and prepends them to the context.
 */
export async function generateChatResponse(
  request: ChatRequest
): Promise<ChatGenerationResult> {
  // 1. RAG retrieval (if documents are specified)
  let ragContext: { chunks: RetrievalResult[]; systemPrompt: string } | undefined;

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
  const stream = IS_MOCK_MODE
    ? generateMockStream(request, ragContext)
    : generateMockStream(request, ragContext); // Real provider integration is in session 5B

  return { stream, ragContext };
}

/**
 * Build the system prompt for RAG-augmented chat.
 *
 * The prompt instructs the assistant to:
 * - Use the provided context chunks
 * - Cite which document each piece of info came from
 * - Admit when the answer is not in the context
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
    // RAG mode — show what was retrieved
    responses.push(
      `📚 **وضع RAG مفعّل** — تم استرجاع ${ragContext.chunks.length} قطعة من المستندات:\n\n`
    );
    ragContext.chunks.forEach((c, i) => {
      responses.push(
        `**مصدر ${i + 1}**: ${c.documentName} (قطعة ${c.chunkIdx + 1}) — التشابه: ${(c.score * 100).toFixed(1)}%\n`
      );
    });
    responses.push(`\n**سؤالك**: ${userText.slice(0, 300)}${userText.length > 300 ? "..." : ""}\n\n`);
    responses.push(
      `هذا رد تجريبي. في الجلسة 5 ب، سيتم استدعاء OpenAI/Anthropic فعليًا ` +
      `مع السياق المرفق كـ system prompt للإجابة الحقيقية.\n\n`
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
