import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CopyButton } from "@/components/copy-button";
import { RunCommandButton } from "@/components/run-command-button";
import { DeleteButton } from "@/components/delete-button";
import { getTranslations } from "next-intl/server";

export default async function CommandsPage() {
  const t = await getTranslations("commands");
  const tc = await getTranslations("common");

  const commands = await prisma.commandTemplate.findMany({
    orderBy: { updatedAt: "desc" },
    include: { project: true },
  });

  const categoryLabels: Record<string, string> = {
    dev: t("dev"),
    build: t("build"),
    test: t("test"),
    deploy: t("deploy"),
    git: t("git"),
    custom: t("custom"),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/commands/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("newCommand")}
          </Button>
        </Link>
      </div>

      {commands.length === 0 ? (
        <EmptyState
          icon={Zap}
          title={t("noCommands")}
          description={t("noCommandsDesc")}
          action={
            <Link href="/commands/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("newCommand")}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {commands.map((command) => (
            <Card key={command.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{command.name}</CardTitle>
                  <Badge variant="outline">{categoryLabels[command.category] || command.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {command.description || tc("description")}
                </p>
                <div className="bg-muted p-2 rounded-md mb-3">
                  <code className="text-xs">{command.command}</code>
                </div>
                {command.project && (
                  <p className="text-xs text-muted-foreground mb-3">
                    {t("project")}: {command.project.name}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <CopyButton text={command.command} label={t("commandCopied")} />
                  <RunCommandButton
                    command={command.command}
                    projectId={command.projectId || undefined}
                    workingDirectory={command.workingDirectory || undefined}
                  />
                  <Link href={`/commands/${command.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Play className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteButton
                    endpoint={`/api/commands/${command.id}`}
                    itemName={command.name}
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
