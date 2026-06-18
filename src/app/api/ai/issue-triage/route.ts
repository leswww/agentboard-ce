import { NextResponse } from "next/server";
import { makeAiRequest, logAiRequest, sanitizeIssueTriageInput } from "@/lib/ai/provider";
import { buildIssueTriagePrompt } from "@/lib/ai/prompts";
import type { IssueTriageInput, IssueTriageOutput } from "@/lib/ai/types";

export async function POST(request: Request) {
  try {
    const body: IssueTriageInput = await request.json();

    if (!body.issueTitle) {
      return NextResponse.json(
        { error: "Issue title is required" },
        { status: 400 }
      );
    }

    const sanitized = sanitizeIssueTriageInput(body as unknown as Record<string, unknown>);
    const prompt = buildIssueTriagePrompt({
      issueTitle: sanitized.issueTitle || body.issueTitle,
      issueBody: sanitized.issueBody || body.issueBody,
      environment: sanitized.environment || body.environment,
      expectedBehavior: sanitized.expectedBehavior || body.expectedBehavior,
      actualBehavior: sanitized.actualBehavior || body.actualBehavior,
      screenshots: sanitized.screenshots || body.screenshots,
      additionalNotes: sanitized.additionalNotes || body.additionalNotes,
      labels: body.labels,
      repository: body.repository,
    });

    const result = await makeAiRequest({
      messages: [
        { role: "system", content: "You are an expert open-source maintainer performing issue triage. Provide structured, actionable triage results." },
        { role: "user", content: prompt },
      ],
    });

    const output = parseIssueTriageOutput(result.content);

    await logAiRequest({
      workflowType: "issue-triage",
      project: body.repository,
      model: result.model,
      status: "completed",
      inputSummary: `Issue: ${body.issueTitle}`,
      outputPreview: output.draftType ? `${output.draftType} | ${output.draftPriority}` : result.content.slice(0, 100),
    });

    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";

    await logAiRequest({
      workflowType: "issue-triage",
      status: "failed",
      errorMessage: message,
    });

    return NextResponse.json(
      { error: "AI request failed", details: message },
      { status: 500 }
    );
  }
}

function parseIssueTriageOutput(content: string): IssueTriageOutput {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  const extractAfter = (prefix: string): string => {
    const re = new RegExp(`${prefix}:?\\s*(.+)`, "i");
    for (const line of lines) {
      const match = line.match(re);
      if (match) return match[1].trim();
    }
    return "";
  };

  const extractSection = (heading: string): string => {
    const idx = content.indexOf(heading);
    if (idx === -1) return "";
    const after = content.slice(idx + heading.length);
    const nextHeading = after.search(/\n#{1,6}\s/);
    return (nextHeading === -1 ? after : after.slice(0, nextHeading)).trim();
  };

  const type = extractAfter("1\\.\\s*Type") || extractAfter("Type");
  const priority = extractAfter("2\\.\\s*Priority") || extractAfter("Priority");
  const severity = extractAfter("3\\.\\s*Severity") || extractAfter("Severity");
  const affectedArea = extractAfter("4\\.\\s*Affected Area") || extractAfter("Affected [Aa]rea");

  const reproductionSteps = extractSection("Reproduction Steps") || extractSection("reproduction");
  const missingInformation = extractSection("Missing Information") || extractSection("missing");
  const suggestedLabels = extractAfter("Suggested Labels") || extractAfter("suggested.*label");
  const suggestedReply = extractSection("Suggested Maintainer Reply") || extractSection("suggested.*reply");
  const suggestedAction = extractSection("Suggested Next Action") || extractSection("suggested.*action");

  const markdownOutput = `## Issue Triage: ${type}\n\n**Type:** ${type}\n**Priority:** ${priority}\n**Severity:** ${severity}\n**Affected Area:** ${affectedArea}\n\n### Reproduction Steps\n${reproductionSteps}\n\n### Missing Information\n${missingInformation}\n\n### Suggested Labels\n${suggestedLabels}\n\n### Suggested Maintainer Reply\n${suggestedReply}\n\n### Suggested Next Action\n${suggestedAction}\n`;

  return {
    draftType: type,
    draftPriority: priority,
    draftSeverity: severity,
    affectedArea,
    reproductionSteps,
    missingInformation,
    suggestedLabels,
    suggestedReply,
    suggestedAction,
    markdownOutput,
  };
}
