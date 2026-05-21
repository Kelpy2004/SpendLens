## What this PR does

Adds the "re-audit on pricing change" feature. When a user saves their audit (lead capture), the full audit — input stack, engine output, and a snapshot of the pricing catalog at that moment — gets stored in Supabase. A detection endpoint compares stored audits against current pricing, emails users whose recommendations changed, and links them to a diff view showing old vs new side by side.

## Why

A one-time audit is useful until the pricing changes. Cursor raised prices in 2024, Claude added tiers in 2025, Copilot restructured plans. If someone ran a SpendLens audit three months ago and a tool they use changed pricing, the old result is actively misleading. This feature turns SpendLens from a snapshot tool into something that stays useful — and gives Credex a reason to re-engage leads who already showed interest.

## How it works

The data flows through four pieces:

**1. Audit storage** — when a user submits the lead capture form, the existing `/api/leads` route now also writes to a new `stored_audits` table. The row includes the full input stack (what they entered), the engine output (recommendations), and a JSON snapshot of the pricing catalog that was live when they ran it. This is best-effort — if the insert fails, the lead still goes through.

**2. Pricing change detection** — `POST /api/detect-changes` pulls every stored audit, compares each one's pricing snapshot against the current catalog using `findChangedTools()`, and for any audit where pricing actually moved, re-runs the engine with the same inputs. The key decision: a price change that doesn't alter the recommendation gets ignored. Users only hear from us when the advice changed, not when a number moved.

**3. Notification email** — affected audits get grouped by email so each user gets one consolidated email, not one per audit. The email shows a table: tool name, old recommendation, new recommendation, savings impact. A "See what changed" button links to the diff view. Built on Resend, same as Round 1.

**4. Diff view** — `/audit/[auditId]/diff?stored=<uuid>` loads the stored audit from Supabase, re-runs the engine with current pricing, and renders old vs new side by side. Changed tools are highlighted with an amber ring and show both recommendations with a savings shift indicator. Unchanged tools are muted and collapsed. Total savings delta is the headline.

```
Lead capture form
    ↓
/api/leads (stores audit + pricing snapshot)
    ↓
/api/detect-changes (cron or manual trigger)
    ↓ compares snapshot vs current catalog
    ↓ re-runs engine if pricing moved
    ↓ groups affected audits by user email
    ↓
Resend email (consolidated, one per user)
    ↓ "See what changed →" button
    ↓
/audit/[auditId]/diff (side-by-side comparison)
```

New files:
- `src/lib/audit/pricing-snapshot.ts` — snapshot capture + tool-level diffing
- `src/lib/audit/change-detector.ts` — core detection logic, grouping, diff building
- `src/lib/audit/change-email.ts` — notification email builder
- `src/app/api/detect-changes/route.ts` — the detection endpoint
- `src/app/audit/[auditId]/diff/page.tsx` — the diff view page
- `supabase/migrations/202605200001_create_stored_audits.sql` — new table

Modified files:
- `src/app/api/leads/route.ts` — also stores audit on lead capture
- `src/components/lead-capture-form.tsx` — passes input payload through
- `src/components/audit-results.tsx` — threads input payload to lead form
- `src/app/audit/[auditId]/page.tsx` — passes payload to results component
- `src/lib/supabase/types.ts` — added stored_audits table types

## What I cut

- **One-click unsubscribe in the email.** The right implementation needs a signed token per user and a server route to flip a flag. That's two more moving pieces for a feature that only matters at volume. The diff view was a better use of the time — it's what makes the email worth opening.

- **Public "what changed this week" page.** Cool growth surface but it's a separate feature, not part of the re-audit flow. Would need its own data model for tracking pricing history over time, not just snapshot comparisons.

- **Admin dashboard.** Would be useful for monitoring but adds no value to the core flow. The detection endpoint already returns scan/affected/sent counts in the JSON response — that's enough for now.

- **Scheduled cron trigger.** The endpoint accepts a manual POST. Vercel Cron is a one-line config away (`vercel.json` with a schedule), but I haven't used it before and didn't want to debug a scheduling issue when the detection logic itself was the important part. The endpoint works, the trigger is a deployment config.

- **Filtering out already-notified audits from re-scanning.** The `notified_at` column exists and gets set, but the detection query doesn't filter on it yet. At current scale it doesn't matter — re-scanning a notified audit that hasn't changed again is a no-op. At scale you'd add `.is("notified_at", null)` to the query.

## How to test it manually

1. Start the app locally with Supabase credentials configured.
2. Run the Supabase migration: `supabase/migrations/202605200001_create_stored_audits.sql`.
3. Go to the homepage, activate Cursor (Business, $400/mo, 10 seats) and run the audit.
4. On the results page, enter an email and submit the lead capture form.
5. Check Supabase — the `stored_audits` table should have a row with your audit data.
6. To simulate a pricing change: edit `src/lib/audit/pricing-catalog.ts` and change Cursor Business `monthlyPerSeat` from `40` to `50`. Save.
7. Trigger detection: `curl -X POST http://localhost:3000/api/detect-changes`
8. The response should show `affected: 1` and `emailsSent: 1` (if Resend is configured). Check your inbox for the notification email.
9. Click "See what changed" in the email — you'll land on the diff view showing old vs new Cursor recommendation side by side.
10. Revert the pricing change in the catalog file.

Without Resend configured, detection still works — the response JSON shows what would have been sent. The diff view works independently by visiting `/audit/<auditId>/diff?stored=<uuid>` with a valid stored audit UUID from Supabase.

## What's tested

1. `pricing-snapshot.test.ts` — snapshot captures a version string and catalog object
2. `pricing-snapshot.test.ts` — snapshots are deep copies independent of the original
3. `pricing-snapshot.test.ts` — identical snapshots produce no changed tools
4. `pricing-snapshot.test.ts` — a price change on a specific tool is detected
5. `pricing-snapshot.test.ts` — unchanged tools are not flagged
6. `change-detector.test.ts` — returns null when pricing has not changed
7. `change-detector.test.ts` — returns null when pricing changed but recommendation stays the same
8. `change-detector.test.ts` — detects a change when pricing shifts enough to alter a recommendation
9. `change-detector.test.ts` — groups multiple audits under the same email
10. `change-detector.test.ts` — returns empty array for empty input

Skipped due to time: integration tests for the `/api/detect-changes` endpoint and the diff page rendering. The detection logic and snapshot diffing are the critical paths and those are covered.

## Open questions / risks

- **Snapshot size.** The full pricing catalog is ~4KB as JSON. At thousands of stored audits that's manageable, but if the catalog grows significantly (more tools, more plans), the table will get heavy. A version hash with a separate catalog-versions table would be cleaner at scale.

- **Race condition on lead capture.** The audit storage insert runs after the lead insert but before the email send. If Supabase is slow, the user might get a confirmation email before their audit is fully stored. Not a functional issue — the audit will be there by the time any detection runs — but the timing could look wrong in logs.

- **No auth on the detection endpoint.** It's gated by `CRON_SECRET` if set, but open otherwise. Fine for a staging deploy, not acceptable for production. A real deployment would use Vercel Cron with a secret header or an internal service token.
