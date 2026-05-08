import { spendToolDefinitions } from "./tool-catalog";
import type { SpendFormState, ToolSpendInput } from "./types";

export type SpendSummary = {
  activeToolCount: number;
  monthlyTotal: number;
  annualTotal: number;
  totalSeats: number;
  largestToolName: string | null;
};

export function sanitizeMoneyInput(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

export function sanitizeSeatInput(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

export function calculateSpendSummary(state: SpendFormState): SpendSummary {
  const activeEntries = spendToolDefinitions
    .map((tool) => ({
      tool,
      input: state.tools[tool.id],
    }))
    .filter(({ input }) => input?.isActive);

  const monthlyTotal = activeEntries.reduce(
    (total, { input }) => total + sanitizeMoneyInput(input.monthlySpend),
    0,
  );

  const totalSeats = activeEntries.reduce(
    (total, { input }) => total + sanitizeSeatInput(input.seats),
    0,
  );

  const largestEntry = activeEntries.reduce<
    { input: ToolSpendInput; name: string } | null
  >((largest, { input, tool }) => {
    if (!largest || input.monthlySpend > largest.input.monthlySpend) {
      return { input, name: tool.name };
    }

    return largest;
  }, null);

  return {
    activeToolCount: activeEntries.length,
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    totalSeats,
    largestToolName: largestEntry?.name ?? null,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
