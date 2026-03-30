import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/ReduxProvider";
import { I18nProvider } from "@/lib/i18n";

// #26 — font loaded via next/font with display swap (already done via Geist)
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const metadata: Metadata = {
  title: { default: "SalSee Coffee", template: "%s | SalSee" },
  description: "Premium coffee crafted with love. Order your favourite brew for dine-in or takeaway.",
  icons: {
    icon: "/salsee.png",
    apple: "/salsee.png",
  },
  // #22 — OG metadata
  openGraph: {
    siteName: "SalSee Coffee",
    type: "website",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* #26 — preconnect to Google Fonts CDN for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geist.variable} font-sans antialiased`}>
        {/* #29 — Skip-to-content link for keyboard / screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-9999 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
        >
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <I18nProvider>
            <ReduxProvider>
              <div id="main-content" tabIndex={-1} className="outline-none">
                {children}
              </div>
            </ReduxProvider>
          </I18nProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
