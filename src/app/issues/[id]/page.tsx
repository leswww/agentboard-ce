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

interface IssueDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("issueTriage");
  const tc = await getTranslations("common");

  const issue = await prisma.issueDraft.findUnique({
    where: { id },
  });

  if (!issue) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/issues">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{issue.issueTitle}</h2>
            <div className="flex items-center gap-2 mt-1">
              {issue.draftType && <Badge variant="outline">{issue.draftType}</Badge>}
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
                  {issue.draftPriority}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {issue.markdownOutput && (
          <CopyButton text={issue.markdownOutput} label="Markdown copied" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {issue.issueBody && (
            <Card>
              <CardHeader>
                <CardTitle>{tc("description")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{issue.issueBody}</p>
              </CardContent>
            </Card>
          )}

          {issue.markdownOutput && (
            <Card>
              <CardHeader>
                <CardTitle>{t("generatedTriage")}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {issue.markdownOutput}
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
              {issue.draftSeverity && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("severity")}</p>
                  <Badge variant="outline">{issue.draftSeverity}</Badge>
                </div>
              )}
              {issue.affectedArea && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("affectedArea")}</p>
                    <p className="text-sm">{issue.affectedArea}</p>
                  </div>
                </>
              )}
              {issue.environment && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("environment")}</p>
                    <p className="text-sm">{issue.environment}</p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{tc("createdAt")}</p>
                <p className="text-sm">{formatDate(issue.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {issue.suggestedLabels && (
            <Card>
              <CardHeader>
                <CardTitle>{t("suggestedLabels")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {issue.suggestedLabels.split(",").map((label) => (
                    <Badge key={label.trim()} variant="outline">
                      {label.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {issue.suggestedReply && (
            <Card>
              <CardHeader>
                <CardTitle>{t("suggestedReply")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{issue.suggestedReply}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
