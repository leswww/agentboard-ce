import { NextResponse } from "next/server";
import { makeAiRequest, logAiRequest, sanitizePrReviewInput } from "@/lib/ai/provider";
import { buildPrReviewPrompt } from "@/lib/ai/prompts";
import type { PrReviewInput, PrReviewOutput } from "@/lib/ai/types";

export async function POST(request: Request) {
  try {
    const body: PrReviewInput = await request.json();

    if (!body.prTitle) {
      return NextResponse.json(
        { error: "PR title is required" },
        { status: 400 }
      );
    }

    const sanitized = sanitizePrReviewInput(body as unknown as Record<string, unknown>);
    const prompt = buildPrReviewPrompt({
      prTitle: sanitized.prTitle || body.prTitle,
      prSummary: sanitized.prSummary || body.prSummary,
      changedFilesSummary: sanitized.changedFilesSummary || body.changedFilesSummary,
      testResults: sanitized.testResults || body.testResults,
      riskNotes: sanitized.riskNotes || body.riskNotes,
      documentationImpact: sanitized.documentationImpact || body.documentationImpact,
      commitsSummary: body.commitsSummary,
      additions: body.additions,
      deletions: body.deletions,
    });

    const result = await makeAiRequest({
      messages: [
        { role: "system", content: "You are an expert open-source maintainer performing code review. Be thorough, constructive, and professional." },
        { role: "user", content: prompt },
      ],
    });

    const output = parsePrReviewOutput(result.content);

    await logAiRequest({
      workflowType: "pr-review",
      status: "completed",
      inputSummary: `PR: ${body.prTitle}`,
      outputPreview: `${output.riskLevel} risk | ${output.reviewSummary.slice(0, 100)}`,
      model: result.model,
    });

    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";

    await logAiRequest({
      workflowType: "pr-review",
      status: "failed",
      errorMessage: message,
    });

    return NextResponse.json(
      { error: "AI request failed", details: message },
      { status: 500 }
    );
  }
}

function parsePrReviewOutput(content: string): PrReviewOutput {
  const extractSection = (heading: string): string => {
    const idx = content.indexOf(heading);
    if (idx === -1) return "";
    const after = content.slice(idx + heading.length);
    const nextHeading = after.search(/\n#{1,6}\s/);
    return (nextHeading === -1 ? after : after.slice(0, nextHeading)).trim();
  };

  const extractLabel = (label: string): string => {
    const re = new RegExp(`${label}:?\\s*(.+)`, "i");
    const match = content.match(re);
    return match ? match[1].trim() : "";
  };

  const reviewSummary = extractSection("Review Summary") || extractSection("Summary");
  const riskLevel = extractLabel("Risk Level") || extractSection("Risk Level") || "Medium";
  const requiredChanges = extractSection("Required Changes") || "No critical changes identified.";
  const suggestedApproval = extractSection("Suggested Approval Comment") || "Looks good!";
  const suggestedChanges = extractSection("Suggested Request-Changes Comment") || "Minor adjustments needed.";
  const testFocusAreas = extractSection("Test Focus Areas") || "Standard testing applies.";
  const documentationImpact = extractSection("Documentation Impact") || "None.";
  const securityNotes = extractSection("Security Notes") || "No security concerns identified.";

  const markdownOutput = `## PR Review: ${reviewSummary.split("\n")[0]}\n\n**Risk Level:** ${riskLevel}\n\n### Review Summary\n${reviewSummary}\n\n### Required Changes\n${requiredChanges}\n\n### Suggested Approval Comment\n${suggestedApproval}\n\n### Suggested Request-Changes Comment\n${suggestedChanges}\n\n### Test Focus Areas\n${testFocusAreas}\n\n### Documentation Impact\n${documentationImpact}\n\n### Security Notes\n${securityNotes}\n`;

  return {
    reviewSummary,
    riskLevel,
    requiredChanges,
    suggestedApproval,
    suggestedChanges,
    testFocusAreas,
    documentationImpact,
    securityNotes,
    markdownOutput,
  };
}
