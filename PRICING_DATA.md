# SpendLens Pricing Data

Verified on May 8, 2026. Prices are in USD and exclude taxes unless a vendor says otherwise. For seat products, SpendLens uses monthly billing list price because the audit asks users for current monthly spend. Annual discounts are documented, but not used as the default math unless the user later tells us they are actually billed annually.

The important product decision here: the engine only claims hard savings when the comparison is a clean seat-to-seat or plan-to-plan comparison. API spend is documented here, but the app does not pretend an API bill can be reduced without token exports by model, cache hit rate, batch eligibility, and request class.

## Cursor

Source: [Cursor pricing](https://cursor.com/pricing), verified May 8, 2026.

| SpendLens tier | Official plan used | Price used in engine | Notes |
| --- | --- | ---: | --- |
| Hobby | Hobby | $0/mo | Free individual plan. |
| Pro | Pro | $20/mo | Individual plan. Cursor also lists Pro+ at $60/mo and Ultra at $200/mo, but those are not in the assignment's required tier list. |
| Business | Teams | $40/user/mo | The assignment says Business; Cursor's current label is Teams. This is the right comparable team-admin tier. |
| Enterprise | Enterprise | Custom | Use only when governance, SCIM, audit logs, pooled usage, or invoice/PO billing matters. |

## GitHub Copilot

Source: [GitHub Copilot plans](https://docs.github.com/en/copilot/get-started/plans), verified May 8, 2026.

| SpendLens tier | Official plan used | Price used in engine | Notes |
| --- | --- | ---: | --- |
| Individual | Copilot Pro | $10/mo | The assignment says Individual; GitHub's current paid individual tier is Copilot Pro. |
| Business | Copilot Business | $19/granted seat/mo | This is the default team recommendation for engineering orgs that do not need Enterprise. |
| Enterprise | Copilot Enterprise | $39/granted seat/mo | Needs GitHub Enterprise-style controls or a larger governance case to justify the premium. |

## Claude

Source: [Claude pricing](https://www.anthropic.com/pricing), verified May 8, 2026. Anthropic redirects this page to `claude.com/pricing`, but the source is still official Anthropic/Claude pricing.

| SpendLens tier | Official plan used | Price used in engine | Notes |
| --- | --- | ---: | --- |
| Free | Free | $0/mo | Individual free plan. |
| Pro | Pro | $20/mo | Claude lists $17/mo with annual billing and $20/mo if billed monthly. SpendLens uses the monthly price. |
| Max | Max | From $100/mo | Max starts at $100/mo. The engine treats it as a heavy individual plan, not a team plan. |
| Team | Team standard seat | $25/seat/mo | Claude lists $20/seat/mo annually and $25/seat/mo monthly, with Team positioned for 5 to 150 people. The engine applies a 5-seat floor. |
| Enterprise | Enterprise self-serve | $20/seat + API-rate usage | Enterprise is seat price plus usage, so SpendLens treats it as usage-sensitive rather than a simple cheaper-plan comparison. |
| API | Claude API | Usage-based | Current benchmark models on the pricing page: Opus 4.7 is $5 input and $25 output per MTok, Sonnet 4.6 is $3 input and $15 output per MTok, Haiku 4.5 is $1 input and $5 output per MTok. Batch processing is advertised as 50% savings. |

## ChatGPT

Sources: [ChatGPT Plus help](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus), [ChatGPT Business help](https://help.openai.com/en/articles/8792828-what-is-chatgpt-business), and [OpenAI business pricing](https://openai.com/business/chatgpt-pricing/), verified May 8, 2026.

| SpendLens tier | Official plan used | Price used in engine | Notes |
| --- | --- | ---: | --- |
| Plus | ChatGPT Plus | $20/mo | Official help center states Plus is $20/month, billed monthly. |
| Team | ChatGPT Business | $25/user/mo | OpenAI renamed Team to Business. Standard ChatGPT seats start at 2 users and are $25/user/mo monthly in USD, with $20/user/mo annual billing noted in help docs. |
| Enterprise | ChatGPT Enterprise | Custom | Use for larger deployments, custom terms, data controls, support, and enterprise procurement needs. |
| API | OpenAI API | Usage-based | ChatGPT subscriptions do not include API usage. API spend is tracked separately. |

## OpenAI API Direct

Source: [OpenAI API pricing](https://openai.com/api/pricing/), verified May 8, 2026.

| SpendLens tier | Official plan used | Price used in engine | Notes |
| --- | --- | ---: | --- |
| Usage-based | OpenAI API | Usage-based | Benchmarks used for reasoning: GPT-5.5 is $5 input, $0.50 cached input, and $30 output per 1M tokens. GPT-5.4 is $2.50 input, $0.25 cached input, and $15 output per 1M tokens. GPT-5.4 mini is $0.75 input, $0.075 cached input, and $4.50 output per 1M tokens. |
| Scale tier | Scale / reserved usage | Usage-based | Only makes sense with predictable production usage or capacity requirements. |
| Enterprise contract | Enterprise contract | Custom | Requires committed volume, support, data residency, or custom legal/commercial terms. |

## Anthropic API Direct

Source: [Claude pricing](https://www.anthropic.com/pricing), verified May 8, 2026.

| SpendLens tier | Official plan used | Price used in engine | Notes |
| --- | --- | ---: | --- |
| Usage-based | Claude API | Usage-based | Current benchmark models: Opus 4.7 is $5 input and $25 output per MTok; Sonnet 4.6 is $3 input and $15 output per MTok; Haiku 4.5 is $1 input and $5 output per MTok. |
| Committed use | Claude API commitment | Usage-based | A finance-safe recommendation needs actual monthly volume, model mix, and contract terms. |
| Enterprise contract | Anthropic enterprise API | Custom | Reasonable only with security, support, committed volume, or custom procurement requirements. |

## Gemini

Sources: [Gemini subscriptions](https://gemini.google/us/subscriptions/) and [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing), verified May 8, 2026.

| SpendLens tier | Official plan used | Price used in engine | Notes |
| --- | --- | ---: | --- |
| Pro | Google AI Pro | $19.99/mo | United States subscription price. |
| Ultra | Google AI Ultra | $249.99/mo | United States subscription price. This should only survive the audit when the user really needs the highest Gemini limits. |
| API | Gemini API | Usage-based | Gemini 3.1 Pro Preview standard pricing is $2 input and $12 output per 1M tokens for prompts up to 200k tokens. Gemini 3.1 Flash-Lite standard pricing is $0.25 input and $1.50 output per 1M tokens. Batch and flex modes are cheaper where available. |

## Windsurf

Source: [Windsurf pricing](https://windsurf.com/pricing), verified May 8, 2026.

| SpendLens tier | Official plan used | Price used in engine | Notes |
| --- | --- | ---: | --- |
| Free | Free | $0/mo | Individual free plan. |
| Pro | Pro | $20/mo | Individual plan. |
| Teams | Teams | $40/user/mo | Team plan with centralized billing, admin analytics, priority support, knowledge base, SSO/access features, and RBAC. |
| Enterprise | Enterprise | Custom | Use when volume discounts, hybrid deployment, account management, or enterprise controls matter. |

