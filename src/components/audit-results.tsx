import {
  BadgeCheck,
  CircleDollarSign,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

import { LeadCaptureForm } from "@/components/lead-capture-form";
import { ShareAuditButton } from "@/components/share-audit-button";
import type { AuditSummaryResult } from "@/lib/audit/ai-summary";
import type { AuditReport, ToolAuditResult } from "@/lib/audit/types";
import { formatCurrency } from "@/lib/spend/summary";

type AuditResultsProps = {
  auditId: string;
  report: AuditReport;
  shareUrl: string;
  summary: AuditSummaryResult;
};

export function AuditResults({
  auditId,
  report,
  shareUrl,
  summary,
}: AuditResultsProps) {
  const hasCredexOpportunity = report.totalMonthlySavings > 500;
  const isSpendingWell = report.totalMonthlySavings < 100;
  const activeTools = report.results.length;

  return (
    <main className="min-h-screen bg-[#f5f6f2] text-[#171512]">
      <section className="border-b border-[#dedbd2] bg-[#171512] text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <Link
              className="inline-flex w-fit items-center gap-3 text-white"
              href="/"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#171512]">
                <WalletCards aria-hidden className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-[#d8d0be]">
                  SpendLens
                </span>
                <span className="block text-sm text-[#bfb6a1]">
                  Your AI spend audit
                </span>
              </span>
            </Link>
            <ShareAuditButton shareUrl={shareUrl} />
          </header>

          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <div className="min-w-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-[#f4d35e]">
                <Sparkles aria-hidden className="h-4 w-4" />
                {isSpendingWell
                  ? "You're spending well"
                  : "Savings opportunity found"}
              </div>
              <h1 className="max-w-4xl break-words text-3xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                {isSpendingWell ? (
                  <>
                    <span className="block">Your AI budget is</span>
                    <span className="block">already disciplined.</span>
                  </>
                ) : (
                  <>
                    <span className="block">See exactly where</span>
                    <span className="block">your AI budget is</span>
                    <span className="block">leaking.</span>
                  </>
                )}
              </h1>
              <p
                className="mt-5 max-w-[300px] text-sm leading-7 text-[#d8d0be] sm:max-w-2xl sm:text-lg sm:leading-8"
                style={{ overflowWrap: "anywhere" }}
              >
                {isSpendingWell
                  ? "SpendLens found less than $100/month in defendable cuts, so the right move is monitoring usage instead of forcing fake savings."
                  : `SpendLens found ${formatCurrency(
                      report.totalMonthlySavings,
                    )}/mo in defendable AI spend savings across ${activeTools} active tool${activeTools === 1 ? "" : "s"}.`}
              </p>
            </div>

            <div className="grid min-w-0 gap-3">
              <MetricRow
                label="Monthly savings"
                value={formatCurrency(report.totalMonthlySavings)}
                icon={TrendingDown}
              />
              <MetricRow
                label="Annual savings"
                value={formatCurrency(report.totalAnnualSavings)}
                icon={LineChart}
              />
              <MetricRow
                label="Current run-rate"
                value={`${formatCurrency(report.totalCurrentMonthlySpend)}/mo`}
                icon={CircleDollarSign}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-10">
        <section className="grid min-w-0 gap-4">
          <section className="max-w-[calc(100vw-2.5rem)] rounded-lg border border-[#dedbd2] bg-white p-5 shadow-sm sm:max-w-none">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#756f61]">
                Personalized summary
              </p>
              <span className="rounded-full bg-[#f1eee7] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#635c4f]">
                {summary.source === "anthropic"
                  ? "Generated with Claude"
                  : "Rule-based fallback"}
              </span>
            </div>
            <p
              className="max-w-[300px] text-sm leading-7 text-[#3d382f] sm:max-w-none sm:text-base"
              style={{ overflowWrap: "anywhere" }}
            >
              {summary.text}
            </p>
          </section>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#756f61]">
                Per-tool breakdown
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Current spend to recommendation
              </h2>
            </div>
            <p className="text-sm text-[#6f695c]">
              Pricing data verified {report.pricingDataVerifiedAt}
            </p>
          </div>

          {report.results.map((result) => (
            <ToolResultCard key={result.toolId} result={result} />
          ))}
        </section>

        <aside className="grid min-w-0 h-fit gap-4 lg:sticky lg:top-6">
          {hasCredexOpportunity ? (
            <section className="rounded-lg border border-[#0f5132] bg-[#e7f4ec] p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#0f5132] text-white">
                <ShieldCheck aria-hidden className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0f5132]">
                Credex fit
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-[#10291d]">
                This is large enough to centralize.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#315643]">
                More than $500/month in defendable savings usually means the
                issue is policy and procurement, not one tool. Credex should
                own the vendor cleanup, renewal calendar, and seat governance.
              </p>
            </section>
          ) : (
            <section className="rounded-lg border border-[#dedbd2] bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#171512] text-white">
                <BadgeCheck aria-hidden className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#756f61]">
                Spend posture
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal">
                {isSpendingWell
                  ? "You're spending well."
                  : "Tighten this before renewal."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6f695c]">
                {isSpendingWell
                  ? "The audit found no large, defensible cuts. Keep tracking seat counts, API usage, and annual renewal dates."
                  : "The savings are real, but still manageable without a full procurement motion. Start with the largest line item first."}
              </p>
            </section>
          )}

          <section className="rounded-lg border border-[#dedbd2] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#756f61]">
              Audit scope
            </p>
            <dl className="mt-4 grid gap-3 text-sm">
              <InfoRow label="Team size" value={`${report.teamSize}`} />
              <InfoRow
                label="Primary use case"
                value={capitalize(report.primaryUseCase)}
              />
              <InfoRow label="Active tools" value={`${activeTools}`} />
              <InfoRow
                label="Recommended run-rate"
                value={`${formatCurrency(report.totalRecommendedMonthlySpend)}/mo`}
              />
            </dl>
          </section>

          <LeadCaptureForm auditId={auditId} report={report} shareUrl={shareUrl} />
        </aside>
      </div>
    </main>
  );
}

