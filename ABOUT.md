# SpendLens — What It Is and How It Was Built

## What It Is

SpendLens is a free web tool that audits your team's AI tool subscriptions and tells you where you're overpaying. You enter what you're currently paying for — Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf, Anthropic API, OpenAI API — along with your plan tier, monthly spend, and seat count. SpendLens compares that against current vendor pricing and gives you a clear breakdown: what to keep, what to downgrade, what to switch, and how much you'd save.

The result is a shareable public URL. No login required to use it. Email is only asked for after you've seen the audit, never before.

It was built as part of a hiring assignment for Credex — a company that sells discounted AI infrastructure credits. SpendLens is designed to be a real lead-generation product: the audit surfaces overspend, and for teams with large savings opportunities, Credex is the obvious next step.

---

## The Problem

Most startups accumulate AI tools the same way: one team adds Cursor, another team signs up for Copilot, someone puts ChatGPT on a personal card and gets reimbursed, and the Anthropic API bill shows up somewhere else entirely. Six months later no one has a clear picture of what's being paid, to whom, and whether any of it is right-sized.

Finance sees the total and signs off. Engineering doesn't want to lose tools that people actually use. Founders don't have time to audit every SaaS subscription. So the spending continues unchecked.

There's no good tool for this. Expense management software tracks payments but doesn't know whether a GitHub Copilot Enterprise seat at $39/month makes sense for a 10-person team that could use Business at $19/seat. Generic SaaS spend tools don't know the difference between an AI coding assistant and an AI API. Nobody has built a tool that understands the specific economics of the AI tools market well enough to give advice that a finance person would actually trust.

That's the gap SpendLens fills.

---

## Who It's For

The primary user is someone at a 10 to 80 person startup who has either noticed the AI tool bills are getting out of hand, or is about to hit a renewal and wants to know if they're paying the right amount before signing another year.

That's usually one of three people:

**The Head of Finance or COO** who can see the spend on the company card but doesn't know enough about the tools to evaluate whether each one is justified. They want a second opinion that doesn't require asking engineering to audit themselves.

**The Engineering Manager or CTO** who knows the tools are overlapping — the team has both Cursor and Copilot, or individual Claude Pro accounts plus a team ChatGPT subscription — but hasn't had time to work out what the right setup actually costs.

**The Founder** who is watching burn rate and knows AI tooling has gotten expensive but hasn't quantified it clearly enough to make a change.

The common thread is that they all want a trustworthy number, not a sales pitch. SpendLens only claims savings it can defend with list-price math. If your spend looks reasonable, it says so instead of manufacturing a fake win.

---

## How It Works

**Step 1 — Enter your stack.**
The intake form lists every major AI tool with the relevant plan tiers. You toggle on the ones you use, enter your monthly spend and seat count for each, set your team size and primary use case (coding, writing, data, research, or mixed). The form saves to localStorage so you don't lose your work if you close the tab.

**Step 2 — Run the audit.**
Clicking "Run audit" takes the form state, encodes it into a sanitized URL payload (no personal data, just the spend inputs), and navigates to the results page. The audit engine runs entirely in TypeScript — no AI involved in the math. It checks four things for each tool: are you on the right plan for your team size, is there a cheaper plan from the same vendor that fits, is there a substantially cheaper alternative tool for your use case, and are you paying retail when you could get the same thing through discounted credits.

**Step 3 — See the results.**
The results page shows total monthly and annual savings in large numbers at the top, then a per-tool breakdown with the current spend, the recommended action, and a one-sentence reason for each. If savings exceed $500/month, a Credex consultation callout appears. If savings are under $100/month, it says "you're spending well" — honestly, without inventing cuts that don't exist.

A short personalised summary paragraph is generated using the Anthropic API based on the audit data. If the API call fails or times out, a rule-based fallback kicks in and the page still renders normally.

**Step 4 — Save the report.**
After seeing the audit, users can enter their email to save the report. The email, company name, role, and team size go to a Supabase database. A confirmation email is sent via Resend. The share URL is public and contains only the spend inputs — no personal information is ever encoded into the link.

---

## How It Was Built

**Frontend: Next.js 14 with TypeScript and Tailwind CSS.**
Next.js was the right choice because the project needs a polished UI, server-rendered share pages with proper Open Graph metadata, API routes, and Vercel deployment — all without splitting into separate services. TypeScript was non-negotiable for the audit engine specifically: financial recommendations need to be typed, testable, and easy to challenge. Tailwind kept the interface fast to build while still letting it feel like a real product rather than a generic template.

**Audit engine: pure TypeScript functions.**
This was the most important architectural decision. The engine lives in `src/lib/audit/engine.ts` as a set of pure functions with no side effects. It takes a spend form state and returns a structured audit report. Every recommendation has a reason string that gets shown to the user. The pricing data lives in a separate catalog (`pricing-catalog.ts`) where every number is sourced from official vendor pages with a verification date. The engine has 23 automated tests.

The decision not to use AI for the math was deliberate. A language model can't be audited the way a pure function can. If the engine says Copilot Enterprise costs $39/seat/month and Business costs $19/seat/month, that's verifiable. If a model says the same thing, you have to trust it. Finance people don't trust things they can't verify.

**Backend: Supabase and Resend.**
Supabase handles lead storage. The database schema is a single leads table with email, audit ID, savings figures, and email delivery status. The service role key stays server-side. Resend handles transactional email — the confirmation email after lead capture. Both integrate through a Next.js API route at `/api/leads` that validates input, checks a honeypot field for bots, applies in-memory rate limiting, writes to Supabase, and sends the email.

**AI summary: Anthropic Messages API.**
The one place AI is used is the ~100-word summary paragraph on the results page. The prompt is narrow: explain the audit in plain language, mention the biggest recommendation, and say "you're spending well" if savings are under $100/month. The call has a 6-second timeout and a deterministic fallback so the page always renders even if the API is down.

**Share URLs: encoded payloads, not database rows.**
The original design stored every audit in Supabase. That got reversed early in the build. Storing anonymous company spend data before a user has agreed to anything breaks the trust model the product is built on. The spend inputs are small enough to encode into a base64 URL parameter — the result page reads from the URL and runs the engine client-side with no database read. Public links are genuinely public and contain no personal information.

**Deployment: Vercel.**
Vercel is the obvious choice for a Next.js project. The CI workflow runs lint and tests on every push to main. Lighthouse scores on the deployed build: Performance 100, Accessibility 100, Best Practices 100 on both pages.

---

## The Credex Connection

SpendLens is designed as a lead-generation product, not just a utility. The funnel works like this: a founder sees the tool on Reddit or Hacker News, runs an audit, discovers they're spending $800/month more than they need to. The result page shows the savings clearly and — for large savings cases — surfaces Credex as the way to centralise the cleanup. The lead capture collects an email and kicks off a Credex sales conversation.

The economics work because Credex can save companies money on the same tools they're already using. SpendLens finds the overspend. Credex fixes it. The audit is free because it makes the sales conversation obvious.
