import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  localPath: z.string().optional(),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  techStack: z.string().optional(),
  packageManager: z.string().optional(),
  startCommand: z.string().optional(),
  testCommand: z.string().optional(),
  buildCommand: z.string().optional(),
  deployCommand: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
  githubOwner: z.string().optional(),
  githubRepo: z.string().optional(),
  githubUrl: z.string().optional(),
  githubDefaultBranch: z.string().optional(),
});

export const commandTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  command: z.string().min(1, "Command is required"),
  workingDirectory: z.string().optional(),
  projectId: z.string().optional(),
  category: z.enum(["dev", "build", "test", "deploy", "git", "custom"]).optional(),
});

export const agentProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  category: z.string().optional(),
  recommendedTool: z.string().optional(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  inputTemplate: z.string().optional(),
  outputFormat: z.string().optional(),
});

export const issueDraftSchema = z.object({
  projectId: z.string().optional(),
  issueTitle: z.string().min(1, "Issue title is required"),
  issueBody: z.string().optional(),
  environment: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  screenshots: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const prReviewDraftSchema = z.object({
  projectId: z.string().optional(),
  prTitle: z.string().min(1, "PR title is required"),
  prSummary: z.string().optional(),
  changedFilesSummary: z.string().optional(),
  testResults: z.string().optional(),
  riskNotes: z.string().optional(),
  documentationImpact: z.string().optional(),
});

export const releaseNoteSchema = z.object({
  projectId: z.string().optional(),
  version: z.string().min(1, "Version is required"),
  releaseDate: z.string().optional(),
  summary: z.string().optional(),
  added: z.string().optional(),
  changed: z.string().optional(),
  fixed: z.string().optional(),
  security: z.string().optional(),
  deprecated: z.string().optional(),
  removed: z.string().optional(),
  breakingChanges: z.string().optional(),
  migrationGuide: z.string().optional(),
  contributors: z.string().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type CommandTemplateInput = z.infer<typeof commandTemplateSchema>;
export type AgentProfileInput = z.infer<typeof agentProfileSchema>;
export type IssueDraftInput = z.infer<typeof issueDraftSchema>;
export type PrReviewDraftInput = z.infer<typeof prReviewDraftSchema>;
export type ReleaseNoteInput = z.infer<typeof releaseNoteSchema>;
