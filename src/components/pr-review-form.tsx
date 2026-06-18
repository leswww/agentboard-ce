"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prReviewDraftSchema, type PrReviewDraftInput } from "@/lib/validations";
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

interface PrReviewFormProps {
  projects: Project[];
}

interface AiGeneratedFields {
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

export function PrReviewForm({ projects }: PrReviewFormProps) {
  const router = useRouter();
  const t = useTranslations("prReview");
  const ta = useTranslations("ai");
  const tc = useTranslations("common");
  const tt = useTranslations("toasts");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiMissingConfig, setAiMissingConfig] = useState(false);

  const [generatedFields, setGeneratedFields] = useState<AiGeneratedFields>({
    reviewSummary: "",
    riskLevel: "",
    requiredChanges: "",
    suggestedApproval: "",
    suggestedChanges: "",
    testFocusAreas: "",
    documentationImpact: "",
    securityNotes: "",
    markdownOutput: "",
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PrReviewDraftInput>({
    resolver: zodResolver(prReviewDraftSchema),
    defaultValues: {
      projectId: "",
      prTitle: "",
      prSummary: "",
      changedFilesSummary: "",
      testResults: "",
      riskNotes: "",
      documentationImpact: "",
    },
  });

  const handleAiReview = async () => {
    const values = getValues();
    if (!values.prTitle) {
      toast.error("PR title is required");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiMissingConfig(false);

    try {
      const res = await fetch("/api/ai/pr-review", {
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
        reviewSummary: data.reviewSummary || "",
        riskLevel: data.riskLevel || "",
        requiredChanges: data.requiredChanges || "",
        suggestedApproval: data.suggestedApproval || "",
        suggestedChanges: data.suggestedChanges || "",
        testFocusAreas: data.testFocusAreas || "",
        documentationImpact: data.documentationImpact || "",
        securityNotes: data.securityNotes || "",
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

  const onSubmit = async (data: PrReviewDraftInput) => {
    try {
      const payload = {
        ...data,
        ...(aiGenerated
          ? {
              reviewSummary: generatedFields.reviewSummary,
              riskLevel: generatedFields.riskLevel,
              requiredChanges: generatedFields.requiredChanges,
              suggestedApproval: generatedFields.suggestedApproval,
              suggestedChanges: generatedFields.suggestedChanges,
            }
          : {}),
      };

      const res = await fetch("/api/pr-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || tt("failedToCreate"));
      }

      const review = await res.json();
      toast.success(tt("prReviewCreated"));
      router.push(`/pr-reviews/${review.id}`);
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
          <CardTitle>{t("reviewDetails")}</CardTitle>
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
            <Label htmlFor="prTitle">{t("prTitle")} *</Label>
            <Input
              id="prTitle"
              {...register("prTitle")}
              placeholder={t("prTitlePlaceholder")}
            />
            {errors.prTitle && (
              <p className="text-sm text-destructive">{errors.prTitle.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="prSummary">{t("prSummary")}</Label>
            <Textarea
              id="prSummary"
              {...register("prSummary")}
              placeholder={t("prSummaryPlaceholder")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("changedFilesSummary")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="changedFilesSummary">{t("changedFilesSummary")}</Label>
            <Textarea
              id="changedFilesSummary"
              {...register("changedFilesSummary")}
              placeholder={t("changedFilesPlaceholder")}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testResults">{t("testResults")}</Label>
            <Textarea
              id="testResults"
              {...register("testResults")}
              placeholder={t("testResultsPlaceholder")}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("riskNotes")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="riskNotes">{t("riskNotes")}</Label>
            <Textarea
              id="riskNotes"
              {...register("riskNotes")}
              placeholder={t("riskNotesPlaceholder")}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentationImpact">{t("documentationImpact")}</Label>
            <Textarea
              id="documentationImpact"
              {...register("documentationImpact")}
              placeholder={t("documentationImpactPlaceholder")}
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
            AI-assisted PR review
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
            onClick={handleAiReview}
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
            <div className="flex items-center gap-2">
              <Label className="font-medium">{t("riskLevel")}:</Label>
              <Badge variant={
                generatedFields.riskLevel === "High" ? "destructive" :
                generatedFields.riskLevel === "Medium" ? "warning" : "success"
              }>
                {generatedFields.riskLevel}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>{t("reviewSummary")}</Label>
              <Textarea value={generatedFields.reviewSummary} readOnly rows={3} />
            </div>

            <div className="space-y-2">
              <Label>{t("requiredChanges")}</Label>
              <Textarea value={generatedFields.requiredChanges} readOnly rows={3} />
            </div>

            <div className="space-y-2">
              <Label>{t("suggestedApproval")}</Label>
              <Textarea value={generatedFields.suggestedApproval} readOnly rows={2} />
            </div>

            <div className="space-y-2">
              <Label>{t("suggestedChanges")}</Label>
              <Textarea value={generatedFields.suggestedChanges} readOnly rows={3} />
            </div>

            {generatedFields.testFocusAreas && (
              <div className="space-y-2">
                <Label>Test Focus Areas</Label>
                <Textarea value={generatedFields.testFocusAreas} readOnly rows={2} />
              </div>
            )}

            {generatedFields.securityNotes && (
              <div className="space-y-2">
                <Label>Security Notes</Label>
                <Textarea value={generatedFields.securityNotes} readOnly rows={2} />
              </div>
            )}

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
          {isSubmitting ? t("generating") : t("generateReview")}
        </Button>
      </div>
    </form>
  );
}
