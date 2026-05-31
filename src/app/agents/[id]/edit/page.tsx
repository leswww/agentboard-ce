import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentForm } from "@/components/agent-form";
import { getTranslations } from "next-intl/server";

interface EditAgentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAgentPage({ params }: EditAgentPageProps) {
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
      <div className="flex items-center gap-4">
        <Link href={`/agents/${agent.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("editAgent")}</h2>
          <p className="text-muted-foreground">
            {agent.name}
          </p>
        </div>
      </div>

      <AgentForm
        initialData={{
          ...agent,
          description: agent.description ?? undefined,
          inputTemplate: agent.inputTemplate ?? undefined,
          outputFormat: agent.outputFormat ?? undefined,
        }}
        agentId={agent.id}
      />
    </div>
  );
}
