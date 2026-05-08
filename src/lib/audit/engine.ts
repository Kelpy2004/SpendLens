import { spendToolDefinitions, type SpendToolId } from "@/lib/spend/tool-catalog";
import type { SpendFormState } from "@/lib/spend/types";
import { sanitizeMoneyInput, sanitizeSeatInput } from "@/lib/spend/summary";
import {
  alternativeOptions,
  estimatePlanCost,
  getPlanPricing,
  getSpendToolName,
  pricingCatalog,
  pricingDataVerifiedAt,
} from "./pricing-catalog";
import type {
  AuditReport,
  PlanPricing,
  SavingsRecommendation,
  ToolAuditResult,
} from "./types";

const MIN_MEANINGFUL_SAVINGS = 1;
const SUBSTANTIAL_SAVINGS_FLOOR = 50;
const SUBSTANTIAL_SAVINGS_RATE = 0.25;

export function buildAuditReport(state: SpendFormState): AuditReport {
  const teamSize = Math.max(1, sanitizeSeatInput(state.teamSize));
  const results = spendToolDefinitions.flatMap((tool) => {
    const input = state.tools[tool.id];

    if (!input?.isActive) {
      return [];
    }

    return [auditTool(tool.id, state, teamSize)];
  });

  const totalCurrentMonthlySpend = roundMoney(
    results.reduce((total, result) => total + result.currentMonthlySpend, 0),
  );
  const totalRecommendedMonthlySpend = roundMoney(
    results.reduce((total, result) => total + result.recommendedMonthlySpend, 0),
  );
  const totalMonthlySavings = roundMoney(
    results.reduce((total, result) => total + result.monthlySavings, 0),
  );

  return {
    teamSize,
    primaryUseCase: state.primaryUseCase,
    pricingDataVerifiedAt,
    totalCurrentMonthlySpend,
    totalCurrentAnnualSpend: roundMoney(totalCurrentMonthlySpend * 12),
    totalRecommendedMonthlySpend,
    totalRecommendedAnnualSpend: roundMoney(totalRecommendedMonthlySpend * 12),
    totalMonthlySavings,
    totalAnnualSavings: roundMoney(totalMonthlySavings * 12),
    results,
  };
}

function auditTool(
  toolId: SpendToolId,
  state: SpendFormState,
  teamSize: number,
): ToolAuditResult {
  const input = state.tools[toolId];
  const currentPlan = getPlanPricing(toolId, input.planTier);
  const seats = Math.max(1, sanitizeSeatInput(input.seats));
  const currentMonthlySpend = sanitizeMoneyInput(input.monthlySpend);
  const expectedPlanMonthlyCost = currentPlan
    ? estimatePlanCost(currentPlan, seats)
    : null;
  const isRightPlanForTeamSize = currentPlan
    ? isPlanRightForTeam(currentPlan, seats, teamSize, currentMonthlySpend)
    : false;

  const cheaperSameVendorPlan = currentPlan
    ? findCheaperSameVendorPlan(
        toolId,
        currentPlan,
        seats,
        teamSize,
        currentMonthlySpend,
      )
    : null;
  const cheaperAlternative =
    currentPlan?.type === "api" || currentPlan?.usageBased
      ? null
      : findCheaperAlternative(
          toolId,
          state,
          seats,
          teamSize,
          currentMonthlySpend,
        );
  const bestSavings = pickBestSavingsRecommendation([
    cheaperSameVendorPlan,
    cheaperAlternative,
  ]);
  const planFitRecommendation = !isRightPlanForTeamSize
    ? findPlanFitRecommendation(toolId, currentPlan, seats, teamSize)
    : null;
  const findings = buildFindings({
    currentMonthlySpend,
    currentPlan,
    expectedPlanMonthlyCost,
    isRightPlanForTeamSize,
    planFitRecommendation,
    seats,
    teamSize,
    toolId,
  });

  if (bestSavings) {
    return {
      toolId,
      toolName: getSpendToolName(toolId),
      currentPlanTier: input.planTier,
      currentMonthlySpend,
      currentAnnualSpend: roundMoney(currentMonthlySpend * 12),
      seats,
      expectedPlanMonthlyCost,
      isRightPlanForTeamSize,
      cheaperSameVendorPlan,
      cheaperAlternative,
      recommendationType: bestSavings.type,
      recommendedToolName: bestSavings.toolName,
      recommendedPlanTier: bestSavings.planTier,
      recommendedMonthlySpend: bestSavings.estimatedMonthlyCost,
      monthlySavings: bestSavings.monthlySavings,
      annualSavings: bestSavings.annualSavings,
      reason: bestSavings.reason,
      findings,
    };
  }

  if (planFitRecommendation) {
    return {
      toolId,
      toolName: getSpendToolName(toolId),
      currentPlanTier: input.planTier,
      currentMonthlySpend,
      currentAnnualSpend: roundMoney(currentMonthlySpend * 12),
      seats,
      expectedPlanMonthlyCost,
      isRightPlanForTeamSize,
      cheaperSameVendorPlan,
      cheaperAlternative,
      recommendationType:
        currentPlan?.type === "api" ? "usage-review" : "plan-fit",
      recommendedToolName: getSpendToolName(toolId),
      recommendedPlanTier: planFitRecommendation.tier,
      recommendedMonthlySpend: currentMonthlySpend,
      monthlySavings: 0,
      annualSavings: 0,
      reason: planFitRecommendation.reason,
      findings,
    };
  }

  return {
    toolId,
    toolName: getSpendToolName(toolId),
    currentPlanTier: input.planTier,
    currentMonthlySpend,
    currentAnnualSpend: roundMoney(currentMonthlySpend * 12),
    seats,
    expectedPlanMonthlyCost,
    isRightPlanForTeamSize,
    cheaperSameVendorPlan,
    cheaperAlternative,
    recommendationType: currentPlan?.type === "api" ? "usage-review" : "keep",
    recommendedToolName: getSpendToolName(toolId),
    recommendedPlanTier: input.planTier,
    recommendedMonthlySpend: currentMonthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason:
      currentPlan?.type === "api"
        ? "Keep the current API setup for now, but review usage exports before claiming savings."
        : "Current spend looks aligned with the selected plan and team size.",
    findings,
  };
}

