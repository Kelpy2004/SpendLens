import {
  auditSummarySystemPrompt,
  buildAuditSummaryPrompt,
  buildTemplatedAuditSummary,
} from "./ai-summary";
import { buildAuditReport } from "./engine";
import { createDefaultSpendFormState } from "@/lib/spend/tool-catalog";

describe("AI audit summary helpers", () => {
  it("builds a constrained prompt from audit data", () => {
    const state = createDefaultSpendFormState();
    state.teamSize = 10;
    state.primaryUseCase = "coding";
    state.tools["github-copilot"] = {
      isActive: true,
      monthlySpend: 390,
      planTier: "Enterprise",
      seats: 10,
    };

    const prompt = buildAuditSummaryPrompt(buildAuditReport(state));

    expect(prompt).toContain("about 100 words");
    expect(prompt).toContain("Monthly savings: $200");
    expect(prompt).toContain("GitHub Copilot");
    expect(prompt).toContain("Do not include bullets");
  });

  it("keeps the system prompt honest about low-savings audits", () => {
    expect(auditSummarySystemPrompt).toContain("Never invent savings");
    expect(auditSummarySystemPrompt).toContain("spending well");
  });

  it("falls back to a plain-English spending-well summary", () => {
    const report = buildAuditReport(createDefaultSpendFormState());
    const summary = buildTemplatedAuditSummary(report);

    expect(summary).toContain("you're spending well");
    expect(summary.split(/\s+/).length).toBeLessThanOrEqual(115);
  });
});

