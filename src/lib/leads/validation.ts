import {
  isPrimaryUseCase,
  type PrimaryUseCase,
} from "@/lib/spend/types";
import { sanitizeMoneyInput, sanitizeSeatInput } from "@/lib/spend/summary";

export type LeadCapturePayload = {
  annualSavings: number;
  auditId: string;
  companyName: string | null;
  email: string;
  monthlySavings: number;
  primaryUseCase: PrimaryUseCase;
  role: string | null;
  sourceUrl: string | null;
  teamSize: number | null;
};

export type LeadValidationResult =
  | {
      ok: true;
      spam: false;
      value: LeadCapturePayload;
    }
  | {
      ok: true;
      spam: true;
    }
  | {
      error: string;
      ok: false;
      status: 400;
    };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadCapturePayload(input: unknown): LeadValidationResult {
  if (!input || typeof input !== "object") {
    return {
      error: "Request body must be a JSON object.",
      ok: false,
      status: 400,
    };
  }

  const body = input as Record<string, unknown>;
  const honeypotValue = normalizeOptionalString(body.website, 120);

  if (honeypotValue) {
    return {
      ok: true,
      spam: true,
    };
  }

  const email = normalizeOptionalString(body.email, 254)?.toLowerCase();
  const auditId = normalizeOptionalString(body.auditId, 80);

  if (!email || !emailPattern.test(email)) {
    return {
      error: "Enter a valid email address.",
      ok: false,
      status: 400,
    };
  }

  if (!auditId) {
    return {
      error: "Missing audit id.",
      ok: false,
      status: 400,
    };
  }

  if (!isPrimaryUseCase(body.primaryUseCase)) {
    return {
      error: "Missing or invalid primary use case.",
      ok: false,
      status: 400,
    };
  }

  return {
    ok: true,
    spam: false,
    value: {
      annualSavings: sanitizeMoneyInput(toNumber(body.annualSavings)),
      auditId,
      companyName: normalizeOptionalString(body.companyName, 120),
      email,
      monthlySavings: sanitizeMoneyInput(toNumber(body.monthlySavings)),
      primaryUseCase: body.primaryUseCase,
      role: normalizeOptionalString(body.role, 120),
      sourceUrl: normalizeOptionalString(body.sourceUrl, 2048),
      teamSize: normalizeTeamSize(body.teamSize),
    },
  };
}

function normalizeOptionalString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function normalizeTeamSize(value: unknown) {
  const parsed = sanitizeSeatInput(toNumber(value));

  if (parsed <= 0) {
    return null;
  }

  return Math.min(parsed, 100000);
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value);
}

