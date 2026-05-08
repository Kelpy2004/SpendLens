import { createDefaultSpendFormState } from "./tool-catalog";
import {
  calculateSpendSummary,
  formatCurrency,
  sanitizeMoneyInput,
  sanitizeSeatInput,
} from "./summary";

describe("spend summary helpers", () => {
  it("totals only active tools", () => {
    const state = createDefaultSpendFormState();

    state.tools.cursor = {
      isActive: true,
      monthlySpend: 40,
      planTier: "Pro",
      seats: 2,
    };
    state.tools.chatgpt = {
      isActive: false,
      monthlySpend: 300,
      planTier: "Team",
      seats: 10,
    };

    expect(calculateSpendSummary(state)).toEqual({
      activeToolCount: 1,
      annualTotal: 480,
      largestToolName: "Cursor",
      monthlyTotal: 40,
      totalSeats: 2,
    });
  });

  it("normalizes invalid money and seat inputs", () => {
    expect(sanitizeMoneyInput(-10)).toBe(0);
    expect(sanitizeMoneyInput(12.349)).toBe(12.35);
    expect(sanitizeSeatInput(-2)).toBe(0);
    expect(sanitizeSeatInput(4.9)).toBe(4);
  });

  it("formats totals as whole-dollar USD", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });
});
