export const primaryUseCases = [
  "coding",
  "writing",
  "data",
  "research",
  "mixed",
] as const;

export type PrimaryUseCase = (typeof primaryUseCases)[number];

export type ToolSpendInput = {
  isActive: boolean;
  planTier: string;
  monthlySpend: number;
  seats: number;
};

export type SpendFormState = {
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  tools: Record<string, ToolSpendInput>;
};

export type SpendToolDefinition = {
  id: string;
  name: string;
  shortName: string;
  category: "coding" | "assistant" | "api" | "general";
  planTiers: readonly string[];
  defaultPlanTier: string;
  accentClassName: string;
  description: string;
};
