import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  insertDocument,
  insertChunks,
  insertEmbedding,
  getDocument,
} from "@/lib/db";
import { chunkText } from "@/lib/chunking";
import { embed, invalidateIdfCache } from "@/lib/embeddings";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".json",
  ".csv",
]);

/**
 * POST /api/documents/upload
 *
 * Accepts a single file in multipart/form-data (field name: "file").
 * Stores the document, chunks it, embeds each chunk, and persists embeddings.
 *
 * Returns the document metadata on success.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Use field name 'file'." },
        { status: 400 }
      );
    }

    // Validate MIME type / extension
    const fileName = file.name;
    const ext = "." + (fileName.split(".").pop() ?? "").toLowerCase();
    const mimeType = file.type || "application/octet-stream";

    const isValidMime = ALLOWED_MIME_TYPES.has(mimeType);
    const isValidExt = ALLOWED_EXTENSIONS.has(ext);

    if (!isValidMime && !isValidExt) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${mimeType || ext}`,
          allowed: Array.from(ALLOWED_EXTENSIONS),
        },
        { status: 415 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large: ${file.size} bytes (max ${MAX_FILE_SIZE})`,
        },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      );
    }

    // Read content
    const content = await file.text();

    // Insert document
    const docId = generateId("doc");
    const document = insertDocument({
      id: docId,
      name: fileName,
      size: file.size,
      content,
      mime_type: mimeType,
    });

    // Chunk the document
    const chunks = chunkText(content);
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "Document produced no chunks (empty or whitespace-only?)" },
        { status: 422 }
      );
    }

    // Insert chunks
    const chunkRecords = chunks.map((c) => ({
      id: generateId("chunk"),
      idx: c.idx,
      text: c.text,
    }));
    insertChunks(docId, chunkRecords);

    // Embed each chunk and store
    for (const chunk of chunkRecords) {
      const { vector, norm } = embed(chunk.text);
      insertEmbedding(chunk.id, vector, norm);
    }

    // Invalidate IDF cache (new document affects IDF computation)
    invalidateIdfCache();

    // Revalidate the documents list (if we use ISR anywhere)
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        document: {
          id: document.id,
          name: document.name,
          size: document.size,
          mime_type: document.mime_type,
          chunk_count: chunkRecords.length,
          created_at: document.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/documents/upload] error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload document",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/upload — return info about this endpoint.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/documents/upload",
    method: "POST",
    description: "Upload a document (TXT/MD/JSON/CSV) for RAG",
    maxFileSize: `${MAX_FILE_SIZE} bytes`,
    allowedTypes: Array.from(ALLOWED_EXTENSIONS),
    fieldName: "file",
  });
}
