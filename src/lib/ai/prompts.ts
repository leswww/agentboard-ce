export function buildIssueTriagePrompt(input: {
  issueTitle: string;
  issueBody?: string;
  environment?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshots?: string;
  additionalNotes?: string;
  labels?: string[];
  repository?: string;
}): string {
  return `You are an experienced open-source maintainer performing issue triage. Analyze the following issue and provide a structured triage output.

Issue Title: ${input.issueTitle}
${input.issueBody ? `Issue Body: ${input.issueBody}` : ""}
${input.environment ? `Environment: ${input.environment}` : ""}
${input.expectedBehavior ? `Expected Behavior: ${input.expectedBehavior}` : ""}
${input.actualBehavior ? `Actual Behavior: ${input.actualBehavior}` : ""}
${input.screenshots ? `Screenshots: ${input.screenshots}` : ""}
${input.additionalNotes ? `Additional Notes: ${input.additionalNotes}` : ""}
${input.labels?.length ? `Existing Labels: ${input.labels.join(", ")}` : ""}
${input.repository ? `Repository: ${input.repository}` : ""}

Provide the following in your response:
1. Type (Bug, Feature, Question, Docs, Maintenance)
2. Priority (Critical, High, Medium, Low)
3. Severity (Critical, Major, Minor, Trivial)
4. Affected Area
5. Reproduction Steps (if applicable)
6. Missing Information needed to resolve
7. Suggested Labels (comma-separated)
8. A suggested maintainer reply (professional, helpful tone)
9. Suggested next action

Format your response as clean Markdown.`;
}

export function buildPrReviewPrompt(input: {
  prTitle: string;
  prSummary?: string;
  changedFilesSummary?: string;
  testResults?: string;
  riskNotes?: string;
  documentationImpact?: string;
  commitsSummary?: string;
  additions?: number;
  deletions?: number;
}): string {
  return `You are an experienced open-source maintainer performing a pull request review. Analyze the following PR and provide a structured review.

PR Title: ${input.prTitle}
${input.prSummary ? `PR Summary: ${input.prSummary}` : ""}
${input.changedFilesSummary ? `Changed Files Summary: ${input.changedFilesSummary}` : ""}
${input.testResults ? `Test Results: ${input.testResults}` : ""}
${input.riskNotes ? `Risk Notes: ${input.riskNotes}` : ""}
${input.documentationImpact ? `Documentation Impact: ${input.documentationImpact}` : ""}
${input.commitsSummary ? `Commits Summary: ${input.commitsSummary}` : ""}
${input.additions !== undefined ? `Additions: ${input.additions}` : ""}
${input.deletions !== undefined ? `Deletions: ${input.deletions}` : ""}

Provide the following in your response:
1. Review Summary - concise overview of the PR's purpose and quality
2. Risk Level (Low, Medium, High)
3. Required Changes - specific items the author should address
4. Suggested Approval Comment - draft of what to say if approving
5. Suggested Request-Changes Comment - draft of what to say if requesting changes
6. Test Focus Areas - what should be tested
7. Documentation Impact - whether docs need updating
8. Security Notes - any security concerns

Focus on code quality, correctness, and maintainer best practices. Be constructive and professional.

Format your response as clean Markdown.`;
}

export function buildReleaseNotesPrompt(input: {
  version: string;
  project?: string;
  recentCommits?: string;
  issuePrSummaries?: string;
  manualNotes?: string;
}): string {
  return `You are an experienced open-source maintainer drafting release notes. Generate structured release notes for the following release.

Version: ${input.version}
${input.project ? `Project: ${input.project}` : ""}
${input.recentCommits ? `Recent Commits:\n${input.recentCommits}` : ""}
${input.issuePrSummaries ? `Issue/PR Summaries:\n${input.issuePrSummaries}` : ""}
${input.manualNotes ? `Manual Notes:\n${input.manualNotes}` : ""}

Provide the following sections in your response:
1. Summary / Highlights - exciting changes in this release
2. Added - new features
3. Changed - changes to existing functionality
4. Fixed - bug fixes
5. Security - security-related updates
6. Breaking Changes - any breaking changes with migration notes
7. Migration Guide - step-by-step migration instructions if needed
8. Contributors - thank contributors (use placeholder @contributors if unknown)

Follow Keep a Changelog format. Be concise but informative.

Format your response as clean Markdown.`;
}

export function buildDocsSuggestionsPrompt(input: {
  project: string;
  changeSummary: string;
  affectedFeatures?: string;
  diffSummary?: string;
  gitSummary?: string;
}): string {
  return `You are an experienced open-source maintainer suggesting documentation updates based on project changes.

Project: ${input.project}
Change Summary: ${input.changeSummary}
${input.affectedFeatures ? `Affected Features: ${input.affectedFeatures}` : ""}
${input.diffSummary ? `Diff Summary: ${input.diffSummary}` : ""}
${input.gitSummary ? `Git Summary: ${input.gitSummary}` : ""}

Provide documentation update suggestions covering:
1. README update suggestions - what to add, modify, or remove in the README
2. Changelog update suggestions - what to add to the changelog
3. Installation docs update suggestions - any changes to setup/installation instructions
4. Migration notes - any migration steps users should follow
5. FAQ or troubleshooting notes - common issues and solutions

Be practical and specific. Each suggestion should be actionable Markdown.

Format your response as clean Markdown.`;
}
