# 📋 Changelog

All notable changes to rag-saas-starter will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added (الجلسة 5 — RAG pipeline + document management)

#### Fixes from session 4 audit
- `.eslintrc.json` — extends `next/core-web-vitals` + `next/typescript` + custom rules
- `next.config.ts` — removed `experimental.serverActions` (was triggering build warning)
- `CONTEXT.md` — documented the mock streaming nature (large chunks vs tokens)

#### RAG infrastructure
- `lib/db.ts` — SQLite layer (better-sqlite3) with schema:
  - documents (id, name, size, content, mime_type, chunk_count, status, timestamps)
  - chunks (id, document_id, idx, text) — with cascade delete + indexes
  - embeddings (chunk_id, vector_json, norm) — TF-IDF vectors
  - WAL mode + foreign keys enabled
  - Singleton connection with lazy init
- `lib/chunking.ts` — sentence-based chunker:
  - Splits on `.!?؟۔؛` (Arabic + English terminators)
  - Configurable max/min chunk size + overlap
  - Hard-splits overly long sentences
  - Stats utility for debugging
- `lib/embeddings.ts` — local TF-IDF embeddings:
  - Arabic + English stopwords (200+ words filtered)
  - Arabic normalization (diacritics, alef variants, ta marbuta)
  - Smoothed IDF (log((1+N)/(1+df)) + 1)
  - Cosine similarity for retrieval
  - IDF cache with invalidation on doc add/remove
  - `retrieveRelevantChunks(query, topK, documentIds?)` — top-K retrieval
- `lib/ai-config.ts` — client-safe constants (split from `ai-provider.ts`)

#### API routes
- `POST /api/documents/upload` — multipart/form-data file upload
  - Validates MIME type (.txt/.md/.json/.csv) + size (5MB max)
  - Reads content → chunks → embeds → stores
  - Returns document metadata on success
- `GET /api/documents` — list all documents (excludes content)
- `GET /api/documents/[id]` — single document + its chunks (preview only)
- `DELETE /api/documents/[id]` — cascade delete (doc + chunks + embeddings)
- Modified `POST /api/chat`:
  - Switched to Node.js runtime (better-sqlite3 requires Node)
  - Accepts optional `documentIds` for RAG retrieval
  - Returns `x-rag-context` header with retrieval metadata
- Modified `lib/ai-provider.ts`:
  - `generateChatResponse()` now returns `{ stream, ragContext }`
  - When `documentIds` provided, retrieves top-K chunks via TF-IDF
  - Builds Arabic system prompt with retrieved context + citation instructions

#### UI components
- `components/chat/document-panel.tsx` — sidebar for document management:
  - File upload (button + hidden input)
  - Document list with selection (click to toggle RAG activation)
  - Delete per document (with confirmation)
  - Error banner with dismiss button
  - Empty state
  - Footer showing active document count
- `components/chat/chat-provider.tsx` — React context for shared state:
  - `selectedDocumentIds` (multi-doc selection)
  - `toggleDocumentSelection(id)`
  - `documentRefreshKey` (forces DocumentPanel to refetch)
- Modified `app/page.tsx`:
  - Desktop layout: 320px sidebar (DocumentPanel) + chat
  - Mobile layout: chat only (documents panel toggle TODO session 5B)
- Modified `components/chat/chat-container.tsx`:
  - Reads `selectedDocumentIds` from context
  - Includes `documentIds` in `/api/chat` request body
  - User message stores `documentIds` for reference

#### Configuration
- `better-sqlite3` dependency added
- `@types/better-sqlite3` dev dependency added
- `.gitignore` — added `data/` (SQLite db + WAL files)

### Verified
- ✅ TypeScript: no errors (`tsc --noEmit`)
- ✅ Production build: success (6 routes)
- ✅ Document upload: HTTP 201 with chunk metadata
- ✅ Document list: HTTP 200
- ✅ Document delete: cascade works
- ✅ RAG retrieval: TF-IDF scoring works (11.8% similarity on test query)
- ✅ Chat with RAG: returns context-aware mock response + x-rag-context header
- ✅ Chat without RAG: falls back to original mock behavior
- ✅ Arabic + RTL: all UI strings and responses in Arabic

### Changed
- `app/api/chat/route.ts` — switched from edge runtime to Node.js runtime (better-sqlite3 requirement)
- `lib/ai-provider.ts` — `generateChatResponse()` return type changed from `ReadableStream` to `{ stream, ragContext }`
- `components/chat/chat-header.tsx` — imports `IS_MOCK_MODE` from `lib/ai-config` (not `ai-provider`) for client safety

### Fixed
- (from session 4 audit) `.eslintrc.json` added — no longer relying on next defaults
- (from session 4 audit) `experimental.serverActions` removed — no more build warning
- (from session 4 audit) `tsconfig.tsbuildinfo` added to `.gitignore`
- Client/server module split — `lib/ai-config.ts` (client-safe) vs `lib/ai-provider.ts` (server-only)

## [0.1.0] - 2026-06-29 (Session 4)

### Added
- Next.js 16 + TypeScript + Tailwind CSS 4 setup
- shadcn/ui base components (Button, Input, Card, ScrollArea, Avatar, DropdownMenu)
- Chat interface UI (message list + input + send button + typing indicator)
- Empty state with feature highlights + example prompts
- API route `/api/chat` (edge runtime, mock streaming)
- Arabic + RTL support افتراضي
- Dark mode toggle (system/light/dark)
- Project Constitution (CONSTITUTION.md)
- Context file for agents (CONTEXT.md)
- Initial README, CHANGELOG, LICENSE, .gitignore, .env.example
