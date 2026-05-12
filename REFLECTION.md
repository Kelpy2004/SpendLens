# SpendLens Reflection

## 1. The hardest bug you hit this week, and how you debugged it

The hardest one was the 500 on the live lead endpoint after I'd set all the Supabase env vars in Vercel and redeployed. The frustrating thing was it should have worked — I'd tested everything locally and it was fine.

My first thought was that Vercel hadn't picked up the env vars correctly. I'd had that happen before where you set something in the dashboard but it's not available at runtime because of prefix issues (NEXT_PUBLIC_ vs server-only). But when I looked at the actual error response, it had moved past the 503 check I'd written for when SUPABASE_SERVICE_ROLE_KEY is missing. That check fires early and returns a clean error. Since it wasn't firing, the client was initializing — the env vars were loading.

So then I thought maybe the Supabase project was paused. Free tier pauses inactive projects and the error can look similar. Opened the dashboard, project was active, accepting connections, everything looked fine.

Then I actually looked at the schema browser and the leads table just wasn't there. I'd written the migration and committed it to supabase/migrations/ but I had never run it against the remote project. Only against my local dev setup. That was it. Ran the SQL from the editor, table appeared, endpoint started returning 201s immediately.

After that the remaining issue was Resend — free tier only sends from onboarding@resend.dev to the account owner's email without a verified domain. That's not a bug, just a platform restriction I hadn't hit locally.

What made it annoying was that it was three completely separate failures stacked on top of each other and each one looked like it could be the root cause. The fix for each one just revealed the next problem. Reading the PostgREST error code (PGRST205 — table missing from schema cache) is what actually pointed me to the migration issue instead of guessing.

---

## 2. A decision you reversed mid-week, and what made you reverse it

My original plan for shareable audit results was to store every audit in Supabase — generate a UUID, write the spend inputs to a row, serve the result page by reading from that row. Short URLs, queryable history, standard approach.

I changed my mind on Day 3 and moved to encoding the sanitized audit payload directly into the share URL as a compressed base64 string instead.

The main thing that made me flip was thinking about what the product is actually doing. It's asking finance leads and founders to enter their company's AI tool spend before showing them anything. The whole pitch is "we show you value before asking for anything." If I'm writing their company's spend data to my database the moment they hit the results page — before they've seen the audit, before they've decided to save it — that feels like it breaks the deal I made with them. A finance person would notice that.

There was also a scope problem. A stored audit table sounds simple but it's not. What happens if someone shares a result and then submits their email — do I link the anonymous row to the lead? What's the retention policy? Do I need a way to revoke a shared link? That's a lot of edge cases to get right in a week.

And honestly, encoding the payload in the URL just works for this data shape. The inputs are small — tool tiers, seat counts, spend numbers. It fits. The result page renders from the URL alone, no DB read, fast, and the user's data never touches my backend until they explicitly choose to save the audit.

The trade-off is longer URLs and I'm fine with that for now. It's the first thing I'd change at scale.

---

## 3. What you would build in week 2 if you had it

PDF export would be first. Finance people don't share URLs in Slack — they attach documents to emails or drop them in Notion before a renewal meeting. The audit results page looks good as a screenshot but a proper PDF with a timestamp, the per-tool breakdown in a table, and a Credex contact line is something you'd actually file. That changes the use case from "I showed this to my team" to "I sent this to our CFO."

Second would be benchmark mode — "your AI spend per developer is $X, companies your size average $Y." You can't make this up, you need actual aggregate data from real audits. But after 50 or 100 audits there's enough signal to say something defensible by team size and use case. That's also what turns SpendLens from a one-time thing into something people come back to every quarter.

Third would be moving public audit storage from URL-encoded payloads to stored snapshots with short slugs. The URL encoding works but it's not what someone expects when they bookmark an audit to review before a renewal meeting. And you can't do proper share analytics without knowing which audit IDs are actually being accessed.

But honestly the most valuable thing in week 2 would just be more user interviews. Not 3, more like 20. I want to know what the one thing is that makes a finance lead forward this to their CEO versus closing the tab. Three conversations aren't enough to answer that.

---

## 4. How you used AI tools

Used Claude and ChatGPT throughout the week — for scaffolding decisions, TypeScript refactors, debugging conversations, and first drafts of the docs.

For the scaffolding stuff I just trusted it. Next.js App Router setup, Tailwind config, Jest with ts-jest, Supabase client patterns — these are well-documented, the AI gets them right, no point second-guessing it.

For the audit engine I used it more like a sounding board. We'd talk through edge cases — what happens when a team has fewer seats than the plan's billing floor, what's the right threshold for an alternative recommendation to actually be meaningful — but I wrote and reviewed every rule myself. The math has to be defensible to a finance person and I wasn't going to trust AI-generated pricing logic without reading through it myself.

For pricing data I verified every number manually even when the AI gave me a specific figure. Good thing I did — when I asked about ChatGPT pricing the AI pointed me to a page that OpenAI had reorganised and the numbers weren't right. The actual pricing was split across three different help.openai.com articles. If I'd just taken the AI's answer I would have shipped wrong data.

For GTM, ECONOMICS, METRICS — I used AI drafts as a starting point and rewrote them from scratch. The AI produces a generic version of whatever you ask for. The specificity is what makes those docs worth reading.

The one time the AI was specifically wrong and I caught it was during Supabase setup. I pasted my env var config for a sanity check and it said it looked fine. It was not fine — what I had labelled as the service role key was actually the anon key copied twice. I caught it by opening the Supabase dashboard and looking at the actual key format, which had changed to sb_publishable_ / sb_secret_ prefixes that the AI hadn't flagged as unusual.

---

## 5. Self-rating on a 1–10 scale

**Discipline: 8/10.** Committed across six days over seven, messages were meaningful and conventional throughout, didn't skip any of the required deliverables. The thing that drops it from a 9 is writing the devlog at the end instead of in real time. I reconstructed it from git history which is accurate, but it's not the same as writing it when the context is fresh.

**Code quality: 8/10.** The audit engine is typed, pure, fully tested, and completely separated from UI. Pricing catalog is documented and sourced separately. Lead capture handles the honeypot, rate limiting, delivery status tracking, and graceful env var failures. The main shortcut is in-memory rate limiting — it works for a single-region deploy but doesn't survive serverless cold starts across multiple regions. It's documented and acceptable for this stage.

**Design sense: 8/10.** It looks like a real product rather than a side project. The dark hero on the results page, the Credex callout that only appears above $500/month, the "spending well" state — those are real design decisions, not defaults. Fixed mobile clipping on the final day. Could use another day of polish on the per-tool breakdown cards but I wouldn't be embarrassed to screenshot it.

**Problem-solving: 8/10.** The production debugging was systematic — ruled things out in order instead of randomly making changes. The URL encoding decision was a real architectural reversal with clear reasoning, not just a shortcut. Where I lost a point is not catching the missing migration earlier. That was an obvious thing to check and I should have caught it on Day 5 when I was deploying.

**Entrepreneurial thinking: 7/10.** GTM and economics are specific — real channels, real unit economics, the fractional CFO distribution idea is something that only makes sense given Credex's specific position. But user interviews are missing, and that's the biggest gap. The assignment is right to weight it heavily. You can write a good GTM doc without talking to anyone. You can't write a good user interview without actually talking to someone.
