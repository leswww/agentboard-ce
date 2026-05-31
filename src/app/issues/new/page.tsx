import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueForm } from "@/components/issue-form";
import { getTranslations } from "next-intl/server";

export default async function NewIssuePage() {
  const t = await getTranslations("issueTriage");

  const projects = await prisma.project.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/issues">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("newTriage")}</h2>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <IssueForm projects={projects} />
    </div>
  );
}
