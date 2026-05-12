# SpendLens Tests

The test strategy is intentionally weighted toward the parts that can hurt trust: audit math, public share payloads, lead validation, abuse controls, and email rendering. The UI is also checked through production builds and Lighthouse because the assignment is judged like a launchable product, not just a code exercise.

## How To Run All Tests

```bash
npm test
```

To run a specific file:

```bash
npx jest <filename>
```

---

## Automated Tests

### Audit Engine — `src/lib/audit/engine.test.ts`

Run: `npx jest engine.test`

| Test | What it covers |
| --- | --- |
| Recommends a cheaper Claude plan when Team is below the seat floor | Same-vendor downgrade when a team plan is overkill for the seat count |
| Rightsizes Copilot Enterprise to Business for a smaller engineering team | Enterprise-to-Business downgrade with correct savings math |
| Finds a substantially cheaper coding alternative when team-seat pricing is high | Alternative tool recommendation with meaningful savings threshold |
| Does not manufacture savings for an already efficient Copilot Business setup | No fake savings — keep recommendation when spend is aligned |
| Treats API spend as a usage review instead of comparing it to app seats | API tools get a usage-review flag, not a seat-based savings claim |
| Flags reported spend that is materially above official list price | Variance detection between user-reported spend and list-price math |
| Returns an empty report when no tools are active | Edge case: audit with no active tools returns zeroed totals |

---

### AI Summary — `src/lib/audit/ai-summary.test.ts`

Run: `npx jest ai-summary.test`

| Test | What it covers |
| --- | --- |
| Prompt stays within token constraints | Prompt builder does not exceed the max_tokens budget |
| Fallback summary fires when savings are under $100 | Low-savings honesty: fallback correctly says "spending well" |
| Fallback summary names the top finding when savings are meaningful | Template fallback includes the biggest recommendation |

---

### Public Audit Payloads — `src/lib/audit/public-audit.test.ts`

Run: `npx jest public-audit.test`

| Test | What it covers |
| --- | --- |
| Round-trips a spend state through encode and decode | Encoded payload decodes back to identical spend inputs |
| Strips inactive tools from the public payload | Inactive tools are not included in the share URL |
| Returns null for a malformed payload | Invalid or corrupted payloads are rejected gracefully |

---

### Lead Validation — `src/lib/leads/validation.test.ts`

Run: `npx jest validation.test`

| Test | What it covers |
| --- | --- |
| Accepts a valid lead payload | Happy path passes validation |
| Rejects a missing or malformed email | Email format enforcement |
| Rejects a payload with no audit ID | Missing audit ID returns 400 |
| Returns spam: true when the honeypot field is filled | Honeypot detection silently accepts without writing to Supabase |
| Normalises optional string fields | Company name and role are trimmed and length-capped |

---

### Rate Limiting — `src/lib/leads/rate-limit.test.ts`

Run: `npx jest rate-limit.test`

| Test | What it covers |
| --- | --- |
| Generates consistent IP and email rate limit keys | Key format is stable and namespaced correctly |
| Allows requests within the window limit | Under-limit requests return allowed: true |
| Blocks requests that exceed the window limit | Over-limit requests return allowed: false with retryAfterSeconds |
| Resets the counter after the window expires | Rate limit window resets correctly |

---

### Email Rendering — `src/lib/leads/email.test.ts`

Run: `npx jest email.test`

| Test | What it covers |
| --- | --- |
| Includes monthly and annual savings in the email copy | Confirmation email body references correct savings figures |
| Escapes HTML in user-supplied fields | Company name and role are sanitized before rendering into HTML |

---

### Spend Summary — `src/lib/spend/summary.test.ts`

Run: `npx jest summary.test`

| Test | What it covers |
| --- | --- |
| Calculates correct monthly and annual totals | Active tool spend is summed correctly |
| Excludes inactive tools from totals | Toggled-off tools do not count toward spend |
| Identifies the largest line item by spend | Largest tool name and amount are surfaced correctly |

---

## Lighthouse

Verified on May 11, 2026 against a local production server.

| Page | Performance | Accessibility | Best Practices |
| --- | ---: | ---: | ---: |
| Home intake | 100 | 100 | 100 |
| Audit result | 99 | 100 | 100 |

Command used:

```bash
npx -y lighthouse@latest http://127.0.0.1:3000 --only-categories=performance,accessibility,best-practices --chrome-flags="--headless=new --no-sandbox --disable-gpu"
```

---

## API Smoke Checks

The production server was started locally with `npm run start -- -p 3000`.

- `GET /` returned `200`.
- Honeypot lead submission returned `201` and did not require Supabase.
- Normal lead submission without Supabase env returned a clean `503` instead of crashing.
