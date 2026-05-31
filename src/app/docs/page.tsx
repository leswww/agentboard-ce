import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTranslations } from "next-intl/server";

export default async function DocsPage() {
  const t = await getTranslations("docs");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("whatIsAgentBoard")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {t("whatIsAgentBoardDesc")}
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">{t("localFirstPhilosophy")}</p>
              <p className="text-sm text-muted-foreground">
                {t("localFirstDesc")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("gettingStarted")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">1. {t("gettingStartedStep1")}</p>
              <p className="text-sm text-muted-foreground">
                {t("gettingStartedStep1Desc")}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">2. {t("gettingStartedStep2")}</p>
              <p className="text-sm text-muted-foreground">
                {t("gettingStartedStep2Desc")}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">3. {t("gettingStartedStep3")}</p>
              <p className="text-sm text-muted-foreground">
                {t("gettingStartedStep3Desc")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("commandTemplatesTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {t("commandTemplatesDesc")}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("commandTemplatesFeatures")}</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {t("commandTemplatesFeaturesList").split(" | ").map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("agentProfilesTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {t("agentProfilesDesc")}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("defaultProfiles")}</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Bug Fixer - Codex/Claude</li>
                <li>Code Reviewer - Codex</li>
                <li>UI Reviewer - Antigravity</li>
                <li>Security Checker</li>
                <li>Docs Writer</li>
                <li>Release Assistant</li>
                <li>Test Writer - Claude</li>
                <li>Refactor Planner - Claude</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("issueTriageTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {t("issueTriageDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("prReviewTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {t("prReviewDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("releaseNotesTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {t("releaseNotesDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("plannedFeatures")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              {t("plannedFeaturesList").split(" | ").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
