import { spendToolDefinitions, type SpendToolId } from "@/lib/spend/tool-catalog";
import type {
  AlternativeOption,
  PlanPricing,
  PricingSource,
  ToolPricing,
} from "./types";

const VERIFIED_AT = "2026-05-08";

const sources = {
  anthropicPricing: {
    label: "Claude pricing",
    url: "https://www.anthropic.com/pricing",
    verifiedAt: VERIFIED_AT,
  },
  chatgptBusinessHelp: {
    label: "ChatGPT Business help",
    url: "https://help.openai.com/en/articles/8792828-what-is-chatgpt-team",
    verifiedAt: VERIFIED_AT,
  },
  chatgptPlans: {
    label: "ChatGPT pricing",
    url: "https://openai.com/chatgpt/pricing",
    verifiedAt: VERIFIED_AT,
  },
  chatgptPlusHelp: {
    label: "ChatGPT Plus help",
    url: "https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus",
    verifiedAt: VERIFIED_AT,
  },
  cursorPricing: {
    label: "Cursor pricing",
    url: "https://cursor.com/pricing",
    verifiedAt: VERIFIED_AT,
  },
  geminiApiPricing: {
    label: "Gemini Developer API pricing",
    url: "https://ai.google.dev/gemini-api/docs/pricing",
    verifiedAt: VERIFIED_AT,
  },
  geminiSubscriptions: {
    label: "Gemini subscriptions",
    url: "https://gemini.google/us/subscriptions/",
    verifiedAt: VERIFIED_AT,
  },
  githubCopilotPlans: {
    label: "GitHub Copilot plans",
    url: "https://docs.github.com/en/copilot/get-started/plans",
    verifiedAt: VERIFIED_AT,
  },
  openaiApiPricing: {
    label: "OpenAI API pricing",
    url: "https://openai.com/api/pricing/",
    verifiedAt: VERIFIED_AT,
  },
  windsurfPricing: {
    label: "Windsurf pricing",
    url: "https://windsurf.com/pricing",
    verifiedAt: VERIFIED_AT,
  },
} satisfies Record<string, PricingSource>;

export const pricingDataVerifiedAt = VERIFIED_AT;

