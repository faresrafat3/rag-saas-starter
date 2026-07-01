# 🧠 سياق rag-saas-starter — Context for Agents

> هذا الملف داخلي. لا يُعرض للعملاء. يُقرأ من أي agent يبدأ العمل على المشروع.

## 🎯 الهدف من المشروع

بناء **production-ready RAG chatbot starter** كأول مشروع portfolio لفارس على مسار الفري لانس.
النيش: AI Integration (الأعلى طلبًا على مستقل وفق `fares-career-lab/IDEAS/mostaql-niches.md`).

## 🛠️ Stack التقني (محدّد)

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **AI**: Vercel AI SDK pattern (provider-agnostic) — للـ demo نستخدم z-ai SDK أو mock response
- **Vector Store (dev)**: in-memory أو SQLite — للـ production: Supabase pgvector
- **Embeddings**: model embedding (سيُحدد في الجلسة 5)
- **Deployment**: Vercel (الجلسة 6)

## 📋 Features المنفذة (الجلسة 4)

1. ✅ Next.js 16 + TypeScript + Tailwind setup
2. ✅ shadcn/ui base components (Button, Input, Card, ScrollArea)
3. ✅ Chat interface UI (message list + input + send button)
4. ✅ Arabic + RTL support افتراضي
5. ✅ Dark mode toggle
6. ✅ API route بسيط (mock streaming response)

## 📋 Features المنفذة (الجلسة 5)

1. ✅ SQLite storage (better-sqlite3) — documents + chunks + embeddings
2. ✅ Sentence-based chunker (Arabic + English terminators)
3. ✅ Local TF-IDF embeddings (zero-dependency, works offline)
4. ✅ Document upload API (POST /api/documents/upload)
5. ✅ Document management API (GET/DELETE /api/documents, /api/documents/[id])
6. ✅ RAG-augmented chat (TF-IDF retrieval + context injection)
7. ✅ Document panel UI (sidebar with upload/select/delete)
8. ✅ ChatContext for shared state (selectedDocumentIds)
9. ✅ Multi-document selection support (UI + API)
10. ✅ Client/server module split (ai-config vs ai-provider)

## 📋 Features المتبقية (الجلسة 5 ب)

- [ ] Provider integration حقيقي (OpenAI / Anthropic) بدل mock
- [ ] Mobile responsive: toggle button for documents panel
- [ ] Chat history persistence (localStorage)
- [ ] Unit tests (chunker, embeddings, API routes)
- [ ] PDF parsing (pdf-parse library)

## 📋 Features المتبقية (الجلسة 6)

- [ ] Deployment على Vercel
- [ ] README احترافي (اتباع portfolio-readme-template.md)
- [ ] Screenshots في `docs/screenshots/`
- [ ] فيديو demo 60 ثانية
- [ ] Topics + description على GitHub (تحديث نهائي)

## 🐛 Bugs معروفة

(لا يوجد بعد)

## 🔗 روابط مهمة

- Repo: https://github.com/faresrafat3/rag-saas-starter
- Demo: TBD (Vercel — بعد الجلسة 6)
- Original sources (Smart Remix):
  - Vercel AI SDK: https://sdk.vercel.ai/
  - shadcn/ui: https://ui.shadcn.com

## 💡 ملاحظات للـ agent القادم

- المشروع حاليًا في مرحلة "Chat UI بدون RAG" — أي RAG فعلي للجلسة 5
- لو عندك z-ai SDK متاح في البيئة، استخدمه للـ demo
- لو لأ، استخدم mock response pattern (موجود في `app/api/chat/route.ts`)
- كل API routes لازم ترجع streaming responses (Vercel AI SDK pattern)
- **مهم**: Arabic + RTL لازم يكونوا default من اليوم الأول، مش feature متأخر

## 🧪 ملاحظة على الـ Mock Streaming (وثّقت في الجلسة 5)

الـ mock في `lib/ai-provider.ts` بيرجع **chunks كبيرة** (جمل كاملة) بدل **tokens صغيرة**.

**السبب**: عشان الـ demo يكون سريع + يستقر الـ UI بسرعة في الاختبار.

**في الـ production** (لو فيه OpenAI API key):
- هنستخدم Vercel AI SDK `streamText()` — بيرجع tokens حقيقية
- الـ UI شغّال بالفعل مع streaming (الـ `ChatContainer` بيـ read chunks من أي حجم)

**لو عاوز تجرب الـ realistic streaming**: عدّل `setTimeout(resolve, 80)` في `lib/ai-provider.ts` لـ `setTimeout(resolve, 30)` وحط كلمات بدل جمل.

## 📦 الـ Dependencies المضافة في الجلسة 5

- `better-sqlite3` — للـ SQLite storage (documents + embeddings)
- `@types/better-sqlite3` — types

**ملاحظة**: `better-sqlite3` مش شغّال على edge runtime. routes اللي بتستخدمه لازم `runtime = 'nodejs'`.
