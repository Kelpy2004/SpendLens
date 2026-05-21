# Round 2 Devlog

## 2026-05-20 09:00 — Read the assignment

Read through the full Round 2 brief twice. Four required features: persistent audit storage, pricing change detection, notification emails, diff view. The constraint that stood out immediately — same repo, same stack, extend don't rewrite. That's the whole test. They want to see if I can work in my own code without fighting it.

## 2026-05-20 09:30 — Planning the schema

Biggest design question first: where does the audit get stored? Round 1's anonymous flow doesn't hit the database at all — the audit runs client-side from a URL payload. So the natural hook is lead capture. When a user submits their email, that's when I have both the email and the audit data together. Adding a `stored_audits` table alongside the existing `leads` table keeps the concerns separate.

Schema: audit_id, email, input_stack (jsonb), output_result (jsonb), pricing_snapshot (jsonb), pricing_version, created_at, notified_at. The pricing_snapshot column is the key — without it I can't diff against current pricing later.

## 2026-05-20 10:00 — Migration written, types updated

Wrote the SQL migration and added the `stored_audits` type to `src/lib/supabase/types.ts`. Following the same pattern as the existing `leads` table — Row, Insert, Update types with RLS enabled.

## 2026-05-20 10:20 — Pricing snapshot module

Created `pricing-snapshot.ts`. Two functions: `capturePricingSnapshot()` that deep-clones the current catalog, and `findChangedTools()` that JSON-stringifies each tool's plan array and compares. Coarse but correct — any change in price, tier, or plan count gets caught. The caller decides if the change actually matters by re-running the engine.

## 2026-05-20 10:45 — Wiring audit storage into lead capture

This was the tricky threading part. The lead capture form already had `report` and `auditId` but not the raw input payload. Had to thread `inputPayload` through: audit page → AuditResults → LeadCaptureForm → /api/leads. Four files touched for what's essentially passing one more prop. Not glamorous but it's the right way — no global state, no side channels.

The API route stores the audit best-effort. If the `stored_audits` insert fails, the lead still saves. Didn't want to break the existing flow for a new feature.

## 2026-05-20 11:30 — Change detector core logic

This was the most important module. `change-detector.ts` takes a stored audit, compares its pricing snapshot against current, and only flags it if the engine would produce a DIFFERENT recommendation. Not just "did the price move" but "did the advice change." That distinction matters — a $1 price bump that doesn't shift the recommendation shouldn't trigger an email.

The `groupByUser()` function consolidates affected audits by email so nobody gets spammed with three emails for one pricing change.

## 2026-05-20 12:15 — Detection endpoint

`POST /api/detect-changes` — scans all stored audits, runs detection, groups by user, sends emails, marks notified. Protected by an optional `CRON_SECRET` bearer token. Returns JSON with scan/affected/sent counts so you can see what happened without checking logs.

## 2026-05-20 12:45 — Notification email

Built the email in `change-email.ts` following the exact same pattern as Round 1's `email.ts` — same Resend integration, same error handling. The email has a table showing tool → old recommendation → new recommendation → impact. One CTA button: "See what changed →" linking to the diff page.

## 2026-05-20 13:30 — Diff view page

The most visible piece. `/audit/[auditId]/diff?stored=<uuid>` fetches the stored audit from Supabase, re-runs the engine with current pricing, and shows everything side by side. Changed tools get an amber highlight with old and new recommendation cards. Unchanged tools are muted at 60% opacity with just one line. Savings delta is the headline.

Had to fix a few lint issues — imported ArrowRight but never used it, had an unused `params` destructure. Clean now.

## 2026-05-20 14:00 — Tests

Wrote 10 tests across two files. `pricing-snapshot.test.ts` covers snapshot capture and tool-level diffing. `change-detector.test.ts` covers the three main scenarios: no change, pricing changed but recommendation didn't, and pricing changed enough to shift a recommendation. Plus groupByUser consolidation.

All 33 tests pass (23 from Round 1 + 10 new).

## 2026-05-20 14:20 — Build fix

First `npm run build` failed on two things: a `.filter(Boolean)` that TypeScript couldn't narrow (switched to an explicit type guard), and a `[...new Set()]` spread that needed `Array.from()` because of the tsconfig target. Both one-line fixes. Build clean after that.

## 2026-05-20 14:30 — Pushed, writing docs

Branch pushed to origin. Lint clean, 33 tests pass, build succeeds. Writing ROUND2_PR.md, this devlog, and the reflection now.
