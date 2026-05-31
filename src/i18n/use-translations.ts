"use client";

import { useTranslations as useNextIntlTranslations } from "next-intl";

export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}
