"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Github, RefreshCw, Search, ExternalLink, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  githubOwner: string | null;
  githubRepo: string | null;
}

interface GithubIssue {
  number: number;
  title: string;
  state: string;
  author: string;
  labels: { name: string; color: string }[];
  comments: number;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export default function GithubIssuesPage() {
  const router = useRouter();
  const t = useTranslations("github");
  const tc = useTranslations("common");

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [issues, setIssues] = useState<GithubIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const res = await fetch("/api/github/token");
      if (res.ok) {
        const data = await res.json();
        setTokenConfigured(data.configured && data.valid);
      }
    } catch {
      // Silent fail
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        const linkedProjects = (data as Project[]).filter(
          (p) => p.githubOwner && p.githubRepo
        );
        setProjects(linkedProjects);
      }
    } catch {
      // Silent fail
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchIssues = async () => {
    if (!selectedProjectId) return;

    setLoading(true);
    setErrorType(null);
    try {
      const res = await fetch(
        `/api/github/issues?projectId=${selectedProjectId}`
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorType(data.errorType || "api-error");
        setIssues([]);
        return;
      }

      setIssues(data.issues || []);
      setRepoInfo(data.owner && data.repo ? { owner: data.owner, repo: data.repo } : null);
    } catch {
      toast.error(t("fetchFailed"));
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter((issue) =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Github className="h-6 w-6" />
          {t("issuesTitle")}
        </h2>
        <p className="text-muted-foreground">{t("issuesSubtitle")}</p>
      </div>

      {/* Token Warning */}
      {!tokenConfigured && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t("missingToken")}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                {t("missingTokenDesc")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Selector */}
      <Card>
        <CardHeader>
          <CardTitle>{t("selectProject")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectsLoading ? (
            <div className="h-10 bg-muted rounded animate-pulse" />
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noLinkedProjects")}</p>
          ) : (
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>{tc("projects")}</Label>
                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={[
                    { value: "", label: t("selectProjectPlaceholder") },
                    ...projects.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.githubOwner}/${p.githubRepo})`,
                    })),
                  ]}
                />
              </div>
              <Button
                onClick={fetchIssues}
                disabled={!selectedProjectId || loading || !tokenConfigured}
                className="gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {t("fetchIssues")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error States */}
      {errorType && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              {errorType === "no-token" && <p className="text-sm">{t("missingToken")}</p>}
              {errorType === "no-repo" && <p className="text-sm">{t("missingRepo")}</p>}
              {errorType === "rate-limit" && <p className="text-sm">{t("rateLimitExceeded")}</p>}
              {errorType === "not-found" && <p className="text-sm">{t("repoNotFound")}</p>}
              {errorType === "api-error" && <p className="text-sm">{t("apiError")}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      {issues.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                {t("openIssues")} ({filteredIssues.length})
              </h3>
              {repoInfo && (
                <Badge variant="outline">{repoInfo.owner}/{repoInfo.repo}</Badge>
              )}
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchIssues")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <EmptyState
              icon={Search}
              title={t("noIssuesFound")}
              description={t("noIssuesFoundDesc")}
            />
          ) : (
            <div className="space-y-2">
              {filteredIssues.map((issue) => (
                <Card
                  key={issue.number}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/github/issues/${issue.number}?projectId=${selectedProjectId}`
                    )
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">
                            #{issue.number}
                          </span>
                          <span className="font-medium truncate">{issue.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                          <span className="text-xs text-muted-foreground">
                            {t("by")} {issue.author}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(issue.createdAt)}
                          </span>
                          {issue.comments > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {issue.comments}
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
