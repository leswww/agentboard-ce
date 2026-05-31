"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { Download, Upload, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { locales, localeNames, COOKIE_NAME, type Locale } from "@/i18n/config";
import { setStoredLocale } from "@/i18n/locale-utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations("settings");
  const tc = useTranslations("common");

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importData, setImportData] = useState<string>("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      toast.error(t("failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast.success(t("settingsSaved"));
    } catch {
      toast.error(t("failedToSave"));
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (newLocale: Locale) => {
    setStoredLocale(newLocale);
    toast.success(t("languageChanged"));
    router.refresh();
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Failed to export");

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agentboard-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(t("dataExported"));
    } catch {
      toast.error(t("failedToExport"));
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData);

      if (!data.data) {
        toast.error(t("invalidImportFormat"));
        return;
      }

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to import");

      toast.success(t("dataImported"));
      setShowImportConfirm(false);
      setImportData("");
    } catch {
      toast.error(t("failedToImport"));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      setShowImportConfirm(true);
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tc("language")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{tc("language")}</Label>
              <Select
                value={locale}
                onChange={(e) => handleLanguageChange(e.target.value as Locale)}
                options={locales.map((loc) => ({
                  value: loc,
                  label: localeNames[loc],
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("appearance")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("theme")}</Label>
              <Select
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value as "light" | "dark" | "system");
                  setSettings((prev) => ({ ...prev, theme: e.target.value }));
                }}
                options={[
                  { value: "light", label: tc("light") },
                  { value: "dark", label: tc("dark") },
                  { value: "system", label: tc("system") },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("projectDefaults")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultProjectPath">{t("defaultProjectPath")}</Label>
              <Input
                id="defaultProjectPath"
                value={settings.defaultProjectPath || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, defaultProjectPath: e.target.value }))
                }
                placeholder={t("defaultProjectPathPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultPackageManager">{t("defaultPackageManager")}</Label>
              <Select
                id="defaultPackageManager"
                value={settings.defaultPackageManager || "npm"}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, defaultPackageManager: e.target.value }))
                }
                options={[
                  { value: "npm", label: "npm" },
                  { value: "yarn", label: "yarn" },
                  { value: "pnpm", label: "pnpm" },
                  { value: "bun", label: "bun" },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("commandRunner")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("commandRunnerMode")}</Label>
              <Select
                value={settings.commandRunnerMode || "streamed"}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, commandRunnerMode: e.target.value }))
                }
                options={[
                  { value: "streamed", label: t("streamedCommandRunner") },
                  { value: "terminal", label: t("terminalMode") },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dangerousCommandConfirmation")}</Label>
              <Select
                value={settings.dangerousCommandConfirmation || "true"}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    dangerousCommandConfirmation: e.target.value,
                  }))
                }
                options={[
                  { value: "true", label: t("enabled") },
                  { value: "false", label: t("disabled") },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dataManagement")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("dataManagementDesc")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                {t("exportData")}
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("import-file")?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {t("importData")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t("saving") : t("saveSettings")}
        </Button>
      </div>

      <Dialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("importData")}</DialogTitle>
            <DialogDescription>
              {t("importWarning")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t("importWarningDetail")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportConfirm(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleImport}>
              {t("importData")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