export const pricingCatalog = {
  "anthropic-api": {
    toolId: "anthropic-api",
    vendorName: "Anthropic API direct",
    plans: [
      {
        tier: "Usage-based",
        displayName: "Usage-based",
        type: "api",
        usageBased: true,
        source: sources.anthropicPricing,
        notes:
          "Claude API usage is metered by model. Haiku 4.5 is $1 input and $5 output per MTok; Sonnet 4.6 is $3 input and $15 output per MTok.",
      },
      {
        tier: "Committed use",
        displayName: "Committed use",
        type: "api",
        usageBased: true,
        source: sources.anthropicPricing,
        notes:
          "Committed use can make sense when monthly traffic is predictable enough to negotiate discounts or usage controls.",
      },
      {
        tier: "Enterprise contract",
        displayName: "Enterprise contract",
        type: "enterprise",
        customPricing: true,
        recommendedMinTeamSize: 50,
        source: sources.anthropicPricing,
        notes:
          "Enterprise API contracts should be reserved for security, support, or committed-volume needs.",
      },
    ],
  },
  chatgpt: {
    toolId: "chatgpt",
    vendorName: "ChatGPT",
    plans: [
      {
        tier: "Plus",
        displayName: "Plus",
        type: "individual",
        monthlyPerSeat: 20,
        recommendedMaxTeamSize: 1,
        source: sources.chatgptPlusHelp,
        notes: "Individual subscription at $20 per month.",
      },
      {
        tier: "Team",
        displayName: "Business",
        type: "team",
        monthlyPerSeat: 25,
        minimumSeats: 2,
        recommendedMinTeamSize: 2,
        recommendedMaxTeamSize: 149,
        source: sources.chatgptBusinessHelp,
        notes:
          "The intake keeps the older Team label; OpenAI renamed it ChatGPT Business. Monthly billing is $25 per user with a two-seat minimum.",
      },
      {
        tier: "Enterprise",
        displayName: "Enterprise",
        type: "enterprise",
        customPricing: true,
        recommendedMinTeamSize: 150,
        source: sources.chatgptPlans,
        notes:
          "Enterprise adds SCIM, advanced controls, data residency, support, custom terms, and volume discounts.",
      },
      {
        tier: "API",
        displayName: "API",
        type: "api",
        usageBased: true,
        source: sources.openaiApiPricing,
        notes:
          "ChatGPT API usage is separate from app seats and should be tracked as OpenAI API direct spend.",
      },
    ],
  },
  claude: {
    toolId: "claude",
    vendorName: "Claude",
    plans: [
      {
        tier: "Free",
        displayName: "Free",
        type: "free",
        monthlyPerSeat: 0,
        recommendedMaxTeamSize: 1,
        source: sources.anthropicPricing,
        notes: "Free Claude access for individual use.",
      },
      {
        tier: "Pro",
        displayName: "Pro",
        type: "individual",
        monthlyPerSeat: 20,
        recommendedMaxTeamSize: 4,
        source: sources.anthropicPricing,
        notes: "Claude Pro is $20 monthly, or $17 monthly when billed annually.",
      },
      {
        tier: "Max",
        displayName: "Max",
        type: "individual",
        monthlyPerSeat: 100,
        recommendedMaxTeamSize: 4,
        source: sources.anthropicPricing,
        notes:
          "Claude Max starts at $100 per month for heavy individual usage.",
      },
      {
        tier: "Team",
        displayName: "Team standard seat",
        type: "team",
        monthlyPerSeat: 25,
        minimumSeats: 5,
        recommendedMinTeamSize: 5,
        recommendedMaxTeamSize: 150,
        source: sources.anthropicPricing,
        notes:
          "Claude Team standard seats are $25 per seat monthly, with Claude positioning Team for 5 to 150 users.",
      },
      {
        tier: "Enterprise",
        displayName: "Enterprise",
        type: "enterprise",
        monthlyPerSeat: 20,
        usageBased: true,
        recommendedMinTeamSize: 150,
        source: sources.anthropicPricing,
        notes:
          "Claude Enterprise self-serve lists $20 per seat plus API-rate usage; sales-assisted deployments are custom.",
      },
      {
        tier: "API",
        displayName: "API",
        type: "api",
        usageBased: true,
        source: sources.anthropicPricing,
        notes:
          "Claude API is model-metered and separate from Claude app seats.",
      },
    ],
  },
  cursor: {
    toolId: "cursor",
    vendorName: "Cursor",
    plans: [
      {
        tier: "Hobby",
        displayName: "Hobby",
        type: "free",
        monthlyPerSeat: 0,
        recommendedMaxTeamSize: 1,
        source: sources.cursorPricing,
        notes: "Free individual plan with limited Agent requests.",
      },
      {
        tier: "Pro",
        displayName: "Pro",
        type: "individual",
        monthlyPerSeat: 20,
        recommendedMaxTeamSize: 4,
        source: sources.cursorPricing,
        notes:
          "Cursor Pro is $20 per month and is the cleaner fit for small teams that do not need central billing or admin.",
      },
      {
        tier: "Business",
        displayName: "Teams",
        type: "team",
        monthlyPerSeat: 40,
        recommendedMinTeamSize: 2,
        recommendedMaxTeamSize: 49,
        source: sources.cursorPricing,
        notes:
          "The intake uses Business; Cursor's current page labels this plan Teams at $40 per user monthly.",
      },
      {
        tier: "Enterprise",
        displayName: "Enterprise",
        type: "enterprise",
        customPricing: true,
        recommendedMinTeamSize: 50,
        source: sources.cursorPricing,
        notes:
          "Enterprise is custom and is mainly justified by pooled usage, SSO/SCIM, audit logs, PO billing, and granular controls.",
      },
    ],
  },
  gemini: {
    toolId: "gemini",
    vendorName: "Gemini",
    plans: [
      {
        tier: "Pro",
        displayName: "Google AI Pro",
        type: "individual",
        monthlyPerSeat: 19.99,
        recommendedMaxTeamSize: 4,
        source: sources.geminiSubscriptions,
        notes: "Google AI Pro is $19.99 per month in the United States.",
      },
      {
        tier: "Ultra",
        displayName: "Google AI Ultra",
        type: "individual",
        monthlyPerSeat: 249.99,
        recommendedMaxTeamSize: 3,
        source: sources.geminiSubscriptions,
        notes:
          "Ultra is $249.99 monthly and is only rational for users who genuinely need the highest Gemini limits.",
      },
      {
        tier: "API",
        displayName: "Gemini API",
        type: "api",
        usageBased: true,
        source: sources.geminiApiPricing,
        notes:
          "Gemini API pricing is model-metered; Gemini 3.1 Pro Preview lists $2 input and $12 output per 1M tokens for prompts up to 200k.",
      },
    ],
  },
  "github-copilot": {
    toolId: "github-copilot",
    vendorName: "GitHub Copilot",
    plans: [
      {
        tier: "Individual",
        displayName: "Copilot Pro",
        type: "individual",
        monthlyPerSeat: 10,
        recommendedMaxTeamSize: 1,
        source: sources.githubCopilotPlans,
        notes:
          "The intake's Individual tier maps to Copilot Pro at $10 per month.",
      },
      {
        tier: "Business",
        displayName: "Copilot Business",
        type: "team",
        monthlyPerSeat: 19,
        recommendedMinTeamSize: 2,
        recommendedMaxTeamSize: 199,
        source: sources.githubCopilotPlans,
        notes: "Copilot Business is $19 per granted seat per month.",
      },
      {
        tier: "Enterprise",
        displayName: "Copilot Enterprise",
        type: "enterprise",
        monthlyPerSeat: 39,
        recommendedMinTeamSize: 50,
        source: sources.githubCopilotPlans,
        notes:
          "Enterprise is $39 per granted seat per month and makes sense when GitHub Enterprise workflows or larger governance needs justify it.",
      },
    ],
  },
  "openai-api": {
    toolId: "openai-api",
    vendorName: "OpenAI API direct",
    plans: [
      {
        tier: "Usage-based",
        displayName: "Usage-based",
        type: "api",
        usageBased: true,
        source: sources.openaiApiPricing,
        notes:
          "OpenAI API is metered by model. GPT-5.5 lists $5 input and $30 output per 1M tokens; GPT-5.4 mini lists $0.75 input and $4.50 output per 1M tokens.",
      },
      {
        tier: "Scale tier",
        displayName: "Scale tier",
        type: "api",
        usageBased: true,
        recommendedMinTeamSize: 20,
        source: sources.openaiApiPricing,
        notes:
          "Scale Tier and reserved capacity are enterprise offerings for larger, predictable workloads.",
      },
      {
        tier: "Enterprise contract",
        displayName: "Enterprise contract",
        type: "enterprise",
        customPricing: true,
        recommendedMinTeamSize: 50,
        source: sources.openaiApiPricing,
        notes:
          "Enterprise contracts should be tied to data residency, reserved capacity, support, or high committed usage.",
      },
    ],
  },
  windsurf: {
    toolId: "windsurf",
    vendorName: "Windsurf",
    plans: [
      {
        tier: "Free",
        displayName: "Free",
        type: "free",
        monthlyPerSeat: 0,
        recommendedMaxTeamSize: 1,
        source: sources.windsurfPricing,
        notes: "Free individual plan.",
      },
      {
        tier: "Pro",
        displayName: "Pro",
        type: "individual",
        monthlyPerSeat: 20,
        recommendedMaxTeamSize: 4,
        source: sources.windsurfPricing,
        notes: "Windsurf Pro is $20 per month.",
      },
      {
        tier: "Teams",
        displayName: "Teams",
        type: "team",
        monthlyPerSeat: 40,
        recommendedMinTeamSize: 2,
        recommendedMaxTeamSize: 49,
        source: sources.windsurfPricing,
        notes:
          "Windsurf Teams is $40 per user monthly and adds centralized billing, analytics, and priority support.",
      },
      {
        tier: "Enterprise",
        displayName: "Enterprise",
        type: "enterprise",
        customPricing: true,
        recommendedMinTeamSize: 50,
        source: sources.windsurfPricing,
        notes:
          "Enterprise is custom and should be reserved for SSO, RBAC, volume discounts, hybrid deployment, or account management.",
      },
    ],
  },
} satisfies Record<SpendToolId, ToolPricing>;

