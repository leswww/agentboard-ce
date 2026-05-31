"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  GitBranch,
  GitCommit,
  RefreshCw,
  Copy,
  FileText,
  FolderOpen,
  AlertCircle,
  Globe,
  Clock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

interface GitStatusData {
  ok: boolean;
  errorType: "no-path" | "invalid-path" | "not-git" | null;
  currentBranch: string | null;
  isDirty: boolean;
  modifiedFiles: string[];
  stagedFiles: string[];
  untrackedFiles: string[];
  commits: GitCommit[];
  remoteUrl: string | null;
  lastRefreshed: string;
}

interface GitInsightsSectionProps {
  projectId: string;
  projectName: string;
  projectPath: string | null;
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function buildGitSummary(data: GitStatusData, projectName: string, projectPath: string): string {
  const lines: string[] = [];
  lines.push("# Git Summary");
  lines.push("");
  lines.push("## Repository");
  lines.push(`- Project: ${projectName}`);
  lines.push(`- Path: ${projectPath}`);
  lines.push(`- Branch: ${data.currentBranch || "N/A"}`);
  lines.push(`- Remote: ${data.remoteUrl || "None"}`);
  lines.push("");
  lines.push("## Working Tree");
  lines.push(`- Status: ${data.isDirty ? "Dirty" : "Clean"}`);
  lines.push("");
  lines.push("## Modified Files");
  if (data.modifiedFiles.length > 0) {
    data.modifiedFiles.forEach((f) => lines.push(`- ${f}`));
  } else {
    lines.push("- None");
  }
  lines.push("");
  lines.push("## Staged Files");
  if (data.stagedFiles.length > 0) {
    data.stagedFiles.forEach((f) => lines.push(`- ${f}`));
  } else {
    lines.push("- None");
  }
  lines.push("");
  lines.push("## Untracked Files");
  if (data.untrackedFiles.length > 0) {
    data.untrackedFiles.forEach((f) => lines.push(`- ${f}`));
  } else {
    lines.push("- None");
  }
  lines.push("");
  lines.push("## Recent Commits");
  if (data.commits.length > 0) {
    data.commits.forEach((c) =>
      lines.push(`- \`${c.hash}\` ${c.message} — ${c.author}, ${formatDateShort(c.date)}`)
    );
  } else {
    lines.push("- None");
  }
  return lines.join("\n");
}

export function GitInsightsSection({
  projectId,
  projectName,
  projectPath,
}: GitInsightsSectionProps) {
  const t = useTranslations("gitInsights");
  const [data, setData] = useState<GitStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGitStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/git/status?projectId=${encodeURIComponent(projectId)}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        setData({
          ok: false,
          errorType: "invalid-path",
          currentBranch: null,
          isDirty: false,
          modifiedFiles: [],
          stagedFiles: [],
          untrackedFiles: [],
          commits: [],
          remoteUrl: null,
          lastRefreshed: new Date().toISOString(),
        });
      }
    } catch {
      setData({
        ok: false,
        errorType: "invalid-path",
        currentBranch: null,
        isDirty: false,
        modifiedFiles: [],
        stagedFiles: [],
        untrackedFiles: [],
        commits: [],
        remoteUrl: null,
        lastRefreshed: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchGitStatus();
  }, [fetchGitStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGitStatus();
  };

  const handleCopySummary = () => {
    if (!data || !projectPath) return;
    const summary = buildGitSummary(data, projectName, projectPath);
    copyToClipboard(summary);
    toast.success(t("gitSummaryCopied"));
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No path state
  if (!projectPath) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FolderOpen}
            title={t("pathRequired")}
            description={t("pathRequired")}
            className="py-6"
          />
        </CardContent>
      </Card>
    );
  }

  // Error states
  if (data && !data.ok) {
    const errorTitle =
      data.errorType === "invalid-path" ? t("invalidPath") : t("notGitRepo");
    const ErrorIcon = data.errorType === "invalid-path" ? AlertCircle : GitBranch;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ErrorIcon}
            title={errorTitle}
            description={errorTitle}
            className="py-6"
          />
        </CardContent>
      </Card>
    );
  }

  // Success state
  if (!data) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          {t("title")}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            title={t("refreshGitStatus")}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopySummary}
            title={t("copyGitSummary")}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Branch */}
        {data.currentBranch && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {t("currentBranch")}
            </p>
            <div className="flex items-center gap-2">
              <GitBranch className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{data.currentBranch}</span>
            </div>
          </div>
        )}

        {/* Remote */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {t("remoteUrl")}
          </p>
          {data.remoteUrl ? (
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs truncate">{data.remoteUrl}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t("noRemote")}</p>
          )}
        </div>

        {/* Working Tree Status */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {t("workingTree")}
          </p>
          <Badge variant={data.isDirty ? "warning" : "success"}>
            {data.isDirty ? t("dirty") : t("clean")}
          </Badge>
        </div>

        {/* Modified Files */}
        {data.modifiedFiles.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {t("modifiedFiles")}
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.modifiedFiles.map((file) => (
                <div key={file} className="flex items-center gap-2 text-xs">
                  <FileText className="h-3 w-3 text-yellow-500 shrink-0" />
                  <span className="truncate">{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staged Files */}
        {data.stagedFiles.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {t("stagedFiles")}
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.stagedFiles.map((file) => (
                <div key={file} className="flex items-center gap-2 text-xs">
                  <FileText className="h-3 w-3 text-green-500 shrink-0" />
                  <span className="truncate">{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Untracked Files */}
        {data.untrackedFiles.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {t("untrackedFiles")}
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.untrackedFiles.map((file) => (
                <div key={file} className="flex items-center gap-2 text-xs">
                  <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate">{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Commits */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {t("recentCommits")}
          </p>
          {data.commits.length > 0 ? (
            <div className="space-y-2">
              {data.commits.map((commit) => (
                <div key={commit.hash} className="flex items-start gap-2 text-xs">
                  <GitCommit className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {commit.hash}
                      </code>
                      <span className="truncate">{commit.message}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">
                      {commit.author} &middot; {formatDateShort(commit.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t("noCommits")}</p>
          )}
        </div>

        {/* Last Refreshed */}
        <div className="flex items-center gap-1 pt-2 border-t">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {t("refreshedAt", { time: formatTime(data.lastRefreshed) })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
