"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("toasts");

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    toast.success(label || t("copiedToClipboard"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
