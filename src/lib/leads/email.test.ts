import { buildLeadConfirmationEmail } from "./email";

describe("lead confirmation email", () => {
  it("renders savings and audit link without leaking unsafe HTML", () => {
    const email = buildLeadConfirmationEmail({
      annualSavings: 12000,
      auditId: "audit-123",
      companyName: "Acme",
      email: "founder@example.com",
      monthlySavings: 1000,
      primaryUseCase: "coding",
      role: "Founder",
      sourceUrl: "https://example.com/audit/audit-123?x=<script>",
      teamSize: 12,
    });

    expect(email.subject).toBe("Your SpendLens AI spend audit");
    expect(email.text).toContain("$1,000/mo");
    expect(email.text).toContain("$12,000/yr");
    expect(email.html).toContain("https://example.com/audit/audit-123?x=&lt;script&gt;");
    expect(email.html).not.toContain("<script>");
  });
});

