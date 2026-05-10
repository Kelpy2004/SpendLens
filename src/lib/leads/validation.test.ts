import { validateLeadCapturePayload } from "./validation";

describe("lead capture validation", () => {
  it("normalizes a valid lead payload", () => {
    const result = validateLeadCapturePayload({
      annualSavings: "14400",
      auditId: "audit-123",
      companyName: "  Acme AI  ",
      email: "FOUNDER@EXAMPLE.COM",
      monthlySavings: 1200.129,
      primaryUseCase: "coding",
      role: "Founder",
      sourceUrl: "https://example.com/audit/audit-123",
      teamSize: "12",
      website: "",
    });

    expect(result).toEqual({
      ok: true,
      spam: false,
      value: {
        annualSavings: 14400,
        auditId: "audit-123",
        companyName: "Acme AI",
        email: "founder@example.com",
        monthlySavings: 1200.13,
        primaryUseCase: "coding",
        role: "Founder",
        sourceUrl: "https://example.com/audit/audit-123",
        teamSize: 12,
      },
    });
  });

  it("rejects invalid emails and missing audit ids", () => {
    expect(
      validateLeadCapturePayload({
        auditId: "audit-123",
        email: "nope",
        primaryUseCase: "coding",
      }),
    ).toMatchObject({ ok: false, error: "Enter a valid email address." });

    expect(
      validateLeadCapturePayload({
        email: "founder@example.com",
        primaryUseCase: "coding",
      }),
    ).toMatchObject({ ok: false, error: "Missing audit id." });
  });

  it("silently marks honeypot submissions as spam", () => {
    expect(
      validateLeadCapturePayload({
        auditId: "audit-123",
        email: "founder@example.com",
        primaryUseCase: "coding",
        website: "https://spam.example",
      }),
    ).toEqual({
      ok: true,
      spam: true,
    });
  });
});

