import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { SideNav, SideNavFallback, TabNav, TabNavFallback } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getProfile } from "@/lib/data";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Karen", template: "%s · Karen" },
  description: "Your government exam co-pilot: what you can apply for, what closes soon, and where each application stands.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#09090c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh font-sans">
        <Suspense>
          <ThemeScript />
        </Suspense>
        <div className="lg:grid lg:grid-cols-[15rem_1fr]">
          <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
            <Brand className="px-3" />
            <nav className="mt-8 grid gap-1">
              <Suspense fallback={<SideNavFallback />}>
                <SideNav />
              </Suspense>
            </nav>
            <div className="mt-auto flex items-center justify-between px-3">
              <span className="text-xs text-muted">Theme</span>
              <ThemeToggle />
            </div>
          </aside>

          <div className="min-w-0">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-xl lg:hidden">
              <Brand />
              <ThemeToggle />
            </header>
            <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
              {children}
            </main>
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
          <Suspense fallback={<TabNavFallback />}>
            <TabNav />
          </Suspense>
        </nav>
      </body>
    </html>
  );
}

function Brand({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid size-8 place-items-center rounded-lg bg-accent text-sm font-bold text-accent-ink">K</span>
      <span className="text-[15px] font-semibold tracking-tight">Karen</span>
    </Link>
  );
}

/** Applies the theme saved in MongoDB. "system" leaves it to the device. */
async function ThemeScript() {
  const { theme } = await getProfile().catch(() => ({ theme: "system" as const }));
  if (theme !== "light" && theme !== "dark") return null;
  return <script dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.theme=${JSON.stringify(theme)}` }} />;
}
