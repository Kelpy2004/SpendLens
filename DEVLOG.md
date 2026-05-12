## Day 1 — 2026-05-07

**Hours worked:** 4.5

**What I did:** Spent most of today just setting up the foundation properly. Next.js 14 with TypeScript, Tailwind, got the GitHub repo going, wrote the CI workflow, stubbed out all the required markdown files, Supabase client scaffolding, and started modelling the tool data types. Didn't ship anything visible but I wanted the skeleton to be right before building on top of it.

**What I learned:** Even with good tooling, setting up a proper production-shaped repo takes longer than you think. The Supabase browser vs server client split, TypeScript strict mode, env examples — all small things but they add up. Worth doing on day one though. Saves pain later.

**Blockers / what I'm stuck on:** Nothing blocking today. Choices felt clear — Next.js App Router, TypeScript, Tailwind. Locked those in early so I'm not second-guessing them mid-build.

**Plan for tomorrow:** Build the spend input form with all required tools and tiers, get localStorage persistence working, and push the audit engine too if there's time.

---

## Day 2 — 2026-05-08

**Hours worked:** 6.5

**What I did:** Big day. Built the full spend intake form — all eight tools, correct plan tiers for each, monthly spend, seats, team size, use case. Got localStorage persistence working with a debounced save so nothing gets lost on a reload. Then moved to the audit engine which honestly took longer than the form. Had to actually read every vendor's pricing page before writing a single rule — couldn't just guess numbers. Built the pricing catalog, then the recommendation logic: same-vendor downgrades, alternative tool suggestions, plan-fit checks, and special handling for API spend (you can't audit API bills by seats, so those get a usage-review flag instead of a fake savings claim). Hit two bugs in the engine — one where I was comparing alternative plans against the user's self-reported spend instead of list price, and one where API tools were being suggested as cheaper alternatives to app subscriptions which makes no sense. Fixed both, wrote tests for them. Also had to dig through three separate OpenAI help articles to get ChatGPT pricing right because their pricing page is a mess.

**What I learned:** The pricing research was the part I underestimated most. GitHub Copilot's plan names changed from what the assignment listed. ChatGPT pricing is split across multiple help pages. If I hadn't verified every number manually I would have shipped wrong data. Recording the source URL and date for every price wasn't optional.

**Blockers / what I'm stuck on:** First version of the alternative recommendation logic was too aggressive — suggested any cheaper tool in the same category even if savings were like $4/month. Added a proper floor and percentage threshold so the engine doesn't manufacture fake wins.

**Plan for tomorrow:** Results page, shareable audit URLs, OG metadata, Anthropic summary integration.

---

## Day 3 — 2026-05-09

**Hours worked:** 7

**What I did:** Connected everything together. Designed a sanitized public payload format — encodes spend inputs into a compressed base64 query string with zero personal fields, no email, no company name. This means the results page can be fully public without needing a DB row for every anonymous visitor. Debated this for a bit (more on this below) but ended up feeling good about the decision. Built the results page: big savings hero, per-tool breakdown with current spend / recommendation / savings / reason, Credex callout when savings exceed $500/month, honest "spending well" state when they're under $100. Added Anthropic summary with a 6-second timeout and a template fallback. Fixed a bug where the OG preview title wasn't using the audit-specific savings copy — it was falling back to the default site title.

**What I learned:** Encoding the payload in the URL avoids writing anonymous company spend to a database before the user has consented to anything. The trade-off is longer URLs, but for this MVP it's the right call. I documented it in ARCHITECTURE.md.

**Blockers / what I'm stuck on:** The OG metadata bug took a bit to figure out. Next.js generateMetadata runs server-side and the origin URL needs to come from request headers — the initial fallback was hardcoding localhost which would've looked terrible in production share previews.

**Plan for tomorrow:** Lead capture backend — Supabase schema, API route, validation, honeypot, rate limiting, Resend email. Then the entrepreneurial docs.

---

## Day 4 — 2026-05-10

**Hours worked:** 7.5

**What I did:** Built the entire lead capture stack in one sitting. Supabase migration for the leads table, the /api/leads POST route with email validation, honeypot detection, IP and email rate limiting. Added Resend for the confirmation email and wrote delivery status back to the lead row so you can see if an email failed without crashing the response. Also added a clean 503 when Supabase isn't configured — didn't want the app to blow up without env vars. Then spent the second half of the day on entrepreneurial docs: GTM, ECONOMICS, LANDING_COPY, METRICS. The economics doc took the most effort. Had to actually think through the funnel math, CAC by channel, conversion rates — couldn't just make up numbers and hope they sounded reasonable.

**What I learned:** Honeypot field is genuinely the right call for this MVP over hCaptcha. No visible UI change, handles a meaningful chunk of bot submissions, zero friction for real users. Just need to document it clearly so it doesn't look like I forgot to add abuse protection.

**Blockers / what I'm stuck on:** Lead capture works locally but I haven't run the migration against the remote Supabase project yet or set env vars in Vercel. That's config work, not code, but it needs to happen before the live endpoint does anything useful.

**Plan for tomorrow:** ARCHITECTURE.md, full README, Lighthouse checks, deploy to Vercel, start production config.

---

## Day 5 — 2026-05-11

**Hours worked:** 8

**What I did:** Longest day. Wrote ARCHITECTURE.md with the Mermaid diagram, data flow, stack reasoning, and the 10k audits/day scaling section. Wrote the README properly — quick start, decisions section, env var reference. Fixed one last bug: share URL origin was deriving incorrectly in some environments because it wasn't reading from the request headers properly. Ran lint, tests, build — all clean. Deployed to Vercel. Ran Lighthouse on both pages locally against the production build. Scores came back 100/100/100 on both which honestly surprised me a bit. Recorded the API smoke checks in TESTS.md. Reviewed all the required files. Still need to actually apply the Supabase migration to the remote project and verify live lead storage — that's tomorrow.

**What I learned:** Writing the architecture doc is where I noticed I hadn't fully written down the reasoning behind the URL encoding decision. I'd made that call quickly on Day 3 and it was right, but it needed to be explained properly. Doing the docs surfaced a few things like that.

**Blockers / what I'm stuck on:** Production lead capture is unverified. Supabase migration not applied to remote, env vars not set in Vercel. First thing tomorrow.

**Plan for tomorrow:** Supabase + Resend env vars in Vercel, apply migration, test live lead capture end to end.

---

## Day 6 — 2026-05-12

**Hours worked:** 1.5

**What I did:** Production config day. Went into Vercel and set the Supabase URL, anon key, service role key, Resend key. Redeployed. Submitted a test lead on the live URL and got a 500. Not a great feeling.

**What I learned:** The error had moved past the "storage not configured" 503, which meant the env vars were at least loading. So it wasn't that. Tested the Supabase project directly — active, accepting connections. Then checked the schema and realized the public.leads table just didn't exist on the remote project. I'd written the migration and committed it but never actually run it against the remote database. Classic. No code bug, just hadn't run the SQL yet. Noted it for tomorrow — needs the migration applied from the SQL editor and then retest.

**Blockers / what I'm stuck on:** Live lead storage still broken until I run the migration. Leaving it for tomorrow morning when I can do it properly and verify the table shows up in the dashboard.

**Plan for tomorrow:** Run migration, retest live lead flow, Resend sender check, mobile layout fixes, README screenshots, final checks, submit.

---

## Day 7 — 2026-05-13

**Hours worked:** 2.5

**What I did:** Ran the SQL migration from the Supabase editor — leads table showed up immediately and the live endpoint started returning 201s. Verified the full flow: form → audit → lead capture → row in Supabase → Resend email. Resend has a free tier restriction where you can only send from onboarding@resend.dev unless you've verified a custom domain, so confirmation emails only land in the Resend account owner's inbox for now. Not a code problem, just a platform limitation — documented it. Fixed mobile layout clipping on the results page, hero heading wrapping was off on narrow screens, metric cards and summary text needed adjustment too. Added the deployed URL and three screenshots to README. Updated jest.config.js to ignore the .claude/ worktree folder so Jest wasn't double-counting test files. Added .claude/ to .gitignore. Ran lint, tests, build one more time — clean. Redeployed. CI green. Wrote DEVLOG and REFLECTION.

**What I learned:** The Resend sender restriction is one of those things that only bites you in production. Works fine locally, looks broken live. Not a big deal once you know what it is but worth documenting clearly for anyone trying to reproduce the email flow.

**Blockers / what I'm stuck on:** User interviews still not done. That's the one remaining gap before submission and it's the one thing I can't reconstruct from code.

**Plan for tomorrow:** Submit.
