"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { releaseNoteSchema, type ReleaseNoteInput } from "@/lib/validations";
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

interface ReleaseNoteFormProps {
  projects: Project[];
}

interface AiGeneratedFields {
  summary: string;
  added: string;
  changed: string;
  fixed: string;
  security: string;
  breakingChanges: string;
  migrationGuide: string;
  contributors: string;
  markdownOutput: string;
}

export function ReleaseNoteForm({ projects }: ReleaseNoteFormProps) {
  const router = useRouter();
  const t = useTranslations("releaseNotes");
  const ta = useTranslations("ai");
  const tc = useTranslations("common");
  const tt = useTranslations("toasts");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiMissingConfig, setAiMissingConfig] = useState(false);

  const [generatedFields, setGeneratedFields] = useState<AiGeneratedFields>({
    summary: "",
    added: "",
    changed: "",
    fixed: "",
    security: "",
    breakingChanges: "",
    migrationGuide: "",
    contributors: "",
    markdownOutput: "",
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ReleaseNoteInput>({
    resolver: zodResolver(releaseNoteSchema),
    defaultValues: {
      projectId: "",
      version: "",
      releaseDate: "",
      summary: "",
      added: "",
      changed: "",
      fixed: "",
      security: "",
      deprecated: "",
      removed: "",
      breakingChanges: "",
      migrationGuide: "",
      contributors: "",
    },
  });

  const handleAiReleaseNotes = async () => {
    const values = getValues();
    if (!values.version) {
      toast.error("Version is required");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiMissingConfig(false);

    try {
      const selectedProject = projects.find((p) => p.id === values.projectId);
      const res = await fetch("/api/ai/release-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: values.version,
          project: selectedProject?.name || values.projectId,
          manualNotes: [
            values.summary,
            values.added,
            values.changed,
            values.fixed,
            values.security,
          ]
            .filter(Boolean)
            .join("\n"),
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
      setGeneratedFields({
        summary: data.summary || "",
        added: data.added || "",
        changed: data.changed || "",
        fixed: data.fixed || "",
        security: data.security || "",
        breakingChanges: data.breakingChanges || "",
        migrationGuide: data.migrationGuide || "",
        contributors: data.contributors || "",
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

  const onSubmit = async (data: ReleaseNoteInput) => {
    try {
      const payload = {
        ...data,
        ...(aiGenerated
          ? {
              summary: generatedFields.summary || data.summary,
              added: generatedFields.added || data.added,
              changed: generatedFields.changed || data.changed,
              fixed: generatedFields.fixed || data.fixed,
              security: generatedFields.security || data.security,
              breakingChanges: generatedFields.breakingChanges || data.breakingChanges,
              migrationGuide: generatedFields.migrationGuide || data.migrationGuide,
              contributors: generatedFields.contributors || data.contributors,
            }
          : {}),
      };

      const res = await fetch("/api/release-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || tt("failedToCreate"));
      }

      const note = await res.json();
      toast.success(tt("releaseNoteCreated"));
      router.push(`/release-notes/${note.id}`);
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
          <CardTitle>{t("releaseInformation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
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
              <Label htmlFor="version">{t("version")} *</Label>
              <Input
                id="version"
                {...register("version")}
                placeholder={t("versionPlaceholder")}
              />
              {errors.version && (
                <p className="text-sm text-destructive">{errors.version.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="releaseDate">{t("releaseDate")}</Label>
              <Input
                id="releaseDate"
                {...register("releaseDate")}
                placeholder={t("releaseDatePlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">{t("summary")}</Label>
            <Textarea
              id="summary"
              {...register("summary")}
              placeholder={t("summaryPlaceholder")}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("changes")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="added">{t("added")}</Label>
              <Textarea
                id="added"
                {...register("added")}
                placeholder={t("addedPlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="changed">{t("changed")}</Label>
              <Textarea
                id="changed"
                {...register("changed")}
                placeholder={t("changedPlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixed">{t("fixed")}</Label>
              <Textarea
                id="fixed"
                {...register("fixed")}
                placeholder={t("fixedPlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security">{t("security")}</Label>
              <Textarea
                id="security"
                {...register("security")}
                placeholder={t("securityPlaceholder")}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("breakingChanges")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deprecated">{t("deprecated")}</Label>
              <Textarea
                id="deprecated"
                {...register("deprecated")}
                placeholder={t("deprecatedPlaceholder")}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="removed">{t("removed")}</Label>
              <Textarea
                id="removed"
                {...register("removed")}
                placeholder={t("removedPlaceholder")}
                rows={2}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="breakingChanges">{t("breakingChanges")}</Label>
            <Textarea
              id="breakingChanges"
              {...register("breakingChanges")}
              placeholder={t("breakingChangesPlaceholder")}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="migrationGuide">{t("migrationGuide")}</Label>
            <Textarea
              id="migrationGuide"
              {...register("migrationGuide")}
              placeholder={t("migrationGuidePlaceholder")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("contributors")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="contributors">{t("contributors")}</Label>
            <Input
              id="contributors"
              {...register("contributors")}
              placeholder={t("contributorsPlaceholder")}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI-assisted release notes
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
            onClick={handleAiReleaseNotes}
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
            <div className="space-y-2">
              <Label>{t("summary")}</Label>
              <Textarea value={generatedFields.summary} readOnly rows={2} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("added")}</Label>
                <Textarea value={generatedFields.added} readOnly rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t("changed")}</Label>
                <Textarea value={generatedFields.changed} readOnly rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t("fixed")}</Label>
                <Textarea value={generatedFields.fixed} readOnly rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t("security")}</Label>
                <Textarea value={generatedFields.security} readOnly rows={3} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("breakingChanges")}</Label>
              <Textarea value={generatedFields.breakingChanges} readOnly rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{t("migrationGuide")}</Label>
              <Textarea value={generatedFields.migrationGuide} readOnly rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{t("contributors")}</Label>
              <Input value={generatedFields.contributors} readOnly />
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
          {isSubmitting ? t("generating") : t("generateNotes")}
        </Button>
      </div>
    </form>
  );
}
