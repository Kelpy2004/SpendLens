import { buildAuditReport } from "./engine";
import { createDefaultSpendFormState, type SpendToolId } from "@/lib/spend/tool-catalog";
import type { PrimaryUseCase, SpendFormState, ToolSpendInput } from "@/lib/spend/types";

function makeState({
  primaryUseCase = "coding",
  teamSize,
  toolId,
  toolInput,
}: {
  primaryUseCase?: PrimaryUseCase;
  teamSize: number;
  toolId: SpendToolId;
  toolInput: Omit<ToolSpendInput, "isActive">;
}): SpendFormState {
  const state = createDefaultSpendFormState();

  state.primaryUseCase = primaryUseCase;
  state.teamSize = teamSize;
  state.tools[toolId] = {
    isActive: true,
    ...toolInput,
  };

  return state;
}

describe("audit recommendation engine", () => {
  it("recommends a cheaper Claude plan when Team is below the seat floor", () => {
    const report = buildAuditReport(
      makeState({
        primaryUseCase: "writing",
        teamSize: 2,
        toolId: "claude",
        toolInput: {
          planTier: "Team",
          monthlySpend: 150,
          seats: 2,
        },
      }),
    );

    const [result] = report.results;

    expect(result.isRightPlanForTeamSize).toBe(false);
    expect(result.cheaperSameVendorPlan).toMatchObject({
      planTier: "Pro",
      monthlySavings: 110,
      annualSavings: 1320,
    });
  });

  it("rightsizes Copilot Enterprise to Business for a smaller engineering team", () => {
    const report = buildAuditReport(
      makeState({
        teamSize: 10,
        toolId: "github-copilot",
        toolInput: {
          planTier: "Enterprise",
          monthlySpend: 390,
          seats: 10,
        },
      }),
    );

    const [result] = report.results;

    expect(result.recommendationType).toBe("same-vendor");
    expect(result.recommendedPlanTier).toBe("Business");
    expect(result.monthlySavings).toBe(200);
    expect(result.isRightPlanForTeamSize).toBe(false);
  });

  it("finds a substantially cheaper coding alternative when team-seat pricing is high", () => {
    const report = buildAuditReport(
      makeState({
        teamSize: 10,
        toolId: "cursor",
        toolInput: {
          planTier: "Business",
          monthlySpend: 400,
          seats: 10,
        },
      }),
    );

    const [result] = report.results;

    expect(result.recommendationType).toBe("alternative");
    expect(result.recommendedToolName).toBe("GitHub Copilot");
    expect(result.recommendedPlanTier).toBe("Business");
    expect(result.monthlySavings).toBe(210);
  });

  it("does not manufacture savings for an already efficient Copilot Business setup", () => {
    const report = buildAuditReport(
      makeState({
        teamSize: 10,
        toolId: "github-copilot",
        toolInput: {
          planTier: "Business",
          monthlySpend: 190,
          seats: 10,
        },
      }),
    );

    const [result] = report.results;

    expect(result.recommendationType).toBe("keep");
    expect(result.monthlySavings).toBe(0);
    expect(result.cheaperSameVendorPlan).toBeNull();
    expect(result.cheaperAlternative).toBeNull();
    expect(report.totalMonthlySavings).toBe(0);
  });

  it("treats API spend as a usage review instead of comparing it to app seats", () => {
    const report = buildAuditReport(
      makeState({
        primaryUseCase: "data",
        teamSize: 8,
        toolId: "openai-api",
        toolInput: {
          planTier: "Usage-based",
          monthlySpend: 1000,
          seats: 1,
        },
      }),
    );

    const [result] = report.results;

    expect(result.recommendationType).toBe("usage-review");
    expect(result.monthlySavings).toBe(0);
    expect(result.cheaperAlternative).toBeNull();
    expect(result.reason).toContain("usage");
  });

  it("flags reported spend that is materially above official list price", () => {
    const report = buildAuditReport(
      makeState({
        teamSize: 2,
        toolId: "cursor",
        toolInput: {
          planTier: "Pro",
          monthlySpend: 70,
          seats: 2,
        },
      }),
    );

    const [result] = report.results;

    expect(result.expectedPlanMonthlyCost).toBe(40);
    expect(result.findings.join(" ")).toContain("above list-price math");
  });

  it("returns an empty report when no tools are active", () => {
    const report = buildAuditReport(createDefaultSpendFormState());

    expect(report.results).toEqual([]);
    expect(report.totalCurrentMonthlySpend).toBe(0);
    expect(report.totalMonthlySavings).toBe(0);
  });
});

