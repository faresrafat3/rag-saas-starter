import { NextRequest, NextResponse } from "next/server";
import { listDocuments, deleteDocument } from "@/lib/db";
import { invalidateIdfCache } from "@/lib/embeddings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/documents
 * Returns metadata for all uploaded documents (excludes content).
 */
export async function GET() {
  try {
    const docs = listDocuments();
    return NextResponse.json({
      documents: docs,
      count: docs.length,
    });
  } catch (error) {
    console.error("[api/documents GET] error:", error);
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents
 * Delete all documents, OR a single document if ?id=... is provided.
 *
 * For single-document delete, prefer DELETE /api/documents/[id].
 */
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const ok = deleteDocument(id);
      if (!ok) {
        return NextResponse.json(
          { error: `Document not found: ${id}` },
          { status: 404 }
        );
      }
      invalidateIdfCache();
      return NextResponse.json({ success: true, deleted: id });
    }

    // Delete all (not exposed by default — clients should call /api/documents/[id] one-by-one)
    return NextResponse.json(
      {
        error:
          "Bulk delete is not supported. Call DELETE /api/documents/[id] for each document.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[api/documents DELETE] error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
