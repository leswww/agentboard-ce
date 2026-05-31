import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, GitPullRequest } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/delete-button";
import { getTranslations } from "next-intl/server";

export default async function PrReviewsPage() {
  const t = await getTranslations("prReview");
  const tc = await getTranslations("common");

  const reviews = await prisma.prReviewDraft.findMany({
    orderBy: { createdAt: "desc" },
  });

  const riskLabels: Record<string, string> = {
    Low: t("riskLevels.low"),
    Medium: t("riskLevels.medium"),
    High: t("riskLevels.high"),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/pr-reviews/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("newReview")}
          </Button>
        </Link>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={GitPullRequest}
          title={t("noReviews")}
          description={t("noReviewsDesc")}
          action={
            <Link href="/pr-reviews/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("newReview")}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/pr-reviews/${review.id}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {review.prTitle}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {review.prSummary || tc("description")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
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
                          {t("riskLevel")}: {riskLabels[review.riskLevel] || review.riskLevel}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  <DeleteButton
                    endpoint={`/api/pr-reviews/${review.id}`}
                    itemName={review.prTitle}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
