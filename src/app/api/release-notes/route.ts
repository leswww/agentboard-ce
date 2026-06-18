import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notes = await prisma.releaseNote.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch release notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      projectId,
      version,
      releaseDate,
      summary,
      added,
      changed,
      fixed,
      security,
      deprecated,
      removed,
      breakingChanges,
      migrationGuide,
      contributors,
      markdownOutput: preGeneratedMarkdown,
    } = body;

    if (!version) {
      return NextResponse.json(
        { error: "Version is required" },
        { status: 400 }
      );
    }

    // Use pre-generated markdown (e.g. from AI) or generate from template
    const markdownOutput = preGeneratedMarkdown || generateReleaseNotesMarkdown({
      version,
      releaseDate,
      summary,
      added,
      changed,
      fixed,
      security,
      deprecated,
      removed,
      breakingChanges,
      migrationGuide,
      contributors,
    });

    const note = await prisma.releaseNote.create({
      data: {
        projectId: projectId || null,
        version,
        releaseDate,
        summary,
        added,
        changed,
        fixed,
        security,
        deprecated,
        removed,
        breakingChanges,
        migrationGuide,
        contributors,
        markdownOutput,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create release note" },
      { status: 500 }
    );
  }
}

function generateReleaseNotesMarkdown(data: {
  version: string;
  releaseDate?: string;
  summary?: string;
  added?: string;
  changed?: string;
  fixed?: string;
  security?: string;
  deprecated?: string;
  removed?: string;
  breakingChanges?: string;
  migrationGuide?: string;
  contributors?: string;
}) {
  let md = `# Release Notes - ${data.version}\n\n`;

  if (data.releaseDate) {
    md += `**Release Date:** ${data.releaseDate}\n\n`;
  }

  if (data.summary) {
    md += `## Highlights\n${data.summary}\n\n`;
  }

  if (data.added) {
    md += `## Added\n${data.added}\n\n`;
  }

  if (data.changed) {
    md += `## Changed\n${data.changed}\n\n`;
  }

  if (data.fixed) {
    md += `## Fixed\n${data.fixed}\n\n`;
  }

  if (data.security) {
    md += `## Security\n${data.security}\n\n`;
  }

  if (data.deprecated) {
    md += `## Deprecated\n${data.deprecated}\n\n`;
  }

  if (data.removed) {
    md += `## Removed\n${data.removed}\n\n`;
  }

  if (data.breakingChanges) {
    md += `## Breaking Changes\n${data.breakingChanges}\n\n`;
  }

  if (data.migrationGuide) {
    md += `## Migration Guide\n${data.migrationGuide}\n\n`;
  }

  if (data.contributors) {
    md += `## Contributors\n${data.contributors}\n\n`;
  }

  return md;
}