function ToolResultCard({ result }: { result: ToolAuditResult }) {
  const hasSavings = result.monthlySavings > 0;

  return (
    <article className="rounded-lg border border-[#dedbd2] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold tracking-normal">
              {result.toolName}
            </h3>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                hasSavings
                  ? "bg-[#e7f4ec] text-[#0f5132]"
                  : "bg-[#f1eee7] text-[#635c4f]"
              }`}
            >
              {hasSavings ? "Change" : "Keep"}
            </span>
          </div>
          <p className="text-sm leading-6 text-[#6f695c]">{result.reason}</p>
        </div>
        <div className="text-left lg:text-right">
          <p className="text-sm font-semibold text-[#756f61]">Savings</p>
          <p className="mt-1 text-3xl font-semibold tracking-normal">
            {formatCurrency(result.monthlySavings)}
            <span className="text-base font-medium text-[#756f61]">/mo</span>
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <ResultCell
          label="Current spend"
          value={`${formatCurrency(result.currentMonthlySpend)}/mo`}
          sublabel={`${result.currentPlanTier} | ${result.seats} seat${result.seats === 1 ? "" : "s"}`}
        />
        <ResultCell
          label="Recommendation"
          value={`${result.recommendedToolName} ${result.recommendedPlanTier}`}
          sublabel={`${formatCurrency(result.recommendedMonthlySpend)}/mo estimated`}
        />
        <ResultCell
          label="Annual impact"
          value={formatCurrency(result.annualSavings)}
          sublabel={
            result.isRightPlanForTeamSize
              ? "Plan fits team size"
              : "Plan fit needs review"
          }
        />
      </div>
    </article>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingDown;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2 rounded-lg bg-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon aria-hidden className="h-5 w-5 text-[#f4d35e]" />
        <span className="min-w-0 text-sm text-[#d8d0be]">{label}</span>
      </div>
      <span className="break-words text-lg font-semibold tracking-normal sm:shrink-0">
        {value}
      </span>
    </div>
  );
}

function ResultCell({
  label,
  sublabel,
  value,
}: {
  label: string;
  sublabel: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#ede7dc] bg-[#fbfaf7] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#756f61]">
        {label}
      </p>
      <p className="mt-2 break-words text-base font-semibold text-[#171512]">
        {value}
      </p>
      <p className="mt-1 text-sm leading-5 text-[#6f695c]">{sublabel}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-[#ede7dc] pt-3">
      <dt className="text-[#6f695c]">{label}</dt>
      <dd className="font-semibold text-[#171512]">{value}</dd>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
