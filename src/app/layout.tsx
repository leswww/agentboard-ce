import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { I18nProvider } from "@/components/i18n-provider";
import { cookies } from "next/headers";
import { COOKIE_NAME, defaultLocale, locales, type Locale } from "@/i18n/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentBoard CE - Local-first workspace for open-source maintainers",
  description:
    "AgentBoard CE is a local-first workspace for developers and open-source maintainers. It helps maintainers manage local repositories, command templates, coding agent prompts, issue triage, pull request review, release notes, and documentation workflows from one dashboard.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;

  let locale: Locale = defaultLocale;
  if (cookieValue && locales.includes(cookieValue as Locale)) {
    locale = cookieValue as Locale;
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <I18nProvider messages={messages} locale={locale}>
          <ThemeProvider defaultTheme="system" storageKey="agentboard-theme">
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
