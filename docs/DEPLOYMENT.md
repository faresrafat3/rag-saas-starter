# 🚀 Deployment Guide — Vercel

> دليل خطوة بخطوة لنشر `rag-saas-starter` على Vercel.

---

## 📋 المتطلبات

- حساب GitHub (موجود: `faresrafat3`)
- حساب Vercel (مجاني — https://vercel.com/signup)
- الريبو منشور على GitHub (موجود: `faresrafat3/rag-saas-starter`)
- (اختياري) OpenAI API key — بدونها الـ app يشتغل في mock mode

---

## 🚀 الخطوات

### 1. إنشاء حساب Vercel

1. اذهب إلى https://vercel.com/signup
2. اضغط **"Continue with GitHub"** (أسهل طريقة)
3. authorize Vercel للوصول لحسابك في GitHub
4. أكمل الـ signup

### 2. استيراد الريبو

1. في Vercel dashboard، اضغط **"Add New..."** → **"Project"**
2. تحت "Import Git Repository"، هتلاقي `faresrafat3/rag-saas-starter`
3. اضغط **"Import"**

### 3. إعدادات المشروع

Vercel هتـ detect تلقائيًا إنه Next.js project. بس تأكد من الإعدادات:

| الإعداد | القيمة |
|---|---|
| **Framework Preset** | Next.js |
| **Root Directory** | `./` (default) |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |

### 4. متغيرات البيئة (Environment Variables)

ضيف المتغيرات دي (لو عندك API key):

| Variable Name | Value | Required |
|---|---|---|
| `OPENAI_API_KEY` | `sk-proj-...` | ❌ optional (بدونها = mock mode) |
| `AI_PROVIDER` | `openai` | ❌ optional (auto-detected) |
| `AI_MODEL` | `gpt-4o-mini` | ❌ optional (default) |
| `AI_TEMPERATURE` | `0.7` | ❌ optional (default) |

> **ملاحظة**: الـ app بيشتغل بدون أي API key في **mock mode** — مفيد للـ demo الأول.

### 5. Deploy!

1. اضغط **"Deploy"**
2. استنى 2-3 دقايق (Vercel هتعمل build + deploy)
3. لما يخلص، هتلاقي URL زي: `https://rag-saas-starter-faresrafat3.vercel.app`

### 6. اختبار الـ deployment

1. افتح الـ URL في المتصفح
2. تأكد إن الـ empty state بيظهر (مع الـ Arabic pattern)
3. اكتب رسالة في الـ chat — لو مفيش API key، هتلاقي "mock mode" badge
4. (اختياري) ارفع ملف TXT من الـ sidebar واختبر RAG

---

## ⚠️ ملاحظات مهمة

### SQLite على Vercel

الـ app بيستخدم `better-sqlite3` للـ local storage. على Vercel:

- ✅ الـ SQLite file بيتحفظ في `/tmp` أثناء الـ request
- ⚠️ **كل deployment جديد بيفقد الـ data** (Vercel serverless = ephemeral)
- 💡 **للـ production الحقيقي**: استبدل SQLite بـ [Supabase pgvector](https://supabase.com) أو [Neon Postgres](https://neon.tech)

### Build warnings

ممكن تلاقي warnings أثناء الـ build:
- `baseline-browser-mapping` — آمن، ignore
- `better-sqlite3 native module` — آمن، Vercel بيتعامل معاه

### Custom domain (اختياري)

1. في Vercel dashboard → Settings → Domains
2. أضف domain بتاعك (مثلاً `rag.fares.dev`)
3. اتبع تعليمات DNS

---

## 🔄 التحديثات المستقبلية

كل ما تعمل `git push` على `main`:
- Vercel تلقائيًا تعمل deployment جديد
- الـ preview deployments بتتعمل للـ PRs تلقائيًا

---

## 📸 بعد الـ deployment

### Screenshots

1. افتح الـ live URL
2. صور الـ views دي:
   - Empty state (مع الـ pattern)
   - Chat conversation (بعد ما تبعت رسالة)
   - Document panel (من الـ sidebar)
   - RAG in action (بعد ما ترفع مستند + تسأل)
   - Mobile view (من DevTools)
   - Dark mode

3. احفظهم في `docs/screenshots/`:
   ```
   docs/screenshots/empty-state.png
   docs/screenshots/chat.png
   docs/screenshots/documents.png
   docs/screenshots/rag.png
   docs/screenshots/mobile.png
   docs/screenshots/dark-mode.png
   ```

4. حدّث `README.md` (استبدل الـ `_TODO_` بالـ image paths)

### Demo video

1. استخدم [Loom](https://loom.com) أو [OBS Studio](https://obsproject.com)
2. سجل 60 ثانية:
   - 5s: عنوان + URL
   - 15s: empty state + features
   - 20s: chat conversation
   - 15s: RAG (رفع مستند + سؤال)
   - 5s: GitHub link
3. ارفع على YouTube (unlisted) أو Loom
4. حدّث `README.md` بالـ link

### تحديث الـ Profile README

بعد ما المشروع يبقى deployed:
1. حدّث `faresrafat3/faresrafat3/README.md`:
   - أضف المشروع لـ "Featured Projects"
   - استبدل "coming soon" بـ live demo link
2. حدّث `fares-career-lab/CONTEXT/persona.md`

---

## 🆘 استكشاف الأخطاء

### Build failure

```
Error: Cannot find module 'better-sqlite3'
```

**الحل**: تأكد إن `npm install` شغّال محليًا أولًا. Vercel هتعمل `npm ci` تلقائيًا.

### Runtime error: SQLite

```
Error: SQLITE_CANTOPEN: unable to open database file
```

**الحل**: الـ `data/` directory لازم يكون writable. لو فيه مشكلة، غيّر `DATABASE_URL` لـ `file:/tmp/rag.db`.

### Mock mode دايماً

لو الـ app دايماً في mock mode حتى لو فيه `OPENAI_API_KEY`:
1. تأكد إن الـ variable name بالظبط `OPENAI_API_KEY` (case-sensitive)
2. تأكد إنها في Vercel → Settings → Environment Variables
3. اعمل Redeploy (Vercel → Deployments → Redeploy)

---

## ✅ Checklist نهائي

- [ ] حساب Vercel منشأ
- [ ] الريبو مستورد
- [ ] متغيرات البيئة مضبوطة (لو فيه API key)
- [ ] Deployment ناجح
- [ ] الـ URL شغال
- [ ] Screenshots مأخوذة
- [ ] Demo video مسجل
- [ ] README محدّث بالـ links
- [ ] Profile README محدّث
