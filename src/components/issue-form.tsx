"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { issueDraftSchema, type IssueDraftInput } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Loader2, Brain, AlertTriangle, Sparkles } from "lucide-react";

interface IssueFormProps {
  projects: Project[];
}

export function IssueForm({ projects }: IssueFormProps) {
  const router = useRouter();
  const t = useTranslations("issueTriage");
  const ta = useTranslations("ai");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const tt = useTranslations("toasts");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiMissingConfig, setAiMissingConfig] = useState(false);

  const [generatedFields, setGeneratedFields] = useState({
    draftType: "",
    draftPriority: "",
    draftSeverity: "",
    affectedArea: "",
    reproductionSteps: "",
    missingInformation: "",
    suggestedLabels: "",
    suggestedReply: "",
    suggestedAction: "",
    markdownOutput: "",
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<IssueDraftInput>({
    resolver: zodResolver(issueDraftSchema),
    defaultValues: {
      projectId: "",
      issueTitle: "",
      issueBody: "",
      environment: "",
      expectedBehavior: "",
      actualBehavior: "",
      screenshots: "",
      additionalNotes: "",
    },
  });

  const handleAiTriage = async () => {
    const values = getValues();
    if (!values.issueTitle) {
      toast.error(tv("issueTitleRequired") || "Issue title is required");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiMissingConfig(false);

    try {
      const res = await fetch("/api/ai/issue-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
      setGeneratedFields({
        draftType: data.draftType || "",
        draftPriority: data.draftPriority || "",
        draftSeverity: data.draftSeverity || "",
        affectedArea: data.affectedArea || "",
        reproductionSteps: data.reproductionSteps || "",
        missingInformation: data.missingInformation || "",
        suggestedLabels: data.suggestedLabels || "",
        suggestedReply: data.suggestedReply || "",
        suggestedAction: data.suggestedAction || "",
        markdownOutput: data.markdownOutput || "",
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

  const onSubmit = async (data: IssueDraftInput) => {
    try {
      const payload = {
        ...data,
        ...(aiGenerated ? generatedFields : {}),
      };

      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || tt("failedToCreate"));
      }

      const issue = await res.json();
      toast.success(tt("issueDraftCreated"));
      router.push(`/issues/${issue.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tt("failedToCreate"));
    }
  };

  const copyAiMarkdown = () => {
    navigator.clipboard.writeText(generatedFields.markdownOutput);
    toast.success(tt("copiedToClipboard"));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("issueDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">{tc("category")}</Label>
            <Select
              id="projectId"
              {...register("projectId")}
              options={[
                { value: "", label: tc("noData") },
                ...projects.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueTitle">{t("issueTitle")} *</Label>
            <Input
              id="issueTitle"
              {...register("issueTitle")}
              placeholder={t("titlePlaceholder")}
            />
            {errors.issueTitle && (
              <p className="text-sm text-destructive">{errors.issueTitle.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueBody">{t("issueBody")}</Label>
            <Textarea
              id="issueBody"
              {...register("issueBody")}
              placeholder={t("bodyPlaceholder")}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("environment")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="environment">{t("environment")}</Label>
            <Input
              id="environment"
              {...register("environment")}
              placeholder={t("environmentPlaceholder")}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expectedBehavior">{t("expectedBehavior")}</Label>
              <Textarea
                id="expectedBehavior"
                {...register("expectedBehavior")}
                placeholder={t("expectedBehaviorPlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualBehavior">{t("actualBehavior")}</Label>
              <Textarea
                id="actualBehavior"
                {...register("actualBehavior")}
                placeholder={t("actualBehaviorPlaceholder")}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("additionalNotes")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="screenshots">{t("screenshots")}</Label>
            <Textarea
              id="screenshots"
              {...register("screenshots")}
              placeholder={t("screenshotsPlaceholder")}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">{t("additionalNotes")}</Label>
            <Textarea
              id="additionalNotes"
              {...register("additionalNotes")}
              placeholder={t("additionalNotesPlaceholder")}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI-assisted triage
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
            type="button"
            variant="secondary"
            onClick={handleAiTriage}
            disabled={aiLoading}
            className="gap-2"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {aiLoading ? ta("generating") : ta("generateWithCodex")}
          </Button>

          {aiError && !aiMissingConfig && (
            <p className="text-sm text-destructive">{aiError}</p>
          )}
        </CardContent>
      </Card>

      {/* AI Generated Output */}
      {aiGenerated && (
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
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>{t("type")}</Label>
                <Input value={generatedFields.draftType} readOnly />
              </div>
              <div className="space-y-2">
                <Label>{t("priority")}</Label>
                <Input value={generatedFields.draftPriority} readOnly />
              </div>
              <div className="space-y-2">
                <Label>{t("severity")}</Label>
                <Input value={generatedFields.draftSeverity} readOnly />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("affectedArea")}</Label>
              <Textarea value={generatedFields.affectedArea} readOnly rows={2} />
            </div>

            <div className="space-y-2">
              <Label>{t("reproductionSteps")}</Label>
              <Textarea value={generatedFields.reproductionSteps} readOnly rows={3} />
            </div>

            <div className="space-y-2">
              <Label>{t("missingInformation")}</Label>
              <Textarea value={generatedFields.missingInformation} readOnly rows={2} />
            </div>

            <div className="space-y-2">
              <Label>{t("suggestedLabels")}</Label>
              <Textarea value={generatedFields.suggestedLabels} readOnly rows={2} />
            </div>

            <div className="space-y-2">
              <Label>{t("suggestedReply")}</Label>
              <Textarea value={generatedFields.suggestedReply} readOnly rows={3} />
            </div>

            <div className="space-y-2">
              <Label>{t("suggestedAction")}</Label>
              <Textarea value={generatedFields.suggestedAction} readOnly rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Markdown</Label>
              <Textarea value={generatedFields.markdownOutput} readOnly rows={6} className="font-mono text-xs" />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={copyAiMarkdown}>
                {ta("copyMarkdown")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tc("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("generating") : t("generateTriage")}
        </Button>
      </div>
    </form>
  );
}
