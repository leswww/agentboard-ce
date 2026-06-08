import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const body = await request.json();
    const { projectId, pullRequest, changedFiles } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    if (!pullRequest || !pullRequest.title) {
      return NextResponse.json(
        { error: "Pull request data is required" },
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

    const changedFilesSummary = changedFiles?.length
      ? changedFiles
          .map(
            (f: { filename: string; status: string; additions: number; deletions: number }) =>
              `${f.filename} — ${f.status}, +${f.additions}/-${f.deletions}`
          )
          .join("\n")
      : `${pullRequest.changedFilesCount || 0} files changed`;

    const prSummaryParts: string[] = [];
    prSummaryParts.push(`GitHub PR: #${number}`);
    if (pullRequest.url) prSummaryParts.push(`URL: ${pullRequest.url}`);
    if (pullRequest.author) prSummaryParts.push(`Author: ${pullRequest.author}`);
    if (pullRequest.head && pullRequest.base) {
      prSummaryParts.push(`Branch: ${pullRequest.head} → ${pullRequest.base}`);
    }
    if (pullRequest.state) prSummaryParts.push(`State: ${pullRequest.state}`);
    if (pullRequest.draft) prSummaryParts.push(`Draft: Yes`);
    if (pullRequest.createdAt) prSummaryParts.push(`Created: ${pullRequest.createdAt}`);
    if (pullRequest.body) prSummaryParts.push(`\n${pullRequest.body}`);

    const prSummary = prSummaryParts.join("\n");

    const reviewResult = generateReviewDraft({
      prTitle: pullRequest.title,
      prSummary,
      changedFilesSummary,
      draft: pullRequest.draft,
    });

    const review = await prisma.prReviewDraft.create({
      data: {
        projectId,
        prTitle: pullRequest.title,
        prSummary,
        changedFilesSummary,
        testResults: null,
        riskNotes: reviewResult.riskNotes,
        documentationImpact: reviewResult.documentationImpact,
        reviewSummary: reviewResult.reviewSummary,
        riskLevel: reviewResult.riskLevel,
        requiredChanges: reviewResult.requiredChanges,
        suggestedApproval: reviewResult.suggestedApproval,
        suggestedChanges: reviewResult.suggestedChanges,
        markdownOutput: reviewResult.markdownOutput,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create review draft" },
      { status: 500 }
    );
  }
}

function generateReviewDraft(data: {
  prTitle: string;
  prSummary: string;
  changedFilesSummary: string;
  draft?: boolean;
}) {
  const title = data.prTitle.toLowerCase();
  const summary = data.prSummary.toLowerCase();
  const combined = `${title} ${summary}`;

  let riskLevel = "Low";
  if (
    combined.includes("breaking") ||
    combined.includes("migration") ||
    combined.includes("security") ||
    combined.includes("database")
  ) {
    riskLevel = "High";
  } else if (
    combined.includes("refactor") ||
    combined.includes("performance") ||
    combined.includes("new feature") ||
    combined.includes("feat")
  ) {
    riskLevel = "Medium";
  }

  const reviewSummary = `Review of PR "${data.prTitle}". ${data.prSummary.split("\n").pop() || "No description provided."}`;

  const requiredChanges: string[] = [];
  if (data.draft) {
    requiredChanges.push("PR is still in draft state");
  }
  if (riskLevel === "High") {
    requiredChanges.push("Additional review required for high-risk changes");
  }
  requiredChanges.push("Verify tests pass");
  requiredChanges.push("Review changed files for correctness");

  const riskNotes =
    riskLevel === "High"
      ? "High-risk changes detected. Requires careful review."
      : riskLevel === "Medium"
        ? "Medium-risk changes. Standard review recommended."
        : "Low-risk changes. Quick review should suffice.";

  const documentationImpact =
    combined.includes("readme") || combined.includes("doc")
      ? "Documentation updates may be needed."
      : "No obvious documentation impact.";

  const suggestedApproval = `This PR looks good. The changes are well-structured. Approved for merge.`;
  const suggestedChanges = `Please address the following before merging:\n${requiredChanges.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;

  const markdownOutput = `## PR Review: ${data.prTitle}

### Summary
${data.prSummary}

### Changes
${data.changedFilesSummary}

### Risk Assessment
**Level:** ${riskLevel}
${riskNotes}

### Documentation Impact
${documentationImpact}

### Required Changes
${requiredChanges.map((c, i) => `${i + 1}. ${c}`).join("\n")}

### Suggested Approval Comment
${suggestedApproval}

### Suggested Request-Changes Comment
${suggestedChanges}
`;

  return {
    reviewSummary,
    riskLevel,
    requiredChanges: requiredChanges.join("\n"),
    suggestedApproval,
    suggestedChanges,
    riskNotes,
    documentationImpact,
    markdownOutput,
  };
}
