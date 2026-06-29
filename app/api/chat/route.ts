import { NextRequest } from "next/server";
import { generateChatResponse, IS_MOCK_MODE } from "@/lib/ai-provider";
import type { ChatRequest } from "@/lib/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;

    // Basic validation
    if (!body?.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    if (body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array cannot be empty" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const stream = await generateChatResponse(body);

    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        "x-ai-provider": IS_MOCK_MODE ? "mock" : process.env.AI_PROVIDER ?? "mock",
      },
    });
  } catch (error) {
    console.error("[api/chat] error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      endpoint: "/api/chat",
      method: "POST",
      description: "Streaming chat endpoint (Vercel AI SDK pattern)",
      provider: IS_MOCK_MODE ? "mock" : process.env.AI_PROVIDER ?? "mock",
    }),
    { headers: { "content-type": "application/json" } }
  );
}
