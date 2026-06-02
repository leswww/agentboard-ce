import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const body = await request.json();
    const { projectId, issue } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    if (!issue || !issue.title) {
      return NextResponse.json(
        { error: "Issue data is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Build additional notes with GitHub metadata
    const additionalNotesParts: string[] = [];
    additionalNotesParts.push(`GitHub Issue: #${number}`);
    if (issue.url) additionalNotesParts.push(`URL: ${issue.url}`);
    if (issue.author) additionalNotesParts.push(`Author: ${issue.author}`);
    if (issue.labels?.length) {
      additionalNotesParts.push(`Labels: ${issue.labels.map((l: { name: string }) => l.name).join(", ")}`);
    }
    if (issue.createdAt) additionalNotesParts.push(`Created: ${issue.createdAt}`);
    if (issue.state) additionalNotesParts.push(`State: ${issue.state}`);

    const additionalNotes = additionalNotesParts.join("\n");

    // Generate triage draft using same logic as local issues
    const triageResult = generateTriageDraft({
      issueTitle: issue.title,
      issueBody: issue.body || "",
      additionalNotes,
    });

    const draft = await prisma.issueDraft.create({
      data: {
        projectId,
        issueTitle: issue.title,
        issueBody: issue.body || null,
        additionalNotes,
        ...triageResult,
      },
    });

    return NextResponse.json(draft, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create triage draft" },
      { status: 500 }
    );
  }
}

function generateTriageDraft(data: {
  issueTitle: string;
  issueBody: string;
  additionalNotes?: string;
}) {
  const title = data.issueTitle.toLowerCase();
  const body = data.issueBody.toLowerCase();
  const combined = `${title} ${body}`;

  let draftType = "Bug";
  if (combined.includes("feature") || combined.includes("request") || combined.includes("enhancement")) {
    draftType = "Feature";
  } else if (combined.includes("question") || combined.includes("how to") || combined.includes("help")) {
    draftType = "Question";
  } else if (combined.includes("doc") || combined.includes("readme") || combined.includes("documentation")) {
    draftType = "Docs";
  } else if (combined.includes("maintenance") || combined.includes("refactor") || combined.includes("cleanup")) {
    draftType = "Maintenance";
  }

  let draftPriority = "Medium";
  if (combined.includes("critical") || combined.includes("urgent") || combined.includes("blocker") || combined.includes("crash")) {
    draftPriority = "Critical";
  } else if (combined.includes("high") || combined.includes("important") || combined.includes("major")) {
    draftPriority = "High";
  } else if (combined.includes("low") || combined.includes("minor") || combined.includes("trivial")) {
    draftPriority = "Low";
  }

  let draftSeverity = "Major";
  if (combined.includes("crash") || combined.includes("data loss") || combined.includes("security")) {
    draftSeverity = "Critical";
  } else if (combined.includes("broken") || combined.includes("not working") || combined.includes("error")) {
    draftSeverity = "Major";
  } else if (combined.includes("slow") || combined.includes("performance") || combined.includes("cosmetic")) {
    draftSeverity = "Minor";
  }

  let affectedArea = "General";
  if (combined.includes("ui") || combined.includes("frontend") || combined.includes("interface")) {
    affectedArea = "UI/Frontend";
  } else if (combined.includes("api") || combined.includes("backend") || combined.includes("server")) {
    affectedArea = "API/Backend";
  } else if (combined.includes("database") || combined.includes("db") || combined.includes("sql")) {
    affectedArea = "Database";
  } else if (combined.includes("auth") || combined.includes("login") || combined.includes("permission")) {
    affectedArea = "Authentication";
  }

  const reproductionSteps = data.issueBody
    ? `1. ${data.issueBody.slice(0, 200)}`
    : "Steps not provided";

  const missingInfo: string[] = [];
  if (!data.issueBody) missingInfo.push("Issue description");

  const labels: string[] = [draftType.toLowerCase()];
  if (draftPriority === "Critical" || draftPriority === "High") labels.push("priority:high");
  if (affectedArea !== "General") labels.push(affectedArea.toLowerCase());

  const suggestedReply = `Thank you for reporting this issue. We've categorized it as a ${draftType.toLowerCase()} with ${draftPriority.toLowerCase()} priority. Our team will review it and get back to you.`;

  let suggestedAction = "Investigate and reproduce the issue";
  if (draftType === "Bug") suggestedAction = "Reproduce the bug, identify root cause, and implement fix";
  if (draftType === "Feature") suggestedAction = "Review feature request, assess feasibility, and plan implementation";
  if (draftType === "Question") suggestedAction = "Provide helpful answer or documentation reference";

  const markdownOutput = `## Issue Triage: ${data.issueTitle}

**Type:** ${draftType}
**Priority:** ${draftPriority}
**Severity:** ${draftSeverity}
**Affected Area:** ${affectedArea}

### Description
${data.issueBody || "No description provided"}

${data.additionalNotes ? `### Additional Notes\n${data.additionalNotes}` : ""}

### Steps to Reproduce
${reproductionSteps}

### Suggested Labels
${labels.join(", ")}

### Suggested Next Action
${suggestedAction}

### Suggested Reply
${suggestedReply}
`;

  return {
    draftType,
    draftPriority,
    draftSeverity,
    affectedArea,
    reproductionSteps,
    missingInformation: missingInfo.join(", ") || null,
    suggestedLabels: labels.join(", "),
    suggestedReply,
    suggestedAction,
    markdownOutput,
  };
}
