import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { getTranslations } from "next-intl/server";

interface PrReviewDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrReviewDetailPage({ params }: PrReviewDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("prReview");
  const tc = await getTranslations("common");

  const review = await prisma.prReviewDraft.findUnique({
    where: { id },
  });

  if (!review) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pr-reviews">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{review.prTitle}</h2>
            <div className="flex items-center gap-2 mt-1">
              {review.riskLevel && (
                <Badge
                  variant={
                    review.riskLevel === "High"
                      ? "destructive"
                      : review.riskLevel === "Medium"
                      ? "warning"
                      : "success"
                  }
                >
                  {t("riskLevel")}: {review.riskLevel}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {review.markdownOutput && (
          <CopyButton text={review.markdownOutput} label="Markdown copied" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {review.prSummary && (
            <Card>
              <CardHeader>
                <CardTitle>{t("reviewSummary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{review.prSummary}</p>
              </CardContent>
            </Card>
          )}

          {review.markdownOutput && (
            <Card>
              <CardHeader>
                <CardTitle>{t("generatedReview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {review.markdownOutput}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tc("details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {review.changedFilesSummary && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("changedFilesSummary")}</p>
                  <p className="text-sm">{review.changedFilesSummary}</p>
                </div>
              )}
              {review.testResults && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("testResults")}</p>
                    <p className="text-sm">{review.testResults}</p>
                  </div>
                </>
              )}
              {review.riskNotes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("riskNotes")}</p>
                    <p className="text-sm">{review.riskNotes}</p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{tc("createdAt")}</p>
                <p className="text-sm">{formatDate(review.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {review.suggestedApproval && (
            <Card>
              <CardHeader>
                <CardTitle>{t("suggestedApproval")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{review.suggestedApproval}</p>
              </CardContent>
            </Card>
          )}

          {review.suggestedChanges && (
            <Card>
              <CardHeader>
                <CardTitle>{t("suggestedChanges")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{review.suggestedChanges}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
