# Round 2 Reflection

## What was the most uncomfortable trade-off you made because of the time pressure?

Skipping the `notified_at` filter in the detection query. The column exists, it gets set after each notification, but the scan query still pulls every stored audit every time. At 50 audits that's nothing. At 50,000 that's a problem — you're re-running the engine on audits you already notified about, and if the pricing hasn't changed again since the last notification, every one of those is wasted work.

The fix is a one-line `.is("notified_at", null)` filter on the Supabase query, but then I'd also need to handle the case where a user WAS notified, pricing changed AGAIN, and they need a second notification. That's a state machine — notified once, pricing changed after notification, re-notify. I know how to build it but I also know it takes an hour of thinking about edge cases and writing tests for them. That hour didn't exist.

So I shipped the version that re-scans everything and relies on the "did the recommendation actually change" check to keep it honest. It's wasteful at scale but correct at any scale. If I had to defend it in a code review I'd say: correctness first, performance when it matters.

## If we extended the deadline by another 24 hours right now, what's the first thing you'd do?

Add the `notified_at` filter and the re-notification state machine I just described. Not because it's the most visible feature but because it's the gap between "demo-ready" and "shippable." Right now if you trigger detection twice with no pricing change in between, the second run correctly sends zero emails because nothing changed. But it still scans every row. At scale that's the kind of thing that shows up as a slow cron job at 3 AM and someone has to debug it.

After that I'd add one-click unsubscribe to the notification email. It's a legal requirement for production email (CAN-SPAM), and more importantly it's a trust signal. If a user can't opt out, the email feels like spam even if the content is useful. The implementation is a signed JWT in the unsubscribe URL, a `/api/unsubscribe` route that sets a flag on the stored audit, and a check in the detection loop that skips flagged audits. Maybe 3 hours total.

## Looking back at your Round 1 codebase as a now-experienced user of it: what's one thing your Round 1 self made harder for your Round 2 self?

The lead capture form didn't pass the full audit data through. Round 1 only sent savings numbers, email, and metadata to the API — not the input stack or the full engine output. That made total sense at the time because there was no reason to store the full audit. But it meant Round 2 had to thread a new prop through four files: the audit page passes the payload to AuditResults, AuditResults passes it to LeadCaptureForm, LeadCaptureForm serializes it into the API call, and the API route writes it to the new table.

None of that was hard, but it was the kind of change that touches a lot of files for what's basically one data point. If Round 1 had included the full payload in the lead capture from the start — even if nothing consumed it yet — Round 2 would have been a two-file change instead of a four-file change. The lesson is that when a component already has access to data, passing it downstream is cheap insurance even if you don't need it today.
