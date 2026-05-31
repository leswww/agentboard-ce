"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState } from "react";
import { getStoredLocale } from "@/i18n/locale-utils";
import { COOKIE_NAME, type Locale } from "@/i18n/config";

interface I18nProviderProps {
  children: React.ReactNode;
  messages: Record<string, unknown>;
  locale: Locale;
}

export function I18nProvider({ children, messages, locale }: I18nProviderProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);
  const [currentMessages, setCurrentMessages] = useState(messages);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored !== locale) {
      // Load the stored locale's messages
      import(`../../messages/${stored}.json`).then((mod) => {
        setCurrentLocale(stored);
        setCurrentMessages(mod.default);
      });
    }
  }, [locale]);

  return (
    <NextIntlClientProvider messages={currentMessages} locale={currentLocale}>
      {children}
    </NextIntlClientProvider>
  );
}
