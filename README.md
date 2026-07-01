# 🚀 rag-saas-starter

> **Production-ready RAG chatbot SaaS starter** with Arabic support, multi-document chat, and streaming responses.
>
> Built with Next.js 16 + Vercel AI SDK pattern + shadcn/ui.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8.svg)](https://tailwindcss.com/)
[![Status: WIP](https://img.shields.io/badge/status-WIP-orange.svg)](CHANGELOG.md)

> ⚠️ **Status**: Work in progress — Session 4 (skeleton + chat UI). RAG pipeline + multi-document chat + deployment coming in sessions 5-6.

---

## ✨ Features (Planned)

- ⚡ **Streaming responses** — UX حديثة بـ Vercel AI SDK pattern
- 🌐 **Arabic + RTL support** افتراضي — ميزة تنافسية في السوق العربي
- 📚 **Multi-document chat** — context across documents (مش بس single-doc)
- 🗂️ **Document management UI** — رفع/حذف/تنظيم المستندات
- 💾 **Chat history persistence** — localStorage أو Supabase
- 🎨 **Beautiful UI** — shadcn/ui + Tailwind + dark/light mode
- 🤖 **Provider-agnostic** — يدعم OpenAI / Anthropic / أي provider عبر Vercel AI SDK

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| AI | Vercel AI SDK (provider-agnostic pattern) |
| Vector Store (dev) | In-memory / SQLite |
| Vector Store (prod) | Supabase pgvector |
| Deployment | Vercel |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm / pnpm

### Installation

```bash
git clone https://github.com/faresrafat3/rag-saas-starter.git
cd rag-saas-starter
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run the development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
rag-saas-starter/
├── app/                      # Next.js App Router
│   ├── api/
│   │   └── chat/route.ts     # Streaming chat API
│   ├── layout.tsx            # Root layout (RTL, dark mode)
│   ├── page.tsx              # Main chat page
│   └── globals.css           # Tailwind + RTL styles
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── chat/                 # Chat-specific components
├── lib/
│   └── utils.ts              # Shared utilities
├── public/                   # Static assets
├── docs/
│   └── screenshots/          # (will be added)
├── CONSTITUTION.md           # Project charter (mini)
├── CONTEXT.md                # Internal context for agents
├── CHANGELOG.md              # Version history
├── LICENSE                   # MIT
├── .env.example              # Environment template
└── README.md                 # This file
```

---

## 🙏 Acknowledgments

This project is a **Smart Remix** built on top of excellent open-source work:

- [Vercel AI SDK](https://sdk.vercel.ai/) (Apache 2.0) — for the streaming + provider abstraction pattern
- [shadcn/ui](https://ui.shadcn.com) (MIT) — for the beautiful component library
- [Next.js](https://nextjs.org) (MIT) — for the App Router + Route Handlers

**What this starter adds on top:**
- Arabic + RTL support as a first-class default
- Multi-document chat (coming in session 5)
- Document management UI (coming in session 5)
- Chat history persistence (coming in session 5)
- Production-ready setup (env vars, error handling, loading states)

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
