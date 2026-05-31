import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FolderKanban,
  Zap,
  Bot,
  Bug,
  GitPullRequest,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const [
    totalProjects,
    totalCommands,
    totalAgents,
    totalIssueDrafts,
    totalPrReviews,
    totalReleaseNotes,
    recentProjects,
    recentIssueDrafts,
    recentPrReviews,
    recentReleaseNotes,
  ] = await Promise.all([
    prisma.project.count({ where: { status: "active" } }),
    prisma.commandTemplate.count(),
    prisma.agentProfile.count(),
    prisma.issueDraft.count(),
    prisma.prReviewDraft.count(),
    prisma.releaseNote.count(),
    prisma.project.findMany({
      where: { status: "active" },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.issueDraft.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.prReviewDraft.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.releaseNote.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const stats = [
    {
      title: t("totalProjects"),
      value: totalProjects,
      icon: FolderKanban,
      href: "/projects",
      color: "text-blue-500",
    },
    {
      title: t("totalCommands"),
      value: totalCommands,
      icon: Zap,
      href: "/commands",
      color: "text-yellow-500",
    },
    {
      title: t("totalAgents"),
      value: totalAgents,
      icon: Bot,
      href: "/agents",
      color: "text-purple-500",
    },
    {
      title: t("totalIssueDrafts"),
      value: totalIssueDrafts,
      icon: Bug,
      href: "/issues",
      color: "text-red-500",
    },
    {
      title: t("totalPrReviews"),
      value: totalPrReviews,
      icon: GitPullRequest,
      href: "/pr-reviews",
      color: "text-green-500",
    },
    {
      title: t("totalReleaseNotes"),
      value: totalReleaseNotes,
      icon: FileText,
      href: "/release-notes",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("welcome")}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{tc("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/projects/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                {t("addProject")}
              </Button>
            </Link>
            <Link href="/issues/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                {t("newIssueTriage")}
              </Button>
            </Link>
            <Link href="/pr-reviews/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                {t("newPrReview")}
              </Button>
            </Link>
            <Link href="/release-notes/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                {t("newReleaseNotes")}
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Bot className="h-4 w-4" />
                {t("openAgentLibrary")}
              </Button>
            </Link>
            <Link href="/terminal">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Zap className="h-4 w-4" />
                {t("openTerminal")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{tc("recentProjects")}</CardTitle>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-1">
                {tc("viewAll")} <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noProjects")}</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.techStack}</p>
                    </div>
                    <Badge variant={project.status === "active" ? "success" : "secondary"}>
                      {project.status === "active" ? tc("active") : tc("archived")}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Drafts */}
        <Card>
          <CardHeader>
            <CardTitle>{tc("recentDrafts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentIssueDrafts.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t("issueDrafts")}</p>
                  {recentIssueDrafts.map((draft) => (
                    <Link
                      key={draft.id}
                      href={`/issues/${draft.id}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors"
                    >
                      <p className="text-sm truncate">{draft.issueTitle}</p>
                      <Badge variant="outline">{draft.draftType}</Badge>
                    </Link>
                  ))}
                </div>
              )}
              {recentPrReviews.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t("prReviews")}</p>
                  {recentPrReviews.map((draft) => (
                    <Link
                      key={draft.id}
                      href={`/pr-reviews/${draft.id}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors"
                    >
                      <p className="text-sm truncate">{draft.prTitle}</p>
                      <Badge variant="outline">{draft.riskLevel}</Badge>
                    </Link>
                  ))}
                </div>
              )}
              {recentReleaseNotes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t("releaseNotes")}</p>
                  {recentReleaseNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/release-notes/${note.id}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors"
                    >
                      <p className="text-sm truncate">{note.version}</p>
                      <Badge variant="outline">{formatDate(note.createdAt)}</Badge>
                    </Link>
                  ))}
                </div>
              )}
              {recentIssueDrafts.length === 0 &&
                recentPrReviews.length === 0 &&
                recentReleaseNotes.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("noDrafts")}</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
