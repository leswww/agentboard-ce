import { prisma } from "@/lib/prisma";
import type { AiConfig, AiRequestInput, AiRequestResult, AiStatus } from "./types";

const DEFAULT_TIMEOUT = 30000;
const MAX_RESPONSE_TOKENS = 4096;
const DEFAULT_MODEL = "gpt-4o";

export async function getAiConfig(): Promise<AiConfig> {
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: ["ai.provider", "ai.apiKey", "ai.baseUrl", "ai.model", "ai.enabled", "ai.validatedAt"] },
    },
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  return {
    provider: (map["ai.provider"] as AiConfig["provider"]) || "disabled",
    apiKey: map["ai.apiKey"] || null,
    baseUrl: map["ai.baseUrl"] || null,
    model: map["ai.model"] || null,
    enabled: map["ai.enabled"] === "true",
    validatedAt: map["ai.validatedAt"] || null,
  };
}

export async function getAiStatus(): Promise<AiStatus> {
  const config = await getAiConfig();
  return {
    configured: !!config.apiKey && config.provider !== "disabled",
    enabled: config.enabled && !!config.apiKey && config.provider !== "disabled",
    provider: config.provider,
    model: config.model || null,
    validatedAt: config.validatedAt,
  };
}

export async function saveAiConfig(
  partial: Partial<Pick<AiConfig, "provider" | "apiKey" | "baseUrl" | "model" | "enabled">>
): Promise<void> {
  const entries: Array<{ key: string; value: string }> = [];

  if (partial.provider !== undefined) entries.push({ key: "ai.provider", value: partial.provider || "disabled" });
  if (partial.apiKey !== undefined) entries.push({ key: "ai.apiKey", value: partial.apiKey || "" });
  if (partial.baseUrl !== undefined) entries.push({ key: "ai.baseUrl", value: partial.baseUrl || "" });
  if (partial.model !== undefined) entries.push({ key: "ai.model", value: partial.model || "" });
  if (partial.enabled !== undefined) entries.push({ key: "ai.enabled", value: String(partial.enabled) });

  for (const { key, value } of entries) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

export async function removeAiConfig(): Promise<void> {
  await prisma.setting.deleteMany({
    where: {
      key: { in: ["ai.provider", "ai.apiKey", "ai.baseUrl", "ai.model", "ai.enabled", "ai.validatedAt"] },
    },
  });
}

export async function validateAiConfig(): Promise<{ valid: boolean; model: string | null; error?: string }> {
  const config = await getAiConfig();

  if (!config.apiKey || config.provider === "disabled") {
    return { valid: false, model: null, error: "AI not configured" };
  }

  const model = config.model || DEFAULT_MODEL;

  try {
    const baseUrl = config.baseUrl || "https://api.openai.com/v1";
    const response = await fetch(`${baseUrl}/models/${model}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { valid: false, model, error: `API returned ${response.status}` };
    }

    await prisma.setting.upsert({
      where: { key: "ai.validatedAt" },
      update: { value: new Date().toISOString() },
      create: { key: "ai.validatedAt", value: new Date().toISOString() },
    });

    return { valid: true, model };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    return { valid: false, model, error: message };
  }
}

export async function makeAiRequest(input: AiRequestInput): Promise<AiRequestResult> {
  const config = await getAiConfig();

  if (!config.apiKey || config.provider === "disabled" || !config.enabled) {
    throw new Error("AI is not configured or disabled");
  }

  const model = config.model || DEFAULT_MODEL;
  const baseUrl = config.baseUrl || "https://api.openai.com/v1";
  const maxTokens = input.maxTokens || MAX_RESPONSE_TOKENS;
  const timeout = input.timeoutMs || DEFAULT_TIMEOUT;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: input.messages,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(timeout),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`AI request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content || "";
  if (!content) {
    throw new Error("AI returned empty response");
  }

  return {
    content,
    model: data.model || model,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  };
}

export async function logAiRequest(params: {
  workflowType: string;
  project?: string;
  model?: string;
  status: string;
  inputSummary?: string;
  outputPreview?: string;
  errorMessage?: string;
}): Promise<void> {
  await prisma.aiRequestLog.create({
    data: {
      workflowType: params.workflowType,
      project: params.project || null,
      model: params.model || null,
      status: params.status,
      inputSummary: params.inputSummary?.slice(0, 500) || null,
      outputPreview: params.outputPreview?.slice(0, 500) || null,
      errorMessage: params.errorMessage?.slice(0, 500) || null,
    },
  });
}

export async function getAiRequestLogs(limit = 50) {
  return prisma.aiRequestLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

function sanitizeInput(input: string, maxLength = 2000): string {
  return input.slice(0, maxLength);
}

interface SanitizedInput {
  issueTitle?: string;
  issueBody?: string;
  environment?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshots?: string;
  additionalNotes?: string;
}

export function sanitizeIssueTriageInput(input: Record<string, unknown>): SanitizedInput {
  return {
    issueTitle: sanitizeInput(String(input.issueTitle || ""), 500),
    issueBody: sanitizeInput(String(input.issueBody || ""), 2000),
    environment: sanitizeInput(String(input.environment || ""), 500),
    expectedBehavior: sanitizeInput(String(input.expectedBehavior || ""), 1000),
    actualBehavior: sanitizeInput(String(input.actualBehavior || ""), 1000),
    screenshots: sanitizeInput(String(input.screenshots || ""), 500),
    additionalNotes: sanitizeInput(String(input.additionalNotes || ""), 1000),
  };
}

interface SanitizedPrInput {
  prTitle?: string;
  prSummary?: string;
  changedFilesSummary?: string;
  testResults?: string;
  riskNotes?: string;
  documentationImpact?: string;
}

export function sanitizePrReviewInput(input: Record<string, unknown>): SanitizedPrInput {
  return {
    prTitle: sanitizeInput(String(input.prTitle || ""), 500),
    prSummary: sanitizeInput(String(input.prSummary || ""), 2000),
    changedFilesSummary: sanitizeInput(String(input.changedFilesSummary || ""), 2000),
    testResults: sanitizeInput(String(input.testResults || ""), 1000),
    riskNotes: sanitizeInput(String(input.riskNotes || ""), 1000),
    documentationImpact: sanitizeInput(String(input.documentationImpact || ""), 500),
  };
}
