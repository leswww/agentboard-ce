import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const issues = await prisma.issueDraft.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(issues);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      projectId,
      issueTitle,
      issueBody,
      environment,
      expectedBehavior,
      actualBehavior,
      screenshots,
      additionalNotes,
    } = body;

    if (!issueTitle) {
      return NextResponse.json(
        { error: "Issue title is required" },
        { status: 400 }
      );
    }

    // Generate triage draft
    const triageResult = generateTriageDraft({
      issueTitle,
      issueBody,
      environment,
      expectedBehavior,
      actualBehavior,
      screenshots,
      additionalNotes,
    });

    const issue = await prisma.issueDraft.create({
      data: {
        projectId: projectId || null,
        issueTitle,
        issueBody,
        environment,
        expectedBehavior,
        actualBehavior,
        screenshots,
        additionalNotes,
        ...triageResult,
      },
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
}

function generateTriageDraft(data: {
  issueTitle: string;
  issueBody?: string;
  environment?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshots?: string;
  additionalNotes?: string;
}) {
  const title = data.issueTitle.toLowerCase();
  const body = (data.issueBody || "").toLowerCase();
  const combined = `${title} ${body}`;

  // Determine type
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

  // Determine priority
  let draftPriority = "Medium";
  if (combined.includes("critical") || combined.includes("urgent") || combined.includes("blocker") || combined.includes("crash")) {
    draftPriority = "Critical";
  } else if (combined.includes("high") || combined.includes("important") || combined.includes("major")) {
    draftPriority = "High";
  } else if (combined.includes("low") || combined.includes("minor") || combined.includes("trivial")) {
    draftPriority = "Low";
  }

  // Determine severity
  let draftSeverity = "Major";
  if (combined.includes("crash") || combined.includes("data loss") || combined.includes("security")) {
    draftSeverity = "Critical";
  } else if (combined.includes("broken") || combined.includes("not working") || combined.includes("error")) {
    draftSeverity = "Major";
  } else if (combined.includes("slow") || combined.includes("performance") || combined.includes("cosmetic")) {
    draftSeverity = "Minor";
  }

  // Determine affected area
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

  // Generate reproduction steps
  const reproductionSteps = data.issueBody
    ? `1. ${data.issueBody}`
    : "Steps not provided";

  // Generate missing information
  const missingInfo: string[] = [];
  if (!data.environment) missingInfo.push("Environment details");
  if (!data.expectedBehavior) missingInfo.push("Expected behavior");
  if (!data.actualBehavior) missingInfo.push("Actual behavior");
  if (!data.screenshots) missingInfo.push("Screenshots or visual evidence");

  // Generate suggested labels
  const labels: string[] = [draftType.toLowerCase()];
  if (draftPriority === "Critical" || draftPriority === "High") labels.push("priority:high");
  if (affectedArea !== "General") labels.push(affectedArea.toLowerCase());

  // Generate suggested reply
  const suggestedReply = `Thank you for reporting this issue. We've categorized it as a ${draftType.toLowerCase()} with ${draftPriority.toLowerCase()} priority. Our team will review it and get back to you.`;

  // Generate suggested action
  let suggestedAction = "Investigate and reproduce the issue";
  if (draftType === "Bug") suggestedAction = "Reproduce the bug, identify root cause, and implement fix";
  if (draftType === "Feature") suggestedAction = "Review feature request, assess feasibility, and plan implementation";
  if (draftType === "Question") suggestedAction = "Provide helpful answer or documentation reference";

  // Generate markdown output
  const markdownOutput = `## Issue Triage: ${data.issueTitle}

**Type:** ${draftType}
**Priority:** ${draftPriority}
**Severity:** ${draftSeverity}
**Affected Area:** ${affectedArea}

### Description
${data.issueBody || "No description provided"}

${data.environment ? `### Environment\n${data.environment}` : ""}

### Steps to Reproduce
${reproductionSteps}

${data.expectedBehavior ? `### Expected Behavior\n${data.expectedBehavior}` : ""}

${data.actualBehavior ? `### Actual Behavior\n${data.actualBehavior}` : ""}

${data.additionalNotes ? `### Additional Notes\n${data.additionalNotes}` : ""}

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
