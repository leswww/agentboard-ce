import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
}

export const DANGEROUS_COMMANDS = [
  "rm -rf",
  "rm -r",
  "sudo",
  "chmod -R",
  "curl | sh",
  "curl | bash",
  "wget | sh",
  "wget | bash",
  "mkfs",
  "dd if=",
  "> /dev/",
  "shutdown",
  "reboot",
  "halt",
  "poweroff",
];

export function isDangerousCommand(command: string): boolean {
  const lower = command.toLowerCase();
  return DANGEROUS_COMMANDS.some((dc) => lower.includes(dc));
}

export function getDangerousCommandPattern(command: string): string | null {
  const lower = command.toLowerCase();
  for (const dc of DANGEROUS_COMMANDS) {
    if (lower.includes(dc)) {
      return dc;
    }
  }
  return null;
}
