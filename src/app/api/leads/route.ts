import { NextResponse, type NextRequest } from "next/server";

import { sendLeadConfirmationEmail } from "@/lib/leads/email";
import {
  checkRateLimit,
  createLeadRateLimitKeys,
} from "@/lib/leads/rate-limit";
import { validateLeadCapturePayload } from "@/lib/leads/validation";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export const runtime = "nodejs";

type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];

const ipRateLimit = {
  limit: 8,
  windowMs: 10 * 60 * 1000,
};

const emailRateLimit = {
  limit: 3,
  windowMs: 15 * 60 * 1000,
};

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const validation = validateLeadCapturePayload(body);

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status },
    );
  }

  if (validation.spam) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const lead = validation.value;
  const ipAddress = getIpAddress(request);
  const [ipKey, emailKey] = createLeadRateLimitKeys({
    email: lead.email,
    ipAddress,
  });
  const ipLimit = checkRateLimit(ipKey, ipRateLimit);
  const emailLimit = checkRateLimit(emailKey, emailRateLimit);
  const blockedLimit = [ipLimit, emailLimit].find((limit) => !limit.allowed);

  if (blockedLimit && !blockedLimit.allowed) {
    return NextResponse.json(
      { error: "Too many lead submissions. Try again shortly." },
      {
        headers: {
          "Retry-After": `${blockedLimit.retryAfterSeconds}`,
        },
        status: 429,
      },
    );
  }

  let supabase: ReturnType<typeof getSupabaseAdminClient>;

  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Lead storage is not configured in this environment." },
      { status: 503 },
    );
  }

  const insertPayload: LeadInsert = {
    annual_savings: lead.annualSavings,
    audit_id: lead.auditId,
    company_name: lead.companyName,
    email: lead.email,
    monthly_savings: lead.monthlySavings,
    primary_use_case: lead.primaryUseCase,
    role: lead.role,
    source_url: lead.sourceUrl,
    team_size: lead.teamSize,
    user_agent: request.headers.get("user-agent"),
  };

  const { data, error } = await supabase
    .from("leads")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not save lead right now." },
      { status: 500 },
    );
  }

  const emailResult = await sendLeadConfirmationEmail(lead);
  const updatePayload: LeadUpdate = {
    email_delivery_status: emailResult.status,
    resend_email_id: emailResult.status === "sent" ? emailResult.id : null,
  };

  await supabase.from("leads").update(updatePayload).eq("id", data.id);

  return NextResponse.json(
    {
      emailDeliveryStatus: emailResult.status,
      id: data.id,
      ok: true,
    },
    { status: 201 },
  );
}

function getIpAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
