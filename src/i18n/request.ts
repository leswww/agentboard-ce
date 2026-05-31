import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { COOKIE_NAME, defaultLocale, locales, type Locale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;

  let locale: Locale = defaultLocale;
  if (cookieValue && locales.includes(cookieValue as Locale)) {
    locale = cookieValue as Locale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
