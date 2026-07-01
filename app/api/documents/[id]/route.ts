import { NextRequest, NextResponse } from "next/server";
import { getDocument, deleteDocument, getChunksForDocument } from "@/lib/db";
import { invalidateIdfCache } from "@/lib/embeddings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/documents/[id]
 * Returns full document metadata + chunks (no embeddings — too large).
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const doc = getDocument(id);

    if (!doc) {
      return NextResponse.json(
        { error: `Document not found: ${id}` },
        { status: 404 }
      );
    }

    const chunks = getChunksForDocument(id);

    return NextResponse.json({
      document: {
        id: doc.id,
        name: doc.name,
        size: doc.size,
        mime_type: doc.mime_type,
        chunk_count: doc.chunk_count,
        status: doc.status,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      },
      chunks: chunks.map((c) => ({
        id: c.id,
        idx: c.idx,
        text: c.text,
        // Truncate very long chunks for preview
        preview:
          c.text.length > 200 ? c.text.slice(0, 200) + "..." : c.text,
      })),
    });
  } catch (error) {
    console.error("[api/documents/[id] GET] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Deletes a document and its chunks + embeddings (cascades).
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ok = deleteDocument(id);

    if (!ok) {
      return NextResponse.json(
        { error: `Document not found: ${id}` },
        { status: 404 }
      );
    }

    invalidateIdfCache();
    return NextResponse.json({ success: true, deleted: id });
  } catch (error) {
    console.error("[api/documents/[id] DELETE] error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