function findCheaperSameVendorPlan(
  toolId: SpendToolId,
  currentPlan: PlanPricing,
  seats: number,
  teamSize: number,
  currentMonthlySpend: number,
): SavingsRecommendation | null {
  if (currentMonthlySpend <= 0) {
    return null;
  }

  const candidates = pricingCatalog[toolId].plans.reduce<SavingsRecommendation[]>(
    (recommendations, plan) => {
      if (plan.tier === currentPlan.tier) {
        return recommendations;
      }

      const estimatedMonthlyCost = estimatePlanCost(plan, seats);

      if (estimatedMonthlyCost === null) {
        return recommendations;
      }

      if (!isPlanReasonableForSavings(plan, seats, teamSize)) {
        return recommendations;
      }

      const monthlySavings = roundMoney(currentMonthlySpend - estimatedMonthlyCost);

      if (monthlySavings < MIN_MEANINGFUL_SAVINGS) {
        return recommendations;
      }

      recommendations.push({
        type: "same-vendor" as const,
        toolId,
        toolName: getSpendToolName(toolId),
        planTier: plan.tier,
        estimatedMonthlyCost,
        monthlySavings,
        annualSavings: roundMoney(monthlySavings * 12),
        reason: buildSameVendorReason(currentPlan, plan, seats, monthlySavings),
      });

      return recommendations;
    },
    [],
  );

  return pickBestSavingsRecommendation(candidates);
}

function findCheaperAlternative(
  currentToolId: SpendToolId,
  state: SpendFormState,
  seats: number,
  teamSize: number,
  currentMonthlySpend: number,
): SavingsRecommendation | null {
  if (currentMonthlySpend <= 0) {
    return null;
  }

  const substantialSavingsMinimum = Math.max(
    SUBSTANTIAL_SAVINGS_FLOOR,
    currentMonthlySpend * SUBSTANTIAL_SAVINGS_RATE,
  );

  const candidates = alternativeOptions
    .filter((option) => option.toolId !== currentToolId)
    .filter((option) =>
      option.relevantUseCases.some((useCase) => useCase === state.primaryUseCase),
    )
    .reduce<SavingsRecommendation[]>((recommendations, option) => {
      const plan = getPlanPricing(option.toolId, option.planTier);

      if (!plan || !isPlanReasonableForSavings(plan, seats, teamSize)) {
        return recommendations;
      }

      const estimatedMonthlyCost = roundMoney(
        option.estimatedMonthlyCost * Math.max(seats, plan.minimumSeats ?? 1),
      );
      const monthlySavings = roundMoney(currentMonthlySpend - estimatedMonthlyCost);

      if (monthlySavings < substantialSavingsMinimum) {
        return recommendations;
      }

      recommendations.push({
        type: "alternative" as const,
        toolId: option.toolId,
        toolName: option.toolName,
        planTier: option.planTier,
        estimatedMonthlyCost,
        monthlySavings,
        annualSavings: roundMoney(monthlySavings * 12),
        reason: `${option.reason} Estimated savings: ${formatMoney(monthlySavings)}/mo for ${seats} seat${seats === 1 ? "" : "s"}.`,
      });

      return recommendations;
    }, []);

  return pickBestSavingsRecommendation(candidates);
}

