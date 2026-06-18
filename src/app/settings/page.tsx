"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { Download, Upload, AlertTriangle, Github, CheckCircle, XCircle, Loader2, Eye, EyeOff, Brain } from "lucide-react";
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
  const tg = useTranslations("github");

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importData, setImportData] = useState<string>("");

  // GitHub token state
  const [githubToken, setGithubToken] = useState("");
  const [githubStatus, setGithubStatus] = useState<{
    configured: boolean;
    valid: boolean;
    username: string | null;
    validatedAt: string | null;
  }>({ configured: false, valid: false, username: null, validatedAt: null });
  const [githubLoading, setGithubLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // AI settings state
  const [aiProvider, setAiProvider] = useState("disabled");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiBaseUrl, setAiBaseUrl] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiValidated, setAiValidated] = useState(false);
  const [aiValidatedAt, setAiValidatedAt] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiKey, setShowAiKey] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchGithubStatus();
    fetchAiStatus();
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

  const fetchGithubStatus = async () => {
    try {
      const res = await fetch("/api/github/token");
      if (res.ok) {
        const data = await res.json();
        setGithubStatus(data);
      }
    } catch {
      // Silent fail for token status
    }
  };

  const handleSaveToken = async () => {
    if (!githubToken.trim()) return;
    setGithubLoading(true);
    try {
      const res = await fetch("/api/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: githubToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tg("tokenSaveFailed"));
        return;
      }
      setGithubStatus(data);
      setGithubToken("");
      toast.success(tg("tokenSaved"));
    } catch {
      toast.error(tg("tokenSaveFailed"));
    } finally {
      setGithubLoading(false);
    }
  };

  const handleValidateToken = async () => {
    setGithubLoading(true);
    try {
      const res = await fetch("/api/github/validate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setGithubStatus((prev) => ({ ...prev, valid: false, username: null }));
        toast.error(data.error || tg("tokenInvalid"));
        return;
      }
      setGithubStatus((prev) => ({
        ...prev,
        valid: data.valid,
        username: data.username,
        validatedAt: data.validatedAt,
      }));
      toast.success(tg("tokenValid"));
    } catch {
      toast.error(tg("tokenInvalid"));
    } finally {
      setGithubLoading(false);
    }
  };

  const handleRemoveToken = async () => {
    setGithubLoading(true);
    try {
      const res = await fetch("/api/github/token", { method: "DELETE" });
      if (res.ok) {
        setGithubStatus({ configured: false, valid: false, username: null, validatedAt: null });
        toast.success(tg("tokenRemoved"));
      }
    } catch {
      toast.error(tg("tokenRemoveFailed"));
    } finally {
      setGithubLoading(false);
    }
  };

  const fetchAiStatus = async () => {
    try {
      const [statusRes, settingsRes] = await Promise.all([
        fetch("/api/ai/status"),
        fetch("/api/ai/settings"),
      ]);
      if (statusRes.ok) {
        const status = await statusRes.json();
        setAiConfigured(status.configured);
        setAiValidated(!!status.validatedAt);
        setAiValidatedAt(status.validatedAt);
        setAiEnabled(status.enabled);
        setAiProvider(status.provider);
        if (status.model) setAiModel(status.model);
      }
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setAiBaseUrl(settings.baseUrl || "");
        if (settings.model) setAiModel(settings.model);
        setAiEnabled(settings.enabled);
        setAiProvider(settings.provider);
      }
    } catch {
      // Silent fail
    }
  };

  const handleSaveAiSettings = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiProvider,
          apiKey: aiApiKey || undefined,
          baseUrl: aiBaseUrl || undefined,
          model: aiModel || undefined,
          enabled: aiEnabled,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setAiApiKey("");
      await fetchAiStatus();
      toast.success(t("settingsSaved"));
    } catch {
      toast.error(t("failedToSave"));
    } finally {
      setAiLoading(false);
    }
  };

  const handleValidateAi = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/validate", { method: "POST" });
      if (res.ok) {
        setAiValidated(true);
        toast.success("AI settings are valid");
      } else {
        const data = await res.json();
        toast.error(data.error || "Validation failed");
      }
    } catch {
      toast.error("Validation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleRemoveAiSettings = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/settings", { method: "DELETE" });
      if (res.ok) {
        setAiConfigured(false);
        setAiValidated(false);
        setAiValidatedAt(null);
        setAiProvider("disabled");
        setAiBaseUrl("");
        setAiModel("");
        setAiEnabled(false);
        toast.success("AI settings removed");
      }
    } catch {
      toast.error("Failed to remove AI settings");
    } finally {
      setAiLoading(false);
    }
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
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure an optional AI provider for Codex-assisted maintainer workflows.
              All AI features are optional. The app works without AI configuration.
            </p>

            {/* AI Status */}
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <span className="text-sm font-medium">AI Status:</span>
              {aiConfigured && aiValidated ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Configured & Valid
                </Badge>
              ) : aiConfigured ? (
                <Badge variant="warning" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not validated
                </Badge>
              ) : (
                <Badge variant="secondary">Not configured</Badge>
              )}
              {aiValidatedAt && (
                <span className="text-sm text-muted-foreground">
                  (validated)
                </span>
              )}
            </div>

            {/* Provider */}
            <div className="space-y-2">
              <Label htmlFor="ai-provider">AI Provider</Label>
              <Select
                id="ai-provider"
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                options={[
                  { value: "disabled", label: "Disabled" },
                  { value: "openai", label: "OpenAI" },
                  { value: "openai-compatible", label: "OpenAI-compatible" },
                ]}
              />
            </div>

            {/* API Key */}
            {aiProvider !== "disabled" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ai-api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="ai-api-key"
                      type={showAiKey ? "text" : "password"}
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="sk-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowAiKey(!showAiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-base-url">Base URL</Label>
                  <Input
                    id="ai-base-url"
                    value={aiBaseUrl}
                    onChange={(e) => setAiBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-model">Model</Label>
                  <Input
                    id="ai-model"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    placeholder="gpt-4o"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ai-enabled"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="ai-enabled" className="mb-0">AI enabled</Label>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSaveAiSettings}
                disabled={aiLoading || aiProvider === "disabled"}
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save AI Settings
              </Button>
              <Button
                variant="outline"
                onClick={handleValidateAi}
                disabled={!aiConfigured || aiLoading}
              >
                Validate
              </Button>
              <Button
                variant="outline"
                onClick={handleRemoveAiSettings}
                disabled={!aiConfigured || aiLoading}
              >
                Remove AI Settings
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              API key is stored locally and never returned to the client. AI output is always a draft requiring human review.
              AgentBoard CE does not automatically write AI output back to GitHub.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              {tg("title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {tg("description")}
            </p>

            {/* Token Status */}
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <span className="text-sm font-medium">{tg("tokenStatus")}:</span>
              {githubStatus.configured && githubStatus.valid ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {tg("tokenValid")}
                </Badge>
              ) : githubStatus.configured ? (
                <Badge variant="warning" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  {tg("tokenInvalid")}
                </Badge>
              ) : (
                <Badge variant="secondary">{tg("tokenNotConfigured")}</Badge>
              )}
              {githubStatus.username && (
                <span className="text-sm text-muted-foreground">
                  ({tg("user")}: {githubStatus.username})
                </span>
              )}
            </div>

            {/* Token Input */}
            <div className="space-y-2">
              <Label htmlFor="github-token">{tg("token")}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="github-token"
                    type={showToken ? "text" : "password"}
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder={tg("tokenPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  onClick={handleSaveToken}
                  disabled={!githubToken.trim() || githubLoading}
                >
                  {githubLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : tg("saveToken")}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleValidateToken}
                disabled={!githubStatus.configured || githubLoading}
              >
                {tg("validateToken")}
              </Button>
              <Button
                variant="outline"
                onClick={handleRemoveToken}
                disabled={!githubStatus.configured || githubLoading}
              >
                {tg("removeToken")}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {tg("tokenHint")}
            </p>
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
