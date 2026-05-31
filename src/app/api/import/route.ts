import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.data) {
      return NextResponse.json(
        { error: "Invalid import format" },
        { status: 400 }
      );
    }

    const { data } = body;

    // Clear existing data
    await prisma.commandRun.deleteMany();
    await prisma.commandTemplate.deleteMany();
    await prisma.agentProfile.deleteMany();
    await prisma.issueDraft.deleteMany();
    await prisma.prReviewDraft.deleteMany();
    await prisma.releaseNote.deleteMany();
    await prisma.project.deleteMany();
    await prisma.setting.deleteMany();

    // Import data
    if (data.projects) {
      for (const project of data.projects) {
        const { id, ...projectData } = project;
        await prisma.project.create({ data: { id, ...projectData } });
      }
    }

    if (data.commandTemplates) {
      for (const template of data.commandTemplates) {
        const { id, ...templateData } = template;
        await prisma.commandTemplate.create({ data: { id, ...templateData } });
      }
    }

    if (data.agentProfiles) {
      for (const profile of data.agentProfiles) {
        const { id, ...profileData } = profile;
        await prisma.agentProfile.create({ data: { id, ...profileData } });
      }
    }

    if (data.issueDrafts) {
      for (const draft of data.issueDrafts) {
        const { id, ...draftData } = draft;
        await prisma.issueDraft.create({ data: { id, ...draftData } });
      }
    }

    if (data.prReviewDrafts) {
      for (const draft of data.prReviewDrafts) {
        const { id, ...draftData } = draft;
        await prisma.prReviewDraft.create({ data: { id, ...draftData } });
      }
    }

    if (data.releaseNotes) {
      for (const note of data.releaseNotes) {
        const { id, ...noteData } = note;
        await prisma.releaseNote.create({ data: { id, ...noteData } });
      }
    }

    if (data.settings) {
      for (const setting of data.settings) {
        await prisma.setting.create({ data: setting });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}
