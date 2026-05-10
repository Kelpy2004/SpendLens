import {
  checkRateLimit,
  createLeadRateLimitKeys,
  resetRateLimitBucketsForTests,
} from "./rate-limit";

describe("lead capture rate limit", () => {
  beforeEach(() => resetRateLimitBucketsForTests());

  it("limits repeated submissions inside a window", () => {
    const options = { limit: 2, windowMs: 60000 };

    expect(checkRateLimit("lead:ip:127.0.0.1", options, 1000)).toMatchObject({
      allowed: true,
      remaining: 1,
    });
    expect(checkRateLimit("lead:ip:127.0.0.1", options, 2000)).toMatchObject({
      allowed: true,
      remaining: 0,
    });
    expect(checkRateLimit("lead:ip:127.0.0.1", options, 3000)).toMatchObject({
      allowed: false,
    });
  });

  it("resets buckets after the window expires", () => {
    const options = { limit: 1, windowMs: 1000 };

    expect(checkRateLimit("lead:email:a@example.com", options, 1000)).toMatchObject({
      allowed: true,
    });
    expect(checkRateLimit("lead:email:a@example.com", options, 2500)).toMatchObject({
      allowed: true,
    });
  });

  it("creates separate ip and email keys", () => {
    expect(
      createLeadRateLimitKeys({
        email: "Founder@Example.com",
        ipAddress: "203.0.113.10",
      }),
    ).toEqual(["lead:ip:203.0.113.10", "lead:email:founder@example.com"]);
  });
});

