# 🚀 rag-saas-starter

> RAG chatbot SaaS starter with Arabic support, multi-document chat, and streaming responses.
>
> Built with Next.js 16 + Vercel AI SDK + shadcn/ui.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8.svg)](https://tailwindcss.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-4-FF0080.svg)](https://sdk.vercel.ai/)
[![Tests: 71](https://img.shields.io/badge/tests-71%20passing-brightgreen.svg)](#testing)
[![Status: WIP](https://img.shields.io/badge/status-WIP-orange.svg)](CHANGELOG.md)

> ⚠️ **Status**: Work in progress — Sessions 4-5 complete (skeleton + chat UI + RAG pipeline + provider integration + persistence). Deployment + screenshots + demo video coming in session 6.

---

## ✨ Features

### Implemented (Sessions 4-5)
- ⚡ **Streaming responses** — Vercel AI SDK `streamText()` with OpenAI provider
- 🌐 **Arabic + RTL support** افتراضي — ميزة تنافسية في السوق العربي
- 📚 **Multi-document RAG** — upload documents, select which ones to query
- 🗂️ **Document management UI** — sidebar with upload/select/delete
- 💾 **Chat history persistence** — localStorage (survives page refresh)
- 📱 **Mobile responsive** — Drawer for documents panel on small screens
- 🎨 **UI** — shadcn/ui + Tailwind + dark/light/system theme
- 🔍 **Local TF-IDF retrieval** — works offline, no API key needed for RAG retrieval
- 🤖 **Provider-agnostic** — OpenAI / Anthropic via Vercel AI SDK; mock mode fallback

### Coming in Session 6
- 🚀 Deployment on Vercel
- 📸 Screenshots
- 🎥 Demo video (60 seconds)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui |
| AI | Vercel AI SDK 4 (`streamText`, `@ai-sdk/openai`, `@ai-sdk/anthropic`) |
| Vector Store (dev) | SQLite (better-sqlite3) — documents, chunks, embeddings |
| Embeddings (dev) | Local TF-IDF (zero-dependency, offline) |
| Embeddings (prod) | OpenAI `text-embedding-3-small` (drop-in replacement) |
| Persistence | localStorage (client) + SQLite (server) |
| Deployment | Vercel |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm / pnpm
- (Optional) OpenAI API key — without it, the app runs in **mock mode** (RAG retrieval still works, but chat responses are mocked)

### Installation

```bash
git clone https://github.com/faresrafat3/rag-saas-starter.git
cd rag-saas-starter
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local — at minimum, set OPENAI_API_KEY for real AI responses

# Run the development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### First Steps

1. **Upload documents**: Click "رفع" in the sidebar (TXT/MD/JSON/CSV files)
2. **Select documents**: Click on uploaded documents to enable them for RAG
3. **Ask questions**: Type in the chat input — the assistant will use the selected documents as context
4. **Toggle theme**: Click the sun/moon icon in the header

---

## ⚠️ Limitations & Production Notes

This is a **starter/learning project**, not production-hardened. Be aware of:

### MVP Limitations
- 📄 **No PDF parsing**: Only TXT/MD/JSON/CSV files supported. To add PDF, install `pdf-parse` and extend `/api/documents/upload`.
- 🔍 **TF-IDF retrieval is for demo only**: Works well on large texts but underperforms on short queries (~11% similarity on test data). For production, replace `lib/embeddings.ts` with OpenAI `text-embedding-3-small` or similar.
- 🗄️ **SQLite is local-only**: Each deployment has its own database. For production, use Supabase pgvector or a managed Postgres.
- 💾 **localStorage has a 5MB limit**: Chat history may be truncated for very long conversations.
- 🧪 **No unit tests yet**: Coming in session 5C.

### Security Considerations
- 🔑 **No authentication**: Anyone with the URL can upload documents and chat. Add NextAuth or Clerk before deploying publicly.
- 📁 **No file content scanning**: Uploaded files are stored as-is. Scan for malicious content in production.
- ⏱️ **No rate limiting**: The `/api/chat` endpoint can be abused. Add rate limiting (e.g., `@upstash/ratelimit`) for production.

### Performance
- 📊 **TF-IDF retrieval is O(N)**: For >1000 chunks, consider migrating to pgvector with HNSW index.
- 🔥 **better-sqlite3 requires Node.js runtime**: The `/api/chat` and `/api/documents/*` routes cannot use Edge runtime.

---

## 📁 Project Structure

```
rag-saas-starter/
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── chat/route.ts             # Streaming chat (RAG-augmented)
│   │   └── documents/
│   │       ├── upload/route.ts       # POST: upload document
│   │       ├── [id]/route.ts         # GET/DELETE: single document
│   │       └── route.ts              # GET: list documents
│   ├── layout.tsx                    # Root layout (RTL, dark mode)
│   ├── page.tsx                      # Main chat page (responsive)
│   └── globals.css                   # Tailwind + RTL + animations
├── components/
│   ├── ui/                           # shadcn/ui (Button, Card, Input, ...)
│   └── chat/
│       ├── chat-header.tsx           # Header + status + theme toggle
│       ├── chat-container.tsx        # Main chat logic + streaming
│       ├── chat-message.tsx          # Message bubble + typing indicator
│       ├── chat-input.tsx            # Input + send/stop button
│       ├── chat-provider.tsx         # Shared state (selected docs)
│       ├── document-panel.tsx        # Sidebar: documents list
│       ├── mobile-doc-drawer.tsx     # Mobile: slide-out drawer
│       ├── empty-state.tsx           # Welcome screen + examples
│       └── theme-toggle.tsx          # Light/dark/system
├── lib/
│   ├── ai-config.ts                  # Client-safe AI constants
│   ├── ai-provider.ts                # Vercel AI SDK + RAG injection
│   ├── chunking.ts                   # Sentence-based chunker
│   ├── db.ts                         # SQLite (better-sqlite3)
│   ├── embeddings.ts                 # Local TF-IDF + retrieval
│   ├── persistence.ts                # localStorage helpers
│   ├── types.ts                      # Shared types
│   └── utils.ts                      # cn(), formatTime(), generateId()
├── docs/screenshots/                 # (will be added in session 6)
├── CONSTITUTION.md                   # Project charter
├── CONTEXT.md                        # Internal context for agents
├── CHANGELOG.md                      # Version history
├── LICENSE                           # MIT
├── .env.example                      # Environment template
└── README.md                         # This file
```

---

## 🧠 How It Works

### RAG Pipeline

```
User uploads file
    ↓
[chunkText()] — sentence-based split (Arabic + English terminators)
    ↓
[embed()] — TF-IDF vectorization (Arabic normalization + stopwords)
    ↓
SQLite storage (documents + chunks + embeddings)
    ↓
User asks question (with selected document IDs)
    ↓
[retrieveRelevantChunks()] — cosine similarity top-K retrieval
    ↓
[buildRagSystemPrompt()] — Arabic system prompt with context + citation rules
    ↓
[streamText()] — Vercel AI SDK → OpenAI / mock fallback
    ↓
Streaming response to client
```

### Provider Modes

| Mode | When | Behavior |
|---|---|---|
| **Real (OpenAI)** | `OPENAI_API_KEY` set in `.env.local` | Uses `streamText()` with `gpt-4o-mini` (configurable) |
| **Mock** | No API key | Returns realistic Arabic mock responses (still shows RAG context) |

---

## 🧪 Testing

This project includes **71 unit tests** (all passing) covering the core RAG logic:

| Test File | Tests | Coverage |
|---|---|---|
| `lib/chunking.test.ts` | 22 | Sentence splitting (Arabic + English terminators), chunk size constraints, overlap, edge cases |
| `lib/embeddings.test.ts` | 30 | Tokenization, Arabic normalization (diacritics/alef/ya/ta marbuta), stopwords, cosine similarity |
| `lib/persistence.test.ts` | 19 | localStorage load/save, SSR safety, quota handling |

### Run Tests

```bash
# Run all tests once
npm test

# Watch mode (during development)
npm run test:watch

# With coverage report
npm run test:coverage
```

### CI/CD

GitHub Actions automatically run on every push/PR:
- `.github/workflows/test.yml` — type-check + tests + coverage
- `.github/workflows/build.yml` — production build verification

---

## 🎨 Cultural Identity

This project applies a **Cultural Skin** (Level A) of Egyptian Heritage design, following the methodology in [`fares-career-lab/METHODOLOGIES/cultural-design-identity.md`](https://github.com/faresrafat3/fares-career-lab/blob/main/METHODOLOGIES/cultural-design-identity.md).

### The 3-Layer Approach

Inspired by **World Cup national team kits** — which blend heritage + idea + authentic craft:

| Layer | Implementation in this project |
|---|---|
| **التراث (Heritage)** | Egyptian Heritage palette (Nile blue `#1B5E8C` + Pharaonic gold `#C9A66B` + sand + papyrus) |
| **الفكرة (Idea)** | Arabic-first UX: RTL default, Arabic microcopy, inspiring empty states (not "no data") |
| **الفن الأصيل (Craft)** | Cairo + Reem Kufi typography, Arabic geometric SVG pattern (8-pointed star), gold gradient accents, consistent spacing rhythm |

### Color Palette

```css
--nile:    #1B5E8C;  /* النيلي — primary */
--gold:    #C9A66B;  /* ذهبي فرعوني — accent */
--sand:    #E6D5B8;  /* رملي — secondary */
--papyrus: #F5EFE0;  /* بردى — background */
--ink:     #1A1A1A;  /* حبر — text */
```

### Typography

- **Body**: Cairo (Google Fonts, OFL) — modern, readable Arabic
- **Headings**: Reem Kufi (Google Fonts, OFL) — cultural identity for titles
- **Mono**: IBM Plex Mono (OFL) — for code blocks

### Geometric Pattern

The empty state features a subtle 8-pointed star (khatam) pattern at 3% opacity — a traditional Islamic geometric motif. See `public/patterns/arabic-geometric.svg`.

---

## 📸 Screenshots

> 🚧 **Coming after deployment** — screenshots will be added once the app is live on Vercel.

| View | Screenshot |
|---|---|
| Empty state (with pattern) | _TODO: `docs/screenshots/empty-state.png`_ |
| Chat conversation | _TODO: `docs/screenshots/chat.png`_ |
| Document panel | _TODO: `docs/screenshots/documents.png`_ |
| RAG in action | _TODO: `docs/screenshots/rag.png`_ |
| Mobile drawer | _TODO: `docs/screenshots/mobile.png`_ |
| Dark mode | _TODO: `docs/screenshots/dark-mode.png`_ |

---

## 🎥 Live Demo

> 🚧 **Coming soon** — the app will be deployed on Vercel.
>
> **Live URL**: _TODO: `https://rag-saas-starter.vercel.app`_
>
> **Demo video** (60 sec): _TODO: YouTube/Loom link_

---

## 🙏 Acknowledgments

This project is a **Smart Remix** built on top of open-source work:

- [Vercel AI SDK](https://sdk.vercel.ai/) (Apache 2.0) — for `streamText()`, provider abstraction, and streaming protocol
- [shadcn/ui](https://ui.shadcn.com) (MIT) — for the component library
- [Next.js](https://nextjs.org) (MIT) — for the App Router + Route Handlers
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (MIT) — for the synchronous SQLite driver
- [LangChain](https://langchain.com) (MIT) — inspiration for the RAG pattern + chunking strategy

**What this starter adds on top:**
- Arabic + RTL support as a first-class default
- Multi-document selection UI
- Local TF-IDF retrieval (zero-dependency, offline-capable)
- Chat history persistence via localStorage
- Mobile-responsive drawer for documents
- Production notes + honest limitations section

---

## 📜 License

MIT © [Fares](https://github.com/faresrafat3)

---

## 📫 Connect

- 🐙 GitHub: [@faresrafat3](https://github.com/faresrafat3)
- 💼 LinkedIn: _coming soon_
- 🎯 Mostaql: _coming soon_

---

⭐ If you find this project helpful, please give it a star!
