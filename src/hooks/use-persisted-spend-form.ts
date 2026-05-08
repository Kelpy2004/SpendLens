"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createDefaultSpendFormState,
  spendToolDefinitions,
} from "@/lib/spend/tool-catalog";
import { sanitizeMoneyInput, sanitizeSeatInput } from "@/lib/spend/summary";
import type {
  PrimaryUseCase,
  SpendFormState,
  ToolSpendInput,
} from "@/lib/spend/types";

const STORAGE_KEY = "spendlens:spend-input:v1";

function coerceToolInput(
  savedInput: Partial<ToolSpendInput> | undefined,
  defaultInput: ToolSpendInput,
): ToolSpendInput {
  return {
    isActive: Boolean(savedInput?.isActive ?? defaultInput.isActive),
    planTier:
      typeof savedInput?.planTier === "string"
        ? savedInput.planTier
        : defaultInput.planTier,
    monthlySpend: sanitizeMoneyInput(Number(savedInput?.monthlySpend ?? 0)),
    seats: sanitizeSeatInput(Number(savedInput?.seats ?? 0)),
  };
}

function mergeSavedState(savedState: unknown): SpendFormState {
  const defaultState = createDefaultSpendFormState();

  if (!savedState || typeof savedState !== "object") {
    return defaultState;
  }

  const maybeState = savedState as Partial<SpendFormState>;
  const savedTools =
    maybeState.tools && typeof maybeState.tools === "object"
      ? maybeState.tools
      : {};

  return {
    teamSize: Math.max(1, sanitizeSeatInput(Number(maybeState.teamSize ?? 12))),
    primaryUseCase: maybeState.primaryUseCase ?? defaultState.primaryUseCase,
    tools: Object.fromEntries(
      spendToolDefinitions.map((tool) => {
        const defaultInput = defaultState.tools[tool.id];
        const savedInput = savedTools[tool.id] as Partial<ToolSpendInput>;

        return [tool.id, coerceToolInput(savedInput, defaultInput)];
      }),
    ),
  };
}

export function usePersistedSpendForm() {
  const [state, setState] = useState<SpendFormState>(() =>
    createDefaultSpendFormState(),
  );
  const [hasHydrated, setHasHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setState(mergeSavedState(JSON.parse(saved)));
      } catch {
        setState(createDefaultSpendFormState());
      }
    }

    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setLastSavedAt(new Date());
  }, [hasHydrated, state]);

  const updateTeamSize = useCallback((teamSize: number) => {
    setState((current) => ({
      ...current,
      teamSize: Math.max(1, sanitizeSeatInput(teamSize)),
    }));
  }, []);

  const updatePrimaryUseCase = useCallback((primaryUseCase: PrimaryUseCase) => {
    setState((current) => ({
      ...current,
      primaryUseCase,
    }));
  }, []);

  const updateTool = useCallback(
    (toolId: string, updates: Partial<ToolSpendInput>) => {
      setState((current) => ({
        ...current,
        tools: {
          ...current.tools,
          [toolId]: {
            ...current.tools[toolId],
            ...updates,
            monthlySpend:
              updates.monthlySpend === undefined
                ? current.tools[toolId].monthlySpend
                : sanitizeMoneyInput(updates.monthlySpend),
            seats:
              updates.seats === undefined
                ? current.tools[toolId].seats
                : sanitizeSeatInput(updates.seats),
          },
        },
      }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setState(createDefaultSpendFormState());
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  return useMemo(
    () => ({
      hasHydrated,
      lastSavedAt,
      resetForm,
      state,
      updatePrimaryUseCase,
      updateTeamSize,
      updateTool,
    }),
    [
      hasHydrated,
      lastSavedAt,
      resetForm,
      state,
      updatePrimaryUseCase,
      updateTeamSize,
      updateTool,
    ],
  );
}
