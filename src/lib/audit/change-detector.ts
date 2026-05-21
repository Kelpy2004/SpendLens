import type { SpendFormState } from "@/lib/spend/types";
import type { AuditReport, ToolAuditResult } from "./types";
import { buildAuditReport } from "./engine";
import {
  capturePricingSnapshot,
  findChangedTools,
  type PricingSnapshot,
} from "./pricing-snapshot";

export type StoredAudit = {
  id: string;
  audit_id: string;
  email: string;
  input_stack: SpendFormState;
  output_result: AuditReport;
  pricing_snapshot: PricingSnapshot;
  pricing_version: string;
};

export type ToolDiff = {
  toolId: string;
  toolName: string;
  oldRecommendation: string;
  newRecommendation: string;
  oldMonthlySavings: number;
  newMonthlySavings: number;
};

export type AffectedAudit = {
  storedAuditId: string;
  auditId: string;
  email: string;
  oldReport: AuditReport;
  newReport: AuditReport;
  changedTools: ToolDiff[];
  savingsDelta: number;
};

export type UserNotificationGroup = {
  email: string;
  audits: AffectedAudit[];
  totalSavingsDelta: number;
};

/**
 * Only flags audits where pricing changes actually alter the recommendation,
 * not every price movement — keeps notification volume honest.
 */
export function detectAuditChanges(stored: StoredAudit): AffectedAudit | null {
  const currentSnapshot = capturePricingSnapshot();
  const changedToolIds = findChangedTools(stored.pricing_snapshot, currentSnapshot);

  if (changedToolIds.length === 0) {
    return null;
  }

  const newReport = buildAuditReport(stored.input_stack);
  const toolDiffs = buildToolDiffs(stored.output_result, newReport, changedToolIds);

  if (toolDiffs.length === 0) {
    return null;
  }

  const savingsDelta = newReport.totalMonthlySavings - stored.output_result.totalMonthlySavings;

  return {
    storedAuditId: stored.id,
    auditId: stored.audit_id,
    email: stored.email,
    oldReport: stored.output_result,
    newReport,
    changedTools: toolDiffs,
    savingsDelta,
  };
}

/** Consolidate affected audits by email so each user gets one notification. */
export function groupByUser(affected: AffectedAudit[]): UserNotificationGroup[] {
  const groups = new Map<string, AffectedAudit[]>();

  for (const audit of affected) {
    const existing = groups.get(audit.email) ?? [];
    existing.push(audit);
    groups.set(audit.email, existing);
  }

  return Array.from(groups.entries()).map(([email, audits]) => ({
    email,
    audits,
    totalSavingsDelta: audits.reduce((sum, a) => sum + a.savingsDelta, 0),
  }));
}

function buildToolDiffs(
  oldReport: AuditReport,
  newReport: AuditReport,
  changedToolIds: string[],
): ToolDiff[] {
  const diffs: ToolDiff[] = [];

  for (const toolId of changedToolIds) {
    const oldResult = oldReport.results.find((r) => r.toolId === toolId);
    const newResult = newReport.results.find((r) => r.toolId === toolId);

    if (!oldResult || !newResult) {
      continue;
    }

    const recChanged = recommendationChanged(oldResult, newResult);

    if (!recChanged) {
      continue;
    }

    diffs.push({
      toolId,
      toolName: newResult.toolName,
      oldRecommendation: formatRecommendation(oldResult),
      newRecommendation: formatRecommendation(newResult),
      oldMonthlySavings: oldResult.monthlySavings,
      newMonthlySavings: newResult.monthlySavings,
    });
  }

  return diffs;
}

function recommendationChanged(a: ToolAuditResult, b: ToolAuditResult): boolean {
  return (
    a.recommendationType !== b.recommendationType ||
    a.recommendedToolName !== b.recommendedToolName ||
    a.recommendedPlanTier !== b.recommendedPlanTier ||
    Math.abs(a.monthlySavings - b.monthlySavings) >= 1
  );
}

function formatRecommendation(result: ToolAuditResult): string {
  if (result.recommendationType === "keep") {
    return `Keep ${result.toolName} ${result.currentPlanTier}`;
  }

  if (result.recommendationType === "usage-review") {
    return `Review ${result.toolName} usage`;
  }

  return `Switch to ${result.recommendedToolName} ${result.recommendedPlanTier}`;
}
