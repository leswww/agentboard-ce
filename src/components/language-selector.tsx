"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { locales, localeNames, type Locale, COOKIE_NAME } from "@/i18n/config";
import { setStoredLocale } from "@/i18n/locale-utils";
import { toast } from "sonner";

export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newLocale: Locale) => {
    setStoredLocale(newLocale);
    setOpen(false);

    const toastMessages: Record<Locale, string> = {
      en: "Language changed",
      "zh-CN": "语言已切换",
      ru: "Язык изменён",
    };

    toast.success(toastMessages[newLocale]);
    router.refresh();
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        title="Language"
      >
        <Globe className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-md border bg-popover p-1 shadow-md">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleSelect(loc)}
              className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                loc === locale ? "bg-accent text-accent-foreground font-medium" : ""
              }`}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
