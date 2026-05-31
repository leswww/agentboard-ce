"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { GitBranch, GitCommit } from "lucide-react";
import { useTranslations } from "next-intl";

interface GitStatus {
  currentBranch: string | null;
  isDirty: boolean;
  files: string[];
  error?: string;
}

interface GitStatusSectionProps {
  projectPath: string;
}

export function GitStatusSection({ projectPath }: GitStatusSectionProps) {
  const t = useTranslations("projects");
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGitStatus() {
      try {
        const res = await fetch("/api/git", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: projectPath }),
        });
        if (res.ok) {
          const data = await res.json();
          setGitStatus(data);
        } else {
          setGitStatus({ currentBranch: null, isDirty: false, files: [], error: "Failed to fetch git status" });
        }
      } catch {
        setGitStatus({ currentBranch: null, isDirty: false, files: [], error: "Not a git repository" });
      } finally {
        setLoading(false);
      }
    }

    fetchGitStatus();
  }, [projectPath]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {t("gitStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gitStatus?.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {t("gitStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{gitStatus.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          {t("gitStatus")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {gitStatus?.currentBranch && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("branch")}</p>
            <div className="flex items-center gap-2">
              <GitBranch className="h-3 w-3" />
              <span className="text-sm">{gitStatus.currentBranch}</span>
            </div>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <Badge variant={gitStatus?.isDirty ? "warning" : "success"}>
            {gitStatus?.isDirty ? t("dirty") : t("clean")}
          </Badge>
        </div>
        {gitStatus?.files && gitStatus.files.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">{t("modifiedFiles")}</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {gitStatus.files.map((file) => (
                <div key={file} className="flex items-center gap-2 text-xs">
                  <GitCommit className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
