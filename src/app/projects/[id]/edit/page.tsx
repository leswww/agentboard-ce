import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/project-form";
import { getTranslations } from "next-intl/server";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const t = await getTranslations("projects");

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("editProject")}</h2>
          <p className="text-muted-foreground">
            {project.name}
          </p>
        </div>
      </div>

      <ProjectForm
        initialData={{
          ...project,
          description: project.description ?? undefined,
          localPath: project.localPath ?? undefined,
          repositoryUrl: project.repositoryUrl ?? undefined,
          techStack: project.techStack ?? undefined,
          startCommand: project.startCommand ?? undefined,
          testCommand: project.testCommand ?? undefined,
          buildCommand: project.buildCommand ?? undefined,
          deployCommand: project.deployCommand ?? undefined,
          notes: project.notes ?? undefined,
          status: project.status as "active" | "archived",
        }}
        projectId={project.id}
      />
    </div>
  );
}