function findPlanFitRecommendation(
  toolId: SpendToolId,
  currentPlan: PlanPricing | undefined,
  seats: number,
  teamSize: number,
) {
  if (!currentPlan) {
    return {
      tier: pricingCatalog[toolId].plans[0]?.tier ?? "Unknown",
      reason: "The selected tier is not in SpendLens pricing data, so it needs a manual pricing check.",
    };
  }

  if (currentPlan.type === "api") {
    return {
      tier: currentPlan.tier,
      reason:
        "API spend cannot be judged by seats alone; export token usage by model before making a finance recommendation.",
    };
  }

  const teamPlan = pricingCatalog[toolId].plans.find((plan) =>
    ["team", "enterprise"].includes(plan.type),
  );
  const individualPlan = pricingCatalog[toolId].plans.find(
    (plan) => plan.type === "individual",
  );

  if (currentPlan.type === "enterprise" && teamSize < 50 && teamPlan) {
    return {
      tier: teamPlan.tier,
      reason:
        "Enterprise is hard to justify below about 50 people unless procurement, security, or support requirements are unusually strict.",
    };
  }

  if (currentPlan.type === "team" && seats < (currentPlan.minimumSeats ?? 1)) {
    return {
      tier: individualPlan?.tier ?? currentPlan.tier,
      reason: `${currentPlan.displayName} has a ${currentPlan.minimumSeats}-seat billing floor, so a smaller seat count should be checked before renewal.`,
    };
  }

  if (["free", "individual"].includes(currentPlan.type) && seats > 4 && teamPlan) {
    return {
      tier: teamPlan.tier,
      reason:
        "Multiple unmanaged individual seats are usually a finance and security smell; move to a team plan if the whole group relies on it.",
    };
  }

  return {
    tier: currentPlan.tier,
    reason:
      "The selected tier is unusual for this team size and should be checked against actual security, admin, and usage needs.",
  };
}

function isPlanRightForTeam(
  plan: PlanPricing,
  seats: number,
  teamSize: number,
  currentMonthlySpend: number,
) {
  if (plan.type === "api") {
    return currentMonthlySpend > 0;
  }

  if (plan.type === "enterprise") {
    return teamSize >= (plan.recommendedMinTeamSize ?? 50) || currentMonthlySpend >= 2500;
  }

  if (plan.minimumSeats && seats < plan.minimumSeats) {
    return false;
  }

  if (plan.recommendedMinTeamSize && seats < plan.recommendedMinTeamSize) {
    return false;
  }

  if (plan.recommendedMaxTeamSize && seats > plan.recommendedMaxTeamSize) {
    return false;
  }

  return true;
}

function isPlanReasonableForSavings(
  plan: PlanPricing,
  seats: number,
  teamSize: number,
) {
  if (plan.type === "api" || plan.type === "enterprise") {
    return false;
  }

  if (plan.minimumSeats && seats < plan.minimumSeats) {
    return true;
  }

  if (plan.recommendedMaxTeamSize && seats > plan.recommendedMaxTeamSize) {
    return false;
  }

  if (plan.type === "individual" && teamSize > 8 && seats > 4) {
    return false;
  }

  return true;
}

function pickBestSavingsRecommendation(
  recommendations: readonly (SavingsRecommendation | null)[],
) {
  return recommendations.reduce<SavingsRecommendation | null>(
    (best, recommendation) => {
      if (!recommendation) {
        return best;
      }

      if (!best || recommendation.monthlySavings > best.monthlySavings) {
        return recommendation;
      }

      return best;
    },
    null,
  );
}

function buildFindings({
  currentMonthlySpend,
  currentPlan,
  expectedPlanMonthlyCost,
  isRightPlanForTeamSize,
  planFitRecommendation,
  seats,
  teamSize,
  toolId,
}: {
  currentMonthlySpend: number;
  currentPlan: PlanPricing | undefined;
  expectedPlanMonthlyCost: number | null;
  isRightPlanForTeamSize: boolean;
  planFitRecommendation: { tier: string; reason: string } | null;
  seats: number;
  teamSize: number;
  toolId: SpendToolId;
}) {
  const findings: string[] = [];
  const planLabel = currentPlan?.displayName ?? "Unknown plan";

  findings.push(
    isRightPlanForTeamSize
      ? `${planLabel} fits ${seats} seat${seats === 1 ? "" : "s"} inside a ${teamSize}-person team.`
      : planFitRecommendation?.reason ??
          `${planLabel} does not cleanly fit the entered team size.`,
  );

  if (expectedPlanMonthlyCost !== null) {
    const variance = currentMonthlySpend - expectedPlanMonthlyCost;

    if (variance > Math.max(25, expectedPlanMonthlyCost * 0.2)) {
      findings.push(
        `Reported spend is ${formatMoney(variance)}/mo above list-price math; check stale seats, add-ons, annual billing, or taxes before renewal.`,
      );
    }
  }

  if (currentPlan?.usageBased || currentPlan?.type === "api") {
    findings.push(
      `${getSpendToolName(toolId)} API spend needs model-level usage exports before SpendLens claims hard savings.`,
    );
  }

  return findings;
}

function buildSameVendorReason(
  currentPlan: PlanPricing,
  targetPlan: PlanPricing,
  seats: number,
  monthlySavings: number,
) {
  return `${targetPlan.displayName} is a cheaper same-vendor fit than ${currentPlan.displayName} for ${seats} seat${seats === 1 ? "" : "s"}, saving ${formatMoney(monthlySavings)}/mo at list price.`;
}

function roundMoney(value: number) {
  return Math.max(0, Math.round(value * 100) / 100);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
