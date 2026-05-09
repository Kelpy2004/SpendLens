import type { AuditReport, ToolAuditResult } from "./types";
import { formatCurrency } from "@/lib/spend/summary";

export type AuditSummaryResult = {
  source: "anthropic" | "fallback";
  text: string;
};

export const auditSummarySystemPrompt =
  "You are SpendLens, a concise AI spend audit product for founders, finance leads, and engineering leaders. Write like a sharp operator: specific, calm, honest, and useful. Never invent savings. If the audit shows low savings, say the team is spending well.";

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";
const SUMMARY_TIMEOUT_MS = 6000;

export async function generateAuditSummary(
  report: AuditReport,
): Promise<AuditSummaryResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      source: "fallback",
      text: buildTemplatedAuditSummary(report),
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUMMARY_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        max_tokens: 170,
        messages: [
          {
            role: "user",
            content: buildAuditSummaryPrompt(report),
          },
        ],
        model: process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL,
        system: auditSummarySystemPrompt,
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Anthropic summary failed: ${response.status}`);
    }

    const data = (await response.json()) as AnthropicMessageResponse;
    const text = data.content
      ?.filter(isAnthropicTextBlock)
      .map((part) => part.text)
      .join(" ")
      .trim();

    if (!text) {
      throw new Error("Anthropic summary returned no text");
    }

    return {
      source: "anthropic",
      text: limitWords(text, 115),
    };
  } catch {
    return {
      source: "fallback",
      text: buildTemplatedAuditSummary(report),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function buildAuditSummaryPrompt(report: AuditReport) {
  const topFindings = [...report.results]
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 4)
    .map(formatToolForPrompt);

  return `Write a single personalized SpendLens audit summary paragraph of about 100 words.

Rules:
- Mention total monthly and annual savings.
- Mention the biggest recommendation if there is one.
- If monthly savings are under $100, honestly say the team is spending well.
- Do not include bullets, markdown, headings, or sales hype.
- Do not mention email, company name, or any identifying information.
- Do not invent facts beyond the audit data below.

Audit data:
Team size: ${report.teamSize}
Primary use case: ${report.primaryUseCase}
Current monthly spend: ${formatCurrency(report.totalCurrentMonthlySpend)}
Recommended monthly spend: ${formatCurrency(report.totalRecommendedMonthlySpend)}
Monthly savings: ${formatCurrency(report.totalMonthlySavings)}
Annual savings: ${formatCurrency(report.totalAnnualSavings)}
Tool findings:
${topFindings.length > 0 ? topFindings.join("\n") : "No active tools were submitted."}`;
}

export function buildTemplatedAuditSummary(report: AuditReport) {
  const topFinding = [...report.results].sort(
    (a, b) => b.monthlySavings - a.monthlySavings,
  )[0];
  const savings = formatCurrency(report.totalMonthlySavings);
  const annualSavings = formatCurrency(report.totalAnnualSavings);

  if (!topFinding || report.totalMonthlySavings < 100) {
    return limitWords(
      `SpendLens reviewed ${report.results.length} active AI tool${report.results.length === 1 ? "" : "s"} for a ${report.teamSize}-person team focused on ${report.primaryUseCase}. The audit found ${savings}/mo in defensible savings, or ${annualSavings}/yr. That is below the threshold where we would push a procurement change, so the honest read is that you're spending well. Keep monitoring seat counts, API usage exports, and renewal dates rather than forcing cuts that could slow the team down.`,
      115,
    );
  }

  return limitWords(
    `SpendLens reviewed ${report.results.length} active AI tool${report.results.length === 1 ? "" : "s"} for a ${report.teamSize}-person team focused on ${report.primaryUseCase}. The audit found ${savings}/mo in defensible savings, or ${annualSavings}/yr. The biggest move is ${topFinding.toolName}: ${topFinding.reason} Start there first, then check the remaining recommendations against actual usage and renewal timing before changing every subscription at once.`,
    115,
  );
}

function formatToolForPrompt(result: ToolAuditResult) {
  return `- ${result.toolName}: current ${result.currentPlanTier} at ${formatCurrency(
    result.currentMonthlySpend,
  )}/mo -> recommend ${result.recommendedToolName} ${
    result.recommendedPlanTier
  } at ${formatCurrency(result.recommendedMonthlySpend)}/mo; savings ${formatCurrency(
    result.monthlySavings,
  )}/mo; reason: ${result.reason}`;
}

function limitWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);

  if (words.length <= maxWords) {
    return text.trim();
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}

type AnthropicContentBlock =
  | {
      text: string;
      type: "text";
    }
  | {
      type: string;
    };

type AnthropicMessageResponse = {
  content?: AnthropicContentBlock[];
};

function isAnthropicTextBlock(part: AnthropicContentBlock): part is {
  text: string;
  type: "text";
} {
  return part.type === "text" && "text" in part && typeof part.text === "string";
}
