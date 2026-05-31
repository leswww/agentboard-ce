import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentForm } from "@/components/agent-form";
import { getTranslations } from "next-intl/server";

export default async function NewAgentPage() {
  const t = await getTranslations("agents");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/agents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("newAgent")}</h2>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <AgentForm />
    </div>
  );
}
