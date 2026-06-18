export type AiProvider = "openai" | "openai-compatible" | "disabled";

export interface AiConfig {
  provider: AiProvider;
  apiKey: string | null;
  baseUrl: string | null;
  model: string | null;
  enabled: boolean;
  validatedAt: string | null;
}

export interface AiStatus {
  configured: boolean;
  enabled: boolean;
  provider: AiProvider;
  model: string | null;
  validatedAt: string | null;
}

export interface AiRequestInput {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface AiRequestResult {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface IssueTriageInput {
  issueTitle: string;
  issueBody?: string;
  environment?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshots?: string;
  additionalNotes?: string;
  labels?: string[];
  repository?: string;
}

export interface IssueTriageOutput {
  draftType: string;
  draftPriority: string;
  draftSeverity: string;
  affectedArea: string;
  reproductionSteps: string;
  missingInformation: string;
  suggestedLabels: string;
  suggestedReply: string;
  suggestedAction: string;
  markdownOutput: string;
}

export interface PrReviewInput {
  prTitle: string;
  prSummary?: string;
  changedFilesSummary?: string;
  testResults?: string;
  riskNotes?: string;
  documentationImpact?: string;
  commitsSummary?: string;
  additions?: number;
  deletions?: number;
}

export interface PrReviewOutput {
  reviewSummary: string;
  riskLevel: string;
  requiredChanges: string;
  suggestedApproval: string;
  suggestedChanges: string;
  testFocusAreas: string;
  documentationImpact: string;
  securityNotes: string;
  markdownOutput: string;
}

export interface ReleaseNotesInput {
  version: string;
  project?: string;
  recentCommits?: string;
  issuePrSummaries?: string;
  manualNotes?: string;
}

export interface ReleaseNotesOutput {
  summary: string;
  added: string;
  changed: string;
  fixed: string;
  security: string;
  breakingChanges: string;
  migrationGuide: string;
  contributors: string;
  markdownOutput: string;
}

export interface DocsSuggestionsInput {
  project: string;
  changeSummary: string;
  affectedFeatures?: string;
  diffSummary?: string;
  gitSummary?: string;
}

export interface DocsSuggestionsOutput {
  readmeSuggestions: string;
  changelogSuggestions: string;
  installDocsSuggestions: string;
  migrationNotes: string;
  faqTroubleshooting: string;
}
