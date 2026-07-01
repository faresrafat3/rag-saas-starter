import { NextRequest } from "next/server";
import { generateChatResponse, IS_MOCK_MODE } from "@/lib/ai-provider";
import type { ChatRequest } from "@/lib/types";

// Note: switched to nodejs runtime because RAG retrieval uses better-sqlite3,
// which is not compatible with edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;

    // Basic validation
    if (!body?.messages || !Array.isArray(body.messages)) {
      return Response.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    if (body.messages.length === 0) {
      return Response.json(
        { error: "messages array cannot be empty" },
        { status: 400 }
      );
    }

    const { stream, ragContext } = await generateChatResponse(body);

    const headers: Record<string, string> = {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-ai-provider": IS_MOCK_MODE ? "mock" : process.env.AI_PROVIDER ?? "mock",
    };

    if (ragContext) {
      headers["x-rag-context"] = encodeURIComponent(
        JSON.stringify({
          chunkCount: ragContext.chunks.length,
          sources: ragContext.chunks.map((c) => ({
            document: c.documentName,
            chunkIdx: c.chunkIdx,
            score: Number(c.score.toFixed(4)),
          })),
        })
      );
    }

    return new Response(stream, { headers });
  } catch (error) {
    console.error("[api/chat] error:", error);
    return Response.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    endpoint: "/api/chat",
    method: "POST",
    description: "Streaming chat endpoint with optional RAG context",
    provider: IS_MOCK_MODE ? "mock" : process.env.AI_PROVIDER ?? "mock",
    supportsRag: true,
  });
}
