import { NextResponse } from "next/server";
import { saveAiConfig, removeAiConfig, getAiConfig } from "@/lib/ai/provider";

export async function GET() {
  try {
    const config = await getAiConfig();
    return NextResponse.json({
      provider: config.provider,
      baseUrl: config.baseUrl,
      model: config.model,
      enabled: config.enabled,
      validatedAt: config.validatedAt,
      configured: !!config.apiKey,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load AI settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, apiKey, baseUrl, model, enabled } = body;

    await saveAiConfig({
      provider: provider || "disabled",
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
      model: model || undefined,
      enabled: enabled !== undefined ? Boolean(enabled) : undefined,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save AI settings" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await removeAiConfig();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove AI settings" },
      { status: 500 }
    );
  }
}
