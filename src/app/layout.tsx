import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "ReFrame — win the customers your website is losing",
  description:
    "Your old site is quietly costing you customers. Paste your link and ReFrame rebuilds it into one they trust — and buy from — in minutes. Edit it just by chatting.",
  metadataBase: new URL("https://reframe.design"),
  openGraph: {
    title: "ReFrame",
    description: "Turn the site you already have into one that wins customers. Live in minutes.",
    type: "website",
    images: ["/brand/reframe-logo.png"],
  },
  // Ask browsers not to auto-translate the UI. Extension/Chrome translation
  // rewrites text nodes before React hydrates, which triggers a fatal
  // hydration mismatch (React #425). `translate="no"` on <html> below is the
  // primary signal; this meta covers Google's translate specifically.
  other: { google: "notranslate" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="grain min-h-screen bg-background font-sans">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
