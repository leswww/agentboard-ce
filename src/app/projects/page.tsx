import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function ProjectsPage() {
  const t = await getTranslations("projects");
  const tc = await getTranslations("common");

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("addProject")}
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={t("noProjects")}
          description={t("noProjectsDesc")}
          action={
            <Link href="/projects/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("addProject")}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={project.status === "active" ? "success" : "secondary"}>
                      {project.status === "active" ? tc("active") : tc("archived")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {project.description || tc("description")}
                  </p>
                  <div className="space-y-2">
                    {project.techStack && (
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.split(",").map((tech) => (
                          <Badge key={tech.trim()} variant="outline" className="text-xs">
                            {tech.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {project.localPath && (
                      <p className="text-xs text-muted-foreground truncate">
                        {project.localPath}
                      </p>
                    )}
                    {project.repositoryUrl && (
                      <p className="text-xs text-blue-500 truncate">
                        {project.repositoryUrl}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
