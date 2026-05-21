"use client";

import {
  ArrowRight,
  BadgeDollarSign,
  Check,
  ChevronDown,
  CircleDollarSign,
  Code2,
  Database,
  FileText,
  FlaskConical,
  Layers3,
  RefreshCcw,
  Search,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { useRef } from "react";
import { useRouter } from "next/navigation";

import { usePersistedSpendForm } from "@/hooks/use-persisted-spend-form";
import {
  createPublicAuditPayload,
  encodePublicAuditPayload,
} from "@/lib/audit/public-audit";
import {
  createDefaultSpendFormState,
  spendToolDefinitions,
} from "@/lib/spend/tool-catalog";
import {
  calculateSpendSummary,
  formatCurrency,
} from "@/lib/spend/summary";
import { primaryUseCases, type PrimaryUseCase } from "@/lib/spend/types";

const useCaseMeta: Record<
  PrimaryUseCase,
  { label: string; icon: typeof Code2; tone: string }
> = {
  coding: { label: "Coding", icon: Code2, tone: "text-[#4f46e5]" },
  writing: { label: "Writing", icon: FileText, tone: "text-[#b45309]" },
  data: { label: "Data", icon: Database, tone: "text-[#047857]" },
  research: { label: "Research", icon: Search, tone: "text-[#be123c]" },
  mixed: { label: "Mixed", icon: Layers3, tone: "text-[#0f766e]" },
};

const categoryLabels = {
  api: "API",
  assistant: "Assistant",
  coding: "Coding",
  general: "General",
};

function parseNumberInput(value: string) {
  return value === "" ? 0 : Number(value);
}

export function SpendInputForm() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const {
    hasHydrated,
    lastSavedAt,
    resetForm,
    state,
    updatePrimaryUseCase,
    updateTeamSize,
    updateTool,
  } = usePersistedSpendForm();
  const summary = calculateSpendSummary(state);
  const canRunAudit = summary.activeToolCount > 0 && summary.monthlyTotal > 0;

  const savedLabel = !hasHydrated
    ? null
    : lastSavedAt
      ? `Saved ${lastSavedAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : "Auto-saved";

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const runSampleAudit = () => {
    const sample = createDefaultSpendFormState();
    sample.teamSize = 12;
    sample.primaryUseCase = "coding";
    sample.tools["cursor"] = { isActive: true, planTier: "Business", monthlySpend: 400, seats: 10 };
    sample.tools["github-copilot"] = { isActive: true, planTier: "Enterprise", monthlySpend: 390, seats: 10 };
    sample.tools["claude"] = { isActive: true, planTier: "Team", monthlySpend: 300, seats: 12 };
    const payload = createPublicAuditPayload(sample);
    const encoded = encodePublicAuditPayload(payload);
    router.push(`/audit/${payload.id}?s=${encoded}`);
  };

  const runAudit = () => {
    if (!canRunAudit) return;
    const payload = createPublicAuditPayload(state);
    const encodedPayload = encodePublicAuditPayload(payload);
    router.push(`/audit/${payload.id}?s=${encodedPayload}`);
  };

  return (
    <main className="min-h-screen bg-[#f5f6f2] text-[#171512]">

      {/* ── Hero ── */}
      <section className="border-b border-[#dedbd2] bg-white px-5 py-20 text-center sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dedbd2] bg-[#f5f6f2] px-4 py-1.5 text-sm font-medium text-[#5f5a4b]">
            <Sparkles aria-hidden className="h-3.5 w-3.5 text-[#f4d35e]" />
            Free · No login · Takes 2 minutes
          </div>

          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-[#171512] sm:text-6xl">
            Stop guessing what your AI stack actually costs.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#6f695c]">
            Enter your tools, plans, and seats. SpendLens compares against
            current vendor pricing and shows exactly where you&apos;re overpaying —
            with numbers your finance team can verify.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#171512] px-6 text-sm font-bold text-white transition hover:bg-[#2a251f]"
              onClick={scrollToForm}
              type="button"
            >
              Start free audit
              <ChevronDown aria-hidden className="h-4 w-4" />
            </button>
            <button
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#d9d4c8] bg-white px-6 text-sm font-bold text-[#4f493d] shadow-sm transition hover:border-[#bcb4a2] hover:text-[#171512]"
              onClick={runSampleAudit}
              type="button"
            >
              See a sample result
              <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-5 text-xs text-[#9c9385]">
            Covers Cursor · GitHub Copilot · Claude · ChatGPT · Gemini ·
            Windsurf · Anthropic API · OpenAI API
          </p>
        </div>
      </section>

      {/* ── Intake form ── */}
      <div
        ref={formRef}
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10"
      >
        <header className="flex flex-col gap-5 border-b border-[#dedbd2] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#171512] text-white">
                <WalletCards aria-hidden className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5f5a4b]">
                  SpendLens
                </p>
                <p className="text-sm text-[#756f61]">AI spend intake</p>
              </div>
            </div>
            <p className="max-w-2xl text-2xl font-semibold leading-snug tracking-normal text-[#171512]">
              Map every AI subscription before the audit starts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {savedLabel && (
              <div className="flex items-center gap-2 rounded-lg border border-[#d9d4c8] bg-white px-3 py-2 text-sm font-medium text-[#4f493d] shadow-sm">
                <Check aria-hidden className="h-4 w-4 text-[#0f8a5f]" />
                {savedLabel}
              </div>
            )}
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d9d4c8] bg-white px-3 text-sm font-semibold text-[#4f493d] shadow-sm transition hover:border-[#bcb4a2] hover:text-[#171512]"
              type="button"
              onClick={resetForm}
            >
              <RefreshCcw aria-hidden className="h-4 w-4" />
              Reset
            </button>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-6">

            {/* Team size + use case */}
            <section className="grid gap-4 rounded-lg border border-[#dedbd2] bg-white p-5 shadow-sm md:grid-cols-[220px_minmax(0,1fr)]">
              <label
                className="flex flex-col gap-2 text-sm font-semibold text-[#3d382f]"
                htmlFor="team-size"
              >
                <span className="flex items-center gap-2">
                  <Users aria-hidden className="h-4 w-4 text-[#4f46e5]" />
                  Team size
                </span>
                <input
                  className="h-11 rounded-lg border border-[#d9d4c8] bg-[#fbfaf7] px-3 text-base font-semibold text-[#171512] outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
                  id="team-size"
                  min={1}
                  type="number"
                  value={state.teamSize}
                  onChange={(event) =>
                    updateTeamSize(parseNumberInput(event.target.value))
                  }
                />
              </label>

              <fieldset>
                <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#3d382f]">
                  <FlaskConical aria-hidden className="h-4 w-4 text-[#be123c]" />
                  Primary use case
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {primaryUseCases.map((useCase) => {
                    const meta = useCaseMeta[useCase];
                    const Icon = meta.icon;
                    const isSelected = state.primaryUseCase === useCase;

                    return (
                      <button
                        aria-pressed={isSelected}
                        className={`flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
                          isSelected
                            ? "border-[#171512] bg-[#171512] text-white"
                            : "border-[#d9d4c8] bg-[#fbfaf7] text-[#5f5a4b] hover:border-[#bcb4a2] hover:text-[#171512]"
                        }`}
                        key={useCase}
                        type="button"
                        onClick={() => updatePrimaryUseCase(useCase)}
                      >
                        <Icon
                          aria-hidden
                          className={`h-4 w-4 ${isSelected ? "" : meta.tone}`}
                        />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </section>

            {/* Tool cards */}
            <section className="grid gap-4 md:grid-cols-2">
              {spendToolDefinitions.map((tool) => {
                const input = state.tools[tool.id];

                return (
                  <article
                    className={`rounded-lg border bg-white p-5 shadow-sm transition ${
                      input.isActive
                        ? "border-[#171512] ring-1 ring-[#171512]/10"
                        : "border-[#dedbd2] hover:border-[#c8c1b2]"
                    }`}
                    key={tool.id}
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-3 flex items-center gap-3">
                          <span
                            aria-hidden
                            className={`h-3 w-3 rounded-full ${tool.accentClassName}`}
                          />
                          <p className="truncate text-lg font-semibold text-[#171512]">
                            {tool.name}
                          </p>
                        </div>
                        <p className="text-sm leading-6 text-[#6f695c]">
                          {tool.description}
                        </p>
                      </div>

                      <label className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#4f493d]">
                        <input
                          checked={input.isActive}
                          aria-label={`Mark ${tool.name} as in stack`}
                          className="peer sr-only"
                          type="checkbox"
                          onChange={(event) =>
                            updateTool(tool.id, {
                              isActive: event.target.checked,
                            })
                          }
                        />
                        <span className="flex h-6 w-11 items-center rounded-full border border-[#cfc7b8] bg-[#ece8df] p-0.5 transition peer-checked:border-[#171512] peer-checked:bg-[#171512]">
                          <span
                            className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                              input.isActive ? "translate-x-5" : ""
                            }`}
                          />
                        </span>
                        {input.isActive ? "In stack" : "Off"}
                      </label>
                    </div>

                    <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-[#f1eee7] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#635c4f]">
                      {categoryLabels[tool.category]}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <label
                        className="flex flex-col gap-2 text-sm font-semibold text-[#3d382f]"
                        htmlFor={`${tool.id}-plan`}
                      >
                        Plan tier
                        <select
                          className="h-11 rounded-lg border border-[#d9d4c8] bg-[#fbfaf7] px-3 text-sm font-medium text-[#171512] outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
                          id={`${tool.id}-plan`}
                          value={input.planTier}
                          onChange={(event) =>
                            updateTool(tool.id, {
                              isActive: true,
                              planTier: event.target.value,
                            })
                          }
                        >
                          {tool.planTiers.map((planTier) => (
                            <option key={planTier} value={planTier}>
                              {planTier}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label
                        className="flex flex-col gap-2 text-sm font-semibold text-[#3d382f]"
                        htmlFor={`${tool.id}-monthly-spend`}
                      >
                        Monthly spend
                        <span className="flex h-11 items-center rounded-lg border border-[#d9d4c8] bg-[#fbfaf7] px-3 transition focus-within:border-[#4f46e5] focus-within:ring-4 focus-within:ring-[#4f46e5]/10">
                          <span className="pr-2 text-sm font-bold text-[#827969]">
                            $
                          </span>
                          <input
                            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#171512] outline-none"
                            id={`${tool.id}-monthly-spend`}
                            inputMode="decimal"
                            min={0}
                            type="number"
                            value={input.monthlySpend}
                            onChange={(event) =>
                              updateTool(tool.id, {
                                isActive:
                                  input.isActive ||
                                  parseNumberInput(event.target.value) > 0,
                                monthlySpend: parseNumberInput(
                                  event.target.value,
                                ),
                              })
                            }
                          />
                        </span>
                      </label>

                      <label
                        className="flex flex-col gap-2 text-sm font-semibold text-[#3d382f]"
                        htmlFor={`${tool.id}-seats`}
                      >
                        Seats
                        <input
                          className="h-11 rounded-lg border border-[#d9d4c8] bg-[#fbfaf7] px-3 text-sm font-semibold text-[#171512] outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
                          id={`${tool.id}-seats`}
                          min={0}
                          type="number"
                          value={input.seats}
                          onChange={(event) =>
                            updateTool(tool.id, {
                              isActive:
                                input.isActive ||
                                parseNumberInput(event.target.value) > 0,
                              seats: parseNumberInput(event.target.value),
                            })
                          }
                        />
                      </label>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-lg border border-[#171512] bg-[#171512] p-5 text-white shadow-lg">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c5bda8]">
                    Current run-rate
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-normal">
                    {formatCurrency(summary.monthlyTotal)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                  <CircleDollarSign aria-hidden className="h-6 w-6" />
                </div>
              </div>

              <dl className="grid gap-3">
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <dt className="text-sm text-[#d8d0be]">Annualized</dt>
                  <dd className="font-semibold">
                    {formatCurrency(summary.annualTotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <dt className="text-sm text-[#d8d0be]">Active tools</dt>
                  <dd className="font-semibold">{summary.activeToolCount}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <dt className="text-sm text-[#d8d0be]">Seats tracked</dt>
                  <dd className="font-semibold">{summary.totalSeats}</dd>
                </div>
              </dl>

              <div className="mt-5 rounded-lg bg-white/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <BadgeDollarSign aria-hidden className="h-4 w-4" />
                  Largest line item
                </div>
                <p className="text-sm leading-6 text-[#e8e2d2]">
                  {summary.largestToolName
                    ? summary.largestToolName
                    : "No active spend yet"}
                </p>
              </div>

              <button
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#f4d35e] px-4 text-sm font-bold text-[#171512] transition hover:bg-[#ffd76a] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/45"
                disabled={!canRunAudit}
                type="button"
                onClick={runAudit}
              >
                Run audit
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
              <p className="mt-3 text-xs leading-5 text-[#cfc6b3]">
                Share URLs include spend inputs only. No email or company fields
                are written into public links.
              </p>
            </section>
          </aside>
        </section>
      </div>

      <footer className="border-t border-[#dedbd2] bg-white px-5 py-6 text-center text-sm text-[#9c9385]">
        SpendLens · Built for Credex · 2026
      </footer>
    </main>
  );
}
