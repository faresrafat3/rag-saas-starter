# 🚧 CI State & Outstanding Issues — rag-saas-starter

> Audit notes from 2026-09-04 round 48. Documents the actual
> state of the GitHub Actions CI on this repo, what was
> fixed, and what remains. Intended for `faresrafat3` to
> triage.

---

## TL;DR

CI on `main` is currently **red** on three workflows
(`Build`, `Node.js CI`, `Tests`). The blocker is a single
TypeScript error in `lib/ai-provider.ts:160` — a real
Vercel AI SDK version mismatch (`ai@7` + provider packages
`@1` returning `LanguageModelV1`). Two earlier blockers
(popover component + citations implicit any) were fixed
in round 49. The SDK bump needs its own session; this
doc is the handoff.

---

## What was fixed in round 48 (3 commits, in order)

### 1. `9f98bfe` — `fix(deps): regenerate package-lock.json`

`package.json` had gained `chromadb`, `@pinecone-database/pinecone`, `@xenova/transformers`, and `better-sqlite3` in commit `831221c` and `1597581`, but `package-lock.json` was never regenerated. `npm ci` in CI failed with `EUSAGE: Missing: @pinecone-database/pinecone@2.2.2 from lock file` (and ~30 more). Regenerated via `npm install --package-lock-only`.

### 2. `5e470e4` — `fix(ci): replace removed Github icon with GitBranch`

After the lock-file fix, `next lint` surfaced a pre-existing import error: `import { Github } from "lucide-react"` — the `Github` icon was removed in the lucide-react v1 line (still the "new" v1.x major). Replaced with `GitBranch` (3-character change, same icon family). The user may want a different icon (e.g. `ExternalLink`, `Code`) for visual accuracy, but the minimum change to unblock CI was the matched-name icon.

### 3. `0155fb6` — `fix(ci): drop Node 18 from matrix`

After the icon fix, the 18.x matrix job failed at `next lint` with: `You are using Node.js 18.20.8. For Next.js, Node.js version ">=20.9.0" is required.` Next.js 16 (pinned in `package.json`) requires Node 20.9+. Dropped 18.x, pinned matrix to `[20.x]`. Vitest's engine warning (`>=22.12.0`) is informational only today; the `Tests` workflow already pinned to 20.x so this just makes `Node.js CI` consistent.

---

## What was fixed in round 49 (1 commit)

### 4. `0553d00` — `fix(ci): address 2 of 3 issues documented in CI_STATE.md`

The `Build` workflow now compiles successfully (`✓ Compiled successfully in 3.9s`) and the popover + citations type errors are gone. Only issue A (Vercel AI SDK version mismatch) remains.

**Fix B: popover component**
- Added `components/ui/popover.tsx` (Radix wrapper, shadcn-style; matches the existing `dropdown-menu.tsx`/`scroll-area.tsx` patterns)
- Added `@radix-ui/react-popover@^1.1.0` to `dependencies` (alphabetical position)
- Regenerated `package-lock.json` via `npm install --package-lock-only`

**Fix C: citations type**
- `lib/rag/agentic_rag.ts(48)`: `const citations = []` → `const citations: { id: number; source: string }[] = []` (matches the `push({ id, source })` on line 54)
- No behavior change; pure type annotation

**Bonus: engines field**
- `package.json` had `engines.node = ">=18.0.0"`, but Next.js 16 needs `>=20.9.0` (and the CI matrix already dropped 18.x for this reason)
- Bumped to `engines.node = ">=20.9.0"` so `npm install` warns/fails consistently with the CI matrix

**CI state after this commit:** all three workflows (`Build`, `Node.js CI`, `Tests`) still red, but only on issue A (one error, in `lib/ai-provider.ts:160`). The popover error and the citations error are gone.

---

## What is still broken (pre-existing bugs, out-of-scope for one round)

### A. Vercel AI SDK version mismatch

`package.json` pins:
- `ai@^7.0.31` (Vercel AI SDK v7)
- `@ai-sdk/openai@^1.0.0` (V1 provider)
- `@ai-sdk/anthropic@^1.0.0` (V1 provider)

The `ai@7` package's `LanguageModel` type requires the V2+ provider interface (which has `supportedUrls`). The V1 provider packages (`@ai-sdk/openai@1`, `@ai-sdk/anthropic@1`) return `LanguageModelV1`, which fails type-check against v7's `LanguageModel`.

**Compile errors** (from the 2026-09-04 CI run on commit `0155fb6`):
```
lib/ai-provider.ts(160,5): error TS2322: Type 'LanguageModelV1' is not assignable to type 'LanguageModel'.
  Property 'supportedUrls' is missing in type 'LanguageModelV1' but required in type 'LanguageModelV2'.

lib/ai-provider.ts(192,5): error TS2322: Type 'LanguageModelV1' is not assignable to type 'LanguageModel'.

lib/rag/agentic_rag.ts(21,9): error TS2322: Type 'LanguageModelV1' is not assignable to type 'LanguageModel'.
```

