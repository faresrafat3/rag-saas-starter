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

## 📋 Features المتبقية (الجلسة 5)

- [ ] RAG pipeline فعلي (document upload + chunking + embeddings)
- [ ] Multi-document chat (context across documents)
- [ ] Document management UI (list, delete, rename)
- [ ] Chat history persistence (localStorage أو Supabase)
- [ ] Provider abstraction (Vercel AI SDK pattern كامل)

## 📋 Features المتبقية (الجلسة 6)

- [ ] Deployment على Vercel
- [ ] README احترافي (اتباع portfolio-readme-template.md)
- [ ] Screenshots في `docs/screenshots/`
- [ ] فيديو demo 60 ثانية
- [ ] Topics + description على GitHub

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
