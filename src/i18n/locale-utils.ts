"use client";

import { COOKIE_NAME, defaultLocale, locales, type Locale } from "./config";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const value = localStorage.getItem(COOKIE_NAME);
  if (value && locales.includes(value as Locale)) {
    return value as Locale;
  }
  return defaultLocale;
}

export function setStoredLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COOKIE_NAME, locale);
  document.cookie = `${COOKIE_NAME}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}