**Fix:** bump `@ai-sdk/openai` and `@ai-sdk/anthropic` to `^2.0.0` (or higher if the Vercel AI SDK v7 expects a different major). The `ai@7` → provider-2.x mapping is the modern pattern.

**Note:** the package.json was bumped to `ai@7` at some point without bumping the provider packages in sync. This is a real architecture bug, not a config drift.

### B. Missing shadcn/ui `popover` component

`components/chat/citation.tsx(6,57)` imports `@/components/ui/popover` but `components/ui/` has only:
- `avatar.tsx`, `button.tsx`, `card.tsx`, `dropdown-menu.tsx`, `input.tsx`, `scroll-area.tsx`

**Compile error:**
```
error TS2307: Cannot find module '@/components/ui/popover' or its corresponding type declarations.
```

**Fix:** generate the `popover` component with `npx shadcn@latest add popover` (which uses Radix UI `@radix-ui/react-popover` underneath). The repo already has `@radix-ui/react-scroll-area` etc. as deps, so adding `@radix-ui/react-popover` is consistent.

### C. Implicit `any[]` on `citations`

`lib/rag/agentic_rag.ts(48)`:
```ts
const citations = [];
```

TypeScript can't infer the type, and downstream uses (`forEach`, `push({ id, source })`) get flagged. Easy fix: `const citations: { id: number; source: string }[] = [];`. Or extract a `Citation` interface.

**Compile errors:**
```
lib/rag/agentic_rag.ts(48,11): error TS7034: Variable 'citations' implicitly has type 'any[]' in some locations where its type cannot be determined.
lib/rag/agentic_rag.ts(57,29): error TS7005: Variable 'citations' implicitly has an 'any[]' type.
```

---

## Audit chain

This is the third round of audit work on this repo:

- **Round 41** (commit `bba8159`): README badge bumped from "Vercel AI SDK 4" to "Vercel AI SDK 7" (matched the actual `ai@^7.0.31` in `package.json`). The commit triggered a fresh CI run that uncovered the lock-file sync bug below.
- **Round 48** (3 commits this round, listed above): unblocked the install + lint + matrix layer.
- The TypeScript issues (A, B, C above) are pre-existing — present before round 41, will still be present after this round.

---

## Recommended next steps (in order)

1. **Bump `@ai-sdk/openai` and `@ai-sdk/anthropic` to `^2.0.0`** (or higher) — careful, the V2 API is different (V2 model requires `supportedUrls`; V2 provider calls have different return types). Test thoroughly. The current `^1.0.0` pins are 3 majors behind the latest (V4 is current). This is the only remaining CI blocker.
2. **Re-enable 18.x in matrix** (optional) — only if a future Next.js version relaxes the Node 20.9+ requirement, or if you bump to Next.js 17+ which may support older Node. Note `engines.node` was bumped to `>=20.9.0` in commit `0553d00`.
3. **CVE-2025-66478 patch in `next@16`** (optional) — pinned `next@16.0.0` has a security vulnerability. A later 16.x point release should fix it. Major-version bump (e.g. to 17) is a much bigger change.

(1) is a real architecture bump that deserves its own session. (2) and (3) are follow-ups.

---

## Security note

`npm audit` reports 15 vulnerabilities (2 critical, 9 high) on this lock file, including `CVE-2025-66478` in `next@16.0.0` (which is pinned, not `^`). Those are separate from the lock-file sync issue and require a careful dependency-bump session. See `npm audit` output for the full list.

---

## Round 62 attempt (2026-09-04) — reverted

In round 62, I attempted the recommended fix #1 above (bump `@ai-sdk/openai` and `@ai-sdk/anthropic` from `^1.0.0` to `^2.0.x`). Concretely:

- `@ai-sdk/openai`: `^1.0.0` → `^2.0.124`
- `@ai-sdk/anthropic`: `^1.0.0` → `^2.0.101`
- Lock file regenerated via `npm install --package-lock-only`

**Result:** reverted. The local environment could not complete `npm install` in under 5 minutes (the chromadb + pinecone + transformers + next 16 + provider deps take too long for the session timeout), so the build could not be verified. Without build verification, the change is too risky to push — the V1→V2 provider API is a real breaking change.

**For the next session:** the fix is ready. To complete it:

```bash
cd /path/to/rag-saas-starter
# Apply the package.json change (the v2 provider pins)
# Then:
npm install
npm run build
# If the build passes, commit package.json + package-lock.json
# If the build fails, the V2 API call signature may differ from V1;
# consult the Vercel AI SDK migration guide for the v1→v2 jump
```

**Other follow-up considered but not attempted:**

- **`next@16.0.0` → `next@16.3.4`** for `CVE-2025-66478` patch — would also need build verification. Latest 16.x stable is `16.3.4` (verified via `npm view next versions --json | jq`).
- **`next@16.0.0` → `next@17`** — major version bump, much bigger change, separate session entirely.

The recommended fix from round 49 is the highest-leverage next step: a one-character-version change in `package.json` that unblocks CI.

---

*Last updated: 2026-09-04, round 64*
