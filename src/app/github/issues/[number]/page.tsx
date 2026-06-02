"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Copy,
  Bug,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface GithubIssue {
  number: number;
  title: string;
  state: string;
  author: string;
  labels: { name: string; color: string }[];
  body: string | null;
  comments: number;
  createdAt: string;
  updatedAt: string;
  url: string;
  repository: string;
}

export default function GithubIssueDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const t = useTranslations("github");
  const tc = useTranslations("common");
  const tt = useTranslations("toasts");

  const [issue, setIssue] = useState<GithubIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingDraft, setCreatingDraft] = useState(false);

  useEffect(() => {
    params.then((p) => {
      if (projectId) {
        fetchIssue(p.number, projectId);
      } else {
        setLoading(false);
      }
    });
  }, [params, projectId]);

  const fetchIssue = useCallback(async (number: string, pid: string) => {
    try {
      const res = await fetch(
        `/api/github/issues/${number}?projectId=${pid}`
      );
      if (res.ok) {
        const data = await res.json();
        setIssue(data.issue);
      } else {
        toast.error(t("fetchIssueFailed"));
      }
    } catch {
      toast.error(t("fetchIssueFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleCreateTriageDraft = async () => {
    if (!issue || !projectId) return;

    setCreatingDraft(true);
    try {
      const res = await fetch(
        `/api/github/issues/${issue.number}/triage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            issue: {
              title: issue.title,
              body: issue.body,
              author: issue.author,
              labels: issue.labels,
              url: issue.url,
              state: issue.state,
              createdAt: issue.createdAt,
            },
          }),
        }
      );

      if (res.ok) {
        const draft = await res.json();
        toast.success(tt("issueDraftCreated"));
        router.push(`/issues/${draft.id}`);
      } else {
        toast.error(t("triageFailed"));
      }
    } catch {
      toast.error(t("triageFailed"));
    } finally {
      setCreatingDraft(false);
    }
  };

  const handleCopyIssueMarkdown = () => {
    if (!issue) return;

    const labelsStr = issue.labels.length
      ? issue.labels.map((l) => l.name).join(", ")
      : "None";

    const markdown = `# GitHub Issue

## Repository
- ${issue.repository}

## Issue
- Number: #${issue.number}
- Title: ${issue.title}
- Author: ${issue.author}
- State: ${issue.state}
- URL: ${issue.url}

## Labels
- ${labelsStr}

## Body
${issue.body || "No description provided"}
`;

    navigator.clipboard.writeText(markdown);
    toast.success(t("issueCopied"));
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

  if (!issue) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Bug}
          title={t("issueNotFound")}
          description={t("issueNotFoundDesc")}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/github/issues?projectId=${projectId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">
                #{issue.number}
              </span>
              <Badge variant={issue.state === "open" ? "success" : "secondary"}>
                {issue.state}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{issue.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyIssueMarkdown}
            className="gap-2"
          >
            <Copy className="h-3 w-3" />
            {t("copyIssueMarkdown")}
          </Button>
          <a href={issue.url} target="_blank" rel="noopener noreferrer">
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
          {/* Issue Body */}
          <Card>
            <CardHeader>
              <CardTitle>{t("description")}</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.body ? (
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {issue.body}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">{t("noDescription")}</p>
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
                onClick={handleCreateTriageDraft}
                disabled={creatingDraft}
                className="gap-2"
              >
                {creatingDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bug className="h-4 w-4" />
                )}
                {t("createTriageDraft")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Issue Details */}
          <Card>
            <CardHeader>
              <CardTitle>{tc("details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("repository")}</p>
                <p className="text-sm">{issue.repository}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("author")}</p>
                <p className="text-sm">{issue.author}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{tc("createdAt")}</p>
                <p className="text-sm">{formatDate(issue.createdAt)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{tc("updatedAt")}</p>
                <p className="text-sm">{formatDate(issue.updatedAt)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("comments")}</p>
                <p className="text-sm flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {issue.comments}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Labels */}
          {issue.labels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("labels")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {issue.labels.map((label) => (
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
