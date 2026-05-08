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

