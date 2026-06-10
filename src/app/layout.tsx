import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SiteRevive AI — Turn any website into a premium experience",
  description:
    "Paste a URL. SiteRevive AI analyzes your existing website and rebuilds it into a modern, high-converting site you can edit with AI — in minutes.",
  metadataBase: new URL("https://siterevive.ai"),
  openGraph: {
    title: "SiteRevive AI",
    description:
      "Transform any website into a modern, premium, AI-editable experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="grain min-h-screen bg-background font-sans">{children}</body>
    </html>
  );
}
