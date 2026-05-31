export const locales = ["en", "zh-CN", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  "zh-CN": "简体中文",
  ru: "Русский",
};

export const COOKIE_NAME = "agentboard-locale";
