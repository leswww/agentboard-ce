import { NextResponse } from "next/server";
import { getAiRequestLogs } from "@/lib/ai/provider";

export async function GET() {
  try {
    const logs = await getAiRequestLogs();
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch AI request history" },
      { status: 500 }
    );
  }
}
