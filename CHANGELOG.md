# 📋 Changelog

All notable changes to rag-saas-starter will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added (الجلسة 5 ج — Tests + Polish fixes)

#### Fixes from session 5B audit
- **Error handling for API errors**: `textStreamToReadableStream()` now catches stream errors and emits user-friendly Arabic messages (401, 429, 5xx, network errors) instead of leaking raw error to the client
- **Focus trap for mobile drawer**: `mobile-doc-drawer.tsx` now saves/restores focus, moves focus into drawer on open, traps Tab key within drawer (accessibility)
- **"Clear chat" button**: Added to `chat-header.tsx` (Trash2 icon, visible only when there are messages, with confirmation)
- **Don't save streaming messages**: `chat-container.tsx` now skips localStorage save while streaming or while any message has `isStreaming: true`
- **Loading state**: Added `isLoading` state to `chat-container.tsx` — shows "جارٍ التحميل..." instead of empty state during initial localStorage load

#### Bug fixes
- **`chunkText` now preserves tiny single chunks**: Previously, text shorter than `minChunkSize` (default 100) returned an empty array. Now the final flush accepts the chunk if it's the only one (prevents data loss).
- **Arabic stopwords normalization**: Added normalized variants (`علي` for `على`, `الي` for `إلى`, etc.) so stopwords are correctly filtered after alef/ya normalization
- **Tokenizer regex fix**: Narrowed Arabic Unicode range from `\u0600-\u06FF` to `\u0621-\u064A\u0660-\u0669\u066E-\u06D2` to exclude Arabic punctuation (؟ ؛ ،) from tokens

#### Test infrastructure
- **Vitest** installed (`vitest` + `@vitest/coverage-v8`)
- `vitest.config.ts` — Node environment, path alias `@`, coverage config
- `package.json` — added `test`, `test:watch`, `test:coverage` scripts; bumped version to 0.3.0

#### Unit tests (71 tests, all passing)
- `lib/chunking.test.ts` (22 tests):
  - Basic splitting (empty, short, single Arabic sentence)
  - English terminators (`.`, `!`, `?`)
  - Arabic terminators (`.`, `؟`, `؛`)
  - Mixed Arabic + English
  - Chunk size constraints (maxChunkSize, minChunkSize, hard-split oversized)
  - Overlap behavior
  - Sequential indices
  - Edge cases (only terminators, multiple spaces, newlines)
  - `getChunkStats` utility
- `lib/embeddings.test.ts` (30 tests):
  - Tokenization (English, Arabic, mixed)
  - Normalization (lowercase, diacritics, alef variants, ya, ta marbuta, tatweel)
  - Stopwords filtering (English + Arabic + length-based)
  - Special characters (punctuation, numbers, mixed)
  - `embed()` (zero norm for stopwords-only, identical vectors for identical text)
  - `cosineSimilarity()` (identical, disjoint, zero norm, partial overlap)
- `lib/persistence.test.ts` (19 tests):
  - `loadMessages` (empty, valid, invalid JSON, non-array, invalid objects)
  - `saveMessages` (basic, truncate at MAX_MESSAGES=100, empty array)
  - `clearMessages`
  - `loadSelectedDocIds` / `saveSelectedDocIds`
  - SSR safety (window undefined)

#### Refactors
- `lib/embeddings.ts`:
  - `computeIdf()` now wrapped in try/catch — falls back to empty IDF if DB unavailable (enables unit testing without SQLite)
  - `embed()` returns zero vector if all tokens are filtered as stopwords (previously returned non-zero with default IDF)
  - Exported `ARABIC_STOPWORDS` and `ENGLISH_STOPWORDS` for test access
- `components/chat/chat-provider.tsx`:
  - Lifted `messages` + `setMessages` to context (so header can read `hasMessages` + `clearChat`)
  - Added `clearChat` action (clears messages + localStorage)
  - Added `hasMessages` flag

### Verified
- ✅ TypeScript: no errors
- ✅ Production build: 6 routes
- ✅ All 71 tests pass
- ✅ Test coverage: chunking + embeddings + persistence fully covered

### Changed
- `lib/ai-provider.ts` — `textStreamToReadableStream()` now emits error messages instead of calling `controller.error()`
- `components/chat/mobile-doc-drawer.tsx` — added focus trap + focus restore
- `components/chat/chat-header.tsx` — added Clear chat button
- `components/chat/chat-container.tsx` — uses context messages, loading state, skip-save-during-streaming
- `lib/chunking.ts` — `flush()` accepts `isFinal` param to preserve single tiny chunks
- `lib/embeddings.ts` — narrowed tokenizer regex, added stopword variants, made `computeIdf` DB-optional

### Fixed
- (from session 5B audit) API errors now produce user-friendly Arabic messages
- (from session 5B audit) Mobile drawer has focus trap (accessibility)
- (from session 5B audit) Clear chat button added
- (from session 5B audit) Streaming messages not saved to localStorage
- (from session 5B audit) Loading state prevents flash of empty state
- (bug) `chunkText` no longer drops short text
- (bug) Arabic stopwords now match after normalization
- (bug) Tokenizer no longer includes Arabic punctuation in tokens

## [0.3.0] - 2026-06-29 (Session 5B)

### Added
- Vercel AI SDK `streamText()` integration with OpenAI/Anthropic providers
- Mock fallback when no API key configured
- `lib/persistence.ts` — localStorage helpers (messages + selected docs)
- `components/chat/mobile-doc-drawer.tsx` — pure CSS drawer
- Mobile toggle button in chat header
- README: Limitations & Production Notes section (MVP limits, security, performance)

### Fixed
- README now documents all limitations honestly
- No remaining `require()` calls
- Mobile layout has functional drawer toggle

## [0.2.0] - 2026-06-29 (Session 5A)

### Added
- SQLite storage (better-sqlite3) — documents + chunks + embeddings
- Sentence-based chunker (Arabic + English terminators)
- Local TF-IDF embeddings (zero-dependency, works offline)
- Document upload API (POST /api/documents/upload)
- Document management API (GET/DELETE /api/documents, /api/documents/[id])
- RAG-augmented chat (TF-IDF retrieval + context injection)
- Document panel UI (sidebar with upload/select/delete)
- ChatContext for shared state (selectedDocumentIds)
- Multi-document selection support (UI + API)
- Client/server module split (ai-config vs ai-provider)

### Fixed
- `.eslintrc.json` added (from session 4 audit)
- `experimental.serverActions` removed from next.config.ts
- `tsconfig.tsbuildinfo` added to .gitignore
- `CONTEXT.md` documented mock streaming nature

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
