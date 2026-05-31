import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrReviewForm } from "@/components/pr-review-form";
import { getTranslations } from "next-intl/server";

export default async function NewPrReviewPage() {
  const t = await getTranslations("prReview");

  const projects = await prisma.project.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pr-reviews">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("newReview")}</h2>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <PrReviewForm projects={projects} />
    </div>
  );
}
