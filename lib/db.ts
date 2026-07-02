/**
 * SQLite Database Layer for rag-saas-starter
 * =============================================================================
 * Stores documents and their chunk embeddings for RAG.
 *
 * Schema:
 * - documents: metadata (id, name, size, content, created_at, status)
 * - chunks: text chunks of documents (id, document_id, idx, text)
 * - embeddings: TF-IDF vectors per chunk (id, chunk_id, vector_json)
 *
 * Note: better-sqlite3 only works in Node.js runtime, not Edge.
 * Routes using this module MUST set `export const runtime = 'nodejs'`.
 */

import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const DB_PATH =
  process.env.DATABASE_URL?.replace(/^file:/, "") ??
  join(process.cwd(), "data", "rag.db");

let dbInstance: DatabaseType | null = null;

/**
 * Get a singleton database connection.
 * Initializes the schema on first call.
 */
export function getDb(): DatabaseType {
  if (dbInstance) return dbInstance;

  // Ensure data directory exists
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      size INTEGER NOT NULL,
      content TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'text/plain',
      chunk_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ready',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      idx INTEGER NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      UNIQUE(document_id, idx)
    );

    CREATE TABLE IF NOT EXISTS embeddings (
      chunk_id TEXT PRIMARY KEY,
      vector_json TEXT NOT NULL,
      norm REAL NOT NULL,
      FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
    CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_id ON embeddings(chunk_id);
  `);

  dbInstance = db;
  return db;
}

/**
 * Close the database connection (for graceful shutdown / tests).
 */
export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// === Types ===

export interface DocumentRecord {
  id: string;
  name: string;
  size: number;
  content: string;
  mime_type: string;
  chunk_count: number;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface ChunkRecord {
  id: string;
  document_id: string;
  idx: number;
  text: string;
}

export interface EmbeddingRecord {
  chunk_id: string;
  vector_json: string;
  norm: number;
}

// === Document operations ===

export function insertDocument(
  doc: Omit<DocumentRecord, "created_at" | "updated_at" | "chunk_count" | "status"> &
    Partial<Pick<DocumentRecord, "chunk_count" | "status">>
): DocumentRecord {
  const db = getDb();
  const now = Date.now();
  const record: DocumentRecord = {
    id: doc.id,
    name: doc.name,
    size: doc.size,
    content: doc.content,
    mime_type: doc.mime_type,
    chunk_count: doc.chunk_count ?? 0,
    status: doc.status ?? "ready",
    created_at: now,
    updated_at: now,
  };

  db.prepare(
    `INSERT INTO documents (id, name, size, content, mime_type, chunk_count, status, created_at, updated_at)
     VALUES (@id, @name, @size, @content, @mime_type, @chunk_count, @status, @created_at, @updated_at)`
  ).run(record);

  return record;
}

export function getDocument(id: string): DocumentRecord | null {
  return getDb().prepare("SELECT * FROM documents WHERE id = ?").get(id) as
    | DocumentRecord
    | null;
}

export function listDocuments(): DocumentRecord[] {
  return getDb()
    .prepare(
      "SELECT id, name, size, mime_type, chunk_count, status, created_at, updated_at FROM documents ORDER BY created_at DESC"
    )
    .all() as Omit<DocumentRecord, "content">[] as DocumentRecord[];
}

export function deleteDocument(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM documents WHERE id = ?").run(id);
  return result.changes > 0;
}

// === Chunk operations ===

export function insertChunks(
  documentId: string,
  chunks: { id: string; idx: number; text: string }[]
): void {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO chunks (id, document_id, idx, text) VALUES (@id, @document_id, @idx, @text)`
  );
  const updateDocChunkCount = db.prepare(
    `UPDATE documents SET chunk_count = ?, updated_at = ? WHERE id = ?`
  );

  const tx = db.transaction((items: typeof chunks) => {
    for (const c of items) {
      stmt.run({ ...c, document_id: documentId });
    }
    updateDocChunkCount.run(items.length, Date.now(), documentId);
  });
  tx(chunks);
}

export function getChunksForDocument(documentId: string): ChunkRecord[] {
  return getDb()
    .prepare(
      "SELECT * FROM chunks WHERE document_id = ? ORDER BY idx ASC"
    )
    .all(documentId) as ChunkRecord[];
}

export function getAllChunksWithDocuments(): Array<
  ChunkRecord & { document_name: string }
> {
  return getDb()
    .prepare(
      `SELECT c.*, d.name as document_name
       FROM chunks c
       JOIN documents d ON c.document_id = d.id
       ORDER BY c.document_id, c.idx`
    )
    .all() as Array<ChunkRecord & { document_name: string }>;
}

// === Embedding operations ===

export function insertEmbedding(
  chunkId: string,
  vector: Record<string, number>,
  norm: number
): void {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO embeddings (chunk_id, vector_json, norm) VALUES (?, ?, ?)`
  ).run(chunkId, JSON.stringify(vector), norm);
}

export function getAllEmbeddings(): Array<{
  chunk_id: string;
  vector_json: string;
  norm: number;
}> {
  return getDb().prepare("SELECT * FROM embeddings").all() as Array<{
    chunk_id: string;
    vector_json: string;
    norm: number;
  }>;
}

export function getEmbeddingsForDocuments(
  documentIds: string[]
): Array<{
  chunk_id: string;
  vector_json: string;
  norm: number;
  document_id: string;
  chunk_text: string;
}> {
  if (documentIds.length === 0) return [];
  const placeholders = documentIds.map(() => "?").join(",");
  return getDb()
    .prepare(
      `SELECT e.chunk_id, e.vector_json, e.norm, c.document_id, c.text as chunk_text
       FROM embeddings e
       JOIN chunks c ON e.chunk_id = c.id
       WHERE c.document_id IN (${placeholders})`
    )
    .all(...documentIds) as Array<{
    chunk_id: string;
    vector_json: string;
    norm: number;
    document_id: string;
    chunk_text: string;
  }>;
}
