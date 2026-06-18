import { NextResponse } from "next/server";
import { validateAiConfig } from "@/lib/ai/provider";

export async function POST() {
  try {
    const result = await validateAiConfig();
    if (result.valid) {
      return NextResponse.json({ valid: true, model: result.model });
    }
    return NextResponse.json(
      { valid: false, error: result.error || "Validation failed" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to validate AI settings" },
      { status: 500 }
    );
  }
}
