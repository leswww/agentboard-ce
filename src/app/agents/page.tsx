import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Bot, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CopyButton } from "@/components/copy-button";
import { DeleteButton } from "@/components/delete-button";
import { getTranslations } from "next-intl/server";

export default async function AgentsPage() {
  const t = await getTranslations("agents");
  const tc = await getTranslations("common");

  const agents = await prisma.agentProfile.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const categoryLabels: Record<string, string> = {
    "Bug Fixer": t("categories.bugFixer"),
    "Code Reviewer": t("categories.codeReviewer"),
    "UI Reviewer": t("categories.uiReviewer"),
    "Security Checker": t("categories.securityChecker"),
    "Docs Writer": t("categories.docsWriter"),
    "Release Assistant": t("categories.releaseAssistant"),
    "Test Writer": t("categories.testWriter"),
    "Refactor Planner": t("categories.refactorPlanner"),
    "Product Manager": t("categories.productManager"),
    Custom: t("categories.custom"),
  };

  const toolLabels: Record<string, string> = {
    Codex: t("tools.codex"),
    Claude: t("tools.claude"),
    Antigravity: t("tools.antigravity"),
    Cursor: t("tools.cursor"),
    Generic: t("tools.generic"),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/agents/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("newAgent")}
          </Button>
        </Link>
      </div>

      {agents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title={t("noAgents")}
          description={t("noAgentsDesc")}
          action={
            <Link href="/agents/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("newAgent")}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <Badge variant="outline">{categoryLabels[agent.category] || agent.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {agent.description || tc("description")}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{toolLabels[agent.recommendedTool] || agent.recommendedTool}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                  {agent.systemPrompt}
                </p>
                <div className="flex items-center gap-2">
                  <CopyButton text={agent.systemPrompt} label={t("promptCopied")} />
                  <Link href={`/agents/${agent.id}`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteButton
                    endpoint={`/api/agents/${agent.id}`}
                    itemName={agent.name}
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
