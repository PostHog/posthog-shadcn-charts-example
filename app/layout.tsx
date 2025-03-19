import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PostHog Tremor Example",
  description: "Visualize PostHog insights with Tremor charts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} antialiased`}
      >
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold">PostHog Shadcn UI Charts Example</Link>
              </div>
              <nav className="flex space-x-8">
                <Link href="/" className="px-3 py-2 text-sm font-medium hover:text-blue-600">
                  Home
                </Link>
                <Link href="/posthog-insights" className="px-3 py-2 text-sm font-medium hover:text-blue-600">
                  PostHog Insights
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
