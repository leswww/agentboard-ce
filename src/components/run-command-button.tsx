"use client";

import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { isDangerousCommand, getDangerousCommandPattern } from "@/lib/utils";
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

interface RunCommandButtonProps {
  command: string;
  projectId?: string;
  workingDirectory?: string;
}

export function RunCommandButton({ command, projectId, workingDirectory }: RunCommandButtonProps) {
  const tc = useTranslations("common");
  const td = useTranslations("dangerousCommands");
  const tt = useTranslations("toasts");

  const [running, setRunning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const isDangerous = isDangerousCommand(command);
  const dangerPattern = getDangerousCommandPattern(command);

  const handleRun = async () => {
    if (isDangerous && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setRunning(true);
    setShowConfirm(false);
    setConfirmed(false);

    try {
      const res = await fetch("/api/commands/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          projectId,
          workingDirectory,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to run command");
      }

      const data = await res.json();
      toast.success(tt("commandCompleted", { code: data.exitCode }));
    } catch {
      toast.error(tt("commandRunFailed"));
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRun}
        disabled={running}
        title={tc("run")}
      >
        {running ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{td("confirmTitle")}</DialogTitle>
            <DialogDescription>
              {td("confirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm">{command}</code>
            </div>
            {dangerPattern && (
              <p className="text-sm text-destructive">{td("warning", { pattern: dangerPattern })}</p>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="confirm-run"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <label htmlFor="confirm-run" className="text-sm">
                {td("confirmCheckbox")}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              {tc("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRun}
              disabled={!confirmed || running}
            >
              {running ? tc("loading") : tc("run")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
