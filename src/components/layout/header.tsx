"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslations } from "next-intl";

export function Header() {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  const pageTitles: Record<string, string> = {
    "/dashboard": t("dashboard"),
    "/projects": t("projects"),
    "/commands": t("commands"),
    "/terminal": t("terminal"),
    "/agents": t("agents"),
    "/issues": t("issueTriage"),
    "/pr-reviews": t("prReview"),
    "/release-notes": t("releaseNotes"),
    "/docs": t("docs"),
    "/settings": t("settings"),
  };

  const title = pageTitles[pathname] || "AgentBoard CE";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
