import type { PrimaryUseCase } from "@/lib/spend/types";
import type { SpendToolId } from "@/lib/spend/tool-catalog";

export type PlanType = "free" | "individual" | "team" | "enterprise" | "api";

export type PricingSource = {
  label: string;
  url: string;
  verifiedAt: string;
};

export type PlanPricing = {
  tier: string;
  displayName: string;
  type: PlanType;
  monthlyBasePrice?: number;
  monthlyPerSeat?: number;
  minimumSeats?: number;
  customPricing?: boolean;
  usageBased?: boolean;
  recommendedMinTeamSize?: number;
  recommendedMaxTeamSize?: number;
  source: PricingSource;
  notes: string;
};

export type ToolPricing = {
  toolId: SpendToolId;
  vendorName: string;
  plans: readonly PlanPricing[];
};

export type AlternativeOption = {
  toolId: SpendToolId;
  toolName: string;
  planTier: string;
  estimatedMonthlyCost: number;
  reason: string;
  relevantUseCases: readonly PrimaryUseCase[];
};

export type AuditRecommendationType =
  | "keep"
  | "same-vendor"
  | "alternative"
  | "plan-fit"
  | "usage-review";

export type SavingsRecommendation = {
  type: Extract<AuditRecommendationType, "same-vendor" | "alternative">;
  toolId: SpendToolId;
  toolName: string;
  planTier: string;
  estimatedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
};

export type ToolAuditResult = {
  toolId: SpendToolId;
  toolName: string;
  currentPlanTier: string;
  currentMonthlySpend: number;
  currentAnnualSpend: number;
  seats: number;
  expectedPlanMonthlyCost: number | null;
  isRightPlanForTeamSize: boolean;
  cheaperSameVendorPlan: SavingsRecommendation | null;
  cheaperAlternative: SavingsRecommendation | null;
  recommendationType: AuditRecommendationType;
  recommendedToolName: string;
  recommendedPlanTier: string;
  recommendedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  findings: readonly string[];
};

export type AuditReport = {
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  pricingDataVerifiedAt: string;
  totalCurrentMonthlySpend: number;
  totalCurrentAnnualSpend: number;
  totalRecommendedMonthlySpend: number;
  totalRecommendedAnnualSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  results: readonly ToolAuditResult[];
};
