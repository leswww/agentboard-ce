"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface DeleteButtonProps {
  endpoint: string;
  itemName: string;
  redirectTo?: string;
}

export function DeleteButton({ endpoint, itemName, redirectTo }: DeleteButtonProps) {
  const router = useRouter();
  const tc = useTranslations("common");
  const tt = useTranslations("toasts");

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(tt("projectDeleted"));
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      toast.error(tt("failedToDelete"));
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowConfirm(true)}
        title={tc("delete")}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tc("delete")} {itemName}</DialogTitle>
            <DialogDescription>
              {tc("delete")}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              {tc("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? tc("loading") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
