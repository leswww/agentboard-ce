"use client";

import { useState } from "react";
import { Project, CommandTemplate } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, Trash2, Copy, Loader2 } from "lucide-react";
import { copyToClipboard, isDangerousCommand, getDangerousCommandPattern, formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

interface TerminalWorkspaceProps {
  projects: Project[];
  commands: CommandTemplate[];
}

interface CommandOutput {
  id: string;
  command: string;
  output: string;
  exitCode: number | null;
  status: string;
  durationMs: number | null;
  startedAt: string;
}

export function TerminalWorkspace({ projects, commands }: TerminalWorkspaceProps) {
  const t = useTranslations("terminal");
  const tc = useTranslations("common");
  const td = useTranslations("dangerousCommands");

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedCommand, setSelectedCommand] = useState("");
  const [customCommand, setCustomCommand] = useState("");
  const [running, setRunning] = useState(false);
  const [outputs, setOutputs] = useState<CommandOutput[]>([]);
  const [showDangerousConfirm, setShowDangerousConfirm] = useState(false);
  const [dangerousConfirmed, setDangerousConfirmed] = useState(false);
  const [pendingCommand, setPendingCommand] = useState("");

  const currentCommand = selectedCommand || customCommand;
  const selectedProjectData = projects.find((p) => p.id === selectedProject);

  const handleRun = async () => {
    if (!currentCommand) {
      toast.error(t("failedToRun"));
      return;
    }

    if (isDangerousCommand(currentCommand)) {
      setPendingCommand(currentCommand);
      setShowDangerousConfirm(true);
      return;
    }

    await executeCommand(currentCommand);
  };

  const executeCommand = async (command: string) => {
    setRunning(true);
    setShowDangerousConfirm(false);
    setDangerousConfirmed(false);

    try {
      const res = await fetch("/api/commands/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          projectId: selectedProject || undefined,
          workingDirectory: selectedProjectData?.localPath || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to run command");

      const data = await res.json();
      setOutputs((prev) => [data, ...prev]);

      if (data.exitCode === 0) {
        toast.success(t("commandCompleted"));
      } else {
        toast.error(t("commandFailed", { code: data.exitCode }));
      }
    } catch {
      toast.error(t("failedToRun"));
    } finally {
      setRunning(false);
    }
  };

  const handleCopyOutput = (output: string) => {
    copyToClipboard(output);
    toast.success(tc("copy") + " ✓");
  };

  const handleClearOutputs = () => {
    setOutputs([]);
    toast.success(t("outputCleared"));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("commandRunner")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("selectProject")}</Label>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                options={[
                  { value: "", label: t("noProject") },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("selectCommand")}</Label>
              <Select
                value={selectedCommand}
                onChange={(e) => {
                  setSelectedCommand(e.target.value);
                  if (e.target.value) setCustomCommand("");
                }}
                options={[
                  { value: "", label: t("selectCommandPlaceholder") },
                  ...commands.map((c) => ({ value: c.command, label: c.name })),
                ]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("customCommand")}</Label>
            <div className="flex gap-2">
              <Input
                value={customCommand}
                onChange={(e) => {
                  setCustomCommand(e.target.value);
                  if (e.target.value) setSelectedCommand("");
                }}
                placeholder={t("customCommandPlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !running) handleRun();
                }}
              />
              <Button onClick={handleRun} disabled={running || !currentCommand}>
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {tc("run")}
              </Button>
            </div>
          </div>

          {selectedProjectData && (
            <div className="text-sm text-muted-foreground">
              {t("workingDirectory")}: {selectedProjectData.localPath || process.cwd()}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("output")}</CardTitle>
          {outputs.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearOutputs}>
              <Trash2 className="h-4 w-4 mr-1" />
              {t("clear")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {outputs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("noOutput")}
            </div>
          ) : (
            <div className="space-y-4">
              {outputs.map((output) => (
                <div key={output.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-medium">{output.command}</code>
                      <Badge
                        variant={
                          output.status === "success" ? "success" : "destructive"
                        }
                      >
                        {output.exitCode === 0 ? t("success") : `${t("exitCode")} ${output.exitCode}`}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {output.durationMs && (
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(output.durationMs)}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyOutput(output.output)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto max-h-60 overflow-y-auto">
                    {output.output || tc("noData")}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDangerousConfirm} onOpenChange={setShowDangerousConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{td("confirmTitle")}</DialogTitle>
            <DialogDescription>
              {td("confirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm">{pendingCommand}</code>
            </div>
            {getDangerousCommandPattern(pendingCommand) && (
              <p className="text-sm text-destructive">
                {td("warning", { pattern: getDangerousCommandPattern(pendingCommand)! })}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="confirm-dangerous"
                checked={dangerousConfirmed}
                onCheckedChange={(checked) => setDangerousConfirmed(checked as boolean)}
              />
              <label htmlFor="confirm-dangerous" className="text-sm">
                {td("confirmCheckbox")}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDangerousConfirm(false)}>
              {tc("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => executeCommand(pendingCommand)}
              disabled={!dangerousConfirmed || running}
            >
              {running ? tc("loading") : td("confirmTitle")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
