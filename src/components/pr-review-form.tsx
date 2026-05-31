"use client";

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
import { Project } from "@prisma/client";
import { useTranslations } from "next-intl";

interface PrReviewFormProps {
  projects: Project[];
}

export function PrReviewForm({ projects }: PrReviewFormProps) {
  const router = useRouter();
  const t = useTranslations("prReview");
  const tc = useTranslations("common");
  const tt = useTranslations("toasts");

  const {
    register,
    handleSubmit,
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

  const onSubmit = async (data: PrReviewDraftInput) => {
    try {
      const res = await fetch("/api/pr-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
