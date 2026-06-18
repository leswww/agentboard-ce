import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.prReviewDraft.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch PR reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      projectId,
      prTitle,
      prSummary,
      changedFilesSummary,
      testResults,
      riskNotes,
      documentationImpact,
      // AI-generated fields (pre-populated)
      reviewSummary,
      riskLevel,
      requiredChanges,
      suggestedApproval,
      suggestedChanges,
      markdownOutput,
    } = body;

    if (!prTitle) {
      return NextResponse.json(
        { error: "PR title is required" },
        { status: 400 }
      );
    }

    // If AI-generated fields are provided, use them directly
    const reviewResult = reviewSummary
      ? { reviewSummary, riskLevel, requiredChanges, suggestedApproval, suggestedChanges, markdownOutput }
      : generateReviewDraft({
      prTitle,
      prSummary,
      changedFilesSummary,
      testResults,
      riskNotes,
      documentationImpact,
    });

    const review = await prisma.prReviewDraft.create({
      data: {
        projectId: projectId || null,
        prTitle,
        prSummary,
        changedFilesSummary,
        testResults,
        riskNotes,
        documentationImpact,
        ...reviewResult,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create PR review" },
      { status: 500 }
    );
  }
}

function generateReviewDraft(data: {
  prTitle: string;
  prSummary?: string;
  changedFilesSummary?: string;
  testResults?: string;
  riskNotes?: string;
  documentationImpact?: string;
}) {
  const title = data.prTitle.toLowerCase();
  const summary = (data.prSummary || "").toLowerCase();
  const combined = `${title} ${summary}`;

  // Determine risk level
  let riskLevel = "Low";
  if (combined.includes("breaking") || combined.includes("migration") || combined.includes("security") || combined.includes("database")) {
    riskLevel = "High";
  } else if (combined.includes("refactor") || combined.includes("performance") || combined.includes("new feature")) {
    riskLevel = "Medium";
  }

  // Generate review summary
  const reviewSummary = `This PR "${data.prTitle}" has been reviewed. ${data.prSummary || "No summary provided."}`;

  // Generate required changes
  const requiredChanges: string[] = [];
  if (!data.testResults || data.testResults.toLowerCase().includes("fail")) {
    requiredChanges.push("Ensure all tests pass");
  }
  if (data.documentationImpact && data.documentationImpact.toLowerCase().includes("needed")) {
    requiredChanges.push("Update documentation");
  }
  if (riskLevel === "High") {
    requiredChanges.push("Additional review required for high-risk changes");
  }
  if (requiredChanges.length === 0) {
    requiredChanges.push("No critical changes required");
  }

  // Generate suggested approval
  const suggestedApproval = `This PR looks good! The changes are well-structured and the tests are passing. Approved for merge.`;

  // Generate suggested changes
  const suggestedChanges = `Please address the following before merging:\n${requiredChanges.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;

  // Generate markdown output
  const markdownOutput = `## PR Review: ${data.prTitle}

### Summary
${data.prSummary || "No summary provided"}

${data.changedFilesSummary ? `### Changes\n${data.changedFilesSummary}` : ""}

${data.testResults ? `### Test Results\n${data.testResults}` : ""}

### Risk Assessment
**Level:** ${riskLevel}

${data.riskNotes ? `### Risk Notes\n${data.riskNotes}` : ""}

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
    markdownOutput,
  };
}
