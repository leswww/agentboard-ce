import { prisma } from "@/lib/prisma";
import { TerminalWorkspace } from "@/components/terminal-workspace";

export default async function TerminalPage() {
  const projects = await prisma.project.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
  });

  const commands = await prisma.commandTemplate.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <TerminalWorkspace projects={projects} commands={commands} />
    </div>
  );
}
