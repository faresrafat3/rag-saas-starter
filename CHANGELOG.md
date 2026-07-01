# 📋 Changelog

All notable changes to rag-saas-starter will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added (الجلسة 5 ب — Provider integration + persistence + mobile)

#### Fixes from session 5A audit
- `README.md` — added comprehensive "Limitations & Production Notes" section covering:
  - MVP limitations (no PDF, TF-IDF demo-only, SQLite local-only, localStorage 5MB cap, no tests)
  - Security considerations (no auth, no file scanning, no rate limiting)
  - Performance notes (TF-IDF O(N), better-sqlite3 requires Node runtime)
- Verified: no remaining `require()` calls in any `.ts` file

#### Provider integration (real AI)
- `lib/ai-provider.ts` — full Vercel AI SDK integration:
  - `streamText()` from `ai` package with `@ai-sdk/openai` and `@ai-sdk/anthropic`
  - Provider resolution: explicit `AI_PROVIDER` env > `OPENAI_API_KEY` > `ANTHROPIC_API_KEY` > mock
  - Lazy provider instantiation (only when API key present)
  - `textStreamToReadableStream()` helper — converts AI SDK's `AsyncIterable<string>` to `ReadableStream<Uint8Array>`
  - Mock fallback when no API key configured (preserves RAG context awareness)
  - RAG system prompt injected as first message (provider-agnostic)
  - Builds messages with proper role typing (system/user/assistant)

#### Persistence (localStorage)
- `lib/persistence.ts` — client-safe localStorage helpers:
  - `loadMessages()` / `saveMessages()` — chat history (capped at 100 messages)
  - `loadSelectedDocIds()` / `saveSelectedDocIds()` — selected documents
  - Quota-exceeded handling: trims to half-capacity on QuotaExceededError
  - SSR-safe: detects `typeof window === "undefined"` and returns empty
  - All operations wrapped in try/catch (best-effort, never throws)
- `components/chat/chat-provider.tsx` — persists `selectedDocumentIds` on change
- `components/chat/chat-container.tsx` — loads messages on mount, saves on every change

#### Mobile responsive
- `components/chat/mobile-doc-drawer.tsx` — slide-out drawer for documents panel:
  - Pure CSS transitions (no Radix Sheet dependency)
  - Overlay with click-to-close
  - Escape key to close
  - Body scroll lock when open
  - 85vw width, max 384px (max-w-sm)
- `components/chat/chat-header.tsx` — added mobile toggle button:
  - Visible only on screens < md breakpoint
  - PanelRight icon with notification dot when documents are selected
  - Removed unused `NEXT_PUBLIC_AI_PROVIDER_LABEL` env reference
- `app/page.tsx` — renders MobileDocDrawer (mobile-only)

#### Documentation
- `README.md` — full rewrite with:
  - Features list (implemented vs coming)
  - Tech stack table
  - Quick Start with first steps guide
  - "How It Works" section with RAG pipeline diagram
  - Provider modes table
  - Limitations & Production Notes (3 subsections)
  - Project structure (full tree)
  - Acknowledgments with attribution

### Verified
- ✅ TypeScript: no errors
- ✅ Production build: 6 routes
- ✅ Dev server: HTTP 200 on all endpoints
- ✅ Mock mode chat: works (with and without RAG)
- ✅ RAG retrieval: works (11.8% similarity on test)
- ✅ Provider resolution: detects mock mode correctly
- ✅ Headers: `x-ai-provider` and `x-rag-context` present
- ✅ SQLite persistence: documents survive restart
- ✅ Mobile drawer: renders only on small screens

### Changed
- `lib/ai-provider.ts` — `generateChatResponse()` now uses real `streamText()` when API key is present (was: mock only)
- `components/chat/chat-provider.tsx` — added `setSelectedDocumentIds`, `mobileDrawerOpen`, `setMobileDrawerOpen` to context value
- `components/chat/chat-container.tsx` — initial state loaded from `loadMessages()` (was: empty array)

### Fixed
- (from session 5A audit) README now documents all limitations honestly
- (from session 5A audit) No remaining `require()` calls
- (from session 5A audit) Mobile layout now has functional drawer toggle (was: "TODO session 5B")

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
