import { capturePricingSnapshot, findChangedTools } from "./pricing-snapshot";

describe("capturePricingSnapshot", () => {
  it("returns a version string and a catalog object", () => {
    const snapshot = capturePricingSnapshot();

    expect(typeof snapshot.version).toBe("string");
    expect(snapshot.version.length).toBeGreaterThan(0);
    expect(snapshot.catalog).toBeDefined();
    expect(typeof snapshot.catalog).toBe("object");
  });

  it("captures a deep copy that is independent of the original", () => {
    const a = capturePricingSnapshot();
    const b = capturePricingSnapshot();

    // Same content, different references.
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.catalog).not.toBe(b.catalog);
  });
});

describe("findChangedTools", () => {
  it("returns empty array when snapshots are identical", () => {
    const snapshot = capturePricingSnapshot();
    const changed = findChangedTools(snapshot, snapshot);

    expect(changed).toEqual([]);
  });

  it("detects a price change for a specific tool", () => {
    const prev = capturePricingSnapshot();
    const curr = capturePricingSnapshot();

    // Simulate Cursor Pro going from $20 to $25.
    const cursorPlans = [...(curr.catalog.cursor.plans as unknown as Record<string, unknown>[])];
    cursorPlans[1] = { ...cursorPlans[1], monthlyPerSeat: 25 };
    (curr.catalog as Record<string, unknown>).cursor = {
      ...curr.catalog.cursor,
      plans: cursorPlans,
    };

    const changed = findChangedTools(prev, curr);

    expect(changed).toContain("cursor");
    expect(changed).not.toContain("claude");
  });

  it("does not flag tools that stayed the same", () => {
    const snapshot = capturePricingSnapshot();
    const changed = findChangedTools(snapshot, snapshot);

    expect(changed).toHaveLength(0);
  });
});
