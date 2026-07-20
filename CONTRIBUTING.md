# Contributing to RAG SaaS Starter

Welcome to the **RAG SaaS Starter**. This project is designed to be the go-to production-ready boilerplate for multi-document chat with native **Arabic / RTL (Right-to-Left)** support.

## 💻 Tech Stack Rules
We strictly adhere to the following stack. Please do not introduce alternative libraries unless absolutely necessary:
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **AI SDK:** Vercel AI SDK (Provider-agnostic: OpenAI / Anthropic)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **RAG/Retrieval:** Local TF-IDF (offline capable)

## 🌐 The Arabic / RTL Rule (Crucial)
This is our major competitive advantage. 
- **ANY UI component you add must be tested in RTL mode.**
- Ensure that margins, paddings, and absolute positioning (`ml-`, `mr-`, `pl-`, `pr-`) are replaced with logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) in Tailwind.

## 🚀 Contribution Areas
- **Streaming UI:** Improving the UX of the Vercel AI SDK streaming response.
- **RAG Pipeline:** Enhancing the chunking, parsing, or the local TF-IDF retrieval accuracy.
- **Document Management:** Adding support for new file types (PDF, Docx) in the sidebar.

Please verify your changes locally (`npm run dev` and `npm run lint`) before submitting a PR.
