import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteRevive AI - rebuild any website into a site that converts",
  description:
    "Paste a URL. SiteRevive analyzes your existing website and rebuilds it into a fast, modern site you can edit by chatting with AI. Live in minutes.",
  metadataBase: new URL("https://siterevive.ai"),
  openGraph: {
    title: "SiteRevive AI",
    description:
      "Rebuild any website into a fast, modern site you can edit with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="grain min-h-screen bg-background font-sans">{children}</body>
    </html>
  );
}
