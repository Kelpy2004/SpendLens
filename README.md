# SpendLens

SpendLens is an AI spend audit for teams that have accumulated too many subscriptions, API bills, and seat-based tools without a clear owner. It turns a messy stack into a simple recommendation: keep it, downgrade it, switch it, or centralize the cleanup through Credex when the savings are big enough.

The app is designed to feel useful before it asks for anything. Users enter their AI stack, get a public result page with defensible savings math, and only then see the option to save the audit by email.

## Quick Start

Install dependencies:

```bash
npm install
```

Create a local env file from the example:

```bash
copy .env.example .env.local
```

Run the app:

```bash
npm run dev
```

Run checks:

```bash
npm run lint
npm test
npm run build
```

The app works without Anthropic, Supabase, or Resend keys for the anonymous audit flow. Anthropic falls back to a templated summary. Lead capture returns a clear storage configuration error until Supabase server variables are set.

## Decisions

1. Audit rules are TypeScript, not AI. The AI summary is useful polish, but finance recommendations should be deterministic, testable, and easy to challenge. That is why the engine lives in pure functions and the prompt only sees already-computed facts.

2. Public audit URLs store sanitized spend data instead of creating a database row for every anonymous result. This keeps the first version simple and shareable. The trade-off is longer URLs, which is why `ARCHITECTURE.md` calls out stored audit snapshots as the first scale upgrade.

3. Lead capture appears after the result, not before it. That probably lowers raw email volume, but it increases trust. For this product, a smaller list of people who saw value is better than a larger list collected through friction.

4. API spend is not treated like seat spend. It would be easy to claim big fake savings by comparing API bills to app subscriptions. SpendLens refuses to do that unless there is usage detail, which makes the recommendations less flashy but much more defensible.

5. The rate limiter is in memory for now. That is acceptable for a hiring assignment and a small launch, but it is not enough for a multi-region production system. The correct next step is a shared store like Upstash Redis or Vercel KV.

## Lead Capture And Abuse Controls

Lead capture appears only after the audit result is visible. That is intentional: asking for an email before showing value would make this feel like a lead-gen trap, and it would also weaken the trust we need from finance and engineering users.

The lead form includes a hidden `website` field as a honeypot. Real users never see it or tab into it, but simple bots often fill every input they find. When that field has a value, the API returns a normal success response and quietly skips Supabase and Resend. That keeps bot feedback low without adding friction for real users.

The `/api/leads` route also rate limits by IP and email in memory. That is enough for this assignment and for a small Product Hunt launch, but the first production upgrade would be moving those counters to Upstash Redis or another shared store so limits survive serverless cold starts and multiple regions.

Required runtime variables for this phase:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```
