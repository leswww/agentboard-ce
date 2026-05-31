"use client";

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
import { Project } from "@prisma/client";
import { useTranslations } from "next-intl";

interface IssueFormProps {
  projects: Project[];
}

export function IssueForm({ projects }: IssueFormProps) {
  const router = useRouter();
  const t = useTranslations("issueTriage");
  const tc = useTranslations("common");
  const tt = useTranslations("toasts");

  const {
    register,
    handleSubmit,
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

  const onSubmit = async (data: IssueDraftInput) => {
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
