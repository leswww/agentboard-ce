"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Terminal,
  Bot,
  Bug,
  GitPullRequest,
  FileText,
  BookOpen,
  Settings,
  Zap,
  Github,
  ChevronLeft,
  ChevronRight,
  Brain,
  FileEdit,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations("navigation");

  const navItems = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("projects"),
      href: "/projects",
      icon: FolderKanban,
    },
    {
      title: t("commands"),
      href: "/commands",
      icon: Zap,
    },
    {
      title: t("terminal"),
      href: "/terminal",
      icon: Terminal,
    },
    {
      title: t("agents"),
      href: "/agents",
      icon: Bot,
    },
    {
      title: t("issueTriage"),
      href: "/issues",
      icon: Bug,
    },
    {
      title: t("githubIssues"),
      href: "/github/issues",
      icon: Github,
    },
    {
      title: t("githubPRs"),
      href: "/github/pull-requests",
      icon: GitPullRequest,
    },
    {
      title: t("prReview"),
      href: "/pr-reviews",
      icon: GitPullRequest,
    },
    {
      title: t("releaseNotes"),
      href: "/release-notes",
      icon: FileText,
    },
    {
      title: t("docs"),
      href: "/docs",
      icon: BookOpen,
    },
    {
      title: t("aiHistory"),
      href: "/ai-history",
      icon: Brain,
    },
    {
      title: t("docsSuggestions"),
      href: "/docs-suggestions",
      icon: FileEdit,
    },
    {
      title: t("settings"),
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AB</span>
            </div>
            <span className="font-semibold text-lg">AgentBoard</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AB</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-6 w-6 rounded hover:bg-accent flex items-center justify-center"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            AgentBoard CE v0.4.0
          </div>
        )}
      </div>
    </aside>
  );
}
