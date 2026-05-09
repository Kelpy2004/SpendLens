import {
  createPublicAuditPayload,
  createSpendStateFromPublicAudit,
  decodePublicAuditPayload,
  encodePublicAuditPayload,
} from "./public-audit";
import { createDefaultSpendFormState } from "@/lib/spend/tool-catalog";

describe("public audit payloads", () => {
  it("round trips a sanitized audit snapshot through a share URL payload", () => {
    const state = createDefaultSpendFormState();
    state.teamSize = 7;
    state.primaryUseCase = "coding";
    state.tools.cursor = {
      isActive: true,
      monthlySpend: 280.129,
      planTier: "Business",
      seats: 7.8,
    };

    const payload = createPublicAuditPayload(state, "audit-123");
    const decoded = decodePublicAuditPayload(encodePublicAuditPayload(payload));
    const restoredState = createSpendStateFromPublicAudit(decoded!);

    expect(decoded).toMatchObject({
      id: "audit-123",
      primaryUseCase: "coding",
      teamSize: 7,
    });
    expect(restoredState.tools.cursor).toEqual({
      isActive: true,
      monthlySpend: 280.13,
      planTier: "Business",
      seats: 7,
    });
  });

  it("drops unknown fields and inactive tools from the public payload", () => {
    const state = createDefaultSpendFormState();
    state.tools.chatgpt = {
      isActive: true,
      monthlySpend: 50,
      planTier: "Team",
      seats: 2,
    };
    state.tools.claude = {
      isActive: false,
      monthlySpend: 500,
      planTier: "Team",
      seats: 20,
    };

    const payload = createPublicAuditPayload(
      {
        ...state,
        // This simulates future lead-capture fields. They must never enter a public share URL.
        email: "founder@example.com",
        company: "Acme AI",
      } as typeof state & { email: string; company: string },
      "audit-456",
    );

    expect(JSON.stringify(payload)).not.toContain("founder@example.com");
    expect(JSON.stringify(payload)).not.toContain("Acme AI");
    expect(payload.tools.chatgpt).toBeDefined();
    expect(payload.tools.claude).toBeUndefined();
  });

  it("rejects malformed share payloads", () => {
    expect(decodePublicAuditPayload("not-valid-json")).toBeNull();
    expect(decodePublicAuditPayload(undefined)).toBeNull();
    expect(decodePublicAuditPayload(["one", "two"])).toBeNull();
  });
});

