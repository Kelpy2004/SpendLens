import { NextResponse } from "next/server";

import {
  detectAuditChanges,
  groupByUser,
  type StoredAudit,
} from "@/lib/audit/change-detector";
import { sendPricingChangeEmail } from "@/lib/audit/change-email";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Protected by bearer token when CRON_SECRET is set. */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const auth = request.headers.get("authorization");

    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let supabase: ReturnType<typeof getSupabaseAdminClient>;

  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 },
    );
  }

  const { data: rows, error } = await supabase
    .from("stored_audits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to read stored audits." },
      { status: 500 },
    );
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({
      affected: 0,
      emailsSent: 0,
      message: "No stored audits to check.",
      scanned: 0,
    });
  }

  const affected = rows
    .map((row) => detectAuditChanges(row as unknown as StoredAudit))
    .filter((result): result is NonNullable<typeof result> => result !== null);

  if (affected.length === 0) {
    return NextResponse.json({
      affected: 0,
      emailsSent: 0,
      message: "All audits are current — no pricing changes affect existing recommendations.",
      scanned: rows.length,
    });
  }

  const groups = groupByUser(affected);
  let emailsSent = 0;

  for (const group of groups) {
    const result = await sendPricingChangeEmail(group);

    if (result.status === "sent") {
      emailsSent++;

      const auditIds = group.audits.map((a) => a.storedAuditId);

      await supabase
        .from("stored_audits")
        .update({ notified_at: new Date().toISOString() })
        .in("id", auditIds);
    }
  }

  return NextResponse.json({
    affected: affected.length,
    emailsSent,
    message: `Found ${affected.length} stale audit(s) across ${groups.length} user(s). Sent ${emailsSent} email(s).`,
    scanned: rows.length,
  });
}
