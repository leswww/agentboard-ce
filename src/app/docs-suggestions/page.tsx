"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles, AlertTriangle, Brain } from "lucide-react";

interface DocsSuggestionsOutput {
  readmeSuggestions: string;
  changelogSuggestions: string;
  installDocsSuggestions: string;
  migrationNotes: string;
  faqTroubleshooting: string;
}

export default function DocsSuggestionsPage() {
  const t = useTranslations("ai.docsSuggestions");
  const ta = useTranslations("ai");
  const tc = useTranslations("common");

  const [project, setProject] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [affectedFeatures, setAffectedFeatures] = useState("");
  const [diffSummary, setDiffSummary] = useState("");
  const [gitSummary, setGitSummary] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiMissingConfig, setAiMissingConfig] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const [output, setOutput] = useState<DocsSuggestionsOutput>({
    readmeSuggestions: "",
    changelogSuggestions: "",
    installDocsSuggestions: "",
    migrationNotes: "",
    faqTroubleshooting: "",
  });

  const handleGenerate = async () => {
    if (!project || !changeSummary) {
      toast.error("Project and change summary are required");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiMissingConfig(false);

    try {
      const res = await fetch("/api/ai/docs-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          changeSummary,
          affectedFeatures,
          diffSummary,
          gitSummary,
        }),
      });

      if (res.status === 404) {
        setAiMissingConfig(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.details || data.error || "AI request failed");
      }

      const data = await res.json();
      setOutput({
        readmeSuggestions: data.readmeSuggestions || "",
        changelogSuggestions: data.changelogSuggestions || "",
        installDocsSuggestions: data.installDocsSuggestions || "",
        migrationNotes: data.migrationNotes || "",
        faqTroubleshooting: data.faqTroubleshooting || "",
      });
      setAiGenerated(true);
      toast.success(ta("draftGenerated"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request failed";
      setAiError(message);
      toast.error(message);
    } finally {
      setAiLoading(false);
    }
  };

  const copySection = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">{t("project")} *</Label>
            <Input
              id="project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="My Project"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="change-summary">{t("changeSummary")} *</Label>
            <Textarea
              id="change-summary"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder={t("changeSummaryPlaceholder")}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="affected-features">{t("affectedFeatures")}</Label>
              <Textarea
                id="affected-features"
                value={affectedFeatures}
                onChange={(e) => setAffectedFeatures(e.target.value)}
                placeholder={t("affectedFeaturesPlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diff-summary">{t("diffSummary")}</Label>
              <Textarea
                id="diff-summary"
                value={diffSummary}
                onChange={(e) => setDiffSummary(e.target.value)}
                placeholder={t("diffSummaryPlaceholder")}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="git-summary">{t("gitSummary")}</Label>
            <Textarea
              id="git-summary"
              value={gitSummary}
              onChange={(e) => setGitSummary(e.target.value)}
              placeholder={t("gitSummaryPlaceholder")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {ta("safetyNotice")}
          </p>

          {aiMissingConfig && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {ta("missingConfig")}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {ta("missingConfigDesc")}
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={aiLoading || !project || !changeSummary}
            className="gap-2"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {aiLoading ? ta("generating") : t("generate")}
          </Button>

          {aiError && !aiMissingConfig && (
            <p className="text-sm text-destructive">{aiError}</p>
          )}
        </CardContent>
      </Card>

      {aiGenerated && (
        <>
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI draft
                </Badge>
                <span className="text-sm font-normal text-muted-foreground">
                  {ta("reviewBeforeUse")}
                </span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("readmeSuggestions")}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copySection(output.readmeSuggestions, "README suggestions")}
              >
                {tc("copy")}
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea value={output.readmeSuggestions} readOnly rows={6} className="font-mono text-xs" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("changelogSuggestions")}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copySection(output.changelogSuggestions, "Changelog suggestions")}
              >
                {tc("copy")}
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea value={output.changelogSuggestions} readOnly rows={6} className="font-mono text-xs" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("installDocsSuggestions")}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copySection(output.installDocsSuggestions, "Install docs suggestions")}
              >
                {tc("copy")}
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea value={output.installDocsSuggestions} readOnly rows={6} className="font-mono text-xs" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("migrationNotes")}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copySection(output.migrationNotes, "Migration notes")}
              >
                {tc("copy")}
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea value={output.migrationNotes} readOnly rows={4} className="font-mono text-xs" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("faqTroubleshooting")}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copySection(output.faqTroubleshooting, "FAQ notes")}
              >
                {tc("copy")}
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea value={output.faqTroubleshooting} readOnly rows={4} className="font-mono text-xs" />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
