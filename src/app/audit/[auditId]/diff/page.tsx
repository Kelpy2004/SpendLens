import type { Metadata } from "next";
import Link from "next/link";
import {
  RefreshCw,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { buildAuditReport } from "@/lib/audit/engine";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { AuditReport, ToolAuditResult } from "@/lib/audit/types";
import type { SpendFormState } from "@/lib/spend/types";
import { formatCurrency } from "@/lib/spend/summary";

type DiffPageProps = {
  params: { auditId: string };
  searchParams: { stored?: string };
};

export const metadata: Metadata = {
  title: "SpendLens — Audit Diff",
  description: "See how pricing changes affect your AI spend audit.",
};

export default async function DiffPage({ searchParams }: DiffPageProps) {
  const storedId = searchParams.stored;

  if (!storedId) {
    return <ErrorState message="Missing stored audit reference." />;
  }

  let supabase: ReturnType<typeof getSupabaseAdminClient>;

  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return <ErrorState message="Database is not configured in this environment." />;
  }

  const { data: stored } = await supabase
    .from("stored_audits")
    .select("*")
    .eq("id", storedId)
    .single();

  if (!stored) {
    return <ErrorState message="Could not find the original audit. The link may have expired." />;
  }

  const oldReport = stored.output_result as unknown as AuditReport;
  const inputStack = stored.input_stack as unknown as SpendFormState;
  const newReport = buildAuditReport(inputStack);

  const savingsDelta = newReport.totalMonthlySavings - oldReport.totalMonthlySavings;

  return (
    <main className="min-h-screen bg-[#f5f6f2] text-[#171512]">
      <section className="border-b border-[#dedbd2] bg-[#171512] text-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8 sm:px-8">
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
                Audit diff
              </span>
            </span>
          </Link>

          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-[#f4d35e]">
              <RefreshCw aria-hidden className="h-4 w-4" />
              Pricing changed since your last audit
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
              {savingsDelta > 0
                ? `${formatCurrency(Math.abs(savingsDelta))}/mo more you could save now.`
                : savingsDelta < 0
                  ? `${formatCurrency(Math.abs(savingsDelta))}/mo less savings available now.`
                  : "Same total savings — but the recommendations shifted."}
            </h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <DeltaCard
              label="Previous savings"
              value={formatCurrency(oldReport.totalMonthlySavings)}
              suffix="/mo"
            />
            <DeltaCard
              label="Current savings"
              value={formatCurrency(newReport.totalMonthlySavings)}
              suffix="/mo"
              highlight
            />
            <DeltaCard
              label="Annual impact"
              value={formatCurrency(Math.abs(savingsDelta * 12))}
              suffix="/yr"
              trend={savingsDelta >= 0 ? "up" : "down"}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
        <h2 className="mb-6 text-2xl font-semibold tracking-normal">
          Per-tool comparison
        </h2>

        <div className="grid gap-4">
          {newReport.results.map((newResult) => {
            const oldResult = oldReport.results.find(
              (r) => r.toolId === newResult.toolId,
            );
            const changed = oldResult
              ? hasResultChanged(oldResult, newResult)
              : true;

            return (
              <ToolDiffCard
                key={newResult.toolId}
                oldResult={oldResult ?? null}
                newResult={newResult}
                changed={changed}
              />
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#171512] px-6 text-sm font-bold text-white transition hover:bg-[#2a251f]"
            href="/"
          >
            Run a fresh audit
          </Link>
        </div>
      </div>
    </main>
  );
}

function ToolDiffCard({
  oldResult,
  newResult,
  changed,
}: {
  oldResult: ToolAuditResult | null;
  newResult: ToolAuditResult;
  changed: boolean;
}) {
  if (!changed) {
    return (
      <article className="rounded-lg border border-[#ede7dc] bg-[#fbfaf7] p-4 opacity-60">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#756f61]">{newResult.toolName}</h3>
          <span className="rounded-full bg-[#f1eee7] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#635c4f]">
            No change
          </span>
        </div>
        <p className="mt-1 text-sm text-[#9f9886]">
          {newResult.recommendedToolName} {newResult.recommendedPlanTier} — {formatCurrency(newResult.monthlySavings)}/mo savings
        </p>
      </article>
    );
  }

  const savingsShift = newResult.monthlySavings - (oldResult?.monthlySavings ?? 0);

  return (
    <article className="rounded-lg border border-[#171512]/15 bg-white p-5 shadow-sm ring-1 ring-amber-200/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold">{newResult.toolName}</h3>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-amber-700">
          Changed
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ede7dc] bg-[#fbfaf7] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#756f61]">
            Previous recommendation
          </p>
          <p className="mt-2 font-semibold text-[#6f695c]">
            {oldResult
              ? `${oldResult.recommendedToolName} ${oldResult.recommendedPlanTier}`
              : "N/A"}
          </p>
          <p className="mt-1 text-sm text-[#9f9886]">
            {oldResult
              ? `${formatCurrency(oldResult.monthlySavings)}/mo savings`
              : "—"}
          </p>
          <p className="mt-2 text-sm leading-5 text-[#9f9886]">
            {oldResult?.reason ?? "—"}
          </p>
        </div>

        <div className="rounded-lg border border-[#171512]/10 bg-white p-4 ring-1 ring-[#171512]/5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#171512]">
            Updated recommendation
          </p>
          <p className="mt-2 font-semibold text-[#171512]">
            {newResult.recommendedToolName} {newResult.recommendedPlanTier}
          </p>
          <p className="mt-1 text-sm text-[#6f695c]">
            {formatCurrency(newResult.monthlySavings)}/mo savings
          </p>
          <p className="mt-2 text-sm leading-5 text-[#3d382f]">
            {newResult.reason}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        {savingsShift > 0 ? (
          <TrendingUp aria-hidden className="h-4 w-4 text-emerald-600" />
        ) : (
          <TrendingDown aria-hidden className="h-4 w-4 text-red-500" />
        )}
        <span className={savingsShift >= 0 ? "text-emerald-700" : "text-red-600"}>
          {savingsShift >= 0 ? "+" : ""}{formatCurrency(savingsShift)}/mo
        </span>
        <span className="text-[#9f9886]">savings shift for this tool</span>
      </div>
    </article>
  );
}

function DeltaCard({
  label,
  value,
  suffix,
  highlight,
  trend,
}: {
  label: string;
  value: string;
  suffix: string;
  highlight?: boolean;
  trend?: "up" | "down";
}) {
  return (
    <div
      className={`rounded-lg px-4 py-3 ${
        highlight ? "bg-white/15" : "bg-white/10"
      }`}
    >
      <p className="text-sm text-[#d8d0be]">
        {trend === "up" && <TrendingUp aria-hidden className="mr-1 inline h-3.5 w-3.5 text-emerald-400" />}
        {trend === "down" && <TrendingDown aria-hidden className="mr-1 inline h-3.5 w-3.5 text-red-400" />}
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">
        {value}
        <span className="text-sm font-medium text-[#bfb6a1]">{suffix}</span>
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f2] px-5 text-[#171512]">
      <section className="w-full max-w-lg rounded-lg border border-[#dedbd2] bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#756f61]">
          SpendLens
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal">
          {message}
        </h1>
        <Link
          className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-[#171512] px-4 text-sm font-bold text-white transition hover:bg-[#2a251f]"
          href="/"
        >
          Start new audit
        </Link>
      </section>
    </main>
  );
}

function hasResultChanged(a: ToolAuditResult, b: ToolAuditResult): boolean {
  return (
    a.recommendationType !== b.recommendationType ||
    a.recommendedToolName !== b.recommendedToolName ||
    a.recommendedPlanTier !== b.recommendedPlanTier ||
    Math.abs(a.monthlySavings - b.monthlySavings) >= 1
  );
}
