import type { LeadCapturePayload } from "./validation";
import { formatCurrency } from "@/lib/spend/summary";

export type LeadEmailResult =
  | {
      id: string;
      status: "sent";
    }
  | {
      reason: "missing-env";
      status: "skipped";
    }
  | {
      reason: string;
      status: "failed";
    };

export async function sendLeadConfirmationEmail(
  lead: LeadCapturePayload,
): Promise<LeadEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      reason: "missing-env",
      status: "skipped",
    };
  }

  const email = buildLeadConfirmationEmail(lead);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "SpendLens/0.1",
      },
      body: JSON.stringify({
        from,
        html: email.html,
        subject: email.subject,
        text: email.text,
        to: [lead.email],
      }),
    });

    if (!response.ok) {
      return {
        reason: `resend-${response.status}`,
        status: "failed",
      };
    }

    const body = (await response.json()) as { id?: string };

    return {
      id: body.id ?? "unknown",
      status: "sent",
    };
  } catch (error) {
    return {
      reason: error instanceof Error ? error.message : "unknown-error",
      status: "failed",
    };
  }
}

export function buildLeadConfirmationEmail(lead: LeadCapturePayload) {
  const monthlySavings = formatCurrency(lead.monthlySavings);
  const annualSavings = formatCurrency(lead.annualSavings);
  const sourceLink = lead.sourceUrl
    ? `<p><a href="${escapeHtml(lead.sourceUrl)}">Open your SpendLens audit</a></p>`
    : "";

  return {
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171512; max-width: 560px;">
        <h1 style="font-size: 24px; margin-bottom: 12px;">Your SpendLens audit is saved</h1>
        <p>Thanks for running the audit. SpendLens found <strong>${monthlySavings}/mo</strong> in defendable AI spend savings, or <strong>${annualSavings}/yr</strong>.</p>
        <p>The next move is simple: review the largest recommendation against actual usage, then decide whether this is a one-off cleanup or a Credex-style governance motion.</p>
        ${sourceLink}
        <p style="color: #6f695c; font-size: 13px;">No company or email data is included in public audit URLs.</p>
      </div>
    `.replace(/\s{2,}/g, " ").trim(),
    subject: "Your SpendLens AI spend audit",
    text: [
      "Your SpendLens audit is saved.",
      `SpendLens found ${monthlySavings}/mo in defendable AI spend savings, or ${annualSavings}/yr.`,
      "Review the largest recommendation against actual usage, then decide whether this is a one-off cleanup or a Credex-style governance motion.",
      lead.sourceUrl ? `Open your audit: ${lead.sourceUrl}` : "",
      "No company or email data is included in public audit URLs.",
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

