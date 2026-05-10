# SpendLens

SpendLens is an AI spend audit for teams that have accumulated too many AI subscriptions, API bills, and seat-based tools without a clear owner. It turns a messy stack into a simple recommendation: keep it, downgrade it, switch it, or centralize the cleanup through Credex when the savings are big enough.

## Lead Capture And Abuse Controls

Lead capture appears only after the audit result is visible. That is intentional: asking for an email before showing value would make this feel like a lead-gen trap, and it would also weaken the trust we need from finance and engineering users.

The lead form includes a hidden `website` field as a honeypot. Real users never see it or tab into it, but simple bots often fill every input they find. When that field has a value, the API returns a normal success response and quietly skips Supabase and Resend. That keeps bot feedback low without adding friction for real users.

The `/api/leads` route also rate limits by IP and email in memory. That is enough for this assignment and for a small Product Hunt launch, but the first production upgrade would be moving those counters to Upstash Redis or another shared store so limits survive serverless cold starts and multiple regions.

Required runtime variables for this phase:

```text
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

