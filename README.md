# SpendLens

SpendLens is a free AI spend audit tool for startup founders, engineering managers, and finance leads who are paying for Cursor, Copilot, Claude, ChatGPT, Gemini, and API usage without a clear picture of whether any of it is right-sized. You enter your stack, get an instant audit with defensible savings math, and only then see the option to save the report by email.

**Live:** https://spendlens-nu.vercel.app/

---

## Screenshots

![SpendLens intake form](public/screenshots/home-intake.png)
*Intake form — enter tools, plans, monthly spend, and seats*

![SpendLens audit results](public/screenshots/audit-result.png)
*Audit results — savings hero, per-tool breakdown, Credex callout for large savings*

![SpendLens mobile](public/screenshots/mobile-audit.png)
*Mobile audit results*

---

Live app: [https://spendlens-nu.vercel.app](https://spendlens-nu.vercel.app)

## Screenshots

![SpendLens intake form](public/screenshots/home-intake.png)

![SpendLens audit result](public/screenshots/audit-result.png)

![SpendLens mobile audit result](public/screenshots/mobile-audit.png)

## Quick Start

```bash
npm install
```

```bash
copy .env.example .env.local   # Windows
cp .env.example .env.local     # Mac/Linux
```

```bash
npm run dev
```

The app runs without Anthropic, Supabase, or Resend keys. The anonymous audit flow works fully. Anthropic falls back to a templated summary. Lead capture returns a clean 503 until Supabase variables are set.

**Run checks:**

```bash
npm run lint
npm test
npm run build
```

**Deploy:** Push to Vercel. Set the environment variables below and run the Supabase migration at `supabase/migrations/202605100001_create_leads.sql` against your remote project.

**Required environment variables:**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

---

## Decisions

**1. Audit logic is hardcoded TypeScript, not AI.**
Finance recommendations need to be deterministic and testable. If the engine says "downgrade from Copilot Enterprise to Business and save $200/month," a finance person should be able to verify that against the vendor pricing page. A model can't be audited. Pure functions can. The Anthropic API is used only for the summary paragraph — polish, not math.

**2. Public audit URLs encode the spend snapshot instead of storing it.**
My first instinct was to write every audit to Supabase and serve results from the database. I reversed that on Day 3. Storing anonymous company spend data before the user has agreed to anything breaks the product's core promise — show value first, ask for nothing until after. URL encoding is a real trade-off (longer links) but it keeps the anonymous flow completely offline, and the result page renders from the URL with no backend read at all.

**3. Lead capture comes after the result, not before.**
Putting an email gate before the audit would probably increase raw capture volume. It would also kill trust. Finance people who land here from a tweet are already skeptical. The product earns the email by showing real savings first. A smaller list of people who saw value and chose to save it beats a bigger list collected through friction.

**4. API spend gets a usage-review flag, not a savings claim.**
It would be easy to claim huge savings by comparing an API bill to a cheaper app subscription. SpendLens doesn't do that. API spend is flagged for usage review — export token usage by model before making any recommendation. That makes the output less dramatic but a lot more honest. A finance person who runs the audit twice should get the same answer both times.

**5. Rate limiting lives in memory, not a shared store.**
For this build it's fine — the app runs on Vercel with low traffic. In a real production deployment across multiple regions, in-memory rate limits don't survive cold starts and don't coordinate between instances. The right fix is Upstash Redis or Vercel KV. That's documented in ARCHITECTURE.md and easy to swap in.

---

## Lead Capture and Abuse Controls

The lead form includes a hidden `website` field as a honeypot. Real users never see it or tab to it. When it has a value, the API returns 201 and quietly skips Supabase and Resend — no data written, no signal to the bot that anything happened.

The `/api/leads` route rate limits by IP (8 requests per 10 minutes) and by email (3 per 15 minutes). That's enough for a launch and handles the obvious abuse patterns without adding a CAPTCHA that would slow down real users.
