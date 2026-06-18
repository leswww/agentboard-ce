import { NextResponse } from "next/server";
import { makeAiRequest, logAiRequest } from "@/lib/ai/provider";
import { buildReleaseNotesPrompt } from "@/lib/ai/prompts";
import type { ReleaseNotesInput, ReleaseNotesOutput } from "@/lib/ai/types";

export async function POST(request: Request) {
  try {
    const body: ReleaseNotesInput = await request.json();

    if (!body.version) {
      return NextResponse.json(
        { error: "Version is required" },
        { status: 400 }
      );
    }

    const prompt = buildReleaseNotesPrompt({
      version: body.version,
      project: body.project,
      recentCommits: body.recentCommits?.slice(0, 3000),
      issuePrSummaries: body.issuePrSummaries?.slice(0, 3000),
      manualNotes: body.manualNotes?.slice(0, 2000),
    });

    const result = await makeAiRequest({
      messages: [
        { role: "system", content: "You are an expert open-source maintainer drafting release notes. Follow Keep a Changelog format." },
        { role: "user", content: prompt },
      ],
    });

    const output = parseReleaseNotesOutput(result.content, body.version);

    await logAiRequest({
      workflowType: "release-notes",
      project: body.project,
      status: "completed",
      inputSummary: `Version: ${body.version}`,
      outputPreview: output.summary?.slice(0, 100) || "",
      model: result.model,
    });

    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";

    await logAiRequest({
      workflowType: "release-notes",
      status: "failed",
      errorMessage: message,
    });

    return NextResponse.json(
      { error: "AI request failed", details: message },
      { status: 500 }
    );
  }
}

function parseReleaseNotesOutput(content: string, version: string): ReleaseNotesOutput {
  const extractSection = (heading: string): string => {
    const idx = content.indexOf(heading);
    if (idx === -1) return "";
    const after = content.slice(idx + heading.length);
    const nextHeading = after.search(/\n#{1,6}\s/);
    return (nextHeading === -1 ? after : after.slice(0, nextHeading)).trim();
  };

  const summary = extractSection("Summary / Highlights") || extractSection("Summary") || extractSection("Highlights");
  const added = extractSection("Added");
  const changed = extractSection("Changed");
  const fixed = extractSection("Fixed");
  const security = extractSection("Security");
  const breakingChanges = extractSection("Breaking Changes");
  const migrationGuide = extractSection("Migration Guide");
  const contributors = extractSection("Contributors");

  const markdownOutput = `# ${version}\n\n${summary ? `## Summary\n${summary}\n\n` : ""}${added ? `### Added\n${added}\n\n` : ""}${changed ? `### Changed\n${changed}\n\n` : ""}${fixed ? `### Fixed\n${fixed}\n\n` : ""}${security ? `### Security\n${security}\n\n` : ""}${breakingChanges ? `### Breaking Changes\n${breakingChanges}\n\n` : ""}${migrationGuide ? `### Migration Guide\n${migrationGuide}\n\n` : ""}${contributors ? `### Contributors\n${contributors}\n` : ""}`;

  return {
    summary,
    added,
    changed,
    fixed,
    security,
    breakingChanges,
    migrationGuide,
    contributors,
    markdownOutput,
  };
}
