"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Brain, Search, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface AiLogEntry {
  id: string;
  workflowType: string;
  project: string | null;
  model: string | null;
  status: string;
  inputSummary: string | null;
  outputPreview: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export default function AiHistoryPage() {
  const t = useTranslations("ai");
  const tc = useTranslations("common");

  const [logs, setLogs] = useState<AiLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/history");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.workflowType.toLowerCase().includes(q) ||
      (log.project || "").toLowerCase().includes(q) ||
      (log.inputSummary || "").toLowerCase().includes(q) ||
      (log.model || "").toLowerCase().includes(q)
    );
  });

  const workflowIcons: Record<string, string> = {
    "issue-triage": "Issue Triage",
    "pr-review": "PR Review",
    "release-notes": "Release Notes",
    "docs-suggestions": "Docs Suggestions",
  };

  const getWorkflowLabel = (type: string) => workflowIcons[type] || type;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {tc("success")}
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {tc("failed")}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("historyTitle")}</h2>
          <p className="text-muted-foreground">{t("historySubtitle")}</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {t("historyEmpty")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("historyEmptyDesc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {getWorkflowLabel(log.workflowType)}
                      </span>
                      {getStatusBadge(log.status)}
                      {log.project && (
                        <span className="text-xs text-muted-foreground">
                          {log.project}
                        </span>
                      )}
                    </div>
                    {log.inputSummary && (
                      <p className="text-sm text-muted-foreground truncate">
                        {log.inputSummary}
                      </p>
                    )}
                    {log.outputPreview && log.status === "completed" && (
                      <p className="text-xs text-muted-foreground truncate">
                        Output: {log.outputPreview}
                      </p>
                    )}
                    {log.errorMessage && log.status === "failed" && (
                      <p className="text-xs text-destructive truncate">
                        Error: {log.errorMessage}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {log.model && <span>Model: {log.model}</span>}
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
