import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandForm } from "@/components/command-form";
import { getTranslations } from "next-intl/server";

interface EditCommandPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCommandPage({ params }: EditCommandPageProps) {
  const { id } = await params;
  const t = await getTranslations("commands");

  const command = await prisma.commandTemplate.findUnique({
    where: { id },
  });

  if (!command) {
    notFound();
  }

  const projects = await prisma.project.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/commands">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("editCommand")}</h2>
          <p className="text-muted-foreground">
            {command.name}
          </p>
        </div>
      </div>

      <CommandForm
        initialData={{
          ...command,
          description: command.description ?? undefined,
          workingDirectory: command.workingDirectory ?? undefined,
          projectId: command.projectId ?? undefined,
          category: command.category as "dev" | "build" | "test" | "deploy" | "git" | "custom",
        }}
        commandId={command.id}
        projects={projects}
      />
    </div>
  );
}
