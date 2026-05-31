"use client";

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
import { Project } from "@prisma/client";
import { useTranslations } from "next-intl";

interface ReleaseNoteFormProps {
  projects: Project[];
}

export function ReleaseNoteForm({ projects }: ReleaseNoteFormProps) {
  const router = useRouter();
  const t = useTranslations("releaseNotes");
  const tc = useTranslations("common");
  const tt = useTranslations("toasts");

  const {
    register,
    handleSubmit,
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

  const onSubmit = async (data: ReleaseNoteInput) => {
    try {
      const res = await fetch("/api/release-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
