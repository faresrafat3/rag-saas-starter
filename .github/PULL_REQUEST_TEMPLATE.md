## Objective
<!-- Describe the feature, bug fix, or UI enhancement you are bringing to the SaaS starter. -->

## Area of Change
- [ ] 🎨 UI / Frontend (shadcn, Tailwind)
- [ ] ⚡ AI Streaming / Vercel AI SDK
- [ ] 📚 RAG Pipeline / Document Chunking / TF-IDF
- [ ] 🌐 Localization / Arabic RTL

## The RTL / Arabic Checklist 🌍
<!-- This is our core feature. You MUST check these if you touched the UI. -->
- [ ] I used logical Tailwind classes (`ms-`, `pe-`, `text-start`) instead of physical ones (`ml-`, `pr-`, `text-left`).
- [ ] I tested the UI layout with an Arabic string to ensure the direction flips correctly.
- [ ] The Drawer/Sidebar operates smoothly on mobile devices in both LTR and RTL.

## Engineering Checklist
- [ ] My code is written in TypeScript and has no `any` types (where avoidable).
- [ ] I verified that the streaming chat does not break when switching between models/providers.
- [ ] Local storage persistence for chat history remains intact.
- [ ] `npm run lint` and `npm run build` pass without warnings.
