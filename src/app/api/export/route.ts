import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      projects,
      commandTemplates,
      commandRuns,
      agentProfiles,
      issueDrafts,
      prReviewDrafts,
      releaseNotes,
      settings,
    ] = await Promise.all([
      prisma.project.findMany(),
      prisma.commandTemplate.findMany(),
      prisma.commandRun.findMany(),
      prisma.agentProfile.findMany(),
      prisma.issueDraft.findMany(),
      prisma.prReviewDraft.findMany(),
      prisma.releaseNote.findMany(),
      prisma.setting.findMany(),
    ]);

    const exportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      data: {
        projects,
        commandTemplates,
        commandRuns,
        agentProfiles,
        issueDrafts,
        prReviewDrafts,
        releaseNotes,
        settings,
      },
    };

    return NextResponse.json(exportData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
