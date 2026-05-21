import { pricingCatalog, pricingDataVerifiedAt } from "./pricing-catalog";

export type PricingSnapshot = {
  version: string;
  catalog: typeof pricingCatalog;
};

export function capturePricingSnapshot(): PricingSnapshot {
  return {
    version: pricingDataVerifiedAt,
    catalog: structuredClone(pricingCatalog),
  };
}

/** Return tool IDs whose pricing differs between two snapshots. */
export function findChangedTools(
  previous: PricingSnapshot,
  current: PricingSnapshot,
): string[] {
  const changed: string[] = [];

  for (const toolId of Object.keys(current.catalog)) {
    const prevPlans = previous.catalog[toolId as keyof typeof pricingCatalog];
    const currPlans = current.catalog[toolId as keyof typeof pricingCatalog];

    if (!prevPlans) {
      changed.push(toolId);
      continue;
    }

    if (JSON.stringify(prevPlans.plans) !== JSON.stringify(currPlans.plans)) {
      changed.push(toolId);
    }
  }

  return changed;
}
