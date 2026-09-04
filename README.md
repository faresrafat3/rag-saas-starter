<div align="center">

# 💬 RAG SaaS Starter

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-7-000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://sdk.vercel.ai/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**Production-ready RAG chatbot SaaS starter with native Arabic / RTL support, multi-document chat, and streaming responses.**

</div>

---

## ✨ Features

- ⚡ **Streaming Responses** — Vercel AI SDK `streamText()` with OpenAI provider.
- 🌐 **Arabic + RTL Support (افتراضي)** — ميزة تنافسية في السوق العربي.
- 📚 **Multi-Document RAG** — Upload documents and select which ones to query.
- 🗂️ **Document Management UI** — Sidebar with upload/select/delete actions.
- 💾 **Chat History Persistence** — LocalStorage (survives page refreshes).
- 📱 **Mobile Responsive** — Beautiful drawer for document panels on small screens.
- 🎨 **Modern UI** — Powered by shadcn/ui + TailwindCSS + Dark/Light themes.
- 🔍 **SOTA Agentic RAG** — ChromaDB (dev) / Pinecone (prod) vector store with bge-m3 semantic embeddings, query decomposition, semantic chunking, and auditable citations.
- 🤖 **Provider-Agnostic** — Seamlessly switch between OpenAI and Anthropic via Vercel AI SDK.

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/faresrafat3/rag-saas-starter.git
cd rag-saas-starter

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local

# 4. Start the development server
npm run dev
```

Visit `http://localhost:3000` to interact with your local instance.
