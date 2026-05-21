"use client";

import { CheckCircle2, Mail, Send, UserRound } from "lucide-react";
import { useState } from "react";

import type { AuditReport } from "@/lib/audit/types";
import type { PublicAuditPayload } from "@/lib/audit/public-audit";

type LeadCaptureFormProps = {
  auditId: string;
  report: AuditReport;
  shareUrl: string;
  inputPayload: PublicAuditPayload;
};

type SubmissionState =
  | {
      message: string;
      status: "idle" | "submitting" | "success" | "error";
    }
  | {
      message: "";
      status: "idle";
    };

export function LeadCaptureForm({
  auditId,
  report,
  shareUrl,
  inputPayload,
}: LeadCaptureFormProps) {
  const [state, setState] = useState<SubmissionState>({
    message: "",
    status: "idle",
  });

  const submitLead = async (formData: FormData) => {
    setState({ message: "Saving your audit...", status: "submitting" });

    const response = await fetch("/api/leads", {
      body: JSON.stringify({
        annualSavings: report.totalAnnualSavings,
        auditId,
        companyName: formData.get("companyName"),
        email: formData.get("email"),
        monthlySavings: report.totalMonthlySavings,
        primaryUseCase: report.primaryUseCase,
        role: formData.get("role"),
        sourceUrl: shareUrl,
        teamSize: formData.get("teamSize"),
        website: formData.get("website"),
        inputStack: inputPayload,
        auditResult: report,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      setState({
        message: body?.error ?? "Could not save this audit right now.",
        status: "error",
      });
      return;
    }

    setState({
      message: "Saved. Check your inbox for the audit confirmation.",
      status: "success",
    });
  };

  return (
    <section className="rounded-lg border border-[#dedbd2] bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#171512] text-white">
        <Mail aria-hidden className="h-5 w-5" />
      </div>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#756f61]">
        Save this audit
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-normal">
        Get the cleanup plan.
      </h2>

      {state.status === "success" ? (
        <div className="mt-4 rounded-lg border border-[#b7ddc5] bg-[#eef8f1] p-4 text-sm leading-6 text-[#245335]">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <CheckCircle2 aria-hidden className="h-4 w-4" />
            Audit saved
          </div>
          {state.message}
        </div>
      ) : (
        <form action={submitLead} className="mt-4 grid gap-3">
          <label className="grid gap-2 text-sm font-semibold text-[#3d382f]">
            Email
            <span className="flex h-11 items-center gap-2 rounded-lg border border-[#d9d4c8] bg-[#fbfaf7] px-3 transition focus-within:border-[#4f46e5] focus-within:ring-4 focus-within:ring-[#4f46e5]/10">
              <Mail aria-hidden className="h-4 w-4 text-[#756f61]" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171512] outline-none"
                name="email"
                required
                type="email"
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#3d382f]">
            Company
            <input
              className="h-11 rounded-lg border border-[#d9d4c8] bg-[#fbfaf7] px-3 text-sm font-medium text-[#171512] outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
              name="companyName"
              type="text"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#3d382f]">
            Role
            <span className="flex h-11 items-center gap-2 rounded-lg border border-[#d9d4c8] bg-[#fbfaf7] px-3 transition focus-within:border-[#4f46e5] focus-within:ring-4 focus-within:ring-[#4f46e5]/10">
              <UserRound aria-hidden className="h-4 w-4 text-[#756f61]" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171512] outline-none"
                name="role"
                type="text"
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#3d382f]">
            Team size
            <input
              className="h-11 rounded-lg border border-[#d9d4c8] bg-[#fbfaf7] px-3 text-sm font-medium text-[#171512] outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
              defaultValue={report.teamSize}
              min={1}
              name="teamSize"
              type="number"
            />
          </label>

          <div
            aria-hidden="true"
            className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
          >
            <label>
              Website
              <input
                autoComplete="off"
                name="website"
                tabIndex={-1}
                type="text"
              />
            </label>
          </div>

          {state.status === "error" ? (
            <p className="rounded-lg border border-[#f1c6c6] bg-[#fff4f4] px-3 py-2 text-sm font-medium text-[#7f1d1d]">
              {state.message}
            </p>
          ) : null}

          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#171512] px-4 text-sm font-bold text-white transition hover:bg-[#2a251f] disabled:cursor-not-allowed disabled:bg-[#b9b1a2]"
            disabled={state.status === "submitting"}
            type="submit"
          >
            {state.status === "submitting" ? "Saving..." : "Send confirmation"}
            <Send aria-hidden className="h-4 w-4" />
          </button>
        </form>
      )}
    </section>
  );
}

