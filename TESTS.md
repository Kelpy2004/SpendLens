# SpendLens Tests

The test strategy is intentionally weighted toward the parts that can hurt trust: audit math, public share payloads, lead validation, abuse controls, and email rendering. The UI is also checked through production builds and Lighthouse because the assignment is judged like a launchable product, not just a code exercise.

## Automated Checks

Run these before pushing:

```bash
npm run lint
npm test
npm run build
```

Current Jest coverage:

- Audit engine edge cases: cheaper same-vendor plans, enterprise downgrades, alternative recommendations, API usage review, and no-fake-savings cases.
- Public audit payloads: round-trip encoding, inactive tool stripping, and malformed payload rejection.
- AI summary helpers: prompt constraints, fallback summary, and low-savings honesty.
- Lead capture validation: email validation, honeypot behavior, input normalization, and missing audit IDs.
- Rate limiting: IP/email key generation, limit enforcement, and window reset.
- Resend email rendering: savings copy and HTML escaping.

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

The Lighthouse CLI reported a Windows temp-folder cleanup warning after the audit completed, but the reports were written and the category scores were available.

## API Smoke Checks

The production server was started locally with `npm run start -- -p 3000`.

- `GET /` returned `200`.
- Honeypot lead submission returned `201` and did not require Supabase.
- Normal lead submission without Supabase env returned a clean `503` instead of crashing.

