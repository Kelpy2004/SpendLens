import type { SpendFormState, SpendToolDefinition } from "./types";

export const spendToolDefinitions = [
  {
    id: "cursor",
    name: "Cursor",
    shortName: "Cursor",
    category: "coding",
    planTiers: ["Hobby", "Pro", "Business", "Enterprise"],
    defaultPlanTier: "Pro",
    accentClassName: "bg-[#635bff]",
    description: "AI-native editor spend for builders and product teams.",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    shortName: "Copilot",
    category: "coding",
    planTiers: ["Individual", "Business", "Enterprise"],
    defaultPlanTier: "Business",
    accentClassName: "bg-[#24292f]",
    description: "Seat-based coding assistant attached to GitHub workflows.",
  },
  {
    id: "claude",
    name: "Claude",
    shortName: "Claude",
    category: "assistant",
    planTiers: ["Free", "Pro", "Max", "Team", "Enterprise", "API"],
    defaultPlanTier: "Team",
    accentClassName: "bg-[#d97757]",
    description: "Claude app seats for writing, research, analysis, and PM work.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    shortName: "ChatGPT",
    category: "assistant",
    planTiers: ["Plus", "Team", "Enterprise", "API"],
    defaultPlanTier: "Team",
    accentClassName: "bg-[#10a37f]",
    description: "OpenAI workspace spend for broad team productivity.",
  },
  {
    id: "anthropic-api",
    name: "Anthropic API direct",
    shortName: "Anthropic API",
    category: "api",
    planTiers: ["Usage-based", "Committed use", "Enterprise contract"],
    defaultPlanTier: "Usage-based",
    accentClassName: "bg-[#a16207]",
    description: "Direct model consumption outside the Claude app.",
  },
  {
    id: "openai-api",
    name: "OpenAI API direct",
    shortName: "OpenAI API",
    category: "api",
    planTiers: ["Usage-based", "Scale tier", "Enterprise contract"],
    defaultPlanTier: "Usage-based",
    accentClassName: "bg-[#14b8a6]",
    description: "Direct OpenAI model and platform usage.",
  },
  {
    id: "gemini",
    name: "Gemini",
    shortName: "Gemini",
    category: "general",
    planTiers: ["Pro", "Ultra", "API"],
    defaultPlanTier: "Pro",
    accentClassName: "bg-[#4285f4]",
    description: "Google AI app and API spend for mixed workflows.",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    shortName: "Windsurf",
    category: "coding",
    planTiers: ["Free", "Pro", "Teams", "Enterprise"],
    defaultPlanTier: "Pro",
    accentClassName: "bg-[#06b6d4]",
    description: "Agentic coding IDE seats for engineering teams.",
  },
] as const satisfies readonly SpendToolDefinition[];

export type SpendToolId = (typeof spendToolDefinitions)[number]["id"];

export function createDefaultSpendFormState(): SpendFormState {
  return {
    teamSize: 12,
    primaryUseCase: "coding",
    tools: Object.fromEntries(
      spendToolDefinitions.map((tool) => [
        tool.id,
        {
          isActive: false,
          planTier: tool.defaultPlanTier,
          monthlySpend: 0,
          seats: 0,
        },
      ]),
    ),
  };
}

export function getToolDefinition(toolId: string) {
  return spendToolDefinitions.find((tool) => tool.id === toolId);
}
