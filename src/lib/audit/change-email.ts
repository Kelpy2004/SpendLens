import type { UserNotificationGroup } from "./change-detector";
import { formatCurrency } from "@/lib/spend/summary";

export type ChangeEmailResult =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

export async function sendPricingChangeEmail(
  group: UserNotificationGroup,
): Promise<ChangeEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { status: "skipped", reason: "missing-env" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://spendlens-nu.vercel.app";
  const email = buildChangeNotificationEmail(group, appUrl);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "SpendLens/0.2",
      },
      body: JSON.stringify({
        from,
        to: [group.email],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });

    if (!response.ok) {
      return { status: "failed", reason: `resend-${response.status}` };
    }

    const body = (await response.json()) as { id?: string };

    return { status: "sent", id: body.id ?? "unknown" };
  } catch (err) {
    return {
      status: "failed",
      reason: err instanceof Error ? err.message : "unknown-error",
    };
  }
}

function buildChangeNotificationEmail(
  group: UserNotificationGroup,
  appUrl: string,
) {
  const { audits } = group;
  const changedTools = audits.flatMap((a) => a.changedTools);
  const uniqueTools = Array.from(new Set(changedTools.map((t) => t.toolName)));

  const toolRows = changedTools.map((t) => {
    const arrow = t.newMonthlySavings > t.oldMonthlySavings ? "↑" : "↓";

    return {
      html: `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #ede7dc;">${t.toolName}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #ede7dc; color: #6f695c;">${t.oldRecommendation}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #ede7dc; font-weight: 600;">${t.newRecommendation}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #ede7dc;">${arrow} ${formatCurrency(Math.abs(t.newMonthlySavings - t.oldMonthlySavings))}/mo</td>
        </tr>
      `,
      text: `${t.toolName}: ${t.oldRecommendation} → ${t.newRecommendation} (${arrow} ${formatCurrency(Math.abs(t.newMonthlySavings - t.oldMonthlySavings))}/mo)`,
    };
  });

  const primaryAudit = audits[0];
  const rerunUrl = `${appUrl}/audit/${primaryAudit.auditId}/diff?stored=${primaryAudit.storedAuditId}`;

  const subject = `Pricing changed for ${uniqueTools.join(", ")} — your SpendLens audit needs a refresh`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171512; max-width: 620px;">
      <h1 style="font-size: 22px; margin-bottom: 8px;">Your AI spend audit is out of date</h1>
      <p>Pricing has changed for <strong>${uniqueTools.join(", ")}</strong> since you last ran your SpendLens audit. Here's what shifted:</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
        <thead>
          <tr style="background: #f5f6f2;">
            <th style="padding: 8px 12px; text-align: left;">Tool</th>
            <th style="padding: 8px 12px; text-align: left;">Was</th>
            <th style="padding: 8px 12px; text-align: left;">Now</th>
            <th style="padding: 8px 12px; text-align: left;">Impact</th>
          </tr>
        </thead>
        <tbody>
          ${toolRows.map((r) => r.html).join("")}
        </tbody>
      </table>

      <p>Your total savings opportunity changed by <strong>${formatCurrency(Math.abs(group.totalSavingsDelta))}/mo</strong>.</p>

      <a href="${rerunUrl}" style="display: inline-block; background: #171512; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 8px 0;">
        See what changed →
      </a>

      <p style="color: #6f695c; font-size: 13px; margin-top: 20px;">
        This email was sent because you saved a SpendLens audit. No personal data is included in audit URLs.
      </p>
    </div>
  `.replace(/\s{2,}/g, " ").trim();

  const text = [
    "Your AI spend audit is out of date",
    "",
    `Pricing has changed for ${uniqueTools.join(", ")} since your last SpendLens audit.`,
    "",
    ...toolRows.map((r) => r.text),
    "",
    `Total savings change: ${formatCurrency(Math.abs(group.totalSavingsDelta))}/mo`,
    "",
    `See what changed: ${rerunUrl}`,
  ].join("\n");

  return { subject, html, text };
}
