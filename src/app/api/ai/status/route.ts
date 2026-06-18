import { NextResponse } from "next/server";
import { getAiStatus } from "@/lib/ai/provider";

export async function GET() {
  try {
    const status = await getAiStatus();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json(
      { error: "Failed to get AI status" },
      { status: 500 }
    );
  }
}
