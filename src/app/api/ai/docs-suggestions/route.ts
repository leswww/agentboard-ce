import { NextResponse } from "next/server";
import { makeAiRequest, logAiRequest } from "@/lib/ai/provider";
import { buildDocsSuggestionsPrompt } from "@/lib/ai/prompts";
import type { DocsSuggestionsInput, DocsSuggestionsOutput } from "@/lib/ai/types";

export async function POST(request: Request) {
  try {
    const body: DocsSuggestionsInput = await request.json();

    if (!body.project || !body.changeSummary) {
      return NextResponse.json(
        { error: "Project and change summary are required" },
        { status: 400 }
      );
    }

    const prompt = buildDocsSuggestionsPrompt({
      project: body.project,
      changeSummary: body.changeSummary.slice(0, 2000),
      affectedFeatures: body.affectedFeatures?.slice(0, 1000),
      diffSummary: body.diffSummary?.slice(0, 2000),
      gitSummary: body.gitSummary?.slice(0, 2000),
    });

    const result = await makeAiRequest({
      messages: [
        { role: "system", content: "You are an expert open-source maintainer suggesting documentation updates. Be specific and practical." },
        { role: "user", content: prompt },
      ],
    });

    const output = parseDocsSuggestionsOutput(result.content);

    await logAiRequest({
      workflowType: "docs-suggestions",
      project: body.project,
      status: "completed",
      inputSummary: `Docs suggestions for ${body.project}`,
      outputPreview: output.readmeSuggestions?.slice(0, 100) || "",
      model: result.model,
    });

    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";

    await logAiRequest({
      workflowType: "docs-suggestions",
      status: "failed",
      errorMessage: message,
    });

    return NextResponse.json(
      { error: "AI request failed", details: message },
      { status: 500 }
    );
  }
}

function parseDocsSuggestionsOutput(content: string): DocsSuggestionsOutput {
  const extractSection = (heading: string): string => {
    const idx = content.indexOf(heading);
    if (idx === -1) return "";
    const after = content.slice(idx + heading.length);
    const nextHeading = after.search(/\n#{1,6}\s/);
    return (nextHeading === -1 ? after : after.slice(0, nextHeading)).trim();
  };

  return {
    readmeSuggestions: extractSection("README") || "No README changes suggested.",
    changelogSuggestions: extractSection("Changelog") || "No changelog changes suggested.",
    installDocsSuggestions: extractSection("Installation") || "No installation doc changes suggested.",
    migrationNotes: extractSection("Migration") || "No migration notes needed.",
    faqTroubleshooting: extractSection("FAQ") || "No FAQ updates suggested.",
  };
}