export const alternativeOptions = [
  {
    toolId: "github-copilot",
    toolName: "GitHub Copilot",
    planTier: "Business",
    estimatedMonthlyCost: 19,
    relevantUseCases: ["coding", "mixed"],
    reason:
      "Copilot Business is a lower-priced coding seat with central billing for teams already using GitHub.",
  },
  {
    toolId: "cursor",
    toolName: "Cursor",
    planTier: "Pro",
    estimatedMonthlyCost: 20,
    relevantUseCases: ["coding", "mixed"],
    reason:
      "Cursor Pro is a strong individual coding seat when admin controls are not worth a $40 team plan.",
  },
  {
    toolId: "windsurf",
    toolName: "Windsurf",
    planTier: "Pro",
    estimatedMonthlyCost: 20,
    relevantUseCases: ["coding", "mixed"],
    reason:
      "Windsurf Pro is a comparable coding IDE seat for teams willing to standardize away from higher-priced plans.",
  },
  {
    toolId: "chatgpt",
    toolName: "ChatGPT",
    planTier: "Plus",
    estimatedMonthlyCost: 20,
    relevantUseCases: ["writing", "data", "research", "mixed"],
    reason:
      "ChatGPT Plus covers broad individual writing, analysis, and research use without team-admin overhead.",
  },
  {
    toolId: "gemini",
    toolName: "Gemini",
    planTier: "Pro",
    estimatedMonthlyCost: 19.99,
    relevantUseCases: ["writing", "data", "research", "mixed", "coding"],
    reason:
      "Google AI Pro is a lower-cost general assistant seat with strong research and coding-adjacent coverage.",
  },
  {
    toolId: "claude",
    toolName: "Claude",
    planTier: "Pro",
    estimatedMonthlyCost: 20,
    relevantUseCases: ["writing", "research", "data", "mixed", "coding"],
    reason:
      "Claude Pro keeps the same core Claude app experience at individual-seat pricing.",
  },
] as const satisfies readonly AlternativeOption[];

export function getPlanPricing(toolId: SpendToolId, tier: string) {
  return pricingCatalog[toolId].plans.find((plan) => plan.tier === tier);
}

export function getSpendToolName(toolId: SpendToolId) {
  return (
    spendToolDefinitions.find((tool) => tool.id === toolId)?.name ??
    pricingCatalog[toolId].vendorName
  );
}

export function getAllPricingSources() {
  return Object.values(sources);
}

export function estimatePlanCost(plan: PlanPricing, seats: number) {
  if (plan.customPricing || plan.usageBased) {
    return null;
  }

  const billableSeats = Math.max(seats, plan.minimumSeats ?? 1);
  const seatCost = (plan.monthlyPerSeat ?? 0) * billableSeats;

  return (plan.monthlyBasePrice ?? 0) + seatCost;
}

