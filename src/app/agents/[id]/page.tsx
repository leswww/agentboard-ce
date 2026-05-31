import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { getTranslations } from "next-intl/server";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("agents");
  const tc = await getTranslations("common");

  const agent = await prisma.agentProfile.findUnique({
    where: { id },
  });

  if (!agent) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{agent.name}</h2>
            <p className="text-muted-foreground">{agent.description || tc("description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={agent.systemPrompt} label={t("promptCopied")} />
          <Link href={`/agents/${agent.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-3 w-3" />
              {tc("edit")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("systemPrompt")}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                {agent.systemPrompt}
              </pre>
            </CardContent>
          </Card>

          {agent.inputTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>{t("inputTemplate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {agent.inputTemplate}
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
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("category")}</p>
                <Badge variant="outline">{agent.category}</Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("recommendedTool")}</p>
                <Badge variant="secondary">{agent.recommendedTool}</Badge>
              </div>
              {agent.outputFormat && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("outputFormat")}</p>
                    <p className="text-sm">{agent.outputFormat}</p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{tc("createdAt")}</p>
                <p className="text-sm">{formatDate(agent.createdAt)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{tc("updatedAt")}</p>
                <p className="text-sm">{formatDate(agent.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
