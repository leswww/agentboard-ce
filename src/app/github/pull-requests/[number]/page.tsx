"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Copy,
  GitPullRequest,
  GitBranch,
  Loader2,
  FileDiff,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface PullRequest {
  number: number;
  title: string;
  state: string;
  draft: boolean;
  author: string;
  head: string;
  base: string;
  mergeable: boolean | null;
  body: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
  repository: string;
  additions: number;
  deletions: number;
  changedFilesCount: number;
  labels: { name: string; color: string }[];
}

interface ChangedFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

interface CommitSummary {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export default function GithubPullRequestDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const t = useTranslations("github");
  const tc = useTranslations("common");

  const [pr, setPr] = useState<PullRequest | null>(null);
  const [changedFiles, setChangedFiles] = useState<ChangedFile[]>([]);
  const [commits, setCommits] = useState<CommitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingDraft, setCreatingDraft] = useState(false);

  const fetchPullRequest = useCallback(
    async (number: string, pid: string) => {
      try {
        const res = await fetch(
          `/api/github/pull-requests/${number}?projectId=${pid}`
        );
        if (res.ok) {
          const data = await res.json();
          setPr(data.pullRequest);
          setChangedFiles(data.changedFiles || []);
          setCommits(data.commits || []);
        } else {
          toast.error(t("fetchPrDetailFailed"));
        }
      } catch {
        toast.error(t("fetchPrDetailFailed"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    params.then((p) => {
      if (projectId) {
        fetchPullRequest(p.number, projectId);
      } else {
        setLoading(false);
      }
    });
  }, [params, projectId, fetchPullRequest]);

  const handleCreateReviewDraft = async () => {
    if (!pr || !projectId) return;

    setCreatingDraft(true);
    try {
      const res = await fetch(
        `/api/github/pull-requests/${pr.number}/review-draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            pullRequest: {
              title: pr.title,
              body: pr.body,
              author: pr.author,
              url: pr.url,
              state: pr.state,
              draft: pr.draft,
              head: pr.head,
              base: pr.base,
              createdAt: pr.createdAt,
              changedFilesCount: pr.changedFilesCount,
            },
            changedFiles: changedFiles.map((f) => ({
              filename: f.filename,
              status: f.status,
              additions: f.additions,
              deletions: f.deletions,
            })),
          }),
        }
      );

      if (res.ok) {
        const draft = await res.json();
        toast.success(t("reviewDraftCreated"));
        router.push(`/pr-reviews/${draft.id}`);
      } else {
        toast.error(t("reviewDraftFailed"));
      }
    } catch {
      toast.error(t("reviewDraftFailed"));
    } finally {
      setCreatingDraft(false);
    }
  };

  const handleCopyPrMarkdown = () => {
    if (!pr) return;

    const labelsStr = pr.labels.length
      ? pr.labels.map((l) => l.name).join(", ")
      : "None";

    const filesStr = changedFiles.length
      ? changedFiles
          .map((f) => `- ${f.filename} — ${f.status}, +${f.additions}/-${f.deletions}`)
          .join("\n")
      : "No file data available.";

    const commitsStr = commits.length
      ? commits.map((c) => `- ${c.sha} ${c.message} — ${c.author}`).join("\n")
      : "No commits available.";

    const markdown = `# GitHub Pull Request

## Repository
- ${pr.repository}

## Pull Request
- Number: #${pr.number}
- Title: ${pr.title}
- Author: ${pr.author}
- State: ${pr.state}
- Draft: ${pr.draft ? "Yes" : "No"}
- Source branch: ${pr.head}
- Target branch: ${pr.base}
- URL: ${pr.url}

## Labels
- ${labelsStr}

## Summary
${pr.body || "No description provided."}

## Changed Files
${filesStr}

## Recent Commits
${commitsStr}
`;

    navigator.clipboard.writeText(markdown);
    toast.success(t("prCopied"));
  };

  const handleCopyReviewChecklist = () => {
    if (!pr) return;

    const markdown = `# PR Review Checklist

## PR Info
- **Title:** ${pr.title}
- **PR:** #${pr.number}
- **Author:** ${pr.author}
- **Branch:** ${pr.head} → ${pr.base}

## Build & Tests
- [ ] Builds successfully
- [ ] Tests pass
- [ ] No obvious regression

## Code Quality
- [ ] Clear implementation
- [ ] Error handling reviewed
- [ ] Edge cases reviewed

## Security
- [ ] No obvious token leakage
- [ ] No unsafe command execution
- [ ] No unintended GitHub write action

## Documentation
- [ ] README updated if needed
- [ ] Changelog updated if needed
- [ ] Migration notes added if needed
`;

    navigator.clipboard.writeText(markdown);
    toast.success(t("reviewChecklistCopied"));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Github}
          title={t("missingProject")}
          description={t("missingProjectDesc")}
        />
      </div>
    );
  }

  if (!pr) {
    return (
      <div className="p-6">
        <EmptyState
          icon={GitPullRequest}
          title={t("prNotFound")}
          description={t("prNotFoundDesc")}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/github/pull-requests?projectId=${projectId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">
                #{pr.number}
              </span>
              <Badge variant={pr.state === "open" ? "success" : "secondary"}>
                {pr.state}
              </Badge>
              {pr.draft && <Badge variant="warning">{t("draft")}</Badge>}
              {pr.mergeable === true && (
                <Badge variant="success">{t("mergeable")}</Badge>
              )}
              {pr.mergeable === false && (
                <Badge variant="destructive">Conflict</Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{pr.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPrMarkdown}
            className="gap-2"
          >
            <Copy className="h-3 w-3" />
            {t("copyPrMarkdown")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyReviewChecklist}
            className="gap-2"
          >
            <Copy className="h-3 w-3" />
            {t("copyReviewChecklist")}
          </Button>
          <a href={pr.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-3 w-3" />
              {t("openOnGithub")}
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* PR Body */}
          <Card>
            <CardHeader>
              <CardTitle>{t("description")}</CardTitle>
            </CardHeader>
            <CardContent>
              {pr.body ? (
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {pr.body}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("noDescription")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Changed Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDiff className="h-4 w-4" />
                {t("changedFiles")} ({changedFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {changedFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tc("noData")}</p>
              ) : (
                <div className="space-y-3">
                  {changedFiles.map((file) => (
                    <div
                      key={file.filename}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono">
                            {file.filename}
                          </code>
                          <Badge
                            variant={
                              file.status === "added"
                                ? "success"
                                : file.status === "removed"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {file.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600 dark:text-green-400">
                            +{file.additions}
                          </span>
                          <span className="text-red-600 dark:text-red-400">
                            -{file.deletions}
                          </span>
                        </div>
                      </div>
                      {file.patch && (
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
                          {file.patch}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Commits */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("recentCommits")} ({commits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commits.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noCommits")}</p>
              ) : (
                <div className="space-y-2">
                  {commits.map((commit) => (
                    <div
                      key={commit.sha}
                      className="flex items-start gap-3 py-2"
                    >
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-muted-foreground">
                            {commit.sha}
                          </code>
                          <span className="text-sm truncate">
                            {commit.message}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {commit.author}
                          {commit.date && ` — ${formatDate(commit.date)}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{tc("actions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateReviewDraft}
                disabled={creatingDraft}
                className="gap-2"
              >
                {creatingDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GitPullRequest className="h-4 w-4" />
                )}
                {t("createReviewDraft")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* PR Details */}
          <Card>
            <CardHeader>
              <CardTitle>{tc("details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("repository")}
                </p>
                <p className="text-sm">{pr.repository}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("author")}
                </p>
                <p className="text-sm">{pr.author}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("sourceBranch")}
                </p>
                <p className="text-sm flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {pr.head}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("targetBranch")}
                </p>
                <p className="text-sm flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {pr.base}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {tc("createdAt")}
                </p>
                <p className="text-sm">{formatDate(pr.createdAt)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {tc("updatedAt")}
                </p>
                <p className="text-sm">{formatDate(pr.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Change Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t("changedFiles")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("changedFiles")}
                </span>
                <span className="text-sm font-medium">
                  {pr.changedFilesCount}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("additions")}
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  +{pr.additions}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("deletions")}
                </span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  -{pr.deletions}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Labels */}
          {pr.labels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("labels")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {pr.labels.map((label) => (
                    <Badge
                      key={label.name}
                      variant="outline"
                      style={{
                        borderColor: `#${label.color}`,
                        color: `#${label.color}`,
                      }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
