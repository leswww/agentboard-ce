import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { RunCommandButton } from "@/components/run-command-button";
import { GitInsightsSection } from "@/components/git-insights-section";
import { getTranslations } from "next-intl/server";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("projects");
  const tc = await getTranslations("common");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      commandTemplates: true,
      commandRuns: {
        orderBy: { startedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
            <p className="text-muted-foreground">{project.description || tc("description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project.repositoryUrl && (
            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-3 w-3" />
                {t("openRepository")}
              </Button>
            </a>
          )}
          <Link href={`/projects/${project.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-3 w-3" />
              {tc("edit")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>{tc("overview")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{tc("status")}</p>
                  <Badge variant={project.status === "active" ? "success" : "secondary"}>
                    {project.status === "active" ? tc("active") : tc("archived")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("packageManager")}</p>
                  <p className="text-sm">{project.packageManager}</p>
                </div>
                {project.techStack && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{t("techStack")}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.split(",").map((tech) => (
                        <Badge key={tech.trim()} variant="outline">
                          {tech.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {project.localPath && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{t("localPath")}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded flex-1 truncate">
                      {project.localPath}
                    </code>
                    <CopyButton text={project.localPath} />
                  </div>
                </div>
              )}

              {project.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{tc("notes")}</p>
                  <p className="text-sm whitespace-pre-wrap">{project.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Commands */}
          <Card>
            <CardHeader>
              <CardTitle>{t("commands")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {project.startCommand && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{t("startCommand")}</p>
                      <code className="text-xs text-muted-foreground">{project.startCommand}</code>
                    </div>
                    <RunCommandButton
                      command={project.startCommand}
                      projectId={project.id}
                      workingDirectory={project.localPath || undefined}
                    />
                  </div>
                )}
                {project.testCommand && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{t("testCommand")}</p>
                      <code className="text-xs text-muted-foreground">{project.testCommand}</code>
                    </div>
                    <RunCommandButton
                      command={project.testCommand}
                      projectId={project.id}
                      workingDirectory={project.localPath || undefined}
                    />
                  </div>
                )}
                {project.buildCommand && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{t("buildCommand")}</p>
                      <code className="text-xs text-muted-foreground">{project.buildCommand}</code>
                    </div>
                    <RunCommandButton
                      command={project.buildCommand}
                      projectId={project.id}
                      workingDirectory={project.localPath || undefined}
                    />
                  </div>
                )}
                {project.deployCommand && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{t("deployCommand")}</p>
                      <code className="text-xs text-muted-foreground">{project.deployCommand}</code>
                    </div>
                    <RunCommandButton
                      command={project.deployCommand}
                      projectId={project.id}
                      workingDirectory={project.localPath || undefined}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Command Runs */}
          {project.commandRuns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("recentCommandRuns")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.commandRuns.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <code className="text-sm">{run.command}</code>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(run.startedAt)}
                          {run.durationMs && ` • ${run.durationMs}ms`}
                        </p>
                      </div>
                      <Badge
                        variant={
                          run.status === "success"
                            ? "success"
                            : run.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {run.status === "success" ? tc("success") : tc("failed")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Git Insights */}
          <GitInsightsSection
            projectId={project.id}
            projectName={project.name}
            projectPath={project.localPath || null}
          />

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>{tc("details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("slug")}</p>
                <p className="text-sm">{project.slug}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{tc("createdAt")}</p>
                <p className="text-sm">{formatDate(project.createdAt)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{tc("updatedAt")}</p>
                <p className="text-sm">{formatDate(project.updatedAt)}</p>
              </div>
              {project.lastOpenedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("lastOpened")}</p>
                    <p className="text-sm">{formatDate(project.lastOpenedAt)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
