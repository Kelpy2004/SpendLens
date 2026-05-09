# SpendLens Prompts

SpendLens only uses AI for the personalized summary paragraph on the public audit result page. The recommendations, savings math, and plan-fit calls are hardcoded TypeScript rules. That split matters: the finance logic stays deterministic, and the model only turns already-computed audit facts into a clearer explanation.

## Audit Summary Prompt

System prompt:

```text
You are SpendLens, a concise AI spend audit product for founders, finance leads, and engineering leaders. Write like a sharp operator: specific, calm, honest, and useful. Never invent savings. If the audit shows low savings, say the team is spending well.
```

User prompt template:

```text
Write a single personalized SpendLens audit summary paragraph of about 100 words.

Rules:
- Mention total monthly and annual savings.
- Mention the biggest recommendation if there is one.
- If monthly savings are under $100, honestly say the team is spending well.
- Do not include bullets, markdown, headings, or sales hype.
- Do not mention email, company name, or any identifying information.
- Do not invent facts beyond the audit data below.

Audit data:
Team size: {{teamSize}}
Primary use case: {{primaryUseCase}}
Current monthly spend: {{currentMonthlySpend}}
Recommended monthly spend: {{recommendedMonthlySpend}}
Monthly savings: {{monthlySavings}}
Annual savings: {{annualSavings}}
Tool findings:
{{toolFindings}}
```

The prompt is intentionally narrow. It asks for one paragraph because this page is meant to be screenshotted and shared, not read like a report. It names the savings numbers explicitly so the model does not round or improvise. It also tells the model to say "spending well" when savings are under $100/month, because fake savings are worse than no savings. A finance lead should feel that the paragraph is explaining the audit, not trying to sell them a magic trick.

The API call uses the Anthropic Messages API with `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, a 6-second timeout, and a deterministic fallback summary. If Claude fails, times out, or returns no text, the result page still renders with the same audit math and a rule-based summary.

