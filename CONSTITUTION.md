# 📜 دستور rag-saas-starter

> دستور مصغر للمشروع. مرتبط بالدستور الأم في `fares-career-lab/CONSTITUTION.md`.
> أي agent يعمل على هذا المشروع يقرأ الأول: هذا الملف، ثم `fares-career-lab/CONSTITUTION.md`.

---

## 🎯 معلومات المشروع

- **الاسم**: rag-saas-starter
- **النيش**: AI Integration (Tier 1 على مستقل)
- **الهدف**: Production-ready RAG chatbot starter مع Arabic support + multi-document chat + streaming responses
- **Demo URL**: TBD (سيُرفع على Vercel في الجلسة 6)
- **الحالة**: in-development (الجلسة 4: skeleton + chat UI)
- **تاريخ البدء**: 2026-06-29
- **تاريخ التسليم (متوقع)**: TBD (بعد الجلسة 6)

---

## 🔗 المصدر (Smart Remix Source)

وفقًا لـ `fares-career-lab/METHODOLOGIES/smart-remix.md`:

| Source | License | What I'm using |
|---|---|---|
| [Vercel AI SDK](https://sdk.vercel.ai/) | Apache 2.0 | الـ pattern لـ streaming responses + provider abstraction |
| [shadcn/ui](https://ui.shadcn.com) | MIT | UI components (Button, Input, Card, ScrollArea, etc.) |
| [Next.js docs](https://nextjs.org/docs) | MIT | App Router patterns + Route Handlers |

**القيمة المضافة الحقيقية** (مش بس تكرار):
1. Arabic language support + RTL افتراضي
2. Multi-document chat (context across documents)
3. Document management UI
4. Chat history persistence
5. Production-ready setup (env vars, error handling, loading states)

**Attribution text في README**:
> "Built using Vercel AI SDK pattern, shadcn/ui components, and Next.js 16. Adds Arabic/RTL support, multi-document chat, and document management UI."

---

## 📖 ترتيب القراءة الإجباري لأي agent

1. هذا الملف (`CONSTITUTION.md`)
2. `CONTEXT.md` — سياق المشروع الداخلي
3. `CHANGELOG.md` — آخر التغييرات
4. `fares-career-lab/CONSTITUTION.md` (الدستور الأم)
5. `fares-career-lab/METHODOLOGIES/smart-remix.md` (لأن المشروع Smart Remix)
6. `fares-career-lab/METHODOLOGIES/project-delivery.md` (لو المشروع لعميل)

---

## ✅ قواعد المشروع

### Do's:
- كل feature جديد = commit واضح بـ conventional commit message
- كل bug fix = commit + note في CHANGELOG
- screenshots تُضاف في `docs/screenshots/`
- README يُحدّث مع كل feature كبير
- كل الـ env vars تمر عبر `.env.local` (في `.gitignore`)
- Arabic + RTL في كل UI من اليوم الأول

### Don'ts:
- ❌ لا ترفع `.env.local` أو أي secrets
- ❌ لا ترفع `node_modules/` أو `.next/`
- ❌ لا ترفع بيانات مستخدم حقيقية
- ❌ لا تعدّل LICENSE بدون إذن فارس
- ❌ لا تنشر الـ demo URL قبل ما فارس يوافق
- ❌ لا تذكر `furqaan-internal` أو الأبحاث الداخلية في أي تواصل خارجي

---

## 🎯 معايير التسليم (Definition of Done)

المشروع يُعتبر "جاهز" لما:

- [ ] كل features الأساسية موجودة وشغالة:
  - [ ] Chat interface (message list + input + send)
  - [ ] Streaming responses
  - [ ] Multi-document upload
  - [ ] Document embeddings + vector search
  - [ ] Arabic + RTL support
  - [ ] Chat history persistence
- [ ] README كامل (اتباع `fares-career-lab/TEMPLATES/portfolio-readme-template.md`)
- [ ] `.env.example` موجود
- [ ] screenshots موجودة في `docs/screenshots/`
- [ ] demo شغال على Vercel
- [ ] لا يوجد `console.log` أو dead code
- [ ] لا يوجد secrets في الكود
- [ ] topics + description مضافين على GitHub
- [ ] تم عمل فيديو demo (60 ثانية كحد أقصى)
- [ ] CHANGELOG محدّث

---

## 🔄 ربط مع `fares-career-lab`

- **مصدر الفكرة**: `fares-career-lab/IDEAS/portfolio-projects.md` (Idea #1)
- **المنهجية المتبعة**: `fares-career-lab/METHODOLOGIES/smart-remix.md`
- **هذا المشروع = أول مشروع portfolio** من خطة الـ 4 أسابيع
- **المشاريع التالية**: Admin Dashboard (Week 3), Landing Page (Week 4)
- **لو فيه lessons learned**: تُسجَّل في `fares-career-lab/LOG/voice-of-fares.md`

---

## 📅 خطة التنفيذ (3 جلسات)

| الجلسة | النطاق | الحالة |
|---|---|---|
| الجلسة 4 (الآن) | skeleton + chat UI (بدون RAG) | 🔄 in-progress |
| الجلسة 5 | RAG pipeline + multi-doc + embeddings | ⏳ |
| الجلسة 6 | deployment + README final + فيديو demo | ⏳ |

---

## ✍️ التوقيع

- **آخر تحديث**: 2026-06-29
- **الإصدار**: 1.0
- **بواسطة**: فارس + (Super Z / GLM agent)
