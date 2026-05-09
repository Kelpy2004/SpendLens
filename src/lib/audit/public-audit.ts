import { spendToolDefinitions, type SpendToolId } from "@/lib/spend/tool-catalog";
import {
  isPrimaryUseCase,
  type PrimaryUseCase,
  type SpendFormState,
  type ToolSpendInput,
} from "@/lib/spend/types";
import { sanitizeMoneyInput, sanitizeSeatInput } from "@/lib/spend/summary";

export const publicAuditVersion = 1;

export type PublicAuditPayload = {
  v: typeof publicAuditVersion;
  id: string;
  createdAt: string;
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  tools: Partial<Record<SpendToolId, ToolSpendInput>>;
};

const spendToolIds = spendToolDefinitions.map((tool) => tool.id);

export function createPublicAuditPayload(
  state: SpendFormState,
  id = createAuditId(),
): PublicAuditPayload {
  return {
    v: publicAuditVersion,
    id,
    createdAt: new Date().toISOString(),
    teamSize: Math.max(1, sanitizeSeatInput(state.teamSize)),
    primaryUseCase: state.primaryUseCase,
    tools: sanitizeTools(state.tools),
  };
}

export function createSpendStateFromPublicAudit(
  payload: PublicAuditPayload,
): SpendFormState {
  return {
    teamSize: payload.teamSize,
    primaryUseCase: payload.primaryUseCase,
    tools: Object.fromEntries(
      spendToolDefinitions.map((tool) => [
        tool.id,
        payload.tools[tool.id] ?? {
          isActive: false,
          monthlySpend: 0,
          planTier: tool.defaultPlanTier,
          seats: 0,
        },
      ]),
    ),
  };
}

export function encodePublicAuditPayload(payload: PublicAuditPayload) {
  const json = JSON.stringify(payload);
  const base64 =
    typeof window === "undefined"
      ? Buffer.from(json, "utf8").toString("base64")
      : window.btoa(unescape(encodeURIComponent(json)));

  return base64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function decodePublicAuditPayload(
  value: string | string[] | undefined,
): PublicAuditPayload | null {
  if (!value || Array.isArray(value)) {
    return null;
  }

  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json =
      typeof window === "undefined"
        ? Buffer.from(padded, "base64").toString("utf8")
        : decodeURIComponent(escape(window.atob(padded)));

    return validatePublicAuditPayload(JSON.parse(json));
  } catch {
    return null;
  }
}

function sanitizeTools(tools: SpendFormState["tools"]) {
  return Object.fromEntries(
    spendToolDefinitions.flatMap((tool) => {
      const input = tools[tool.id];

      if (!input?.isActive) {
        return [];
      }

      const planTier = (tool.planTiers as readonly string[]).includes(
        input.planTier,
      )
        ? input.planTier
        : tool.defaultPlanTier;

      return [
        [
          tool.id,
          {
            isActive: true,
            monthlySpend: sanitizeMoneyInput(input.monthlySpend),
            planTier,
            seats: sanitizeSeatInput(input.seats),
          },
        ],
      ];
    }),
  ) as Partial<Record<SpendToolId, ToolSpendInput>>;
}

function validatePublicAuditPayload(value: unknown): PublicAuditPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Partial<PublicAuditPayload>;

  if (
    payload.v !== publicAuditVersion ||
    typeof payload.id !== "string" ||
    typeof payload.createdAt !== "string" ||
    !isPrimaryUseCase(payload.primaryUseCase) ||
    typeof payload.teamSize !== "number" ||
    !payload.tools ||
    typeof payload.tools !== "object"
  ) {
    return null;
  }

  const tools = Object.fromEntries(
    spendToolIds.flatMap((toolId) => {
      const input = payload.tools?.[toolId];

      if (!isValidToolInput(toolId, input)) {
        return [];
      }

      return [[toolId, input]];
    }),
  ) as Partial<Record<SpendToolId, ToolSpendInput>>;

  return {
    v: publicAuditVersion,
    id: payload.id,
    createdAt: payload.createdAt,
    teamSize: Math.max(1, sanitizeSeatInput(payload.teamSize)),
    primaryUseCase: payload.primaryUseCase,
    tools,
  };
}

function isValidToolInput(
  toolId: SpendToolId,
  input: unknown,
): input is ToolSpendInput {
  const tool = spendToolDefinitions.find((definition) => definition.id === toolId);

  if (!tool || !input || typeof input !== "object") {
    return false;
  }

  const toolInput = input as Partial<ToolSpendInput>;

  return (
    toolInput.isActive === true &&
    typeof toolInput.planTier === "string" &&
    (tool.planTiers as readonly string[]).includes(toolInput.planTier) &&
    typeof toolInput.monthlySpend === "number" &&
    typeof toolInput.seats === "number"
  );
}

function createAuditId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }

  return `audit-${Date.now().toString(36)}`;
}
