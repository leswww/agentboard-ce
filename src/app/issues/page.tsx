import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/delete-button";
import { getTranslations } from "next-intl/server";

export default async function IssuesPage() {
  const t = await getTranslations("issueTriage");
  const tc = await getTranslations("common");

  const issues = await prisma.issueDraft.findMany({
    orderBy: { createdAt: "desc" },
  });

  const typeLabels: Record<string, string> = {
    Bug: t("types.bug"),
    Feature: t("types.feature"),
    Question: t("types.question"),
    Docs: t("types.docs"),
    Maintenance: t("types.maintenance"),
  };

  const priorityLabels: Record<string, string> = {
    Critical: t("priorities.critical"),
    High: t("priorities.high"),
    Medium: t("priorities.medium"),
    Low: t("priorities.low"),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/issues/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("newTriage")}
          </Button>
        </Link>
      </div>

      {issues.length === 0 ? (
        <EmptyState
          icon={Bug}
          title={t("noIssues")}
          description={t("noIssuesDesc")}
          action={
            <Link href="/issues/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("newTriage")}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/issues/${issue.id}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {issue.issueTitle}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {issue.issueBody || tc("description")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {issue.draftType && (
                        <Badge variant="outline">{typeLabels[issue.draftType] || issue.draftType}</Badge>
                      )}
                      {issue.draftPriority && (
                        <Badge
                          variant={
                            issue.draftPriority === "Critical"
                              ? "destructive"
                              : issue.draftPriority === "High"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {priorityLabels[issue.draftPriority] || issue.draftPriority}
                        </Badge>
                      )}
                      {issue.affectedArea && (
                        <Badge variant="outline">{issue.affectedArea}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(issue.createdAt)}
                      </span>
                    </div>
                  </div>
                  <DeleteButton
                    endpoint={`/api/issues/${issue.id}`}
                    itemName={issue.issueTitle}
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
